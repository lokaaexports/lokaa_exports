const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lokaaexports.com'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/customer/', '/dashboard/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
