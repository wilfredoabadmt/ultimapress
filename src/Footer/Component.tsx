import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { Clock, Mail, MapPin, Phone, Instagram, Facebook, MessageCircle, Youtube, Music, Phone as WhatsApp } from 'lucide-react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { getSiteSettings, mediaURL } from '@/utilities/getSiteSettings'
import { DesignedChrome } from '@/components/DesignedChrome'
import { needsCookieBanner } from '@/components/Visitors'
import { CookieSettingsLink } from '@/components/Visitors/Consent.client'

// Social icon mapping - matches the options in Footer config
const socialIcons: Record<string, React.ElementType> = {
  Facebook,
  Instagram,
  'X': MessageCircle, // X/Twitter icon
  LinkedIn: MessageCircle,
  YouTube: Youtube,
  TikTok: Music,
  WhatsApp,
}

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const settings = await getSiteSettings()

  const cookies = needsCookieBanner(settings)

  if (footerData?.designed && footerData.designHtml) {
    return (
      <>
        <DesignedChrome as="footer" html={footerData.designHtml} css={footerData.designCss} />
        {cookies && (
          <div className="container py-3 text-center text-xs opacity-70">
            <CookieSettingsLink />
          </div>
        )}
      </>
    )
  }

  const navItems = footerData?.navItems || []
  const social = footerData?.social || []
  const { about, phone, email, address, hours } = footerData || {}
  const hasContact = Boolean(phone || email || address)
  const privacy =
    settings.privacyPolicyPage && typeof settings.privacyPolicyPage === 'object'
      ? settings.privacyPolicyPage
      : null

  return (
    <footer
      className="up-footer relative overflow-hidden"
    >
      {/* Neon glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--up-primary)] rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--up-accent)] rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/4 w-60 h-60 border-2 border-[var(--up-primary)] rounded-full opacity-30" />
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 border-2 border-[var(--up-accent)] rounded-full opacity-30" />
      </div>

      {/* Grid background for disruption effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 12 }).map((__, i) => (
            <div key={i} className="border border-white/10" />
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes neon-flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 24%, 55% { opacity: 0.4; }
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .up-footer {
          font-family: 'Gilroy', 'Inter', ui-sans-serif, system-ui, sans-serif;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
          color: #e5e5e5;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .up-footer a, .up-footer button {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          color: inherit;
        }
        .up-footer a::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .up-footer a:hover::before {
          left: 0;
        }
        .up-footer a:hover {
          color: white;
          text-shadow: 0 0 20px var(--up-primary);
        }
        .up-footer h3 {
          font-family: 'Gilroy', 'Inter', ui-sans-serif, system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: white;
          margin-bottom: 1.5rem;
          position: relative;
          transition: all 0.3s ease;
        }
        .up-footer h3::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, var(--up-primary), var(--up-accent));
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .up-footer h3:hover::after {
          opacity: 1;
        }
        .up-footer .text-white\\/70 {
          transition: all 0.3s ease;
          color: #a3a3a3;
        }
        .up-footer:hover .text-white\\/70 {
          color: #e5e5e5;
        }
        .up-footer li {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          opacity: 0;
          transform: translateY(10px);
        }
        .up-footer li:nth-child(1) { transition-delay: 0.1s; }
        .up-footer li:nth-child(2) { transition-delay: 0.15s; }
        .up-footer li:nth-child(3) { transition-delay: 0.2s; }
        .up-footer li:nth-child(4) { transition-delay: 0.25s; }
        /* Items will animate in when footer is in view */

        .social-item {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
        }
        .social-item:hover {
          border-color: var(--up-primary);
          color: var(--up-primary);
          transform: translateY(-3px);
          box-shadow: 0 0 20px rgba(234, 88, 12, 0.4);
        }
        .social-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .social-item:hover::before {
          opacity: 1;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          transform: translateX(-10px);
          opacity: 0;
        }
        .contact-item:hover {
          transform: translateX(0);
        }

        /* Neon underline effect */
        .neon-underline {
          background: linear-gradient(90deg, var(--up-primary), var(--up-accent), var(--up-primary));
          background-size: 200% 100%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .neon-underline:hover {
          opacity: 1;
        }

        /* Copyright pulse */
        .copyright {
          position: relative;
          transition: all 0.3s ease;
        }
        .copyright::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--up-primary), transparent);
          opacity: 0.3;
          animation: pulse-glow 3s infinite;
        }
        .copyright:hover::after {
          opacity: 0.6;
        }
      `}} />

      <div className="container relative z-10 grid gap-10 py-16 md:py-20 lg:grid-cols-[1.2fr_1fr_1fr_1fr] 2xl:grid-cols-[1.1fr_1fr_1fr_1fr]">
        {/* Brand & Social */}
        <div className="flex flex-col gap-6">
          <Link className="flex items-center gap-3 group" href="/">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--up-primary)] to-[var(--up-accent)] flex items-center justify-center shadow-lg group-hover:shadow-[var(--up-primary)] transition-all duration-300">
              <Logo src={mediaURL(settings.logo)} siteTitle={settings.siteTitle} />
            </div>
          </Link>
          {(about || settings.tagline) && (
            <p className="max-w-md leading-relaxed text-base text-white/80">
              {about || settings.tagline}
            </p>
          )}
          {social.length > 0 && (
            <div className="flex gap-3">
              {social.map((s, i) => {
                const Icon = socialIcons[s.platform] || Github
                return (
                  <a
                    key={i}
                    className="social-item flex items-center justify-center"
                    href={s.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={s.platform}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* Contact Info */}
        {hasContact && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white">Contact</h3>
            <ul className="flex flex-col gap-3">
              {phone && (
                <li className="contact-item">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Phone className="h-5 w-5 text-[var(--up-primary)]" />
                  </div>
                  <a className="text-white/70 hover:text-white transition-colors break-all" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="contact-item">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Mail className="h-5 w-5 text-[var(--up-primary)]" />
                  </div>
                  <a className="text-white/70 hover:text-white transition-colors break-all" href={`mailto:${email}`}>
                    {email}
                  </a>
                </li>
              )}
              {address && (
                <li className="contact-item">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <MapPin className="h-5 w-5 text-[var(--up-primary)]" />
                  </div>
                  <span className="text-white/70 hover:text-white transition-colors whitespace-pre-line">
                    {address}
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Hours */}
        {hours && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white">Opening hours</h3>
            <div className="flex items-center gap-3 text-white/70">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Clock className="h-5 w-5 text-[var(--up-primary)]" />
              </div>
              <span className="whitespace-pre-line hover:text-white transition-colors">
                {hours}
              </span>
            </div>
          </div>
        )}

        {/* Links */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white">Quick Links</h3>
          <nav className="flex flex-col gap-2">
            {navItems.map(({ link }, i) => {
              return (
                <Link
                  key={i}
                  href={link.url}
                  className="neon-underline inline-block py-1 text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              )
            })}
            {privacy?.slug && (
              <Link
                href={`/${privacy.slug}`}
                className="neon-underline inline-block py-1 text-white/70 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            )}
            {settings.enableRSS && (
              <a
                href="/feed.xml"
                className="neon-underline inline-block py-1 text-white/70 hover:text-white transition-colors"
              >
                RSS Feed
              </a>
            )}
            {cookies && (
              <CookieSettingsLink className="text-sm text-white/70 hover:text-white py-1" />
            )}
          </nav>
        </div>
      </div>

      {/* Bottom bar with glitch effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--up-primary)] to-transparent opacity-20" />
      </div>

      <div className="border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="container relative z-10 flex flex-col items-center justify-between gap-4 py-6 text-sm text-white/60 md:flex-row md:items-center">
          <span className="copyright">
            © {new Date().getFullYear()} {settings.siteTitle}
          </span>
          {settings.enableThemeSwitcher && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--up-primary)] animate-pulse" />
              <ThemeSelector />
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}