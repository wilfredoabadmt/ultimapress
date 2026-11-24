'use client'

import type { Component, Editor } from 'grapesjs'
import postcss from 'postcss'
import React, { useEffect, useRef, useState } from 'react'

import { joinBuilderCss, splitBuilderCss } from '@/utilities/builderCss'
import { mapEmbedURL, toEmbedURL } from '@/utilities/embed'

import { WIDGET_CANVAS_CSS, WIDGET_CSS } from '@/components/Widgets/styles'

import {
  CHROME_TEMPLATES,
  ELEMENTS,
  ICON_OPTIONS,
  PAGE_TEMPLATES,
  TEMPLATES,
  WIDGETS,
  WRAP,
  heroTemplate,
  svgIcon,
  templateIcon,
  type HeroData,
} from './library'
import { EXTRA_WIDGETS, templates as libraryTemplates, type Mode } from './sectionLibrary'

import 'grapesjs/dist/css/grapes.min.css'
import './visual-builder.scss'

export type BuilderSection =
  | { kind: 'design'; index: number; id: string; name: string; html: string; baseCss: string; builderCss: string; synced?: string }
  | { kind: 'ref'; index: number; id: string; name: string; detail: string }

type Block = Record<string, unknown>
type MyTemplate = { id: string; name: string; html: string; css: string }
type Props = {
  admin: string
  pageId: string
  title: string
  slug: string
  sections: BuilderSection[]
  layout: Block[]
  look: { primary: string; accent: string; headingFont: string; bodyFont: string; dark: boolean }
  forms: { id: string; title: string }[]
  hero: HeroData | null
  heroGroup: Record<string, unknown> | null
  myTemplates: MyTemplate[]
  synced: MyTemplate[]
  collections: { id: string; name: string }[]
  videos: { id: string; name: string }[]
  chrome: 'header' | 'footer' | null
  versionDate: string | null
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const newKey = () => 't' + Math.random().toString(36).slice(2, 10)

/** Scope a section's CSS to one wrapper in the canvas (the site does the same on the page). */
function scopeCss(css: string, scope: string): string {
  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      let parent = rule.parent
      while (parent && parent.type !== 'root') {
        if (parent.type === 'atrule' && /keyframes$/i.test((parent as postcss.AtRule).name)) return
        parent = parent.parent as typeof parent
      }
      rule.selectors = rule.selectors.map((sel) => {
        const s = sel.trim()
        const replaced = s.replace(/^(:root|html|body)(?=$|[\s.#:[>+~])/i, scope)
        return replaced !== s ? replaced : `${scope} ${s}`
      })
    })
    return root.toString().replace(/<\/style/gi, '')
  } catch {
    return ''
  }
}

const fontHref = (fonts: string[]) =>
  `https://fonts.googleapis.com/css2?${Array.from(new Set(fonts.filter(Boolean)))
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700;800`)
    .join('&')}&display=swap`

const lock = (c: Component) =>
  c.onAll((x: Component) =>
    x.set({ selectable: false, hoverable: false, layerable: false, draggable: false, droppable: false, editable: false }),
  )

export function VisualBuilder(props: Props) {
  const { admin, pageId, title, slug, sections, layout, look, forms, hero, heroGroup, collections, videos, chrome, versionDate } = props
  const canvasRef = useRef<HTMLDivElement>(null)
  const blocksRef = useRef<HTMLDivElement>(null)
  const layersRef = useRef<HTMLDivElement>(null)
  const stylesRef = useRef<HTMLDivElement>(null)
  const traitsRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<Editor | null>(null)
  const layoutRef = useRef<Block[]>(layout)
  const sourceCss = useRef(new Map<string, string>())
  const instanceCss = useRef(new Map<string, string>())
  const heroConverted = useRef(false)
  const renderTemplatesRef = useRef<() => void>(() => undefined)
  const showTemplatesRef = useRef(false)
  const modeRef = useRef<Mode>('bright')
  const [mode, setMode] = useState<Mode>('bright')
  const convertHeroRef = useRef<() => void>(() => undefined)
  const addSyncedRef = useRef<(list: MyTemplate[]) => void>(() => undefined)
  const syncedCss = useRef(new Map<string, string>(props.synced.map((t) => [t.id, t.css])))
  const savingRef = useRef(false)
  const dirtyRef = useRef(false)
  const saveRef = useRef<(publish: boolean, quiet?: boolean) => Promise<void>>(async () => undefined)
  const [history, setHistory] = useState<{ id: string; date: string; status: string }[] | null>(null)
  const [heroSelected, setHeroSelected] = useState(false)

  const [myTemplates, setMyTemplates] = useState<MyTemplate[]>(props.myTemplates)
  const [leftTab, setLeftTab] = useState<'add' | 'templates' | 'layers'>('add')
  const [rightTab, setRightTab] = useState<'style' | 'settings'>('style')
  const [device, setDevice] = useState('Desktop')
  const [selected, setSelected] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState<'' | 'draft' | 'publish' | 'template'>('')
  const [notice, setNotice] = useState<{ text: string; bad?: boolean } | null>(null)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    let cancelled = false
    let editor: Editor | null = null

    ;(async () => {
      const grapesjs = (await import('grapesjs')).default
      if (cancelled || !canvasRef.current) return

      /** Our own pieces: icons, videos and maps, and forms. */
      const types = (ed: Editor) => {
        const dc = ed.DomComponents
        dc.addType('up-icon', {
          isComponent: (el: HTMLElement) => (el?.classList?.contains?.('up-icon') ? { type: 'up-icon' } : false),
          model: {
            defaults: {
              droppable: false,
              icon: 'star',
              traits: [{ type: 'select', name: 'icon', label: 'Icon', changeProp: true, options: ICON_OPTIONS }],
            },
            init(this: Component) {
              const name = this.getAttributes()['data-icon']
              if (name) this.set('icon', name, { silent: true })
              this.on('change:icon', () => {
                const n = String(this.get('icon') || 'star')
                this.addAttributes({ 'data-icon': n })
                this.components(svgIcon(n))
                this.components().forEach(lock)
              })
              this.components().forEach(lock)
            },
          },
        })
        dc.addType('up-embed', {
          isComponent: (el: HTMLElement) => (el?.classList?.contains?.('up-embed') ? { type: 'up-embed' } : false),
          model: {
            defaults: { droppable: false, link: '' },
            init(this: Component) {
              const kind = this.getAttributes()['data-kind'] === 'map' ? 'map' : 'video'
              this.set('traits' as never, [
                {
                  type: 'text',
                  name: 'link',
                  label: kind === 'map' ? 'Address' : 'Video link (YouTube, Vimeo or Loom)',
                  placeholder: kind === 'map' ? '12 Main Street, Dublin' : 'https://youtu.be/…',
                  changeProp: true,
                },
              ] as never)
              this.set('link', this.getAttributes()['data-link'] || '', { silent: true })
              const refresh = () => {
                const link = String(this.get('link') || '')
                const src = kind === 'map' ? mapEmbedURL(link) : toEmbedURL(link)
                this.addAttributes({ 'data-link': link })
                this.components(
                  src
                    ? `<iframe src="${esc(src)}" title="${kind === 'map' ? 'Map' : 'Video'}" style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>`
                    : '',
                )
                this.components().forEach(lock)
              }
              this.on('change:link', refresh)
              refresh()
            },
          },
        })
        dc.addType('up-form', {
          isComponent: (el: HTMLElement) => (el?.hasAttribute?.('data-up-newform') ? { type: 'up-form' } : false),
          model: {
            defaults: {
              draggable: WRAP,
              droppable: false,
              stylable: false,
              formId: '',
              traits: [
                {
                  type: 'select',
                  name: 'formId',
                  label: 'Form',
                  changeProp: true,
                  options: [{ id: '', name: forms.length ? 'Choose a form' : 'No forms yet: create one under Grow, Forms' }, ...forms.map((f) => ({ id: f.id, name: f.title }))],
                },
              ],
            },
            init(this: Component) {
              this.on('change:formId', () => {
                const f = forms.find((x) => x.id === this.get('formId'))
                this.components(`<strong>Form: ${esc(f?.title || 'choose one in Settings')}</strong><span>Shown here as a card; it appears in full on your site.</span>`)
                this.components().forEach(lock)
              })
              this.components().forEach(lock)
            },
          },
        })

        // Widgets: each gets its own settings in the Settings tab.
        const opt = (values: (string | number)[], label?: (v: string) => string) =>
          values.map((v) => ({ id: String(v), label: label ? label(String(v)) : String(v), name: label ? label(String(v)) : String(v) }))
        const widget = (
          name: string,
          test: (el: HTMLElement) => boolean,
          traits: Record<string, unknown>[],
          extra: Record<string, unknown> = {},
          onChange?: (c: Component) => void,
        ) =>
          dc.addType(name, {
            ...(extra.extend ? { extend: extra.extend as string } : {}),
            isComponent: (el: HTMLElement) => (typeof el?.getAttribute === 'function' && test(el) ? { type: name } : false),
            model: {
              defaults: { traits, ...(extra.defaults as object) },
              init(this: Component) {
                if (onChange) this.on('change:attributes', () => onChange(this))
              },
            },
          })
        const attr = (el: HTMLElement, a: string, v?: string) => (v ? el.getAttribute(a) === v : Boolean(el.hasAttribute?.(a)))
        const cls = (el: HTMLElement, c: string) => el.classList?.contains(c)

        widget('up-stars', (el) => cls(el, 'up-w-stars'),
          [{ type: 'select', name: 'data-up-stars', label: 'Rating', options: opt([5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5], (v) => `${v} out of 5`) }],
          { defaults: { droppable: false, editable: false } },
          (c) => c.addAttributes({ 'aria-label': `Rated ${c.getAttributes()['data-up-stars']} out of 5` }, { silent: true } as never))
        widget('up-progress', (el) => cls(el, 'up-w-progress'),
          [{ type: 'select', name: 'data-up-value', label: 'Filled to', options: opt(Array.from({ length: 21 }, (_, i) => 100 - i * 5), (v) => `${v}%`) }],
          {},
          (c) => {
            const pct = c.find('.up-w-pct')[0]
            if (pct) pct.components(`${c.getAttributes()['data-up-value']}%`)
          })
        widget('up-alert', (el) => cls(el, 'up-w-alert'),
          [{ type: 'select', name: 'data-up-tone', label: 'Colour', options: [{ id: 'info', label: 'Your brand colour', name: 'Your brand colour' }, { id: 'success', label: 'Green', name: 'Green' }, { id: 'warning', label: 'Amber', name: 'Amber' }] }])
        widget('up-tabpanel', (el) => cls(el, 'up-w-tabpanel'),
          [{ type: 'text', name: 'data-title', label: 'Tab name' }])
        widget('up-popup', (el) => attr(el, 'data-up-widget', 'popup'),
          [
            { type: 'text', name: 'data-up-id', label: 'Popup name (link a button to #popup-name)' },
            { type: 'select', name: 'data-up-trigger', label: 'Opens', options: [{ id: 'button', label: 'When a link to it is clicked', name: 'When a link to it is clicked' }, { id: 'timer', label: 'After a few seconds', name: 'After a few seconds' }, { id: 'exit', label: 'When the visitor is about to leave', name: 'When the visitor is about to leave' }] },
            { type: 'number', name: 'data-up-delay', label: 'Seconds to wait (timer)', min: 1, max: 120 },
          ])
        widget('up-countdown', (el) => attr(el, 'data-up-widget', 'countdown'),
          [{ type: 'text', name: 'data-up-until', label: 'Counts down to (year-month-day hour:minute)', placeholder: '2026-12-31 18:00' }],
          { defaults: { droppable: false } })
        widget('up-counter', (el) => attr(el, 'data-up-count'),
          [
            { type: 'text', name: 'data-up-count', label: 'Counts up to' },
            { type: 'text', name: 'data-up-suffix', label: 'After the number (e.g. + or %)' },
          ],
          { extend: 'text' },
          (c) => {
            const a = c.getAttributes()
            c.components(`${a['data-up-count'] || '0'}${a['data-up-suffix'] || ''}`)
          })
        widget('up-carousel', (el) => cls(el, 'up-w-carousel'),
          [
            { type: 'select', name: 'data-up-per', label: 'Slides on screen', options: opt([1, 2, 3]) },
            { type: 'select', name: 'data-up-autoplay', label: 'Move by itself', options: [{ id: '0', label: 'No', name: 'No' }, ...opt([3, 5, 8], (v) => `Every ${v} seconds`)] },
          ])
        widget('up-search', (el) => attr(el, 'data-up-widget', 'search'),
          [
            { type: 'text', name: 'data-up-placeholder', label: 'Text in the box' },
            { type: 'text', name: 'data-up-button', label: 'Button text' },
          ],
          { defaults: { droppable: false } })
        widget('up-crumbs', (el) => attr(el, 'data-up-widget', 'breadcrumbs'),
          [{ type: 'text', name: 'data-up-home', label: 'Name of the first link', placeholder: 'Home' }],
          { defaults: { droppable: false } })
        // The video behind a section: kept as a plain, silent, looping video (no player controls).
        dc.addType('up-bgvid', {
          isComponent: (el: HTMLElement) =>
            el?.tagName === 'VIDEO' && el.parentElement?.classList?.contains('up-w-bgvideo') ? { type: 'up-bgvid', tagName: 'video' } : false,
          model: {
            defaults: { tagName: 'video', droppable: false, selectable: false, hoverable: false, layerable: false, draggable: false },
            init(this: Component) {
              this.removeAttributes(['controls', 'allowfullscreen'])
              this.addAttributes({ autoplay: '', muted: '', loop: '', playsinline: '' })
            },
          },
        })
        dc.addType('up-bgvideo', {
          isComponent: (el: HTMLElement) => (el?.classList?.contains?.('up-w-bgvideo') ? { type: 'up-bgvideo' } : false),
          model: {
            defaults: {
              traits: [
                {
                  type: 'select',
                  name: 'videoSrc',
                  label: 'Video',
                  changeProp: true,
                  options: [{ id: '', label: videos.length ? 'Choose a video' : 'Upload an MP4 in Media first', name: videos.length ? 'Choose a video' : 'Upload an MP4 in Media first' }, ...videos.map((v) => ({ id: v.id, label: v.name, name: v.name }))],
                },
              ],
            },
            init(this: Component) {
              const vid = this.components().find((c: Component) => c.get('tagName') === 'video')
              if (vid) {
                this.set('videoSrc', vid.getAttributes().src || '', { silent: true })
                lock(vid)
              }
              this.on('change:videoSrc', () => {
                const v = this.components().find((c: Component) => c.get('tagName') === 'video')
                if (v) v.addAttributes({ src: String(this.get('videoSrc') || '') })
              })
            },
          },
        })
        dc.addType('up-grid', {
          isComponent: (el: HTMLElement) => (el?.getAttribute?.('data-up-newblock') === 'loopGrid' ? { type: 'up-grid' } : false),
          model: {
            defaults: {
              draggable: WRAP,
              droppable: false,
              stylable: false,
              collection: collections[0]?.id || '',
              heading: '',
              limit: 6,
              showFilter: false,
              loadMore: true,
              traits: [
                { type: 'select', name: 'collection', label: 'Show', changeProp: true, options: collections.map((c) => ({ id: c.id, label: c.name, name: c.name })) },
                { type: 'text', name: 'heading', label: 'Heading (optional)', changeProp: true },
                { type: 'number', name: 'limit', label: 'How many at first', changeProp: true, min: 1, max: 48 },
                { type: 'checkbox', name: 'showFilter', label: 'Category filter (posts)', changeProp: true },
                { type: 'checkbox', name: 'loadMore', label: 'Load more button', changeProp: true },
              ],
            },
            init(this: Component) {
              const label = () => {
                const c = collections.find((x) => x.id === this.get('collection'))
                this.components(`<strong>Content grid: ${esc(c?.name || 'choose what to show')}</strong><span>${esc(String(this.get('limit') || 6))} at first${this.get('loadMore') ? ', with Load more' : ''}. It shows your newest items on the site.</span>`)
                this.components().forEach(lock)
              }
              this.on('change:collection change:limit change:loadMore', label)
              label()
            },
          },
        })
      }

      editor = grapesjs.init({
        container: canvasRef.current,
        height: '100%',
        width: 'auto',
        fromElement: false,
        storageManager: false,
        panels: { defaults: [] },
        plugins: [types],
        undoManager: { trackSelection: false },
        selectorManager: { componentFirst: true },
        blockManager: { appendTo: blocksRef.current!, blocks: [] },
        layerManager: { appendTo: layersRef.current! },
        styleManager: { appendTo: stylesRef.current! },
        traitManager: { appendTo: traitsRef.current! },
        deviceManager: {
          devices: [
            { id: 'Desktop', name: 'Desktop', width: '' },
            { id: 'Tablet', name: 'Tablet', width: '768px', widthMedia: '992px' },
            { id: 'Phone', name: 'Phone', width: '375px', widthMedia: '480px' },
          ],
        },
        assetManager: {
          assets: [],
          autoAdd: true,
          uploadFile: async (ev: DragEvent | Event) => {
            const files = (ev as DragEvent).dataTransfer?.files || (ev.target as HTMLInputElement)?.files
            if (!files) return
            for (const file of Array.from(files)) {
              const fd = new FormData()
              fd.append('file', file)
              fd.append('_payload', JSON.stringify({ alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') }))
              try {
                const res = await fetch('/api/media', { method: 'POST', body: fd, credentials: 'include' })
                const data = await res.json()
                if (data?.doc?.url) editor?.AssetManager.add({ src: data.doc.url, name: data.doc.filename })
              } catch {
                setNotice({ text: 'That photo could not be uploaded.', bad: true })
              }
            }
          },
        },
      })
      editorRef.current = editor
      if (process.env.NODE_ENV !== 'production') (window as unknown as { upBuilder?: Editor }).upBuilder = editor
      const ed = editor

      // Elements and templates.
      for (const b of [...ELEMENTS, ...WIDGETS, ...EXTRA_WIDGETS]) ed.Blocks.add(b.id, { label: b.label, category: b.category, media: b.media, content: b.content as never, activate: b.activate })
      const addTemplateBlock = (id: string, label: string, category: string, html: string, css: string) => {
        sourceCss.current.set(id, css)
        ed.Blocks.add(id, {
          label,
          category,
          media: templateIcon(category),
          content: { tagName: 'div', attributes: { 'data-up-design': '', 'data-up-tplsrc': id, class: 'up-design' }, components: html, draggable: WRAP } as never,
        })
      }
      function addSyncedBlocks(list: MyTemplate[]) {
        for (const t of list) {
          sourceCss.current.set(`syn-${t.id}`, t.css)
          ed.Blocks.add(`syn-${t.id}`, {
            label: t.name,
            category: 'Synced sections',
            media: templateIcon('Synced'),
            content: { tagName: 'div', attributes: { 'data-up-design': '', 'data-up-tplsrc': `syn-${t.id}`, 'data-up-synced': t.id, class: 'up-design' }, components: t.html, draggable: WRAP } as never,
          })
        }
      }
      addSyncedRef.current = addSyncedBlocks
      for (const t of TEMPLATES) addTemplateBlock(`tpl-${t.key}`, t.label, t.category, t.html, t.css)
      for (const t of CHROME_TEMPLATES) addTemplateBlock(`tpl-${t.key}`, t.label, t.category, t.html, t.css)
      for (const t of props.myTemplates) addTemplateBlock(`my-${t.id}`, t.name, 'My templates', t.html, t.css)
      addSyncedBlocks(props.synced)
      // The second library: each section in a Bright and a Dark version.
      for (const b of [...libraryTemplates('bright'), ...libraryTemplates('dark')]) {
        ed.Blocks.add(b.id, { label: b.label, category: b.category, media: b.media, content: b.content as never })
      }
      // Whole pages: several ready-designed sections at once.
      for (const pg of PAGE_TEMPLATES) {
        ed.Blocks.add(pg.key, {
          label: pg.label,
          category: 'Whole pages',
          media: templateIcon('Content'),
          content: pg.sections
            .map((k) => TEMPLATES.find((t) => t.key === k))
            .filter(Boolean)
            .map((t) => ({ tagName: 'div', attributes: { 'data-up-design': '', 'data-up-tplsrc': `tpl-${t!.key}`, class: 'up-design' }, components: t!.html, draggable: WRAP })) as never,
        })
      }

      // One list on screen at a time: elements (Add tab) or templates (Templates tab).
      const renderLists = () => {
        const all = ed.Blocks.getAll().models
        const templates = showTemplatesRef.current
        const otherMode = modeRef.current === 'dark' ? 'lib-bright-' : 'lib-dark-'
        ed.Blocks.render(
          all.filter((b) => /^(tpl|my|syn|page|lib)-/.test(b.getId()) === templates && !b.getId().startsWith(otherMode)),
        )
      }
      renderTemplatesRef.current = renderLists
      renderLists()

      // The page: hero, designed sections, and ready-made blocks as cards.
      const parts: string[] = []
      if (hero) {
        parts.push(
          `<div data-up-hero="1" class="up-ref up-ref--hero"><strong>Page hero</strong><span>Edit it in the page editor, or turn it into a section to design it here.</span><button type="button" data-up-convert="1">Turn into a section</button></div>`,
        )
      }
      for (const s of sections) {
        parts.push(
          s.kind === 'design'
            ? `<div data-up-design="${esc(s.id)}"${s.synced ? ` data-up-synced="${esc(s.synced)}"` : ''} class="up-design up-d-${esc(s.id)}">${s.html}</div>`
            : `<div data-up-ref="${s.index}" class="up-ref"><strong>${esc(s.name)}${s.detail ? `: ${esc(s.detail)}` : ''}</strong><span>A ready-made block. Move or remove it here; change its content in the page editor.</span></div>`,
        )
      }
      ed.setComponents(parts.join(''))
      ed.setStyle(sections.map((s) => (s.kind === 'design' ? s.builderCss : '')).join('\n'))

      const wrapper = ed.getWrapper()!
      const lockSvgs = (root: Component) =>
        root.onAll((c: Component) => {
          if (c.get('type') === 'svg' || c.get('type') === 'svg-in') lock(c)
        })

      const prepareTop = (c: Component) => {
        const a = c.getAttributes()
        if (a['data-up-hero'] != null) {
          c.set({ name: 'Page hero', draggable: false, removable: false, copyable: false, droppable: false, stylable: false, editable: false, toolbar: [] })
          c.components().forEach(lock)
        } else if (a['data-up-ref'] != null) {
          c.set({ draggable: WRAP, droppable: false, stylable: false, editable: false, copyable: false })
          c.components().forEach(lock)
        } else if (a['data-up-design'] != null) {
          c.set({ draggable: WRAP, stylable: false })
        }
        lockSvgs(c)
      }
      wrapper.components().forEach((c: Component, i: number) => {
        const s = sections[hero ? i - 1 : i]
        if (s) c.set({ name: s.kind === 'design' ? `Section: ${s.name}` : s.name })
        prepareTop(c)
      })

      // Canvas styles: the site's look, each section's own styles, and the builder's helpers.
      const canvasCss = () => WIDGET_CSS + WIDGET_CANVAS_CSS + `
