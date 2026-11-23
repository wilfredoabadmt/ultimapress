import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { getSiteSettings, mediaURL } from '@/utilities/getSiteSettings'
import { DesignedChrome } from '@/components/DesignedChrome'
import { needsCookieBanner } from '@/components/Visitors'
import { CookieSettingsLink } from '@/components/Visitors/Consent.client'

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
      className="up-footer mt-auto text-white"
      style={{
        background: 'color-mix(in oklab, var(--up-primary) 78%, black)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(234, 88, 12, 0.15) 0%, transparent 50%)',
        opacity: 0.5,
        pointerEvents: 'none',
      }} />
      <style dangerouslySetInnerHTML={{ __html: `
        .up-footer {
          font-family: 'Gilroy', 'Inter', ui-sans-serif, system-ui, sans-serif;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .up-footer a, .up-footer button {
          transition: color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .up-footer a:hover, .up-footer button:hover {
          transform: translateY(-2px);
          color: white;
        }
        .up-footer h3 {
          font-family: 'Gilroy', 'Inter', ui-sans-serif, system-ui, sans-serif;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: white;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }
        .up-footer h3:hover {
          letter-spacing: 0.1em;
        }
        .up-footer .text-white\\/70 {
          transition: color 0.3s ease;
        }
        .up-footer:hover .text-white\\/70 {
          color: white;
        }
        .up-footer li {
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .up-footer li:hover {
          transform: translateX(4px);
        }
        .up-footer a {
          position: relative;
        }
        .up-footer a::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 0;
          height: 1px;
          background: white;
          transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .up-footer a:hover::after {
          width: 100%;
        }
      `}} />

      <div className="container grid gap-10 py-16 md:py-20 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Link className="flex items-center group" href="/">
            <Logo src={mediaURL(settings.logo)} siteTitle={settings.siteTitle} />
          </Link>
          {(about || settings.tagline) && (
            <p className="max-w-sm leading-relaxed text-white/70 transition-all duration-300">
              {about || settings.tagline}
            </p>
          )}
          {social.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
              {social.map((s, i) => (
                <li key={i}>
                  <a
                    className="text-white/90 hover:text-white transition-all duration-300 ease-out
                    hover:-translate-y-0.5 hover:shadow-lg inline-block"
                    href={s.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasContact && (
          <div className="transition-all duration-300">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest">Contact</h3>
            <ul className="flex flex-col gap-3 text-white/70">
              {phone && (
                <li className="flex gap-3 group">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-white/50 transition-all duration-300 group-hover:text-white group-hover:scale-110" aria-hidden />
                  <a className="hover:text-white transition-all duration-300" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>
                </li>
              )}
              {email && (
                <li className="flex gap-3 group">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-white/50 transition-all duration-300 group-hover:text-white group-hover:scale-110" aria-hidden />
                  <a className="break-all hover:text-white transition-all duration-300" href={`mailto:${email}`}>
                    {email}
                  </a>
                </li>
              )}
              {address && (
                <li className="flex gap-3 group">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-white/50 transition-all duration-300 group-hover:text-white group-hover:scale-110" aria-hidden />
                  <span className="whitespace-pre-line hover:text-white transition-all duration-300">{address}</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {hours && (
          <div className="transition-all duration-300">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest">Opening hours</h3>
            <div className="flex gap-3 text-white/70">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-white/50 transition-all duration-300 hover:scale-110" aria-hidden />
              <span className="whitespace-pre-line hover:text-white transition-all duration-300">{hours}</span>
            </div>
          </div>
        )}

        <div className="transition-all duration-300">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest">Links</h3>
          <nav className="flex flex-col gap-3 text-white/70">
            {navItems.map(({ link }, i) => {
              return <CMSLink key={i} {...link} />
            })}
            {privacy?.slug && (
              <Link
                href={`/${privacy.slug}`}
                className="hover:text-white transition-all duration-300 inline-block"
              >
                Privacy Policy
              </Link>
            )}
            {settings.enableRSS && (
              <a
                href="/feed.xml"
                className="hover:text-white transition-all duration-300 inline-block"
              >
                RSS
              </a>
            )}
            {cookies && <CookieSettingsLink className="text-left block" />}
          </nav>
        </div>
      </div>

      <div className="border-t border-white/15 bg-white/10">
        <div className="container flex flex-col items-start justify-between gap-4 py-6 text-sm text-white/70 md:flex-row md:items-center">
          <span className="hover:text-white transition-all duration-300">
            © {new Date().getFullYear()} {settings.siteTitle}
          </span>
          {settings.enableThemeSwitcher && (
            <div className="transition-transform duration-300 hover:scale-105">
              <ThemeSelector />
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}