import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import React from 'react'

import { hasRole } from '@/access/roles'
import { cleanDesignHtml, scopeDesignCss } from '@/utilities/designSafety'
import { splitBuilderCss } from '@/utilities/builderCss'
import { getSiteSettings, safeColor } from '@/utilities/getSiteSettings'

import { VisualBuilder, type BuilderSection } from './Builder.client'
import type { HeroData } from './library'
import { NOT_GRIDDABLE } from '@/blocks/LoopGrid/cards'

/** Names people recognise for the ready-made blocks. */
const BLOCK_NAMES: Record<string, string> = {
  archive: 'Latest posts',
  banner: 'Banner',
  code: 'Code',
  content: 'Text',
  cta: 'Call to action',
  embed: 'Video or map',
  faq: 'FAQ',
  features: 'Features',
  formBlock: 'Form',
  gallery: 'Gallery',
  latestProperties: 'Latest properties',
  mediaBlock: 'Image',
  pricing: 'Pricing',
  split: 'Image and text',
  stats: 'Stats',
  testimonials: 'Testimonials',
}

const safeId = (id: unknown) => String(id ?? '').replace(/[^a-zA-Z0-9_-]/g, '')

type LexNode = { type?: string; text?: string; children?: LexNode[] }
const textOf = (n: LexNode): string => (n.text ?? '') + (n.children || []).map(textOf).join('')

/**
 * The visual builder (/admin/visual-builder?page=<id>): the whole page, full screen,
 * with drag and drop, click-to-edit and a style panel. Designed sections are edited
 * directly; ready-made blocks can be moved or removed and keep their own settings.
 */
