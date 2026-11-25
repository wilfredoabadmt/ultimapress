#!/usr/bin/env node
/**
 * UltimaPress supervisor.
 *
 * Runs the website and lets the owner replace its code from the admin
 * (Site code page): a new version is unpacked, built and started on a spare
 * port first, and only takes over when it answers. If anything fails the
 * current version keeps running. The database is backed up before every update
 * and restored when a failed update had already changed it.
 *
 * Folders (all on the data volume, so they survive restarts and image updates):
 *   site-code/releases/<id>/   one folder per version: source, node_modules, build
 *   site-code/backups/<id>.dump  database backup taken before <id> went live
 *   site-code/incoming/        uploads waiting to be built
 *   site-code/state.json       which version is live, which one came before
 *   site-code/status.json      progress of the current or last update
 *
 * Plain Node, no dependencies. The app talks to it on 127.0.0.1 only
 * (src/siteCode/supervisor.ts).
 */
import { spawn, spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The server's own copy of the security check, never the one inside uploaded code.
import { deepBaseline, forClaude, scanSecurity } from './security-check.mjs'
import { createSiteScan } from './site-scan.mjs'
import { conflictsForClaude, createSources, isNewer, mergeSites, versionOf, copySource } from './upgrade.mjs'

const APP_DIR = path.resolve(process.env.UP_APP_DIR || '/app')
const DATA_DIR = path.resolve(process.env.UP_DATA_DIR || path.join(APP_DIR, 'data'))
const SC = path.join(DATA_DIR, 'site-code')
const RELEASES = path.join(SC, 'releases')
const BACKUPS = path.join(SC, 'backups')
const INCOMING = path.join(SC, 'incoming')
const LOGS = path.join(SC, 'logs')
const STATE_FILE = path.join(SC, 'state.json')
const STATUS_FILE = path.join(SC, 'status.json')
const SECURITY_FILE = path.join(SC, 'security.json') // last check of the live version
const OFFICIAL = path.join(SC, 'official') // copies of official UltimaPress versions, for updates
const UPGRADES = path.join(SC, 'upgrades') // updates that need Claude, as zips to download

const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOSTNAME || '0.0.0.0'
const CONTROL_PORT = Number(process.env.UP_CONTROL_PORT || 3999)
const CANDIDATE_PORT = Number(process.env.UP_CANDIDATE_PORT || 3100)
const TOKEN = crypto.randomBytes(24).toString('hex')
const START_TIMEOUT = Number(process.env.UP_START_TIMEOUT || 180) * 1000

for (const d of [SC, RELEASES, BACKUPS, INCOMING, LOGS, UPGRADES]) fs.mkdirSync(d, { recursive: true })

const log = (...a) => console.log('[supervisor]', ...a)
const readJSON = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}
const writeJSON = (file, value) => {
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(value, null, 2))
  fs.renameSync(`${file}.tmp`, file)
}

/** state: { active: id|null, previous: id|null|undefined, releases: {id: {...}}, history: [] } */
let state = readJSON(STATE_FILE, { active: null, releases: {}, history: [] })
const saveState = () => writeJSON(STATE_FILE, state)
const releaseDir = (id) => (id ? path.join(RELEASES, id) : APP_DIR)
const isBuilt = (dir) => fs.existsSync(path.join(dir, '.next', 'BUILD_ID'))
const record = (entry) => {
  state.history = [{ at: new Date().toISOString(), ...entry }, ...(state.history || [])].slice(0, 20)
  saveState()
}

// ---------------------------------------------------------------- the website

const childEnv = (port, host) => ({
  ...process.env,
  PORT: String(port),
  HOSTNAME: host,
  UP_SUPERVISOR_URL: `http://127.0.0.1:${CONTROL_PORT}`,
  UP_SUPERVISOR_TOKEN: TOKEN,
  UP_SITE_CODE_DIR: SC,
})

const startNext = (dir, port, host) =>
  spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', host], {
    cwd: dir,
    env: childEnv(port, host),
    stdio: 'inherit',
    detached: true,
  })

const stopProcess = (c, wait = 15000) =>
  new Promise((resolve) => {
    if (!c || c.exitCode !== null || c.signalCode !== null) return resolve()
    c.expected = true
    const kill = (sig) => {
      try {
        process.kill(-c.pid, sig)
      } catch {
        try {
          c.kill(sig)
        } catch {
          /* already gone */
        }
      }
    }
    const timer = setTimeout(() => kill('SIGKILL'), wait)
    c.once('exit', () => {
      clearTimeout(timer)
      resolve()
    })
    kill('SIGTERM')
  })

