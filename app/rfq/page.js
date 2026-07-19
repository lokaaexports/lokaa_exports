import { Suspense } from 'react'
import RFQPageClient from '@/components/site/rfq-client'
import { createPageMetadata } from '@/app/metadata'

export const metadata = createPageMetadata({
  title: 'Request a quotation — export sourcing enquiry',
  description: 'Submit a professional RFQ for product sourcing, pricing, compliance, packaging and logistics support with Lokaa Exports.',
  path: '/rfq',
})

export default function RFQPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
      <RFQPageClient />
    </Suspense>
  )
}
