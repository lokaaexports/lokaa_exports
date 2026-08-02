import AboutPageClient from '@/components/site/about-page-client'
import { getCatalogCategories } from '@/lib/products-server'
import { createPageMetadata } from '@/app/metadata'

export const metadata = createPageMetadata({
  title: 'About Lokaa Exports',
  description: 'Learn about Lokaa Exports, our sourcing model, values and long-term export partnership approach for international buyers.',
  path: '/about',
})

export default async function AboutPage() {
  const categories = await getCatalogCategories()
  return <AboutPageClient categories={categories} />
}