const waitHealthy = async (port, c, timeout = START_TIMEOUT) => {
  const until = Date.now() + timeout
  let errors = 0
  while (Date.now() < until) {
    if (c && (c.exitCode !== null || c.signalCode !== null)) throw new Error('The site stopped while starting.')
    try {
      const robots = await fetch(`http://127.0.0.1:${port}/robots.txt`, { signal: AbortSignal.timeout(5000) })
      // Up, but every page fails: no point waiting for the full timeout.
      if (robots.status >= 500 && ++errors >= 6) {
        throw new Error(`The admin answered with an error (${robots.status}).`)
      }
      if (robots.ok) {
        // The admin needs the database: this is where new migrations run.
        const admin = await fetch(`http://127.0.0.1:${port}/admin/login`, {
          signal: AbortSignal.timeout(120000),
          redirect: 'manual',
        })
        if (admin.status < 500) return
        throw new Error(`The admin answered with an error (${admin.status}).`)
      }
    } catch (e) {
      if (String(e.message).startsWith('The admin answered')) {
        throw new Error(`The site starts, but its pages fail (error ${e.message.match(/\d+/)?.[0] || '500'}).`)
      }
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw new Error('The site did not answer in time.')
}

let main = null
let crashes = []
let shuttingDown = false

const startMain = (id) => {
  const dir = releaseDir(id)
  log(`starting ${id ? `your version ${id}` : 'the official version'} on port ${PORT}`)
  const c = startNext(dir, PORT, HOST)
  main = c
  c.on('exit', (code, signal) => {
    if (c.expected || shuttingDown) return
    log(`the site stopped (${signal || code}), restarting`)
    crashes = [...crashes.filter((t) => Date.now() - t < 120000), Date.now()]
    if (id && crashes.length >= 3) {
      // A custom version that cannot stay up: go back to the official one.
      log('your version keeps stopping: switching back to the official version')
      state.previous = state.active
      state.active = null
      record({ action: 'fallback', id, ok: false, error: 'Stopped three times in two minutes.' })
      crashes = []
      startMain(null)
      return
    }
    setTimeout(() => !shuttingDown && main === c && startMain(id), 2000)
  })
  return c
}

// ---------------------------------------------------------------- update jobs

let job = null // { id, kind, steps, ... } mirrored to status.json
const STEPS = {
  deploy: [
    ['unpack', 'Unpacking the new code'],
    ['security', 'Checking security'],
    ['backup', 'Backing up your content'],
    ['install', 'Installing what it needs'],
    ['build', 'Building the site'],
    ['check', 'Checking it starts'],
    ['switch', 'Switching over'],
  ],
  revert: [
    ['backup', 'Backing up your content'],
    ['switch', 'Switching over'],
  ],
  upgrade: [
    ['prepare', 'Getting the new UltimaPress'],
    ['merge', 'Bringing your features over'],
    ['security', 'Checking security'],
    ['backup', 'Backing up your content'],
    ['install', 'Installing what it needs'],
    ['build', 'Building the site'],
    ['check', 'Checking it starts'],
    ['switch', 'Switching over'],
  ],
}
const saveStatus = () => job && writeJSON(STATUS_FILE, job)
const setStep = (key) => {
  for (const s of job.steps) {
    if (s.key === key) s.state = 'running'
    else if (s.state === 'running') s.state = 'done'
  }
  job.step = key
  saveStatus()
  log(`${job.id}: ${key}`)
}
const appendLog = (text) => {
  fs.appendFileSync(job.logFile, text)
  job.log = ((job.log || '') + text).slice(-6000)
}

const run = (cmd, args, opts = {}) =>
  new Promise((resolve, reject) => {
    appendLog(`\n$ ${cmd} ${args.join(' ')}\n`)
    const c = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts })
    let tick = 0
    const onData = (d) => {
      appendLog(d.toString())
      if (Date.now() - tick > 1500) {
        tick = Date.now()
        saveStatus()
      }
    }
    c.stdout.on('data', onData)
    c.stderr.on('data', onData)
    const fail = (message) => reject(Object.assign(new Error(message), { fromRun: true }))
    c.on('error', (e) => fail(`${cmd}: ${e.message}`))
    c.on('exit', (code) => (code === 0 ? resolve() : fail(`${cmd} failed (exit ${code}).`)))
  })

/** Replaces a raw command failure with words the owner can act on. */
const plain = (promise, message) =>
  promise.catch((e) => {
    throw e.fromRun ? Object.assign(new Error(message), { code: e.code }) : e
  })

const dbUrl = () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set, so the content cannot be backed up.')
  return process.env.DATABASE_URL
}
const backupDatabase = async (id) => {
  const file = path.join(BACKUPS, `${id}.dump`)
  await run('pg_dump', ['-Fc', '--no-owner', '-d', dbUrl(), '-f', file])
  // Keep the five newest backups.
  const old = fs
    .readdirSync(BACKUPS)
    .filter((f) => f.endsWith('.dump'))
    .sort()
    .reverse()
    .slice(5)
  for (const f of old) fs.rmSync(path.join(BACKUPS, f), { force: true })
  return file
}
const restoreDatabase = (file) =>
  run('pg_restore', ['--clean', '--if-exists', '--no-owner', '-d', dbUrl(), file])

