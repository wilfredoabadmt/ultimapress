'use client'

import React, { useState } from 'react'

import { Turnstile } from '@/components/Turnstile'

export const CommentForm: React.FC<{ postId: number | string; moderated: boolean }> = ({
  postId,
  moderated,
}) => {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [reset, setReset] = useState(0)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setState('sending')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: postId,
          authorName: form.get('authorName'),
          authorEmail: form.get('authorEmail'),
          content: form.get('content'),
          website: form.get('website'),
          turnstileToken: token,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.errors?.[0]?.message || 'Something went wrong.')
      }
      setState('done')
      if (!moderated) window.location.reload()
    } catch (err) {
      setError((err as Error).message)
      setReset((n) => n + 1)
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <p className="rounded-[var(--radius)] border border-border bg-card p-5">
        ¡Gracias! {moderated ? 'Tu comentario se publicará una vez que sea aprobado.' : ''}
      </p>
    )
  }

  const input =
    'w-full rounded-[var(--radius)] border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input name="authorName" required maxLength={80} placeholder="Tu Nombre Completo" className={input} />
        <input
          name="authorEmail"
          type="email"
          required
          placeholder="Correo Electrónico (no será publicado)"
          className={input}
        />
      </div>
      <textarea
        name="content"
        required
        maxLength={5000}
        rows={5}
        placeholder="Escribe tu comentario o consulta aquí..."
        className={input}
      />
      {/* Honeypot: hidden from people, filled in by bots */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <Turnstile onToken={setToken} resetKey={reset} />
      {state === 'error' && <p className="text-destructive">{error}</p>}
      <div>
        <button type="submit" className="up-btn" disabled={state === 'sending'}>
          {state === 'sending' ? 'Enviando…' : 'Publicar Comentario'}
        </button>
      </div>
    </form>
  )
}
