import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, MessageSquare, Sparkles, Terminal } from 'lucide-react'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { ArticleData, BreadcrumbData } from '@/components/Seo'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Comments } from '@/components/Comments'
import { getSiteSettings } from '@/utilities/getSiteSettings'
import { notFound } from 'next/navigation'
import { ShareButtons } from '@/components/ShareButtons'

export async function generateStaticParams() {
  // No database during a Docker image build: pages are then rendered on first visit.
  if (process.env.UP_SKIP_STATIC === '1') return []
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const settings = await getSiteSettings()
  if (settings.enableBlog === false) notFound()
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article className="bg-[#050508] text-gray-200 min-h-screen pb-20 selection:bg-orange-500 selection:text-black">
      <PageClient />
      <ArticleData post={post} />
      <BreadcrumbData
        trail={[
          { name: 'Inicio', path: '/' },
          { name: 'Radar Tecnológico', path: '/radar-tech' },
          { name: post.title, path: url },
        ]}
      />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      {/* Hero Header with Featured Image */}
      <PostHero post={post} />

      {/* Post Main Body */}
      <div className="container mx-auto px-4 md:px-8 max-w-4xl pt-8">
        
        {/* Social Share Bar Top */}
        <ShareButtons title={post.title} url={url} />

        {/* Article Body Content */}
        <div className="py-6 border-b border-white/[0.08]">
          <RichText
            className="max-w-none text-gray-300 leading-relaxed text-base sm:text-lg prose prose-invert prose-orange prose-headings:font-black prose-headings:tracking-tight prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:border-l-4 prose-h2:border-orange-500 prose-h2:pl-4 prose-h2:text-white prose-h3:text-xl prose-h3:text-orange-400 prose-a:text-orange-400 prose-a:underline hover:prose-a:text-orange-300 prose-strong:text-white prose-code:text-orange-300 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-orange-500 prose-blockquote:text-gray-300 prose-blockquote:bg-white/[0.02] prose-blockquote:py-1 prose-blockquote:px-5 prose-blockquote:rounded-r-xl"
            data={post.content}
            enableGutter={false}
          />
        </div>

        {/* Social Share Bar Bottom */}
        <ShareButtons title={post.title} url={url} />

        {/* Author Bio Box */}
        <div className="my-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c0c14] to-[#07070a] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center font-black text-black text-2xl shadow-xl shadow-orange-500/25 border-2 border-orange-400/40 shrink-0">
              WA
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h4 className="text-xl font-bold text-white tracking-wide">Ing. Wilfredo Abad</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  AUTOR
                </span>
              </div>
              <p className="text-xs text-orange-400 font-mono font-semibold uppercase tracking-wider">
                Systems Engineer & Growth Architect
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Especialista en arquitectura web de alto rendimiento (Next.js 15, Payload CMS, WordPress Pro), despliegue en infraestructura NVMe propia, optimización de velocidad de carga y desarrollo asistido por agentes de Inteligencia Artificial.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/contacto"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-600/30"
                >
                  <span>Agendar Asesoría</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="https://wa.me/59171523780"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-mono transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Directo</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Call to Action Banner */}
        <div className="my-12 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-orange-950/40 via-[#0d0d14] to-[#07070a] border border-orange-500/30 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>¿Listo para escalar tu infraestructura?</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                Construyamos tu próximo proyecto con estándares de clase mundial
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Hosting NVMe dedicado, desarrollo Fullstack a medida y más de $2,500 USD en licencias Pro incluidas a costo $0 para tu negocio.
              </p>
            </div>
            <Link
              href="/contacto"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-orange-600/30 hover:-translate-y-0.5 transition-all shrink-0 inline-flex items-center gap-2"
            >
              <span>Cotizar Proyecto Ahora</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <div className="my-16 pt-8 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Continuar Explorando en el Radar
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Artículos y análisis técnicos complementarios
                </p>
              </div>
              <Link
                href="/radar-tech"
                className="text-xs font-mono uppercase tracking-wider text-orange-400 hover:text-orange-300 transition-colors hidden sm:inline-flex items-center gap-1"
              >
                <span>Ver todo el radar</span>
                <span>→</span>
              </Link>
            </div>
            <RelatedPosts
              className="max-w-none grid grid-cols-1 md:grid-cols-2 gap-6"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          </div>
        )}

        {/* Comments Section */}
        <div className="my-12 pt-8 border-t border-white/[0.08]">
          <Comments postId={post.id} allowComments={post.allowComments} />
        </div>

      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post, path: `/posts/${decodedSlug}` })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