const migrationsOf = (dir) => {
  try {
    return fs.readdirSync(path.join(dir, 'src', 'migrations')).sort().join('|')
  } catch {
    return ''
  }
}
const sameFile = (a, b) => {
  try {
    return fs.readFileSync(a).equals(fs.readFileSync(b))
  } catch {
    return false
  }
}

/** Things an upload must never bring along. */
const STRIP = ['node_modules', '.next', '.git', 'data', 'media', 'backups', 'public/media']

const unpack = async (file, dest) => {
  const tmp = `${dest}.unpack`
  fs.rmSync(tmp, { recursive: true, force: true })
  fs.rmSync(dest, { recursive: true, force: true })
  fs.mkdirSync(tmp, { recursive: true })
  if (/\.zip$/i.test(file)) await run('unzip', ['-q', '-o', file, '-d', tmp])
  else await run('tar', ['-xzf', file, '-C', tmp, '--no-same-owner'])

  // The site may sit in a single folder inside the archive.
  let root = tmp
  if (!fs.existsSync(path.join(root, 'package.json'))) {
    const dirs = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('__'))
    const inner = dirs.find((d) => fs.existsSync(path.join(root, d.name, 'package.json')))
    if (inner) root = path.join(root, inner.name)
  }
  const pkg = readJSON(path.join(root, 'package.json'), null)
  const deps = { ...(pkg?.dependencies || {}) }
  if (!pkg || !deps.next || !deps.payload || !fs.existsSync(path.join(root, 'src', 'payload.config.ts'))) {
    fs.rmSync(tmp, { recursive: true, force: true })
    throw new Error('This does not look like an UltimaPress site: package.json or src/payload.config.ts is missing.')
  }
  for (const p of STRIP) fs.rmSync(path.join(root, p), { recursive: true, force: true })
  for (const f of fs.readdirSync(root)) if (/^\.env(\..+)?$/.test(f) && f !== '.env.example') fs.rmSync(path.join(root, f))
  // No links pointing outside the folder.
  await run('find', [root, '-type', 'l', '-delete'])
  fs.renameSync(root, dest)
  fs.rmSync(tmp, { recursive: true, force: true })
}

const install = async (dir, fromDir) => {
  const same =
    sameFile(path.join(dir, 'pnpm-lock.yaml'), path.join(fromDir, 'pnpm-lock.yaml')) &&
    sameFile(path.join(dir, 'package.json'), path.join(fromDir, 'package.json'))
  if (same && fs.existsSync(path.join(fromDir, 'node_modules'))) {
    appendLog('\nSame packages as the running version: copying them.\n')
    // Use rsync-style copy for better performance
    await run('rsync', ['-a', '--delete', `${path.join(fromDir, 'node_modules')}/`, `${path.join(dir, 'node_modules')}/`])
    return
  }
  const store = ['--store-dir', path.join(SC, 'pnpm-store')]
  const env = { ...process.env, NODE_ENV: 'development', CI: 'true' }
  try {
    await run('pnpm', ['install', '--frozen-lockfile', '--frozen', ...store], { cwd: dir, env })
  } catch {
    appendLog('\nThe lockfile did not match package.json: installing without it.\n')
    await run('pnpm', ['install', '--no-frozen-lockfile', ...store], { cwd: dir, env })
  }
}

const build = async (dir) => {
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
    UP_SKIP_STATIC: '1',
    NODE_OPTIONS: '--no-deprecation',
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'build-only-secret',
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost',
  }
  // Keeps admin components registered even if that step was forgotten.
  await run(process.execPath, ['node_modules/payload/bin.js', 'generate:importmap'], { cwd: dir, env }).catch(() =>
    appendLog('\n(import map step skipped)\n'),
  )
  await run(process.execPath, ['node_modules/next/dist/bin/next', 'build', '--experimental-build-mode', 'compile'], {
    cwd: dir,
    env,
  })
  if (!isBuilt(dir)) throw new Error('The build finished without producing a site.')
}

const cleanReleases = () => {
  const keep = new Set([state.active, state.previous].filter(Boolean))
  for (const id of fs.readdirSync(RELEASES)) {
    if (!keep.has(id.replace(/\.unpack$/, ''))) fs.rmSync(path.join(RELEASES, id), { recursive: true, force: true })
  }
  for (const id of Object.keys(state.releases || {})) if (!keep.has(id)) delete state.releases[id]
  saveState()
}

/** Stops the live site, starts `id` in its place; on failure puts `backTo` back. */
const switchTo = async (id, backTo) => {
  await stopProcess(main)
  crashes = []
  const c = startMain(id)
  try {
    await waitHealthy(PORT, c)
  } catch (e) {
    await stopProcess(c)
    startMain(backTo)
    throw e
  }
}

// ---------------------------------------------------------------- add-ons

/**
 * Deep check add-on: the Opengrep scanner, downloaded on request to the data volume so it
 * survives image updates. Pinned version, checked against its SHA-256 before use.
 */
