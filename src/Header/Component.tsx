import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getSiteSettings, mediaURL } from '@/utilities/getSiteSettings'
import React from 'react'
import { headers } from 'next/headers'

import { DesignedChrome } from '@/components/DesignedChrome'

export async function Header() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('next-url') || ''
  
  const headerData = await getCachedGlobal('header', 1)()
  const settings = await getSiteSettings()

  // On custom cyber home, CyberNavbar provides full navigation
  if (pathname === '/' || pathname === '') {
    const chosen = settings.homepage
    if (!chosen || (typeof chosen === 'object' && !chosen.slug) || chosen === 'home') {
      return null
    }
  }

  if (headerData?.designed && headerData.designHtml) {
    return <DesignedChrome as="header" html={headerData.designHtml} css={headerData.designCss} />
  }

  return (
    <HeaderClient
      data={headerData}
      logoSrc={mediaURL(settings.logo)}
      siteTitle={settings.siteTitle}
      showSearch={settings.enableSearch !== false}
    />
  )
}
