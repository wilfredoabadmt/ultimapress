'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo = 'posts', showCategories = true, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s+/g, ' ').trim()
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden bg-[#0c0c12]/90 border border-white/10 hover:border-orange-500/40 shadow-lg hover:shadow-[0_10px_30px_rgba(234,88,12,0.15)] transition-all duration-300 hover:-translate-y-1 hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      {/* Featured Card Image */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#07070a]">
        {metaImage && typeof metaImage !== 'string' ? (
          <Media
            resource={metaImage}
            size="33vw"
            imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-950/20 to-black text-gray-600 font-mono text-xs">
            RADAR TECNOLÓGICO
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {showCategories && hasCategories && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {categories?.map((category, index) => {
                if (typeof category === 'object' && category !== null) {
                  const { title: titleFromCategory } = category
                  const categoryTitle = titleFromCategory || 'Tecnología'
                  return (
                    <span
                      key={index}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/25"
                    >
                      {categoryTitle}
                    </span>
                  )
                }
                return null
              })}
            </div>
          )}

          {titleToUse && (
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug mb-2">
              <Link className="not-prose" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          )}

          {sanitizedDescription && (
            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 leading-relaxed">
              {sanitizedDescription}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-orange-400/90 font-semibold">
          <span>Leer artículo completo</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </article>
  )
}