export async function VisualBuilderView({ initPageResult, searchParams }: AdminViewServerProps) {
  const { req } = initPageResult
  const admin = req.payload.config.routes.admin || '/admin'
  if (!req.user) redirect(`${admin}/login`)

  const one = (v: unknown) => (Array.isArray(v) ? v[0] : v) as string | undefined
  const pageId = one(searchParams?.page)
  const globalSlug = one(searchParams?.global)
  const versionId = one(searchParams?.version)

  const message = (text: string) => (
    <div style={{ padding: 48, fontFamily: 'var(--font-body)' }}>
      <p>{text}</p>
      <p>
        <a href={`${admin}/collections/pages`}>Back to Pages</a>
      </p>
    </div>
  )

  if (!hasRole(req.user, 'admin', 'editor')) {
    // Authors use the classic editor (pages open in the visual builder by default).
    if (pageId) redirect(`${admin}/collections/pages/${encodeURIComponent(pageId)}?editor=classic`)
    return message('The visual builder is for administrators and editors.')
  }

  // The header or footer, designed as one section.
  let chrome: 'header' | 'footer' | null = null
  let page: Record<string, unknown> | null = null
  let versionDate: string | null = null
  if (globalSlug === 'header' || globalSlug === 'footer') {
    chrome = globalSlug
    const g = (await req.payload
      .findGlobal({ slug: globalSlug, depth: 0, user: req.user, overrideAccess: false })
      .catch(() => null)) as Record<string, unknown> | null
    if (!g) return message('That could not be opened.')
    page = {
      id: globalSlug,
      title: globalSlug === 'header' ? 'Header' : 'Footer',
      slug: '',
      hero: { type: 'none' },
      layout: g.designHtml
        ? [{ blockType: 'design', id: globalSlug, blockName: globalSlug, html: g.designHtml, css: g.designCss || '' }]
        : [],
    }
  } else {
    if (!pageId) return message('Open the visual builder from a page.')
    if (versionId) {
      // An earlier version, to look at and publish again if wanted.
      const v = await req.payload
        .findVersionByID({ collection: 'pages', id: versionId, depth: 0, user: req.user, overrideAccess: false })
        .catch(() => null)
      if (v && String((v as { parent?: unknown }).parent) === String(pageId)) {
        page = { ...(v.version as unknown as Record<string, unknown>), id: pageId }
        versionDate = String(v.updatedAt || '')
      }
    }
    if (!page) {
      page = (await req.payload
        .findByID({ collection: 'pages', id: pageId, draft: true, depth: 0, user: req.user, overrideAccess: false })
        .catch(() => null)) as unknown as Record<string, unknown> | null
    }
    if (!page) return message('That page could not be found.')
    // A brand new page needs its title and address first: that is done in the classic editor.
    if (!versionId && (!page.title || !page.slug)) redirect(`${admin}/collections/pages/${encodeURIComponent(pageId)}?editor=new`)
  }

  // Synced sections: shown with their shared content.
  const synced = await req.payload
    .find({ collection: 'synced-sections', limit: 200, depth: 0, sort: 'name', user: req.user, overrideAccess: false })
    .then((r) => r.docs.map((d) => ({ id: String(d.id), name: String(d.name), html: cleanDesignHtml(d.html as string), css: String(d.css || '') })))
    .catch(() => [] as { id: string; name: string; html: string; css: string }[])
  const syncedById = new Map(synced.map((d) => [d.id, d]))

  const layout = (Array.isArray(page.layout) ? page.layout : []) as unknown as Record<string, unknown>[]

  const sections: BuilderSection[] = layout.map((block, index) => {
    if (block.blockType === 'design') {
      const id = safeId(block.id)
      const syncedId = block.synced ? String(typeof block.synced === 'object' ? (block.synced as { id?: unknown }).id : block.synced) : ''
      const shared = syncedId ? syncedById.get(syncedId) : undefined
      const { base, builder } = splitBuilderCss((shared ? shared.css : block.css) as string)
      return {
        kind: 'design',
        index,
        id,
        name: shared ? `Synced: ${shared.name}` : (block.blockName as string) || 'Designed section',
        html: shared ? shared.html : cleanDesignHtml(block.html as string),
        baseCss: scopeDesignCss(base, `.up-d-${id}`),
        builderCss: builder,
        synced: shared ? shared.id : undefined,
      }
    }
    const type = String(block.blockType || '')
    return {
      kind: 'ref',
      index,
      id: safeId(block.id),
      name: BLOCK_NAMES[type] || type,
      detail: (block.blockName as string) || '',
    }
  })

  const hero = (page.hero || {}) as Record<string, unknown>
  const heroType = hero.type as string | undefined

  // The hero's words, picture and buttons, to rebuild it as a designed section if asked.
  let heroData: HeroData | null = null
  if (heroType && heroType !== 'none') {
    const nodes = ((hero.richText as { root?: LexNode } | undefined)?.root?.children || []) as LexNode[]
    const heading = nodes.find((n) => n.type === 'heading')
    const rest = nodes.filter((n) => n !== heading).map(textOf).filter(Boolean)
    let image = ''
    if (hero.media) {
      const mediaId = typeof hero.media === 'object' ? (hero.media as { id?: unknown }).id : hero.media
      const media = await req.payload
        .findByID({ collection: 'media', id: mediaId as string, depth: 0, user: req.user, overrideAccess: false })
        .catch(() => null)
      image = (media?.url as string) || ''
    }
    const buttons: HeroData['buttons'] = []
    for (const row of (hero.links as { link?: Record<string, unknown> }[] | undefined) || []) {
      const link = row.link || {}
      let url = (link.url as string) || '#'
      const ref = link.reference as { relationTo?: string; value?: unknown } | undefined
      if (link.type === 'reference' && ref?.value) {
        const id = typeof ref.value === 'object' ? (ref.value as { id?: unknown }).id : ref.value
        const doc = await req.payload
          .findByID({ collection: (ref.relationTo || 'pages') as 'pages', id: id as string, depth: 0, user: req.user, overrideAccess: false })
          .catch(() => null)
        const s = doc?.slug as string | undefined
        url = s ? (ref.relationTo === 'posts' ? `/posts/${s}` : s === 'home' ? '/' : `/${s}`) : '#'
      }
      if (link.label) buttons.push({ label: String(link.label), url })
    }
    heroData = { heading: heading ? textOf(heading) : '', text: rest.join(' '), image, buttons }
  }

  // The site's own look, so the canvas matches the live site.
  const dbSettings = await req.payload.findGlobal({ slug: 'site-settings', depth: 0 }).catch(() => null)
  const settings = dbSettings || (await getSiteSettings())
  const look = {
    primary: safeColor(settings.primaryColor, '#7B2BFF'),
    accent: safeColor(settings.accentColor, '#F21CD9'),
    headingFont: settings.headingFont || 'Manrope',
    bodyFont: settings.bodyFont || 'Inter',
    dark: settings.template === 'dark',
  }

  // Content that can be shown in a grid: collections with their own pages.
  const collections = req.payload.config.collections
    .filter((c) => !NOT_GRIDDABLE.has(c.slug) && !c.slug.startsWith('payload') && c.fields.some((f) => 'name' in f && f.name === 'slug'))
    .map((c) => ({ id: c.slug, name: typeof c.labels?.plural === 'string' ? c.labels.plural : c.slug }))

  const videos = await req.payload
    .find({ collection: 'media', limit: 100, depth: 0, where: { mimeType: { like: 'video' } }, user: req.user, overrideAccess: false })
    .then((r) => r.docs.map((m) => ({ id: String(m.url || ''), name: String(m.filename || m.alt || 'Video') })).filter((m) => m.id))
    .catch(() => [] as { id: string; name: string }[])

  const forms = await req.payload
    .find({ collection: 'forms', limit: 100, depth: 0, user: req.user, overrideAccess: false })
    .then((r) => r.docs.map((f) => ({ id: String(f.id), title: String((f as { title?: string }).title || `Form ${f.id}`) })))
    .catch(() => [])

  const myTemplates = await req.payload
    .find({ collection: 'section-templates', limit: 200, depth: 0, sort: 'name', user: req.user, overrideAccess: false })
    .then((r) => r.docs.map((t) => ({ id: String(t.id), name: String(t.name), html: cleanDesignHtml(t.html as string), css: String(t.css || '') })))
    .catch(() => [])

  return (
    <VisualBuilder
      look={look}
      forms={forms}
      hero={heroData}
      heroGroup={heroType && heroType !== 'none' ? hero : null}
      myTemplates={myTemplates}
      synced={synced}
      collections={collections}
      videos={videos}
      chrome={chrome}
      versionDate={versionDate}
      admin={admin}
      pageId={String(page.id)}
      title={String(page.title || 'Untitled')}
      slug={typeof page.slug === 'string' ? page.slug : ''}
      sections={sections}
      layout={layout}
    />
  )
}

export default VisualBuilderView
