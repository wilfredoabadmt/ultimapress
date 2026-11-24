'use client'

import React, { useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'
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
        throw new Error(body?.errors?.[0]?.message || 'Ocurrió un error al enviar el comentario.')
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
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-300 flex items-start gap-3.5">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white mb-1">¡Comentario recibido con éxito!</h4>
          <p className="text-sm text-gray-300">
            {moderated
              ? 'Tu comentario se publicará en el artículo en cuanto sea revisado por el moderador.'
              : 'Tu comentario ha sido publicado exitosamente.'}
          </p>
        </div>
      </div>
    )
  }

  const inputClasses =
    'w-full rounded-xl border border-white/10 bg-[#0d0d14]/90 px-4 py-3.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200'

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-2">
            Nombre <span className="text-orange-500">*</span>
          </label>
          <input
            name="authorName"
            required
            maxLength={80}
            placeholder="Tu Nombre o Alias Profesional"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-2">
            Correo Electrónico <span className="text-gray-500 font-normal lowercase">(no se publicará)</span> <span className="text-orange-500">*</span>
          </label>
          <input
            name="authorEmail"
            type="email"
            required
            placeholder="ejemplo@empresa.com"
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-2">
          Comentario o Aporte Técnico <span className="text-orange-500">*</span>
        </label>
        <textarea
          name="content"
          required
          maxLength={5000}
          rows={5}
          placeholder="Escribe tu consulta, perspectiva técnica o feedback sobre este artículo..."
          className={inputClasses}
        />
      </div>

      {/* Honeypot anti-spam */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <Turnstile onToken={setToken} resetKey={reset} />

      {state === 'error' && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          disabled={state === 'sending'}
        >
          {state === 'sending' ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Enviando Comentario...</span>
            </>
          ) : (
            <>
              <span>Publicar Comentario</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
