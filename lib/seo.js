const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lokaaglobalexports.com'

export const siteConfig = {
  name: 'Lokaa Exports',
  legalName: 'Lokaa Exports Pvt. Ltd.',
  url: SITE_URL,
  description: 'Premium Indian export house connecting global importers with verified supply chains across organics, industrial equipment, and textiles.',
  address: {
    streetAddress: 'Chennai Export Processing Zone',
    addressLocality: 'Chennai',
    addressRegion: 'Tamil Nadu',
    postalCode: '600001',
    addressCountry: 'IN',
  },
  telephone: '+91 97906 07059',
  email: 'info@lokaaexports.com',
  logo: `${SITE_URL}/logo.png`,
  sameAs: [],
}

export function buildMetadata({ title, description, path = '/', image = '/og-image.jpg', keywords = [], type = 'website' }) {
  const canonical = `${SITE_URL}${path}`
  const normalizedKeywords = Array.isArray(keywords) ? keywords.filter(Boolean).map((keyword) => keyword.trim()) : []

  return {
    title,
    description,
    keywords: normalizedKeywords,
    alternates: { canonical, languages: { en: canonical } },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type,
      locale: 'en_US',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    other: normalizedKeywords.length > 0 ? [{ name: 'keywords', content: normalizedKeywords.join(', ') }] : undefined,
  }
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.legalName,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: siteConfig.logo,
    description: siteConfig.description,
    address: {
      '@type': 'PostalAddress',
      ...siteConfig.address,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: siteConfig.telephone,
        contactType: 'sales',
        email: siteConfig.email,
        areaServed: 'Worldwide',
        availableLanguage: ['English', 'Hindi', 'Tamil'],
      },
    ],
    sameAs: siteConfig.sameAs,
    knowsAbout: ['International Trade', 'Merchant Exports', 'Global Sourcing', 'Supply Chain Management', 'B2B Export'],
  }
}

export function buildProductKeywords(product, categoryName = '') {
  const baseKeywords = [
    product.name,
    `${product.name} export`,
    `organic ${product.name}`,
    `organic ${product.name} export`,
    `${product.name} supplier India`,
    `${product.name} exporter India`,
    `${product.name} bulk export`,
    `${product.name} wholesale`,
    'Indian organic exports',
    'export house India',
    'B2B export sourcing',
    'global sourcing',
    'export-ready organic products',
  ]

  const categoryKeywords = categoryName
    ? [`${categoryName} export`, `${categoryName} supplier`, `${categoryName} from India`, `organic ${categoryName}`]
    : []

  const applicationKeywords = (product.applications || []).flatMap((application) => [
    `${application} export`,
    `${application} supplier`,
  ])

  const packagingKeywords = (product.packaging || []).map((pack) => `${pack} packaging`)

  return Array.from(
    new Set([
      ...baseKeywords,
      ...categoryKeywords,
      ...applicationKeywords,
      ...packagingKeywords,
      ...(product.certifications || []),
      'organic export India',
      'Agri organic export',
      'premium Indian spices export',
    ]),
  ).slice(0, 40)
}

export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    image: `${SITE_URL}/og-image.jpg`,
    url: siteConfig.url,
    telephone: siteConfig.telephone,
    email: siteConfig.email,
    address: {
      '@type': 'PostalAddress',
      ...siteConfig.address,
    },
    areaServed: 'Worldwide',
    description: siteConfig.description,
  }
}

export function buildFaqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export function buildProductSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.tagline,
    image: product.gallery?.[0] || product.hero,
    url: `${SITE_URL}/products/${product.slug}`,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'Lokaa Exports',
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'INR',
      url: `${SITE_URL}/products/${product.slug}`,
    },
    additionalProperty: product.specs?.map((spec) => ({
      '@type': 'PropertyValue',
      name: spec.label,
      value: spec.value,
    })) || [],
  }
}