:root{--up-primary:${look.primary};--up-accent:${look.accent};--up-font-heading:'${look.headingFont}',ui-sans-serif,system-ui,sans-serif;--up-font-body:'${look.bodyFont}',ui-sans-serif,system-ui,sans-serif;--radius:.75rem}
html,body{margin:0;font-family:var(--up-font-body);background:${look.dark ? '#07070a' : '#ffffff'}!important;color:${look.dark ? '#f4f3f8' : '#16161a'}!important}
.up-design{background:${look.dark ? '#07070a' : 'transparent'}}
h1,h2,h3,h4,h5,h6{font-family:var(--up-font-heading)}
*,*::before,*::after{animation-duration:1ms!important;animation-delay:0s!important;animation-iteration-count:1!important;animation-fill-mode:both!important;animation-timeline:auto!important}
img{max-width:100%}
[data-up-design]{min-height:24px}
.up-embed iframe{pointer-events:none}
.up-embed:empty::after{position:absolute;inset:0;display:grid;place-items:center;padding:16px;text-align:center;color:#6e6a80;font:15px system-ui,sans-serif}
.up-embed[data-kind=video]:empty::after{content:'Select this, then paste a video link in the Settings tab'}
.up-embed[data-kind=map]:empty::after{content:'Select this, then type an address in the Settings tab'}
.up-ref{margin:16px;padding:28px;border:2px dashed #b9b4cc;border-radius:14px;background:#f6f4fb;color:#3b3550;font:15px/1.5 system-ui,sans-serif;display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.up-ref strong{font-size:17px}
.up-ref span{color:#6e6a80}
.up-ref--hero{background:#ece8f8}
.up-ref button{margin-top:8px;padding:9px 16px;border:0;border-radius:999px;background:${look.primary};color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer}
`
      const injectSection = (doc: Document, key: string, css: string) => {
        if (doc.querySelector(`style[data-up-tpl-style="${key}"]`)) return
        const style = doc.createElement('style')
        style.setAttribute('data-up-tpl-style', key)
        style.textContent = scopeCss(css, `[data-up-tpl="${key}"]`)
        doc.head.appendChild(style)
      }
      const addCanvasStyles = () => {
        const doc = ed.Canvas.getDocument()
        if (!doc) return
        if (!doc.getElementById('up-base-css')) {
          const link = doc.createElement('link')
          link.rel = 'stylesheet'
          link.href = fontHref([look.headingFont, look.bodyFont])
          doc.head.appendChild(link)
          const style = doc.createElement('style')
          style.id = 'up-base-css'
          style.textContent = canvasCss() + '\n' + sections.map((s) => (s.kind === 'design' ? s.baseCss : '')).join('\n')
          doc.head.appendChild(style)
          doc.addEventListener(
            'mousedown',
            (e) => {
              if ((e.target as HTMLElement)?.closest?.('[data-up-convert]')) {
                e.preventDefault()
                e.stopPropagation()
                convertHero()
              }
            },
            true,
          )
        }
        instanceCss.current.forEach((css, key) => injectSection(doc, key, css))
      }

      // Turn the page hero into a designed section, with its own words, photo and buttons.
      convertHeroRef.current = () => convertHero()
      function convertHero() {
        if (!hero) return
        const heroComp = wrapper.components().find((c: Component) => c.getAttributes()['data-up-hero'] != null)
        if (!heroComp) return
        const { html, css } = heroTemplate(hero)
        const key = newKey()
        instanceCss.current.set(key, css)
        const doc = ed.Canvas.getDocument()
        if (doc) injectSection(doc, key, css)
        const at = heroComp.index()
        heroComp.set({ removable: true })
        heroComp.remove()
        const added = wrapper.append({ tagName: 'div', attributes: { 'data-up-design': '', 'data-up-tpl': key, class: 'up-design' }, components: html } as never, { at })[0]
        added?.set({ name: 'Section: hero' })
        heroConverted.current = true
        setDirty(true)
        setNotice({ text: 'The hero is now a section you can design. Publish to keep it.' })
        setHeroSelected(false)
      }

      ed.on('canvas:frame:load', addCanvasStyles)
      ed.on('load', () => {
        addCanvasStyles()
        ed.UndoManager.clear()
        setDirty(false)
        dirtyRef.current = false
        if (versionDate) setNotice({ text: `You're looking at the version from ${new Date(versionDate).toLocaleString()}. Publish to make it live again, or go back to the page editor to leave it.` })
      })

      // A template dropped on the page gets its own copy of the template's styles.
      ed.on('component:add', (c: Component) => {
        if (c.parent() !== ed.getWrapper()) {
          lockSvgs(c)
          return
        }
        const src = c.getAttributes()['data-up-tplsrc']
        if (src) {
          const full = sourceCss.current.get(src) || ''
          // A synced section's own builder styles stay editable; the rest is its fixed design.
          const parts = src.startsWith('syn-') ? splitBuilderCss(full) : { base: full, builder: '' }
          const css = parts.base
          if (parts.builder) ed.Css.addRules(parts.builder)
          const key = newKey()
          instanceCss.current.set(key, css)
          c.removeAttributes('data-up-tplsrc')
          c.addAttributes({ 'data-up-tpl': key })
          const doc = ed.Canvas.getDocument()
          if (doc) injectSection(doc, key, css)
          const block = ed.Blocks.get(src)
          c.set({ name: `Section: ${block?.getLabel?.() || 'template'}` })
        }
        prepareTop(c)
      })

      // Your media library, ready to pick from.
      fetch('/api/media?limit=200&depth=0&sort=-createdAt', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => {
          const docs = Array.isArray(d?.docs) ? d.docs : []
          ed.AssetManager.add(
            docs
              .filter((m: { url?: string; mimeType?: string }) => m.url && (!m.mimeType || m.mimeType.startsWith('image/')))
              .map((m: { url: string; filename?: string }) => ({ src: m.url, name: m.filename })),
          )
        })
        .catch(() => undefined)

      ed.on('component:selected', (c: Component) => {
        const a = c?.getAttributes?.() || {}
        if (c && c !== ed.getWrapper() && a['data-up-ref'] == null && a['data-up-hero'] == null && a['data-up-newform'] == null && a['data-up-newblock'] == null && !c.getTrait('data-up-anim')) {
          c.addTrait(
            [
              { type: 'select', name: 'data-up-anim', label: 'Entrance effect', options: [{ id: '', label: 'None', name: 'None' }, { id: 'fade', label: 'Fade in', name: 'Fade in' }, { id: 'up', label: 'Slide up', name: 'Slide up' }, { id: 'left', label: 'Slide in from the left', name: 'Slide in from the left' }, { id: 'right', label: 'Slide in from the right', name: 'Slide in from the right' }, { id: 'zoom', label: 'Zoom in', name: 'Zoom in' }] },
              { type: 'select', name: 'data-up-hover', label: 'Hover effect', options: [{ id: '', label: 'None', name: 'None' }, { id: 'lift', label: 'Lift', name: 'Lift' }, { id: 'grow', label: 'Grow', name: 'Grow' }, { id: 'glow', label: 'Glow', name: 'Glow' }, { id: 'brighten', label: 'Brighten', name: 'Brighten' }] },
            ] as never,
          )
        }
        setSelected(true)
        setHeroSelected(c?.getAttributes?.()['data-up-hero'] != null)
        if (['up-embed', 'up-form', 'up-icon', 'link', 'image'].includes(String(c?.get?.('type')))) setRightTab('settings')
      })
      ed.on('component:deselected', () => setSelected(Boolean(ed.getSelected())))
      ed.on('update', () => {
        setDirty(true)
        dirtyRef.current = true
      })
    })()

    return () => {
      cancelled = true
      editor?.destroy()
      editorRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    showTemplatesRef.current = leftTab === 'templates'
    modeRef.current = mode
    if (leftTab !== 'layers') renderTemplatesRef.current()
  }, [leftTab, mode])

  // Autosave: a draft every 45 seconds while there are changes (never for the header,
  // footer or an older version, which are only saved when you choose to).
  useEffect(() => {
    if (chrome || versionDate) return
    const t = setInterval(() => {
      if (dirtyRef.current && !savingRef.current) saveRef.current(false, true)
    }, 45000)
    return () => clearInterval(t)
  }, [chrome, versionDate])

  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (!dirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [dirty])

  // ---- Helpers shared by saving the page and saving a template ----

  const topOf = (ed: Editor, c: Component | undefined): Component | undefined => {
    const wrapper = ed.getWrapper()!
    let cur = c
    while (cur && cur.parent() && cur.parent() !== wrapper) cur = cur.parent()
    return cur && cur.parent() === wrapper ? cur : undefined
  }

  /** Styles added in the builder, grouped by the top-level piece that holds the element. */
  const collectRules = (ed: Editor) => {
    const wrapper = ed.getWrapper()!
    const rulesOf = new Map<Component, string[]>()
    for (const rule of ed.Css.getRules()) {
      const css = rule.toCSS()
      if (!css) continue
      const sel = rule.selectorsToString()
      if (!sel || /^(body|html|\*)$/i.test(sel.trim())) continue
      let found: Component | undefined
      const idMatch = sel.match(/#([\w-]+)/)
      if (idMatch) found = wrapper.find(`#${idMatch[1]}`)[0]
      if (!found) {
        try {
          found = wrapper.find(sel.replace(/::?[\w-]+(\([^)]*\))?/g, '').trim())[0]
        } catch {
          found = undefined
        }
      }
      const top = topOf(ed, found)
      if (!top) continue
      rulesOf.set(top, [...(rulesOf.get(top) || []), css])
    }
    return rulesOf
  }

  /** The section's own styles (as written by Claude, a template or by hand). */
  const baseCssOf = (c: Component): string => {
    const a = c.getAttributes()
    const id = a['data-up-design'] ? String(a['data-up-design']) : ''
    const orig = id ? layoutRef.current.find((b) => String(b.id) === id) : undefined
    if (a['data-up-synced']) {
      const shared = syncedCss.current.get(String(a['data-up-synced']))
      if (shared != null) return splitBuilderCss(shared).base
    }
    if (orig) return splitBuilderCss(orig.css as string).base
    if (a['data-up-tpl']) return instanceCss.current.get(String(a['data-up-tpl'])) || ''
    return ''
  }

  const save = async (publish: boolean, quiet = false) => {
    const ed = editorRef.current
    if (!ed || savingRef.current) return
    const wrapper = ed.getWrapper()!
    const tops = wrapper.components().models.slice()
    const rulesOf = collectRules(ed)

    type Piece =
      | { kind: 'ref'; index: number; comp: Component }
      | { kind: 'form'; comp: Component; formId: string }
      | { kind: 'grid'; comp: Component }
      | { kind: 'design'; id: string | null; comp: Component }
      | { kind: 'new'; comps: Component[] }
    const pieces: Piece[] = []
    let loose: Component[] = []
    const flush = () => {
      if (loose.length) pieces.push({ kind: 'new', comps: loose })
      loose = []
    }
    const fail = (c: Component, text: string) => {
      if (quiet) return
      ed.select(c)
      setRightTab('settings')
      setNotice({ text, bad: true })
    }
    const seen = new Set<string>()
    for (const c of tops) {
      const a = c.getAttributes()
      if (a['data-up-hero'] != null) continue
      if (a['data-up-ref'] != null) {
        flush()
        pieces.push({ kind: 'ref', index: Number(a['data-up-ref']), comp: c })
      } else if (a['data-up-newform'] != null) {
        flush()
        const formId = String(c.get('formId') || '')
        if (!formId) return fail(c, 'Choose which form to show: select the form card, then pick one in Settings.')
        pieces.push({ kind: 'form', comp: c, formId })
      } else if (a['data-up-newblock'] === 'loopGrid') {
        flush()
        if (!c.get('collection')) return fail(c, 'Choose what the content grid shows: select it, then pick in Settings.')
        pieces.push({ kind: 'grid', comp: c })
      } else if (a['data-up-design'] != null) {
        flush()
        const id = String(a['data-up-design'] || '')
        if (id && !seen.has(id)) {
          seen.add(id)
          pieces.push({ kind: 'design', id, comp: c })
        } else pieces.push({ kind: 'design', id: null, comp: c })
      } else loose.push(c)
    }
    flush()

    const htmlOf = (p: Piece) =>
      p.kind === 'design' ? p.comp.getInnerHTML() : p.kind === 'new' ? p.comps.map((c) => c.toHTML()).join('') : ''
    const cssOf = (p: Piece) =>
      p.kind === 'design'
        ? joinBuilderCss(baseCssOf(p.comp), (rulesOf.get(p.comp) || []).join('\n'))
        : p.kind === 'new'
          ? joinBuilderCss('', p.comps.flatMap((c) => rulesOf.get(c) || []).join('\n'))
          : ''

    savingRef.current = true
    setSaving(publish ? 'publish' : 'draft')
    if (!quiet) setNotice(null)
    try {
      // Synced sections are saved once, for every page that shows them.
      for (const p of pieces) {
        if (p.kind !== 'design') continue
        const syncedId = p.comp.getAttributes()['data-up-synced']
        if (!syncedId) continue
        const css = cssOf(p)
        const r = await fetch(`/api/synced-sections/${encodeURIComponent(String(syncedId))}?depth=0`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ html: htmlOf(p), css }),
        })
        if (r.ok) syncedCss.current.set(String(syncedId), css)
      }

      // The header or footer: everything on the canvas becomes one design.
      if (chrome) {
        const designable = pieces.filter((p) => p.kind === 'design' || p.kind === 'new')
        const res = await fetch(`/api/globals/${chrome}?depth=0`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            designed: designable.length > 0,
            designHtml: designable.map(htmlOf).join('\n'),
            designCss: designable.map(cssOf).join('\n'),
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setNotice({ text: data?.errors?.[0]?.message || `The ${chrome} could not be saved.`, bad: true })
          return
        }
        ed.UndoManager.clear()
        setDirty(false)
        dirtyRef.current = false
        setNotice({ text: designable.length ? `Saved. Your designed ${chrome} is now on every page.` : `Saved. The standard ${chrome} is back.` })
        return
      }

      const byId = new Map(layoutRef.current.map((b) => [String(b.id), b]))
      const nextLayout: Block[] = pieces.map((p) => {
        if (p.kind === 'ref') return layoutRef.current[p.index]
        if (p.kind === 'form') {
          return { blockType: 'formBlock', blockName: 'form', form: /^\d+$/.test(p.formId) ? Number(p.formId) : p.formId, enableIntro: false }
        }
        if (p.kind === 'grid') {
          return {
            blockType: 'loopGrid',
            blockName: String(p.comp.get('collection')),
            collection: String(p.comp.get('collection')),
            heading: String(p.comp.get('heading') || ''),
            limit: Number(p.comp.get('limit')) || 6,
            showFilter: Boolean(p.comp.get('showFilter')),
            loadMore: p.comp.get('loadMore') !== false,
          }
        }
        if (p.kind === 'design') {
          const a = p.comp.getAttributes()
          const orig = byId.get(String(a['data-up-design'] || '')) || { blockType: 'design', blockName: 'section', fullWidth: true }
          const syncedId = a['data-up-synced'] ? String(a['data-up-synced']) : ''
          const block: Block = {
            ...orig,
            html: htmlOf(p),
            css: cssOf(p),
            synced: syncedId ? (/^\d+$/.test(syncedId) ? Number(syncedId) : syncedId) : null,
          }
          if (!p.id) delete block.id
          return block
        }
        return { blockType: 'design', blockName: 'section', fullWidth: true, html: htmlOf(p), css: cssOf(p) }
      })

      const body: Record<string, unknown> = { layout: nextLayout, _status: publish ? 'published' : 'draft' }
      if (heroConverted.current && heroGroup) body.hero = { ...heroGroup, type: 'none' }

      const res = await fetch(`/api/pages/${pageId}?depth=0${publish ? '' : '&draft=true'}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.doc) {
        setNotice({ text: data?.errors?.[0]?.message || 'The page could not be saved.', bad: true })
        return
      }
      const saved: Block[] = Array.isArray(data.doc.layout) ? data.doc.layout : nextLayout
      layoutRef.current = saved
      heroConverted.current = false

      // Bring the editor in line with what was saved, so the next save is the same page.
      pieces.forEach((p, i) => {
        const block = saved[i]
        if (!block) return
        const newId = String(block.id ?? '')
        if (p.kind === 'ref') p.comp.addAttributes({ 'data-up-ref': String(i) })
        else if (p.kind === 'form' || p.kind === 'grid') {
          p.comp.removeAttributes(p.kind === 'form' ? 'data-up-newform' : 'data-up-newblock')
          p.comp.addAttributes({ 'data-up-ref': String(i) })
        } else if (p.kind === 'design') p.comp.addAttributes({ 'data-up-design': newId })
        else {
          const at = p.comps[0].index()
          const holder = wrapper.append(`<div data-up-design="${esc(newId)}" class="up-design"></div>`, { at })[0]
          for (const c of p.comps) c.move(holder, { at: holder.components().length })
          holder.set({ name: 'Section: section', draggable: WRAP, stylable: false })
        }
      })
      ed.UndoManager.clear()
      setDirty(false)
      dirtyRef.current = false
      setNotice({
        text: quiet
          ? `Draft saved automatically at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
          : publish
            ? 'Published. The page on your site is updated.'
            : 'Draft saved. Publish when you are ready.',
      })
    } catch {
      setNotice({ text: 'The page could not be saved. Check your connection and try again.', bad: true })
    } finally {
      savingRef.current = false
      setSaving('')
    }
  }
  saveRef.current = save

  /** Turn the selected section into a synced section, used on many pages. */
  const makeSynced = async () => {
    const ed = editorRef.current
    if (!ed || saving) return
    const top = topOf(ed, ed.getSelected())
    const a = top?.getAttributes() || {}
    if (!top || a['data-up-design'] == null) {
      setNotice({ text: 'Select something inside a designed section first.', bad: true })
      return
    }
    if (a['data-up-synced']) {
      setNotice({ text: 'This section is already synced: your changes update every page that uses it.' })
      return
    }
    const name = window.prompt('Name this synced section', 'Shared section')?.trim()
    if (!name) return
    const css = joinBuilderCss(baseCssOf(top), (collectRules(ed).get(top) || []).join('\n'))
    const res = await fetch('/api/synced-sections', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, html: top.getInnerHTML(), css }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.doc) {
      setNotice({ text: data?.errors?.[0]?.message || 'That could not be saved.', bad: true })
      return
    }
    const id = String(data.doc.id)
    syncedCss.current.set(id, css)
    top.addAttributes({ 'data-up-synced': id })
    top.set({ name: `Synced: ${name}` })
    addSyncedRef.current([{ id, name, html: top.getInnerHTML(), css }])
    renderTemplatesRef.current()
    setDirty(true)
    dirtyRef.current = true
    setNotice({ text: `"${name}" is now a synced section. Add it to other pages from Templates, Synced sections. Save to link this page.` })
  }

  /** Earlier versions of the page, to look at and publish again. */
  const openHistory = async () => {
    if (history) {
      setHistory(null)
      return
    }
    try {
      const res = await fetch(`/api/pages/versions?where[parent][equals]=${encodeURIComponent(pageId)}&sort=-updatedAt&limit=25&depth=0`, { credentials: 'include' })
      const data = await res.json()
      setHistory(
        (data.docs || []).map((v: { id: string; updatedAt: string; version?: { _status?: string } }) => ({
          id: String(v.id),
          date: v.updatedAt,
          status: v.version?._status === 'published' ? 'Published' : 'Draft',
        })),
      )
    } catch {
      setNotice({ text: 'The history could not be loaded.', bad: true })
    }
  }

  /** Save the selected section to "My templates", ready to reuse on any page. */
  const saveTemplate = async () => {
    const ed = editorRef.current
    if (!ed || saving) return
    const top = topOf(ed, ed.getSelected())
    const a = top?.getAttributes() || {}
    if (!top || a['data-up-ref'] != null || a['data-up-hero'] != null || a['data-up-newform'] != null) {
      setNotice({ text: 'Select something inside a section you designed, then save it as a template.', bad: true })
      return
    }
    const name = window.prompt('Name this template', 'My section')?.trim()
    if (!name) return

    // Element styles are tied to this page; give them classes so each copy styles itself.
    const ids = new Set<string>()
    const rules = (collectRules(ed).get(top) || []).map((css) =>
      css.replace(/#(i[\w-]*)(?![\w-])/g, (_m, id: string) => {
        ids.add(id)
        return `.t-${id}`
      }),
    )
    const attributes = (m: Component, attrs: Record<string, unknown>) => {
      const id = m.getId()
      if (ids.has(id)) {
        attrs.class = [attrs.class, `t-${id}`].filter(Boolean).join(' ')
        delete attrs.id
      }
      return attrs
    }
    const isSection = a['data-up-design'] != null
    const html = (isSection ? top.components().models : [top]).map((c) => c.toHTML({ attributes })).join('')
    const css = [isSection ? baseCssOf(top) : '', ...rules].filter(Boolean).join('\n')

    setSaving('template')
    try {
      const res = await fetch('/api/section-templates', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, html, css }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.doc) {
        setNotice({ text: data?.errors?.[0]?.message || 'The template could not be saved.', bad: true })
        return
      }
      const t: MyTemplate = { id: String(data.doc.id), name, html: String(data.doc.html || html), css }
      sourceCss.current.set(`my-${t.id}`, t.css)
      ed.Blocks.add(`my-${t.id}`, {
        label: t.name,
        category: 'My templates',
        media: templateIcon('My templates'),
        content: { tagName: 'div', attributes: { 'data-up-design': '', 'data-up-tplsrc': `my-${t.id}`, class: 'up-design' }, components: t.html, draggable: WRAP } as never,
      })
      renderTemplatesRef.current()
      setMyTemplates((list) => [...list, t])
      setNotice({ text: `Saved "${name}". Find it under Templates, My templates.` })
    } catch {
      setNotice({ text: 'The template could not be saved.', bad: true })
    } finally {
      setSaving('')
    }
  }

  const switchDevice = (name: string) => {
    editorRef.current?.setDevice(name)
    setDevice(name)
  }
  const togglePreview = () => {
    const ed = editorRef.current
    if (!ed) return
    if (preview) ed.stopCommand('core:preview')
    else ed.runCommand('core:preview')
    setPreview(!preview)
  }

  const pageUrl = slug === 'home' ? '/' : `/${slug}`
  const back = chrome ? `${admin}/globals/${chrome}` : `${admin}/collections/pages/${pageId}?editor=classic`
  const tab = (on: boolean) => (on ? 'is-on' : '')

  return (
    <div className={`up-vb${preview ? ' is-preview' : ''}`}>
      <header className="up-vb__bar">
        <a className="up-vb__back up-vb__home" href={admin} title="Back to the dashboard" aria-label="Back to the dashboard" onClick={(e) => { if (dirty && !window.confirm('Leave without saving your changes?')) e.preventDefault() }}>
          ←
        </a>
        <a className="up-vb__back" href={back} onClick={(e) => { if (dirty && !window.confirm('Leave without saving your changes?')) e.preventDefault() }}>
          {chrome ? 'Classic editor' : 'Switch to classic editor'}
        </a>
        <div className="up-vb__title">
          <strong>{title}</strong>
          <span>{dirty ? 'Unsaved changes' : 'Visual builder'}</span>
        </div>
        <div className="up-vb__devices" role="group" aria-label="Screen size">
          {['Desktop', 'Tablet', 'Phone'].map((d) => (
            <button key={d} type="button" className={tab(device === d)} onClick={() => switchDevice(d)}>
              {d}
            </button>
          ))}
        </div>
        <div className="up-vb__actions">
          <button type="button" onClick={() => editorRef.current?.UndoManager.undo()} aria-label="Undo" title="Undo">↶</button>
          <button type="button" onClick={() => editorRef.current?.UndoManager.redo()} aria-label="Redo" title="Redo">↷</button>
          <button type="button" onClick={togglePreview}>{preview ? 'Edit' : 'Preview'}</button>
          {!chrome && <button type="button" onClick={openHistory} aria-expanded={Boolean(history)}>History</button>}
          {slug && <a href={pageUrl} target="_blank" rel="noreferrer">View page</a>}
          {chrome ? (
            <button type="button" className="is-primary" onClick={() => save(true)} disabled={Boolean(saving)}>
              {saving ? 'Saving…' : `Save ${chrome}`}
            </button>
          ) : (
            <>
              <button type="button" onClick={() => save(false)} disabled={Boolean(saving)}>
                {saving === 'draft' ? 'Saving…' : 'Save draft'}
              </button>
              <button type="button" className="is-primary" onClick={() => save(true)} disabled={Boolean(saving)}>
                {saving === 'publish' ? 'Publishing…' : 'Publish'}
              </button>
            </>
          )}
        </div>
      </header>
      {history && (
        <div className="up-vb__history" role="dialog" aria-label="Page history">
          <strong>Earlier versions</strong>
          <p>Open one to look at it in the builder. Publish it to make it live again.</p>
          <ul>
            {history.length === 0 && <li>No earlier versions yet.</li>}
            {history.map((v) => (
              <li key={v.id}>
                <a
                  href={`${admin}/visual-builder?page=${encodeURIComponent(pageId)}&version=${encodeURIComponent(v.id)}`}
                  onClick={(e) => { if (dirty && !window.confirm('Leave without saving your changes?')) e.preventDefault() }}
                >
                  {new Date(v.date).toLocaleString()}
                </a>
                <span>{v.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {notice && (
        <div className={`up-vb__notice${notice.bad ? ' is-bad' : ''}`} role="status">
          {notice.text}
          <button type="button" onClick={() => setNotice(null)} aria-label="Close">×</button>
        </div>
      )}
      <div className="up-vb__body">
        <aside className="up-vb__left">
          <div className="up-vb__tabs" role="tablist">
            <button type="button" role="tab" aria-selected={leftTab === 'add'} className={tab(leftTab === 'add')} onClick={() => setLeftTab('add')}>Add</button>
            <button type="button" role="tab" aria-selected={leftTab === 'templates'} className={tab(leftTab === 'templates')} onClick={() => setLeftTab('templates')}>Templates</button>
            <button type="button" role="tab" aria-selected={leftTab === 'layers'} className={tab(leftTab === 'layers')} onClick={() => setLeftTab('layers')}>Layers</button>
          </div>
          <p className="up-vb__hint" hidden={leftTab !== 'add'}>Drag onto the page. Drop between sections for a new section, or inside one to add to it.</p>
          <div className="up-vb__mode" hidden={leftTab !== 'templates'} role="group" aria-label="Section style">
            {(['bright', 'dark'] as Mode[]).map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} className={mode === m ? 'is-on' : ''} onClick={() => setMode(m)}>
                {m === 'bright' ? 'Bright' : 'Dark'}
              </button>
            ))}
          </div>
          <p className="up-vb__hint" hidden={leftTab !== 'templates'}>
            {chrome
              ? `Pick a ${chrome} design under Headers and footers, drag it onto the canvas, then change the words and links.`
              : "Ready-designed sections and whole pages in your site's colours and fonts. Drag one onto the page, then change the words and photos."}
            {myTemplates.length === 0 && ' Sections you save appear here under My templates.'}
          </p>
          <div ref={blocksRef} className="up-vb__panel" hidden={leftTab === 'layers'} />
          <div ref={layersRef} className="up-vb__panel" hidden={leftTab !== 'layers'} />
        </aside>
        <main className="up-vb__canvas">
          <div ref={canvasRef} className="up-vb__editor" />
        </main>
        <aside className="up-vb__right">
          <div className="up-vb__tabs" role="tablist">
            <button type="button" role="tab" aria-selected={rightTab === 'style'} className={tab(rightTab === 'style')} onClick={() => setRightTab('style')}>Style</button>
            <button type="button" role="tab" aria-selected={rightTab === 'settings'} className={tab(rightTab === 'settings')} onClick={() => setRightTab('settings')}>Settings</button>
          </div>
          {!selected && (
            <p className="up-vb__hint">
              Click anything on the page to change it. Double-click text to type, double-click a photo to swap it. Videos, maps, icons, forms and links are set in Settings.
            </p>
          )}
          {heroSelected && (
            <div className="up-vb__selbar">
              <p className="up-vb__hint" style={{ margin: '0 0 10px' }}>The page hero is set in the page editor. Turn it into a section to design it here, with its words, photo and buttons.</p>
              <button type="button" onClick={() => convertHeroRef.current()}>Turn the hero into a section</button>
            </div>
          )}
          {selected && !heroSelected && (
            <div className="up-vb__selbar">
              <button type="button" onClick={saveTemplate} disabled={Boolean(saving)}>
                {saving === 'template' ? 'Saving…' : 'Save section as template'}
              </button>
              {!chrome && (
                <button type="button" onClick={makeSynced} disabled={Boolean(saving)} style={{ marginTop: 6 }}>
                  Make it a synced section
                </button>
              )}
            </div>
          )}
          <div ref={stylesRef} className="up-vb__panel" hidden={rightTab !== 'style' || !selected} />
          <div ref={traitsRef} className="up-vb__panel" hidden={rightTab !== 'settings' || !selected} />
        </aside>
      </div>
    </div>
  )
}