const DEEP_DIR = path.join(DATA_DIR, 'addons', 'deep-check')
const DEEP_BIN = path.join(DEEP_DIR, 'opengrep')
const DEEP_STATE = path.join(DEEP_DIR, 'state.json')
const OPENGREP = {
  version: 'v2.0.0',
  x64: { file: 'opengrep_linux_x86', sha256: '37e93f4da5fd04a18c5c1febbdd12f7e98dfccd4d0c9cf2593bcb25eeb462da0' },
  arm64: { file: 'opengrep_linux_aarch64', sha256: '6257b65423a744b704af2ff9beeb8f222c2f6925236af386b56b031d4c06d6d8' },
}
let deepInstall = null // { state: 'installing' | 'failed', error? }

const deepState = () => {
  const s = readJSON(DEEP_STATE, null)
  const installed = Boolean(s?.enabled) && fs.existsSync(DEEP_BIN)
  return {
    id: 'deep-check',
    available: Boolean(OPENGREP[process.arch]),
    enabled: installed,
    version: installed ? s.version : null,
    installedAt: installed ? s.installedAt : null,
    installing: deepInstall?.state === 'installing',
    error: deepInstall?.state === 'failed' ? deepInstall.error : null,
  }
}
const deepOptions = async () => {
  if (!deepState().enabled) return null
  // What the deep check reports on the official code is not repeated for custom versions.
  const key = `${OPENGREP.version}:${readJSON(path.join(APP_DIR, 'package.json'), {}).version || ''}`
  const file = path.join(DEEP_DIR, 'baseline.json')
  let saved = readJSON(file, null)
  if (saved?.key !== key) {
    saved = { key, fingerprints: await deepBaseline(APP_DIR, DEEP_BIN) }
    writeJSON(file, saved)
  }
  return { bin: DEEP_BIN, baseline: saved.fingerprints }
}

/** Downloads in a separate process (docker/download.mjs) and returns the SHA-256. */
const download = (url, file) =>
  new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [fileURLToPath(new URL('./download.mjs', import.meta.url)), url, file])
    let out = ''
    let err = ''
    p.stdout.on('data', (d) => (out += d))
    p.stderr.on('data', (d) => (err = (err + d).slice(-500)))
    p.on('error', reject)
    p.on('close', (code) => (code === 0 ? resolve(out.trim()) : reject(new Error(`The download failed. ${err}`.trim()))))
  })

const installDeep = async () => {
  const asset = OPENGREP[process.arch]
  if (!asset) throw new Error('The Deep check is not available for this type of server.')
  fs.mkdirSync(DEEP_DIR, { recursive: true })
  const tmp = `${DEEP_BIN}.download`
  try {
    const sha = await download(`https://github.com/opengrep/opengrep/releases/download/${OPENGREP.version}/${asset.file}`, tmp)
    if (sha !== asset.sha256) throw new Error('The downloaded scanner did not match its checksum, so it was not installed.')
    fs.renameSync(tmp, DEEP_BIN)
    fs.chmodSync(DEEP_BIN, 0o755)
    const test = spawnSync(DEEP_BIN, ['--version'], { timeout: 60_000 })
    if (test.status !== 0) throw new Error('The scanner was downloaded but does not run on this server.')
  } catch (e) {
    fs.rmSync(tmp, { force: true })
    fs.rmSync(DEEP_BIN, { force: true })
    throw e
  }
  writeJSON(DEEP_STATE, { enabled: true, version: OPENGREP.version, installedAt: new Date().toISOString() })
  log('deep check installed')
}

const setDeep = (enabled) => {
  if (enabled) {
    if (deepInstall?.state === 'installing' || deepState().enabled) return deepState()
    deepInstall = { state: 'installing' }
    // Installed: the owner starts the first scan with Scan now.
    installDeep()
      .then(() => {
        deepInstall = null
      })
      .catch((e) => {
        deepInstall = { state: 'failed', error: e.message }
        log(`deep check install failed: ${e.message}`)
      })
  } else {
    if (deepInstall?.state === 'installing') {
      const e = new Error('The Deep check is still being installed. Try again in a minute.')
      e.code = 'busy'
      throw e
    }
    deepInstall = null
    fs.rmSync(DEEP_DIR, { recursive: true, force: true })
    log('deep check removed')
  }
  return deepState()
}

/**
 * Scan my site add-on (docker/site-scan.mjs): tests the running site with ZAP and Nuclei.
 * Its address is this site's own, from DOMAIN or SITE_URL, never from a request.
 */
const ownURL = () => {
  const site = String(process.env.SITE_URL || '').trim().replace(/\/+$/, '')
  if (/^https?:\/\/[^/\s]+$/.test(site)) return site
  const domain = String(process.env.DOMAIN || '').trim()
  if (/^[a-z0-9.-]+$/i.test(domain)) return `https://${domain}`
  return `http://127.0.0.1:${PORT}` // no domain yet: the site itself, inside the server
}
const siteScan = createSiteScan({
  dataDir: DATA_DIR,
  target: ownURL,
  busy: () => job?.state === 'running',
  log,
})

// ---------------------------------------------------------------- security check

