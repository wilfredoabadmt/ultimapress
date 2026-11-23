#!/usr/bin/env node
/**
 * UltimaPress security check.
 *
 * Reads a site's source code and looks for the mistakes that most often open a
 * website to attackers: actions anyone can call without logging in, visitor input
 * that reaches HTML or the database unescaped, passwords and keys written into the
 * code, and packages with known vulnerabilities.
 *
 * It runs:
 *   - before `pnpm ship` sends a version (scripts/ship.mjs), so Claude fixes problems first
 *   - on the server before a new version is built (docker/supervisor.mjs). The server
 *     always uses its own copy of this file, never the one inside the uploaded code.
 *   - from Settings > Security ("Check now", and once a day)
 *
 * A "critical" finding stops a version from going live. Warnings are shown but do not
 * block. Package vulnerabilities never block: they come from the packages, not from
 * the site's own code, and are fixed by updating.
 *
 * Code that is safe for a reason the check cannot see can say so on the line, or the
 * line above, with:   // up-security: <the reason>
 * Those are listed as "marked safe" on the Security page, with the reason, so the
 * owner can see them.
 *
 * Plain Node, no dependencies.
 *   node docker/security-check.mjs [folder] [--json] [--no-packages]
 *                                  [--deep=<opengrep binary> [--official=<official folder>]]
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const SCANNER_VERSION = 1

const CODE = /\.(ts|tsx|js|jsx|mjs|cjs)$/
const SKIP_DIRS = new Set(['node_modules', '.next', 'migrations', 'tests', '__tests__', 'dist', 'build', '.git'])
const SKIP_FILES = /(payload-types\.ts|importMap\.js|\.d\.ts|\.test\.|\.spec\.)$/

// ---------------------------------------------------------------- helpers

const walk = (dir, out = []) => {
  let entries = []
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    if (e.isSymbolicLink()) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(p, out)
    } else if (CODE.test(e.name) && !SKIP_FILES.test(e.name)) out.push(p)
  }
  return out
}

/** Blanks out comments (keeping line breaks) so commented-out code is not reported. */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\/|(^|[^:'"`\\])\/\/[^\n]*/g, (m, pre) =>
    m.startsWith('/*') ? m.replace(/[^\n]/g, ' ') : (pre || '') + ' '.repeat(m.length - (pre || '').length),
  )

const lineOf = (src, index) => src.slice(0, index).split('\n').length

/** The text of a { ... } block starting at `open` (index of "{"). */
const block = (src, open) => {
  let depth = 0
  for (let i = open; i < src.length; i++) {
    const c = src[i]
    if (c === '{') depth++
    else if (c === '}' && --depth === 0) return src.slice(open, i + 1)
  }
  return src.slice(open)
}

/** "// up-security: reason" on the line or the line above. */
const markedSafe = (lines, line) => {
  for (const l of [lines[line - 1], lines[line - 2]]) {
    const m = l && l.match(/\/\/\s*up-security:\s*(.+?)\r?$/)
    if (m) return m[1].trim()
  }
  return null
}

// ---------------------------------------------------------------- rules

/**
 * Each rule returns findings: { at (index in the file), extra? }.
 * `severity`: critical blocks going live, warning does not.
 */
const RULES = [
  {
    id: 'secret-in-code',
    severity: 'critical',
    title: 'A password or secret key is written into the code',
    why: 'Anyone who sees the code (a download, a backup, a shared repo) can use it to get into the service it unlocks.',
    fix: 'Move it to Settings > Private settings or an environment variable, read it on the server only, and change the key at the service since it has been exposed.',
    test: (src) => {
      const out = []
      const patterns = [
        /\bsk_live_[0-9a-zA-Z]{16,}/g,
        /\bsk-ant-[0-9a-zA-Z_-]{20,}/g,
        /\bsk-(proj-)?[0-9a-zA-Z_-]{32,}/g,
        /\bAKIA[0-9A-Z]{16}\b/g,
        /\bgh[pousr]_[0-9a-zA-Z]{30,}/g,
        /\bxox[abpr]-[0-9a-zA-Z-]{20,}/g,
        /\bAIza[0-9A-Za-z_-]{35}\b/g,
        /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
        /\bjwt\.(sign|verify)\s*\([^)]*,\s*['"`][^'"`$]{6,}['"`]/g,
        /\b(api_?key|secret|password|passwd|auth_?token|access_?token|client_?secret)\s*[:=]\s*['"`](?!\s*['"`])[^'"`\s$]{12,}['"`]/gi,
      ]
      const placeholder = /your|example|xxx|changeme|change-me|placeholder|dummy|sample|<|\.\.\./i
      for (const re of patterns)
        for (const m of src.matchAll(re)) if (!placeholder.test(m[0].split(/[:=]/).pop())) out.push({ at: m.index })
      return out
    },
  },
  {
    id: 'secret-sent-to-browser',
    severity: 'critical',
    title: 'A secret is made available to the browser',
    why: 'Environment variables starting with NEXT_PUBLIC_ are copied into the pages every visitor downloads.',
    fix: 'Rename it without NEXT_PUBLIC_ and only use it in server code (endpoints, hooks, server components).',
    test: (src) =>
      [...src.matchAll(/NEXT_PUBLIC_[A-Z0-9_]*(SECRET|PASSWORD|PRIVATE|TOKEN|API_KEY|_KEY)\b/g)]
        .filter((m) => !/SITE_KEY|PUBLISHABLE|PUBLIC_KEY/.test(m[0]))
        .map((m) => ({ at: m.index })),
  },
  {
    id: 'raw-sql',
    severity: 'critical',
    title: 'A database query is built by joining text together',
    why: 'If any part of that text can come from a visitor, they can change the query and read or delete data (SQL injection).',
    fix: 'Use Payload’s find/create/update functions, or the sql`...` template with ${values}, which sends values separately from the query.',
    test: (src) => {
      const out = []
      for (const m of src.matchAll(/\bsql\.raw\s*\(/g)) out.push({ at: m.index })
      for (const m of src.matchAll(/\.(query|execute|unsafe|\$queryRawUnsafe|\$executeRawUnsafe)\s*\(\s*(`[^`]*\$\{|['"][^'"]*['"]\s*\+)/g))
        out.push({ at: m.index })
      return out
    },
  },
  {
    id: 'code-from-text',
    severity: 'critical',
    title: 'Text is run as code',
    why: 'eval, new Function and shell commands built from text let anyone who controls that text run their own code on the server.',
    fix: 'Remove eval/new Function. For programs, use execFile or spawn with a fixed command and the values passed as separate arguments.',
    test: (src) => {
      const out = []
      for (const m of src.matchAll(/(?<![.\w])eval\s*\(|\bnew\s+Function\s*\(/g)) out.push({ at: m.index })
      for (const m of src.matchAll(/\b(exec|execSync)\s*\(\s*(`[^`]*\$\{|[^'"`)\s][^,)]*\+|(['"])[^'"]*\3\s*\+)/g)) out.push({ at: m.index })
      for (const m of src.matchAll(/\b(spawn|spawnSync|execFile)\s*\([^)]*shell\s*:\s*true/g)) out.push({ at: m.index })
      return out
    },
  },
  {
    id: 'open-access',
    severity: 'critical',
    title: 'Anyone can change or delete this content without logging in',
    why: 'An access rule that always returns true lets any visitor, or any script on the internet, use it.',
    fix: 'Use the helpers in src/access/roles.ts (for example the admin or editor helpers) for update and delete. Only visitor submissions such as comments or form entries may allow public create, and those need spam protection.',
    test: (src) => {
      const out = []
      const always = '(\\([^)]*\\)\\s*=>\\s*\\(?\\s*true\\b|anyone\\b|true\\b)'
      const spamProtected = /honeypot|turnstile|verifyTurnstile|captcha/i.test(src)
      for (const a of src.matchAll(/\baccess\s*:\s*\{/g)) {
        const open = src.indexOf('{', a.index)
        const body = block(src, open)
        for (const m of body.matchAll(new RegExp(`\\b(update|delete|unlock|readVersions)\\s*:\\s*${always}`, 'g')))
          out.push({ at: open + m.index })
        // Public create is only for visitor submissions, which need spam protection.
        if (!spamProtected)
          for (const m of body.matchAll(new RegExp(`\\bcreate\\s*:\\s*${always}`, 'g'))) out.push({ at: open + m.index })
      }
      return out
    },
  },
  {
    id: 'unprotected-endpoint',
    severity: 'critical',
    title: 'This action can be used by anyone, without logging in',
    why: 'The endpoint changes something but never checks who is calling it, so anyone who finds the address can use it.',
    fix: 'At the start of the handler, check req.user and the role (hasRole from src/access/roles.ts) and return 403 otherwise. If it is meant for visitors, protect it with Turnstile and limits, then mark it with // up-security: <why it is public>.',
    test: (src, file) => {
      const out = []
      const guard =
        /req\.user|hasRole|isAdmin|admin\(req\)|own\(req\)|CRON_SECRET|checkDeployKey|authorization|verifyTurnstile|turnstile|honeypot|getMeUser|payload\.auth\(|\bauth\(|x-up-token|apiKey|timingSafeEqual|deny\(\)|status\s*:\s*40[13]\b/i
      // Payload endpoints: objects with path + handler.
      for (const m of src.matchAll(/\bpath\s*:\s*['"`][^'"`]*['"`]/g)) {
        const start = src.lastIndexOf('{', m.index)
        if (start < 0) continue
        const body = block(src, start)
        if (!/\bhandler\s*:/.test(body)) continue
        const method = (body.match(/\bmethod\s*:\s*['"`](\w+)['"`]/) || [])[1]?.toLowerCase() || 'get'
        if (!['post', 'put', 'patch', 'delete'].includes(method)) continue
        if (guard.test(body)) continue
        out.push({ at: m.index })
      }
      // Next.js route handlers.
      if (/[\\/]route\.(ts|js|mjs)$/.test(file) && !/\(payload\)/.test(file)) {
        for (const m of src.matchAll(/export\s+(async\s+)?(function\s+|const\s+)(POST|PUT|PATCH|DELETE)\b/g)) {
          const open = src.indexOf('{', m.index)
          const body = open > 0 ? block(src, open) : ''
          if (!guard.test(body) && !/draftMode|preview|secret/i.test(body)) out.push({ at: m.index })
        }
      }
      return out
    },
  },
  {
    id: 'no-tls-check',
    severity: 'critical',
    title: 'Secure connection checks are switched off',
    why: 'Without them, anyone between the server and the other service can read or change what is sent, including passwords.',
    fix: 'Remove rejectUnauthorized: false and NODE_TLS_REJECT_UNAUTHORIZED. Fix the certificate instead.',
    test: (src) =>
      [...src.matchAll(/rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"`]?0/g)].map((m) => ({ at: m.index })),
  },
  {
    id: 'unescaped-html',
    severity: 'warning',
    title: 'HTML is inserted without being cleaned',
    why: 'If any of this HTML can come from a visitor or an imported post, they can add scripts that run for everyone who opens the page (cross-site scripting).',
    fix: 'Clean it first (cleanDesignHtml or the sanitizer the site already uses), or render it as text instead of HTML.',
    test: (src) => {
      const out = []
      const safe = /JSON\.stringify|clean|saniti[sz]e|escape|purify|^\s*['"`][^$]*['"`]\s*$|CSS|css|styles?\b|WIDGET_/i
      // A plain variable: look at what it was set to in the same file.
      const traced = (value) => {
        const v = value.trim()
        if (!/^[A-Za-z_$][\w$]*$/.test(v)) return v
        const set = src.match(new RegExp(`(?:const|let|var)\\s+${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*([^\\n;]*)`))
        return set ? set[1] : v
      }
      for (const m of src.matchAll(/dangerouslySetInnerHTML\s*=\s*\{\{\s*__html\s*:\s*([^}]*)\}\}/g)) {
        if (safe.test(m[1]) || safe.test(traced(m[1]))) continue
        out.push({ at: m.index })
      }
      for (const m of src.matchAll(/\.(innerHTML|outerHTML)\s*=(?!=)\s*([^;\n]*)/g)) {
        if (/^\s*(['"`][^$]*['"`]|''|"")\s*$/.test(m[2])) continue
        if (/clean|saniti[sz]e|escape|purify/i.test(m[2]) || /clean|saniti[sz]e|escape|purify/i.test(traced(m[2]))) continue
        out.push({ at: m.index })
      }
      for (const m of src.matchAll(/\binsertAdjacentHTML\s*\(|document\.write\s*\(/g)) out.push({ at: m.index })
      return out
    },
  },
  {
    id: 'incomplete-escaping',
    severity: 'warning',
    title: 'Only the first special character is escaped',
    why: 'replace() with plain text only changes the first match, so the rest of the text is not escaped.',
    fix: 'Use a regular expression with the g flag, for example .replace(/&/g, "&amp;"), or a shared escape function.',
    test: (src) =>
      [...src.matchAll(/\.replace\s*\(\s*(['"])(&|<|>|"|'|\\"|\\')\1\s*,/g)].map((m) => ({ at: m.index })),
  },
  {
    id: 'missing-access',
    severity: 'warning',
    title: 'A collection has no access rules',
    why: 'Without them, every logged-in user, including authors, can read, change and delete everything in it.',
    fix: 'Add an access block using the helpers in src/access/roles.ts.',
    test: (src, file) => {
      if (!/CollectionConfig/.test(src)) return []
      const out = []
      for (const m of src.matchAll(/:\s*CollectionConfig\s*=\s*\{/g)) {
        const body = block(src, src.indexOf('{', m.index))
        if (!/\baccess\s*:/.test(body)) out.push({ at: m.index })
      }
      return out
    },
  },
  {
    id: 'risky-uploads',
    severity: 'warning',
    title: 'Uploads allow file types that can run code',
    why: 'allowRestrictedFileTypes lets people upload files such as HTML or scripts, which can run in the browsers of everyone who opens them.',
    fix: 'Remove allowRestrictedFileTypes and list the allowed types in mimeTypes instead.',
    test: (src) => [...src.matchAll(/allowRestrictedFileTypes\s*:\s*true/g)].map((m) => ({ at: m.index })),
  },
  {
    id: 'weak-random',
    severity: 'warning',
    title: 'A guessable random number is used for something secret',
    why: 'Math.random() can be predicted, so codes, tokens or keys made with it can be guessed.',
    fix: 'Use crypto.randomBytes() or crypto.randomUUID().',
    test: (src) =>
      [...src.matchAll(/(token|secret|password|passcode|otp|nonce|salt|api_?key|secret_?key|reset)[^\n;]{0,40}Math\.random\(\)/gi)].map((m) => ({ at: m.index })),
  },
  {
    id: 'open-cors',
    severity: 'warning',
    title: 'Any website can call this site’s API',
    why: 'With CORS set to "*", other websites can make requests to this site from a visitor’s browser.',
    fix: 'List the exact domains that need access, or remove the CORS setting.',
    test: (src) =>
      [...src.matchAll(/Access-Control-Allow-Origin['"`]\s*[,:]\s*['"`]\*['"`]|\bcors\s*:\s*['"`]\*['"`]/g)].map((m) => ({ at: m.index })),
  },
]

// ---------------------------------------------------------------- packages

const runCapture = (cmd, args, cwd, timeoutMs) =>
  new Promise((resolve) => {
    let out = ''
    let done = false
    let p
    try {
      p = spawn(cmd, args, { cwd, env: { ...process.env, CI: 'true' } })
    } catch {
      return resolve(null)
    }
    const timer = setTimeout(() => {
      if (!done) p.kill('SIGKILL')
    }, timeoutMs)
    p.stdout.on('data', (d) => (out += d))
    p.stderr.on('data', () => {})
    p.on('error', () => {
      done = true
      clearTimeout(timer)
      resolve(null)
    })
    p.on('close', () => {
      done = true
      clearTimeout(timer)
      resolve(out)
    })
  })

/** Known vulnerabilities in the packages the site uses (pnpm audit). Never blocks. */
export async function checkPackages(dir) {
  if (!fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))) return { checked: false, reason: 'No pnpm-lock.yaml found.' }
  const out = await runCapture('pnpm', ['audit', '--json', '--prod'], dir, 90_000)
  if (!out) return { checked: false, reason: 'The package check could not reach the package registry.' }
  let data
  try {
    data = JSON.parse(out)
  } catch {
    return { checked: false, reason: 'The package check gave an unexpected answer.' }
  }
  const items = Object.values(data.advisories || {}).map((a) => ({
    package: a.module_name,
    severity: a.severity,
    title: a.title,
    fixedIn: a.patched_versions,
    url: a.url,
  }))
  const count = (s) => items.filter((i) => i.severity === s).length
  return {
    checked: true,
    counts: { critical: count('critical'), high: count('high'), moderate: count('moderate'), low: count('low') },
    items: items.slice(0, 50),
  }
}

// ---------------------------------------------------------------- deep check (add-on)

/**
 * The optional Deep check: the Opengrep scanner with the security rules in
 * docker/deep-check-rules.yaml. It follows code more closely than the rules above, so it
 * finds more, with more false alarms. To keep that useful it only reports what is new
 * compared with the official UltimaPress code (`baseline`), which is checked before release.
 *   critical: rule severity ERROR with medium or high confidence (stops an update)
 *   warning:  any other ERROR rule, medium or high confidence, or a high likelihood
 *   hint:     the rest, only counted
 */
export const DEEP_RULES = fileURLToPath(new URL('./deep-check-rules.yaml', import.meta.url))

const fingerprint = (f) => `${f.rule}|${f.file}|${f.code}`

const runDeep = (bin, dir, timeoutMs) =>
  new Promise((resolve, reject) => {
    let out = ''
    let err = ''
    const p = spawn(
      bin,
      ['scan', '--config', DEEP_RULES, '--json', '--quiet', '--timeout', '20', '--jobs', '2', '--max-memory', '1500', 'src'],
      { cwd: dir, env: { ...process.env, SEMGREP_SEND_METRICS: 'off' } },
    )
    const timer = setTimeout(() => p.kill('SIGKILL'), timeoutMs)
    p.stdout.on('data', (d) => (out += d))
    p.stderr.on('data', (d) => (err = (err + d).slice(-2000)))
    p.on('error', (e) => {
      clearTimeout(timer)
      reject(e)
    })
    p.on('close', () => {
      clearTimeout(timer)
      try {
        resolve(JSON.parse(out))
      } catch {
        reject(new Error(`The deep check did not finish. ${err.trim().split('\n').pop() || ''}`.trim()))
      }
    })
  })

/** Raw deep-check findings for `dir`. */
export async function deepFindings(dir, bin, timeoutMs = 10 * 60_000) {
  const root = path.resolve(dir)
  const data = await runDeep(bin, root, timeoutMs)
  const cache = new Map()
  const linesOf = (file) => {
    if (!cache.has(file)) {
      try {
        cache.set(file, fs.readFileSync(path.join(root, file), 'utf8').split('\n'))
      } catch {
        cache.set(file, [])
      }
    }
    return cache.get(file)
  }
  return (data.results || []).map((r) => {
    const file = path.relative(root, path.resolve(root, r.path)).split(path.sep).join('/')
    const lines = linesOf(file)
    const m = r.extra?.metadata || {}
    return {
      rule: `deep:${String(r.check_id).split('.').pop()}`,
      level: r.extra?.severity || 'WARNING',
      confidence: m.confidence || 'LOW',
      likelihood: m.likelihood || 'LOW',
      file,
      line: r.start.line,
      code: (lines[r.start.line - 1] || '').trim().slice(0, 200),
      message: String(r.extra?.message || '').replace(/\s+/g, ' ').trim(),
      cwe: Array.isArray(m.cwe) ? m.cwe[0] : m.cwe,
      reason: markedSafe(lines, r.start.line),
    }
  })
}

/** Fingerprints of what the deep check reports on the official code. */
export async function deepBaseline(officialDir, bin) {
  return (await deepFindings(officialDir, bin)).map(fingerprint)
}

const firstSentence = (t) => {
  const m = t.match(/^(.{20,160}?[.!?])(\s|$)/)
  return (m ? m[1] : t.slice(0, 160)).replace(/`/g, '')
}

/** The Deep check for `dir`, compared with `baseline` (fingerprints from deepBaseline). */
export async function deepCheck(dir, { bin, baseline = [] }) {
  const known = new Set(baseline)
  const critical = []
  const warnings = []
  const safe = []
  let hints = 0
  let sameAsOfficial = 0
  for (const f of await deepFindings(dir, bin)) {
    if (known.has(fingerprint(f))) {
      sameAsOfficial++
      continue
    }
    const strong = f.confidence === 'MEDIUM' || f.confidence === 'HIGH'
    const severity =
      f.level === 'ERROR' && strong ? 'critical' : f.level === 'ERROR' || strong || f.likelihood === 'HIGH' ? 'warning' : null
    if (!severity) {
      hints++
      continue
    }
    const finding = {
      rule: f.rule,
      source: 'deep',
      severity,
      title: firstSentence(f.message),
      why: `${f.message}${f.cwe ? ` (${f.cwe})` : ''}`,
      fix: 'Change the code so it no longer does this, or ask Claude to fix it using the explanation above. If it is safe on purpose, say why with // up-security: <reason>.',
      file: f.file,
      line: f.line,
      code: f.code,
    }
    if (f.reason) safe.push({ ...finding, reason: f.reason })
    else if (severity === 'critical') critical.push(finding)
    else warnings.push(finding)
  }
  return { ran: true, critical, warnings, markedSafe: safe, hints, sameAsOfficial }
}

// ---------------------------------------------------------------- scan

/**
 * Scans `dir` (a site folder with src/). Returns
 * { ok, scannedAt, critical: Finding[], warnings: Finding[], markedSafe: Finding[], files, packages, deep }
 * `deep`: { bin, baseline } runs the Deep check add-on too.
 */
export async function scanSecurity(dir, { packages = true, deep = null, official = null } = {}) {
  const root = path.resolve(dir)
  const files = walk(path.join(root, 'src'))
  const critical = []
  const warnings = []
  const safe = []
  for (const file of files) {
    let raw
    try {
      raw = fs.readFileSync(file, 'utf8')
    } catch {
      continue
    }
    if (raw.length > 800_000) continue
    const src = stripComments(raw)
    const lines = raw.split(/\r?\n/)
    const rel = path.relative(root, file).split(path.sep).join('/')
    for (const rule of RULES) {
      const seen = new Set()
      for (const hit of rule.test(src, rel)) {
        const line = lineOf(src, hit.at)
        if (seen.has(line)) continue
        seen.add(line)
        const finding = {
          rule: rule.id,
          severity: rule.severity,
          title: rule.title,
          why: rule.why,
          fix: rule.fix,
          file: rel,
          line,
          code: (lines[line - 1] || '').trim().slice(0, 200),
        }
        const reason = markedSafe(lines, line)
        if (reason) safe.push({ ...finding, reason })
        else if (rule.severity === 'critical') critical.push(finding)
        else warnings.push(finding)
      }
    }
  }
  let pkgs = packages ? await checkPackages(root) : { checked: false, reason: 'Skipped.' }
  // Known issues in UltimaPress's own packages are fixed by UltimaPress updates, not by the
  // owner: only keep the ones that come from packages added or changed for this site.
  if (pkgs.checked && official) {
    const same = path.resolve(official) === root
    const base = same ? pkgs : await checkPackages(official)
    const known = new Set((base.items || []).map((i) => `${i.package}|${i.title}`))
    const items = same ? [] : (pkgs.items || []).filter((i) => !known.has(`${i.package}|${i.title}`))
    const count = (sev) => items.filter((i) => i.severity === sev).length
    pkgs = {
      checked: true,
      counts: { critical: count('critical'), high: count('high'), moderate: count('moderate'), low: count('low') },
      items,
    }
  }
  let deepResult = null
  if (deep?.bin) {
    try {
      deepResult = await deepCheck(root, deep)
      critical.push(...deepResult.critical)
      warnings.push(...deepResult.warnings)
      safe.push(...deepResult.markedSafe)
    } catch (e) {
      deepResult = { ran: false, error: e.message }
    }
  }
  // Lines the official UltimaPress marks safe are not the owner's concern: only list the ones
  // in code that was added or changed for this site.
  let ownSafe = safe
  if (official && path.resolve(official) !== root) {
    const known = new Set((await scanSecurity(official, { packages: false })).markedSafe.map((f) => `${f.rule}|${f.file}|${f.code}`))
    ownSafe = safe.filter((f) => !known.has(`${f.rule}|${f.file}|${f.code}`))
  } else if (official) {
    ownSafe = [] // this is the official code itself
  }
  return {
    ok: critical.length === 0,
    deep: deepResult && {
      ran: deepResult.ran,
      error: deepResult.error,
      hints: deepResult.hints || 0,
      sameAsOfficial: deepResult.sameAsOfficial || 0,
    },
    scanner: SCANNER_VERSION,
    scannedAt: new Date().toISOString(),
    files: files.length,
    critical,
    warnings,
    markedSafe: ownSafe,
    packages: pkgs,
  }
}

/** Text for the owner to paste into Claude. */
export function forClaude(result) {
  const list = [...result.critical, ...result.warnings]
  if (!list.length) return ''
  return [
    'The UltimaPress security check found these problems in my site’s code. Please fix them, run `node docker/security-check.mjs` until it reports no critical problems, then ship again.',
    '',
    ...list.map(
      (f, i) => `${i + 1}. [${f.severity}] ${f.title}\n   ${f.file}:${f.line}\n   ${f.code}\n   How to fix: ${f.fix}`,
    ),
  ].join('\n')
}

/** Plain-text report for the terminal. */
export function report(result) {
  const out = []
  const show = (f) => `  ${f.file}:${f.line}  ${f.title}\n    ${f.code}\n    Fix: ${f.fix}`
  out.push(`Security check: ${result.files} files`)
  if (result.critical.length) out.push(`\nCritical (${result.critical.length}), these stop the site going live:`, ...result.critical.map(show))
  if (result.warnings.length) out.push(`\nWarnings (${result.warnings.length}):`, ...result.warnings.map(show))
  if (result.markedSafe.length)
    out.push(`\nMarked safe in the code (${result.markedSafe.length}):`, ...result.markedSafe.map((f) => `  ${f.file}:${f.line}  ${f.reason}`))
  const p = result.packages
  if (p.checked) {
    const c = p.counts
    out.push(`\nPackages: ${c.critical} critical, ${c.high} high, ${c.moderate} moderate, ${c.low} low known vulnerabilities (these do not block).`)
  } else out.push(`\nPackages: not checked. ${p.reason}`)
  out.push(result.ok ? '\nResult: passed, no critical problems.' : '\nResult: NOT passed. Fix the critical problems above.')
  return out.join('\n')
}

// ---------------------------------------------------------------- command line

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const dir = args.find((a) => !a.startsWith('--')) || process.cwd()
  // --deep=<path to opengrep> [--official=<official UltimaPress folder to compare with>]
  const opt = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3)
  let deep = null
  if (opt('deep')) deep = { bin: opt('deep'), baseline: opt('official') ? await deepBaseline(opt('official'), opt('deep')) : [] }
  const result = await scanSecurity(dir, { packages: !args.includes('--no-packages'), deep })
  process.stdout.write(args.includes('--json') ? JSON.stringify({ ...result, forClaude: forClaude(result) }) : report(result) + '\n')
  process.exit(result.ok ? 0 : 1)
}
