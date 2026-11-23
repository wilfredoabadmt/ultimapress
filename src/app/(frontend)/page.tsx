import type { Metadata } from 'next'

import PageTemplate, { generateMetadata as generatePageMetadata } from './[slug]/page'
import PostsPage from './posts/page'
import { getSiteSettings } from '@/utilities/getSiteSettings'
import { CyberHomePage } from '@/components/CyberHome'

export const revalidate = 600

/**
 * Homepage. Site Settings > Reading decides whether it shows a static page
 * (the chosen page, or the page with slug "home") or the latest posts.
 * By default, renders the CyberHomePage portfolio of Wilfredo Abad.
 */
async function homepageSlug(): Promise<string | 'posts' | 'cyber'> {
  const settings = await getSiteSettings()
  if (settings.homepageDisplays === 'posts' && settings.enableBlog !== false) return 'posts'
  const chosen = settings.homepage
  if (chosen && typeof chosen === 'object' && chosen.slug) return chosen.slug
  return 'cyber'
}

export default async function HomePage() {
  const slug = await homepageSlug()
  if (slug === 'posts') return <PostsPage />
  if (slug === 'cyber') return <CyberHomePage />
  return <PageTemplate params={Promise.resolve({ slug })} />
}

export async function generateMetadata(): Promise<Metadata> {
  const slug = await homepageSlug()
  if (slug === 'cyber') {
    return {
      title: 'Wilfredo Abad | Systems Engineer & Digital Growth Specialist',
      description: 'Ingeniería de software de alta gama, arquitecturas web ultra rápidas, más de $2,500 en software premium oficial incluido y estrategias de marketing digital y político de alta conversión.',
      keywords: ['Wilfredo Abad', 'Ingeniero de Sistemas', 'Desarrollo Web Bolivia', 'Next.js', 'WordPress Pro', 'Crocoblock', 'Elementor', 'Marketing Político', 'E-commerce'],
      openGraph: {
        title: 'Wilfredo Abad | Systems Engineer & Digital Growth Specialist',
        description: 'Construyendo plataformas web ultra veloces con stack futurista y estrategias de conversión masiva.',
        images: ['/assets/wilfredo-set.jpg']
      }
    }
  }
  if (slug === 'posts') return {}
  return generatePageMetadata({ params: Promise.resolve({ slug }) })
}