/** Stops an update whose code has a critical security problem. */
const securityGate = async (id, dir) => {
  const deep = await deepOptions().catch(() => null)
  const result = await scanSecurity(dir, { packages: false, deep, official: APP_DIR })
  const summary = `Security check: ${result.critical.length} critical, ${result.warnings.length} warnings, ${result.markedSafe.length} marked safe.\n`
  appendLog(`\n${summary}`)
  if (result.deep && !result.deep.ran) appendLog(`  Deep check skipped: ${result.deep.error}\n`)
  for (const f of result.critical) appendLog(`  CRITICAL ${f.file}:${f.line}  ${f.title}\n`)
  for (const f of result.warnings) appendLog(`  warning  ${f.file}:${f.line}  ${f.title}\n`)
  job.security = {
    ok: result.ok,
    critical: result.critical.length,
    warnings: result.warnings.length,
    markedSafe: result.markedSafe.length,
  }
  if (!result.ok) {
    // Shown on the Site code page with this update only (not kept anywhere else).
    job.security.problems = result.critical.map(({ title, file, line, code, fix }) => ({ title, file, line, code, fix }))
    job.security.forClaude = forClaude(result)
    const n = result.critical.length
    const e = new Error(
      `The security check found ${n} critical problem${n === 1 ? '' : 's'} in this version, so it was not put live. ` +
        'They are listed below: copy them for Claude to fix, then send the update again.',
    )
    e.code = 'security'
    throw e
  }
}

let checking = null
/** Checks the live version's code and packages; saved for Settings > Security. */
// Which UltimaPress image made a saved result: results from an older image are checked again.
const IMAGE_VERSION = `${readJSON(path.join(APP_DIR, 'package.json'), {}).version || ''}:${crypto
  .createHash('sha256')
  .update(fs.readFileSync(fileURLToPath(new URL('./security-check.mjs', import.meta.url))))
  .digest('hex')
  .slice(0, 12)}`
const liveResult = () => {
  const saved = readJSON(SECURITY_FILE, null)
  return saved && saved.checkedBy === IMAGE_VERSION ? saved : null
}

const checkLive = () => {
  checking ??= (async () => {
    try {
      const dir = releaseDir(state.active || null)
      const deep = await deepOptions().catch(() => null)
      const result = await scanSecurity(dir, { deep, official: APP_DIR })
      const saved = { ...result, version: state.active || 'official', checkedBy: IMAGE_VERSION, forClaude: forClaude(result) }
      writeJSON(SECURITY_FILE, saved)
      return saved
    } finally {
      checking = null
    }
  })()
  return checking
}

/**
 * Puts a new version live: `prepare(dir)` writes its code into the version's folder
 * (an upload unpacked, or an UltimaPress update merged), then the usual steps follow.
 */
const goLive = async ({ id, by, note, prepare, cleanup = () => {} }) => {
  const from = state.active || null
  const fromDir = releaseDir(from)
  const dir = releaseDir(id)
  let backup = null
  let candidate = null
  let migrated = false
  try {
    const prepared = (await prepare(dir)) || {}
    migrated = migrationsOf(dir) !== migrationsOf(fromDir)

    setStep('security')
    await securityGate(id, dir)

    setStep('backup')
    backup = await plain(backupDatabase(id), 'Your content could not be backed up, so nothing was changed.')

    setStep('install')
    await plain(install(dir, fromDir), 'The packages the new code needs could not be installed.')
    if (prepared.regenerateTypes) await regenerateTypes(dir)

    setStep('build')
    await plain(build(dir), 'The new code did not build. The details show why.')

    setStep('check')
    candidate = startNext(dir, CANDIDATE_PORT, '127.0.0.1')
    candidate.dbTouched = true
    await waitHealthy(CANDIDATE_PORT, candidate)
    await stopProcess(candidate)
    candidate = null

    setStep('switch')
    state.releases[id] = { createdAt: new Date().toISOString(), by, note, migrated, base: versionOf(dir) }
    try {
      await switchTo(id, from)
    } catch (e) {
      delete state.releases[id]
      throw e
    }
    state.previous = from
    state.active = id
    record({ action: job.kind, id, by, ok: true })
    cleanReleases()
    checkLive().catch(() => {})
  } catch (e) {
    const started = Boolean(candidate?.dbTouched) || job.step === 'switch'
    await stopProcess(candidate)
    if (started && migrated && backup) {
      appendLog('\nThe new version had changed the database: restoring the backup.\n')
      try {
        await restoreDatabase(backup)
        await stopProcess(main)
        startMain(from)
        await waitHealthy(PORT, main).catch(() => {})
      } catch (r) {
        appendLog(`\nRestore failed: ${r.message}\nThe backup is at ${backup}\n`)
      }
    }
    fs.rmSync(dir, { recursive: true, force: true })
    fs.rmSync(`${dir}.unpack`, { recursive: true, force: true })
    record({ action: job.kind, id, by, ok: false, error: e.message })
    throw e
  } finally {
    cleanup()
  }
}

