import HomePageClient from '@/components/site/home-page-client'
import { createPageMetadata } from '@/app/metadata'

export const metadata = createPageMetadata({
  title: 'Global sourcing partner for importers and procurement teams',
  description: 'Lokaa Exports is a premium B2B export partner connecting global buyers with verified Indian and Asian suppliers across organics, industrial products and textiles.',
  path: '/',
})

export default function HomePage() {
  return <HomePageClient />
}
