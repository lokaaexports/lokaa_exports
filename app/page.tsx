import HomePageClient from '@/components/site/home-page-client'
import { createPageMetadata } from '@/app/metadata'
import { getCatalogCategories } from '@/lib/products-server'

export const dynamic = 'force-dynamic'

export const metadata = createPageMetadata({
  title: 'Global sourcing partner for importers and procurement teams',
  description: 'Lokaa Exports is a premium B2B export partner connecting global buyers with verified Indian and Asian suppliers across organics, industrial products and textiles.',
  path: '/',
})

export default async function HomePage() {
  let categories = []
  try {
    categories = await getCatalogCategories()
  } catch (err) {
    console.error('Home page db connection fallback:', err)
  }
  return <HomePageClient categories={categories} />
}