const deploy = ({ id, file, by, note }) =>
  goLive({
    id,
    by,
    note,
    prepare: async (dir) => {
      setStep('unpack')
      await plain(unpack(file, dir), 'The file could not be opened. Send a zip of your site folder.')
    },
    cleanup: () => fs.rmSync(file, { force: true }),
  })

// ---------------------------------------------------------------- UltimaPress updates

const sources = createSources({ appDir: APP_DIR, cacheDir: OFFICIAL, download, log })

/** What the site runs now and the newest UltimaPress it can move to. */
const upgradeInfo = async () => {
  const custom = Boolean(state.active)
  const current = versionOf(releaseDir(state.active || null))
  const image = versionOf(APP_DIR)
  const latest = await sources.latestRelease()
  let target = image
  if (latest && isNewer(latest, target)) target = latest
  const available = Boolean(current && target && isNewer(target, current))
  return {
    custom,
    current,
    image,
    latest,
    target: available ? target : null,
    available,
    autoUpdate: Boolean(state.autoUpdate),
    lastAuto: state.lastAuto || null,
  }
}

/** Generated types (src/payload-types.ts), made again from the merged collections. No database needed. */
const regenerateTypes = (dir) =>
  run(process.execPath, ['node_modules/payload/bin.js', 'generate:types'], {
    cwd: dir,
    env: { ...process.env, NODE_OPTIONS: '--no-deprecation', PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'build-only-secret' },
  }).catch(() => appendLog('\n(the types could not be generated again: the new UltimaPress ones are used)\n'))

/** Zips a folder for download. */
const zipFolder = (dir, file) => run('zip', ['-r', '-q', file, '.'], { cwd: dir })

const upgrade = async ({ id, by, to }) => {
  const info = await upgradeInfo()
  // `to`: the version on this server, after Update in Docker Manager (see autoUpgrade).
  const newVersion = to && isNewer(to, info.current) ? to : info.target
  if (!newVersion) throw new Error('This site already runs the newest UltimaPress.')
  const from = state.active || null
  const ours = releaseDir(from)
  const baseVersion = info.current
  job.upgrade = { from: baseVersion, to: newVersion }
  return goLive({
    id,
    by,
    note: `UltimaPress ${baseVersion} to ${newVersion}`,
    prepare: async (dir) => {
      setStep('prepare')
      const theirs = await sources.get(newVersion)
      appendLog(`\nUltimaPress ${newVersion}: ${theirs === APP_DIR ? 'from this server' : 'ready'}.\n`)
      setStep('merge')
      if (!from) {
        // Official version: nothing of the site's own to bring over.
        copySource(theirs, dir)
        return {}
      }
      const base = await sources.get(baseVersion)
      const result = mergeSites({ base, ours, theirs, out: dir, baseVersion, newVersion })
      appendLog(`\nMerged UltimaPress ${baseVersion} to ${newVersion}: ${result.conflicts.length} file(s) need Claude.\n`)
      for (const n of result.notes) appendLog(`  ${n}\n`)
      for (const c of result.conflicts) appendLog(`  ${c.file}: ${c.why}\n`)
      job.upgrade.notes = result.notes
      if (result.conflicts.length) {
        fs.rmSync(path.join(UPGRADES), { recursive: true, force: true })
        fs.mkdirSync(UPGRADES, { recursive: true })
        await zipFolder(dir, path.join(UPGRADES, `${id}.zip`))
        job.upgrade.conflicts = result.conflicts
        job.upgrade.download = id
        job.upgrade.forClaude = conflictsForClaude({ conflicts: result.conflicts, baseVersion, newVersion })
        const n = result.conflicts.length
        const e = new Error(
          `UltimaPress ${newVersion} and your own features both changed ${n} file${n === 1 ? '' : 's'}, so nothing was changed on your site. ` +
            'Download the updated code and give it to Claude with the text below. Then put it live as usual.',
        )
        e.code = 'conflicts'
        throw e
      }
      return { regenerateTypes: result.typesMerged }
    },
  })
}

const revert = async ({ id, to, restoreData, by }) => {
  const from = state.active || null
  if (!from) throw new Error('The site is already running the official version.')
  const target = to === 'official' ? null : (state.previous ?? null)
  if (target && !isBuilt(releaseDir(target))) throw new Error('The previous version is no longer on the server.')
  const changedData = migrationsOf(releaseDir(from)) !== migrationsOf(releaseDir(target))
  const before = path.join(BACKUPS, `${from}.dump`)
  if (changedData && !restoreData) {
    const e = new Error('The version you are leaving changed the database, so the content has to go back with it.')
    e.code = 'needs_data'
    throw e
  }
  if (changedData && !fs.existsSync(before)) throw new Error('The backup taken before that update is gone.')

  setStep('backup')
  await plain(backupDatabase(id), 'Your content could not be backed up, so nothing was changed.')
  setStep('switch')
  if (changedData) {
    await stopProcess(main)
    try {
      await plain(restoreDatabase(before), 'The content backup could not be restored, so the site stayed as it was.')
    } catch (e) {
      startMain(from)
      throw e
    }
  }
  await switchTo(target, from)
  state.previous = from
  state.active = target
  record({ action: 'revert', id: target || 'official', by, ok: true })
}

