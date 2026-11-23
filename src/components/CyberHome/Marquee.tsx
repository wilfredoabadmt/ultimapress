'use client'

import React from 'react'

export const CyberMarquee: React.FC = () => {
  const techStack = [
    'Next.js 16',
    'Payload CMS 3',
    'PostgreSQL 17',
    'Docker & Coolify',
    'Agentes IA & n8n',
    'React 19',
    'TypeScript',
    'WordPress Pro',
    'Bricks Builder',
    'Elementor Pro',
    'Crocoblock JetEngine',
    'Meta Ads (Alto ROAS)',
    'Adobe Creative Cloud',
    'Clientify CRM',
    'WooCommerce Funnels',
  ]

  return (
    <div className="relative py-4 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.4)] border-y border-orange-400/30 select-none">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {/* Double items for infinite seamless looping */}
        {[...techStack, ...techStack].map((item, index) => (
          <div key={index} className="inline-flex items-center mx-6">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-black/90">
              {item}
            </span>
            <span className="ml-6 w-2 h-2 rounded-full bg-black/40" />
          </div>
        ))}
      </div>
    </div>
  )
}
