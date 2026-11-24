'use client'

import React, { useState } from 'react'
import { Share2, Check, MessageCircle, Twitter, Linkedin, Copy } from 'lucide-react'

export const ShareButtons: React.FC<{
  title: string
  url: string
}> = ({ title, url }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      const fullUrl = window.location.origin + url
      navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const encodedTitle = encodeURIComponent(title)
  const fullHref = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin + url) : ''

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 my-8">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-400">
        <Share2 className="w-4 h-4 text-orange-500" />
        <span>Compartir este análisis:</span>
      </div>

      <div className="flex items-center gap-2">
        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${fullHref}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-400 border border-white/5 transition-colors"
          title="Compartir en WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${fullHref}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-300 hover:text-blue-400 border border-white/5 transition-colors"
          title="Compartir en LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </a>

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${fullHref}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-white/5 hover:bg-sky-500/20 text-gray-300 hover:text-sky-400 border border-white/5 transition-colors"
          title="Compartir en X"
        >
          <Twitter className="w-4 h-4" />
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-orange-500/20 text-gray-300 hover:text-orange-400 border border-white/5 text-xs font-mono transition-colors"
          title="Copiar enlace"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