const startJob = (kind, params) => {
  if (job && job.state === 'running') {
    const e = new Error('An update is already running.')
    e.code = 'busy'
    throw e
  }
  const id = params.id
  job = {
    id,
    kind,
    state: 'running',
    startedAt: new Date().toISOString(),
    steps: STEPS[kind].map(([key, label]) => ({ key, label, state: 'waiting' })),
    logFile: path.join(LOGS, `${id}.log`),
    log: '',
  }
  saveStatus()
  const work = kind === 'deploy' ? deploy(params) : kind === 'upgrade' ? upgrade(params) : revert(params)
  work
    .then(() => {
      for (const s of job.steps) s.state = 'done'
      job.state = 'done'
    })
    .catch((e) => {
      for (const s of job.steps) if (s.state === 'running') s.state = 'failed'
      job.state = 'failed'
      job.error = e.message
      job.code = e.code
      appendLog(`\n${e.message}\n`)
      log(`${id}: failed: ${e.message}`)
    })
    .finally(() => {
      job.finishedAt = new Date().toISOString()
      saveStatus()
      if (kind === 'upgrade' && params.auto) {
        // Shown on the dashboard and Site code; a failed version is not tried again on its own.
        state.lastAuto = {
          at: job.finishedAt,
          from: job.upgrade?.from || null,
          to: job.upgrade?.to || params.to || null,
          ok: job.state === 'done',
          error: job.state === 'done' ? null : job.error,
          needsClaude: job.code === 'conflicts',
        }
        saveState()
      }
    })
  return job
}

// ---------------------------------------------------------------- control API

const publicState = () => ({
  active: state.active || null,
  previous: state.active ? (state.previous ?? null) : undefined,
  canGoBack: Boolean(state.active),
  hasPrevious: Boolean(state.active && state.previous && isBuilt(releaseDir(state.previous))),
  release: state.active ? state.releases?.[state.active] || null : null,
  history: (state.history || []).slice(0, 8),
  job: job || readJSON(STATUS_FILE, null),
})

http
  .createServer(async (req, res) => {
    const send = (code, body) => {
      res.writeHead(code, { 'content-type': 'application/json' })
      res.end(JSON.stringify(body))
    }
    if (req.headers['x-up-token'] !== TOKEN) return send(401, { error: 'Not allowed.' })
    try {
      if (req.method === 'GET' && req.url === '/status') return send(200, publicState())
      if (req.method === 'GET' && req.url === '/security')
        return send(200, { live: liveResult(), refused: null })
      let raw = ''
      for await (const chunk of req) raw += chunk
      const body = raw ? JSON.parse(raw) : {}
      const id = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)
      if (req.method === 'GET' && req.url === '/addons') return send(200, { addons: [deepState(), siteScan.state()] })
      if (req.method === 'POST' && req.url === '/addons') {
        if (body.id === 'deep-check') setDeep(Boolean(body.enabled))
        else if (body.id === 'site-scan') siteScan.set(Boolean(body.enabled))
        else return send(400, { error: 'Unknown add-on.' })
        return send(200, { addons: [deepState(), siteScan.state()] })
      }
      // Scan my site: GET the last result, POST to start a scan (no address is accepted).
      if (req.method === 'GET' && req.url === '/site-scan') return send(200, { addon: siteScan.state(), result: siteScan.result() })
      if (req.method === 'POST' && req.url === '/site-scan') {
        siteScan.start()
        return send(200, { addon: siteScan.state(), result: siteScan.result() })
      }
      if (req.method === 'POST' && req.url === '/security') {
        await checkLive()
        return send(200, { live: liveResult(), refused: null })
      }
      if (req.method === 'POST' && req.url === '/deploy') {
        const file = path.resolve(String(body.file || ''))
        if (!file.startsWith(INCOMING + path.sep) || !fs.existsSync(file)) return send(400, { error: 'No upload found.' })
        return send(200, { job: startJob('deploy', { id, file, by: body.by, note: body.note }) })
      }
      if (req.method === 'GET' && req.url === '/upgrade') return send(200, await upgradeInfo())
      if (req.method === 'POST' && req.url === '/auto-update') {
        state.autoUpdate = Boolean(body.enabled)
        saveState()
        log(`automatic updates ${state.autoUpdate ? 'on' : 'off'} (${body.by || 'admin'})`)
        return send(200, await upgradeInfo())
      }
      if (req.method === 'POST' && req.url === '/upgrade') {
        return send(200, { job: startJob('upgrade', { id, by: body.by }) })
      }
      if (req.method === 'POST' && req.url === '/revert') {
        // Checked before the job starts, so the page can ask for confirmation.
        const from = state.active || null
        const target = body.to === 'official' ? null : (state.previous ?? null)
        if (from && !body.restoreData && migrationsOf(releaseDir(from)) !== migrationsOf(releaseDir(target))) {
          return send(409, {
            code: 'needs_data',
            error: 'That version changed the database, so going back also restores your content to how it was before that update.',
          })
        }
        return send(200, {
          job: startJob('revert', { id, to: body.to, restoreData: Boolean(body.restoreData), by: body.by }),
        })
      }
      send(404, { error: 'Unknown.' })
    } catch (e) {
      send(e.code === 'busy' ? 409 : 400, { error: e.message, code: e.code })
    }
  })
  .listen(CONTROL_PORT, '127.0.0.1')

