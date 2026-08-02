import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from './providers'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lokaaexports.com'

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Lokaa Exports — Connecting India's Finest to Global Markets",
    template: '%s — Lokaa Exports',
  },
  description: "Lokaa Exports is a merchant export house connecting global importers with verified Indian and Asian manufacturing partners. Two specialist divisions — Organics and Industrial — serving 42+ countries.",
  keywords: [
    'Lokaa Exports', 'Indian exports', 'B2B export', 'merchant exporter',
    'organic food export India', 'industrial machinery export', 'spices export',
    'agricultural export', 'export from India', 'RFQ Indian supplier',
    'APEDA registered exporter', 'ISO 22000 exporter', 'India sourcing partner',
  ],
  authors: [{ name: 'Lokaa Exports Pvt. Ltd.' }],
  creator: 'Lokaa Exports',
  publisher: 'Lokaa Exports Pvt. Ltd.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Lokaa Exports',
    title: "Lokaa Exports — Connecting India's Finest to Global Markets",
    description: 'A new-generation merchant export house with two specialist divisions — Organics and Industrial — connecting global importers with verified Indian and Asian manufacturing partners.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Lokaa Exports' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lokaa Exports',
    description: 'Connecting India\'s finest to global markets. Est. 2026.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: { icon: '/favicon.ico' },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Lokaa Exports Pvt. Ltd.',
  legalName: 'Lokaa Exports Private Limited',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  foundingDate: '2026',
  foundingLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Chennai', addressCountry: 'IN' } },
  description: 'Merchant export house connecting global importers with verified Indian and Asian manufacturing partners across two specialist divisions — Organics and Industrial.',
  address: { '@type': 'PostalAddress', addressLocality: 'Chennai', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
  contactPoint: [
    { '@type': 'ContactPoint', telephone: '+91-97906-07059', contactType: 'sales', email: 'info@lokaaexports.com', availableLanguage: ['English', 'Hindi', 'Tamil'], areaServed: 'Worldwide' },
    { '@type': 'ContactPoint', telephone: '+91-97906-07059', contactType: 'customer support', email: 'info@lokaaexports.com', areaServed: 'Worldwide' },
  ],
  sameAs: [],
  knowsAbout: ['International Trade', 'Merchant Exports', 'Global Sourcing', 'Supply Chain Management', 'B2B Export'],
  subOrganization: [
    { '@type': 'Organization', name: 'Lokaa Organics', description: 'Organic foods, spices, herbs, millets and coconut products.' },
    { '@type': 'Organization', name: 'Lokaa Industrial', description: 'Food processing machinery, industrial equipment and electronics.' },
  ],
}

import { WhatsAppButton } from '@/components/site/whatsapp-button'

export default function RootLayout({ children }: any) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      </head>
      <body className="font-body antialiased bg-ivory text-navy">
        <Providers>
          {children}
        </Providers>
        <Toaster />
        <WhatsAppButton />
      </body>
    </html>
  )
}

