import { redirect } from 'next/navigation'
import { createPageMetadata } from '@/app/metadata'

export const metadata = createPageMetadata({
  title: 'Other Lokaa Products — Garments and lifestyle export sourcing',
  description: 'Discover Other Lokaa Products for garments, leather goods and premium lifestyle sourcing across export-ready product categories.',
  path: '/lifestyle',
})

export default function LifestylePage() {
  redirect('/category/others')
}