// ---------------------------------------------------------------- start

// A job that was running when the container stopped did not finish.
const last = readJSON(STATUS_FILE, null)
if (last && last.state === 'running') {
  writeJSON(STATUS_FILE, { ...last, state: 'failed', error: 'The server restarted during this update.' })
}
if (state.active && !isBuilt(releaseDir(state.active))) {
  log(`version ${state.active} is missing: using the official version`)
  state.active = null
  saveState()
}
for (const f of fs.readdirSync(RELEASES)) if (f.endsWith('.unpack')) fs.rmSync(path.join(RELEASES, f), { recursive: true, force: true })

// If a new container image was deployed, switch to running /app directly
try {
  const buildIdFile = path.join(APP_DIR, '.next', 'BUILD_ID')
  if (fs.existsSync(buildIdFile)) {
    const currentBuildId = fs.readFileSync(buildIdFile, 'utf8').trim()
    if (currentBuildId && currentBuildId !== state.lastImageBuildId) {
      log(`New container image detected (${currentBuildId}): switching to container version in ${APP_DIR}`)
      state.previous = state.active
      state.active = null
      state.lastImageBuildId = currentBuildId
      saveState()
    }
  }
} catch (e) {
  log(`Error checking container build ID: ${e.message}`)
}
startMain(state.active || null)
// A copy of this image's UltimaPress, so sites with their own version can be updated later.
try {
  sources.keepImage()
} catch (e) {
  log(`could not keep a copy of this version: ${e.message}`)
}

/**
 * After Update in Docker Manager, a site running its own version is still on the UltimaPress it
 * was built on. Bring it over to this server's version once, automatically: the owner asked for
 * the update, and it goes through the usual checks (nothing changes if anything fails). This also
 * gives versions made before 1.1.4, whose admin has no Update button, the new UltimaPress.
 */
const autoUpgrade = () => {
  const image = versionOf(APP_DIR)
  const active = state.active
  if (!active || !image) return
  const base = versionOf(releaseDir(active))
  const key = `${active}>${image}`
  if (!base || !isNewer(image, base) || state.autoUpgraded?.[key]) return
  state.autoUpgraded = { [key]: new Date().toISOString() } // once per version and server update
  saveState()
  const id = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)
  log(`your version is built on UltimaPress ${base}: bringing it over to ${image}`)
  try {
    startJob('upgrade', { id, by: 'Automatic, after the server update', to: image, auto: true })
  } catch (e) {
    log(`automatic update not started: ${e.message}`)
  }
}
setTimeout(autoUpgrade, Number(process.env.UP_AUTO_UPGRADE_DELAY || 120) * 1000).unref()

/**
 * Automatic updates (Site code > Keep UltimaPress up to date, off by default): checked every
 * hour, run at night (1 to 5 am, server time) when a new version is out. Same steps as the
 * Update button. A version that failed is not tried again on its own.
 */
const nightlyUpdate = async () => {
  if (!state.autoUpdate || job?.state === 'running') return
  const hour = new Date().getHours()
  if (!process.env.UP_AUTO_UPDATE_ANYTIME && (hour < 1 || hour >= 5)) return
  const info = await upgradeInfo().catch(() => null)
  if (!info?.available || !info.target) return
  if (state.lastAuto && !state.lastAuto.ok && state.lastAuto.to === info.target) return
  const id = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)
  log(`automatic update to UltimaPress ${info.target}`)
  try {
    startJob('upgrade', { id, by: 'Automatic update', to: info.target, auto: true })
  } catch (e) {
    log(`automatic update not started: ${e.message}`)
  }
}
setInterval(() => nightlyUpdate().catch(() => {}), Number(process.env.UP_AUTO_UPDATE_EVERY || 3600) * 1000).unref()
// Older versions kept the last refused update on the Security page; that is no longer shown.
fs.rmSync(path.join(SC, 'security-refused.json'), { force: true })

// Security check of the live version: 5 minutes after start, then once a day.
// A result saved by an older version is out of date: check again soon after starting.
setTimeout(
  () => checkLive().catch((e) => log(`security check failed: ${e.message}`)),
  (liveResult() ? 5 * 60 : 30) * 1000,
).unref()
setInterval(() => checkLive().catch((e) => log(`security check failed: ${e.message}`)), 24 * 3600_000).unref()

const shutdown = async () => {
  shuttingDown = true
  await stopProcess(main, 10000)
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
