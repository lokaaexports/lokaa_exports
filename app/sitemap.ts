const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lokaaexports.com'

export default function sitemap() {
  const now = new Date().toISOString()

  const staticRoutes = [
    // Core pages
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/process', priority: 0.7, changeFrequency: 'monthly' },

    // Product sections
    { path: '/products', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/organics', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/industrial', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/lifestyle', priority: 0.9, changeFrequency: 'monthly' },

    // RFQ
    { path: '/rfq', priority: 0.85, changeFrequency: 'monthly' },

    // Auth (lower priority - not typically indexed but good to list)
    { path: '/auth/login', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/auth/register', priority: 0.3, changeFrequency: 'yearly' },
  ]

  return staticRoutes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
