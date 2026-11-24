import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { MessageSquare } from 'lucide-react'

import type { Comment } from '@/payload-types'
import { getSiteSettings } from '@/utilities/getSiteSettings'
import { CommentForm } from './Form'
import { formatDateTime } from '@/utilities/formatDateTime'

/** Approved comments for a post, threaded one level deep, plus the reply form. */
export async function Comments({
  postId,
  allowComments,
}: {
  postId: number | string
  allowComments?: boolean | null
}) {
  const settings = await getSiteSettings()
  if (settings.enableComments === false || allowComments === false) return null

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'comments',
    where: { and: [{ post: { equals: postId } }, { status: { equals: 'approved' } }] },
    sort: 'createdAt',
    limit: 500,
    depth: 0,
    overrideAccess: false,
  })

  const topLevel = docs.filter((c) => !c.parent)
  const replies = (id: Comment['id']) => docs.filter((c) => c.parent === id)

  return (
    <section className="max-w-[48rem] mx-auto mt-16 w-full" id="comments">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {docs.length === 0 ? 'Deja tu Comentario' : `${docs.length} Comentario${docs.length === 1 ? '' : 's'}`}
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Zona de discusión y aportes técnicos de la comunidad
            </p>
          </div>
        </div>
      </div>

      {docs.length > 0 && (
        <ol className="flex flex-col gap-6 mb-10">
          {topLevel.map((c) => (
            <li key={c.id}>
              <CommentItem comment={c} />
              {replies(c.id).length > 0 && (
                <ol className="mt-4 ml-6 pl-6 border-l-2 border-orange-500/30 flex flex-col gap-4">
                  {replies(c.id).map((r) => (
                    <li key={r.id}>
                      <CommentItem comment={r} />
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="p-6 sm:p-8 rounded-3xl bg-[#09090f]/90 border border-white/10 shadow-xl backdrop-blur-xl">
        <CommentForm postId={postId} moderated={settings.moderateComments !== false} />
      </div>
    </section>
  )
}

const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => (
  <article className="rounded-2xl border border-white/10 bg-[#0d0d14]/80 p-5 shadow-lg backdrop-blur-md">
    <header className="flex justify-between items-center gap-4 mb-3 text-xs font-mono">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-bold text-black text-[10px]">
          {comment.authorName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <strong className="text-white font-bold">{comment.authorName}</strong>
      </div>
      <time className="text-gray-400" dateTime={comment.createdAt}>
        {formatDateTime(comment.createdAt)}
      </time>
    </header>
    <p className="whitespace-pre-line text-sm text-gray-300 leading-relaxed pl-8">
      {comment.content}
    </p>
  </article>
)
