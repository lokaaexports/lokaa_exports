const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lokaaglobalexports.com'

export default function sitemap() {
  const now = new Date().toISOString()
  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/products', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/organics', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/industrial', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/rfq', priority: 0.8, changeFrequency: 'monthly' },
  ]
  return staticRoutes.map(r => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
