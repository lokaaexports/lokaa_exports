import { buildMetadata } from '@/lib/seo'

export function createPageMetadata({ title, description, path = '/', image = '/og-image.jpg', keywords = [], type = 'website' }: any) {
  return buildMetadata({ title: `${title} | Lokaa Exports`, description, path, image, keywords, type })
}
