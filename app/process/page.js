import ProcessPageClient from '@/components/site/process-page-client'
import { createPageMetadata } from '@/app/metadata'

export const metadata = createPageMetadata({
  title: 'Our export process',
  description: 'See the Lokaa Exports workflow from requirement analysis to supplier selection, quality coordination, documentation and delivery.',
  path: '/process',
})

export default function ProcessPage() {
  return <ProcessPageClient />
}
