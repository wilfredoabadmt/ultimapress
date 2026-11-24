import React from 'react'
import Link from 'next/link'
import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { formatDateTime } from '@/utilities/formatDateTime'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const authorName =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''
      ? formatAuthors(populatedAuthors)
      : 'Ing. Wilfredo Abad'

  return (
    <header className="relative pt-10 pb-12 overflow-hidden bg-[#07070A] border-b border-white/[0.06]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-orange-600/15 via-orange-500/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 max-w-4xl relative z-10">
        
        {/* Navigation Breadcrumb Back */}
        <nav aria-label="Navegación de retorno" className="mb-6 flex items-center gap-2">
          <Link
            href="/radar-tech"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-orange-400 hover:border-orange-500/30 transition-all duration-200 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Volver a Radar Tecnológico</span>
          </Link>
        </nav>

        {/* Categories Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {categories?.map((category, index) => {
            if (typeof category === 'object' && category !== null) {
              const { title: categoryTitle } = category
              const titleToUse = categoryTitle || 'Ingeniería Digital'

              return (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_12px_rgba(234,88,12,0.15)]"
                >
                  {titleToUse}
                </span>
              )
            }
            return null
          })}
        </div>

        {/* Main Post Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-white tracking-tight leading-[1.18] mb-8">
          {title}
        </h1>

        {/* Author Meta Strip Card */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-[#0d0d14]/90 border border-white/10 backdrop-blur-xl mb-10 shadow-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-orange-500/25 border border-orange-400/30">
              WA
            </div>
            <div>
              <div className="text-white font-bold text-sm md:text-base tracking-wide flex items-center gap-2">
                <span>{authorName}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              </div>
              <div className="text-[11px] md:text-xs text-orange-400 font-mono font-semibold uppercase tracking-wider">
                Systems Engineer & Growth Architect
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs text-gray-400 font-mono">
            {publishedAt && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 hidden sm:inline">Publicado:</span>
                <time dateTime={publishedAt} className="text-gray-200 font-semibold">
                  {formatDateTime(publishedAt)}
                </time>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-gray-300">
              <span>⏱</span>
              <span>5 min de lectura</span>
            </div>
          </div>
        </div>

        {/* Featured Image (Hero Image) */}
        {heroImage && typeof heroImage !== 'string' && (
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(234,88,12,0.12)] bg-[#09090e] aspect-video w-full group">
            <Media
              fill
              priority
              imgClassName="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
              resource={heroImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070A]/80 via-transparent to-transparent pointer-events-none" />
            
            {/* Subtle glow rim inside */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-white/10 pointer-events-none" />
          </div>
        )}

      </div>
    </header>
  )
}
