import { Suspense } from 'react'
import RFQPageClient from '@/components/site/rfq-client'
import { createPageMetadata } from '@/app/metadata'
import { getProductsCatalog, getCatalogCategories } from '@/lib/products-server'

export const metadata = createPageMetadata({
  title: 'Request a quotation — export sourcing enquiry',
  description: 'Submit a professional RFQ for product sourcing, pricing, compliance, packaging and logistics support with Lokaa Exports.',
  path: '/rfq',
})

export default async function RFQPage() {
  const [products, categories] = await Promise.all([getProductsCatalog(), getCatalogCategories()])

  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
      <RFQPageClient products={products} categories={categories} />
    </Suspense>
  )
}
