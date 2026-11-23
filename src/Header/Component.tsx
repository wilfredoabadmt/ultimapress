import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getSiteSettings, mediaURL } from '@/utilities/getSiteSettings'
import React from 'react'

import { DesignedChrome } from '@/components/DesignedChrome'

export async function Header() {
  const headerData = await getCachedGlobal('header', 1)()
  const settings = await getSiteSettings()

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
