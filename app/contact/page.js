import ContactPageClient from '@/components/site/contact-page-client'
import { createPageMetadata } from '@/app/metadata'

export const metadata = createPageMetadata({
  title: 'Contact Lokaa Exports',
  description: 'Contact Lokaa Exports for sourcing enquiries, product questions, RFQs and export support.',
  path: '/contact',
})

export default function ContactPage() {
  return <ContactPageClient />
}
