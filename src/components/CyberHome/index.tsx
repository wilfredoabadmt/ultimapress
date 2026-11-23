import React from 'react'
import { CyberNavbar } from './Navbar'
import { CyberHero } from './Hero'
import { CyberMarquee } from './Marquee'
import { CyberMethodology } from './Methodology'
import { CyberAbout } from './About'
import { CyberServices } from './Services'
import { CyberProjects } from './Projects'
import { CyberArsenal } from './Arsenal'
import { CyberTimeline } from './Timeline'
import { CyberHosting } from './Hosting'
import { CyberContact } from './Contact'
import { CyberFooter } from './Footer'

export const CyberHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white font-['Gilroy',sans-serif] selection:bg-orange-500 selection:text-black">
      <CyberNavbar />
      <CyberHero />
      <CyberMarquee />
      <CyberAbout />
      <CyberServices />
      <CyberProjects />
      <CyberArsenal />
      <CyberMethodology />
      <CyberTimeline />
      <CyberHosting />
      <CyberContact />
      <CyberFooter />
    </div>
  )
}

export default CyberHomePage
