'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowLeft, Check, Package, Ship, Award, Globe2, Layers } from 'lucide-react'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'
import { CATEGORIES } from '@/lib/products'

const EASE = [0.16, 1, 0.3, 1]

const buildProductOverview = (product, category) => {
  const categoryName = category?.name || 'Organic export product'
  const marketPosition = category?.slug === 'non-seasonal-essentials' ? 'year-round ingredient supply' : 'seasonal bulk exports'

  return `Premium ${product.name} from India, optimized for global B2B buyers in Singapore, Malaysia, UAE, UK and Europe. This ${categoryName.toLowerCase()} is export-ready, traceable, and packaged to support food manufacturers, private label lines, and retail distributors with reliable delivery and certified organic compliance.`
}

export default function ProductDetailPageClient({ slug, products = [], categories = [] }) {
  const [active, setActive] = useState(0)
  const product = products.find((p) => p.slug === slug)

  if (!product) return null

  const category = (Array.isArray(categories) && categories.length > 0 ? categories : CATEGORIES).find((c) => c.slug === product.category)
  const gallery = Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery : [product.hero || '/placeholder.png']
  const certifications = Array.isArray(product.certifications) ? product.certifications : []
  const applications = Array.isArray(product.applications) ? product.applications : []
  const packaging = Array.isArray(product.packaging) ? product.packaging : []
  const specs = Array.isArray(product.specs) ? product.specs : []
  const rel = products.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 3)

  return (
    <main>
      <Nav theme="light" />
      <section className="bg-ivory pb-16 pt-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <Link href="/products" className="mb-8 inline-flex items-center gap-2 text-sm text-graphite/60 transition hover:text-navy">
              <ArrowLeft className="h-4 w-4" /> Back to catalogue
            </Link>
          </motion.div>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <motion.div layoutId={`hero-${product.slug}`} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: EASE }} className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-navy/5 shadow-sm">
                <Image src={gallery[active] || gallery[0]} alt={product.name} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" priority />
                <div className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-navy">{category?.name}</div>
              </motion.div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {gallery.map((g, index) => (
                  <button key={index} onClick={() => setActive(index)} className={`relative aspect-[4/3] overflow-hidden rounded-xl transition-all ${active === index ? 'ring-2 ring-gold' : 'opacity-70 hover:opacity-100'}`}>
                    <Image src={g} alt={`${product.name} gallery image ${index + 1}`} fill sizes="20vw" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: EASE }}>
                <div className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite"><span className="h-px w-8 bg-gold" /> Product sheet</div>
                <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-navy lg:text-5xl">{product.name}</h1>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-navy">Export-grade {product.name} from India, certified for global sourcing and bulk distribution.</h2>
                <p className="mt-6 text-lg leading-relaxed text-graphite">{product.tagline}</p>
                <p className="mt-4 text-base leading-relaxed text-graphite">{buildProductOverview(product, category)}</p>
                <div className="mt-8">
                  <Link href={`/rfq?product=${product.slug}`} className="group inline-flex items-center gap-3 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-deep">
                    Request quote for this product
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-navy transition-transform group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span>
                  </Link>
                </div>
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  {certifications.map((c) => (
                    <div key={c} className="flex items-center gap-2 text-sm text-navy">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-gold"><Check className="h-3.5 w-3.5" /></div>
                      {c}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-6">
            <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><Layers className="h-3.5 w-3.5 text-gold" /> Specifications</div>
            <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-6 px-6 py-4">
                  <div className="text-sm text-graphite/60">{s.label}</div>
                  <div className="text-right font-medium text-navy">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-14">
              <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><Package className="h-3.5 w-3.5 text-gold" /> Packaging options</div>
              <ul className="space-y-3">
                {packaging.map((p) => <li key={p} className="flex items-start gap-3 text-navy"><span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" /><span>{p}</span></li>)}
              </ul>
            </div>
            <div className="mt-14">
              <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><Layers className="h-3.5 w-3.5 text-gold" /> Product details</div>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(product.details || {}).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-navy/10 bg-ivory p-4">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-graphite/50">{key === 'productName' ? 'Product Name' : key === 'botanicalName' ? 'Botanical Name' : key === 'origin' ? 'Origin' : key === 'grade' ? 'Grade' : key === 'color' ? 'Color' : key === 'size' ? 'Size' : key === 'moisture' ? 'Moisture' : key === 'purity' ? 'Purity' : key === 'shelfLife' ? 'Shelf Life' : key === 'packaging' ? 'Packaging' : key === 'storage' ? 'Storage' : key === 'moq' ? 'MOQ' : key === 'leadTime' ? 'Lead Time' : key}</div>
                    <div className="mt-2 font-medium text-navy">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><Award className="h-3.5 w-3.5 text-gold" /> Applications</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {applications.map((a) => <div key={a} className="rounded-xl border border-navy/5 bg-ivory p-5 text-sm font-medium text-navy">{a}</div>)}
            </div>
            <div className="mt-14">
              <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><Globe2 className="h-3.5 w-3.5 text-gold" /> Export markets</div>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(product.exportMarkets) ? product.exportMarkets : []).map((m) => <span key={m} className="rounded-full bg-navy px-4 py-2 text-sm text-white">{m}</span>)}
              </div>
            </div>
            <div className="mt-14 flex items-start gap-4 rounded-2xl bg-navy p-6 text-white">
              <Ship className="mt-0.5 h-6 w-6 flex-shrink-0 text-gold" />
              <div>
                <div className="font-display text-lg">Logistics & Incoterms</div>
                <div className="mt-1 text-sm leading-relaxed text-white/70">FOB, CIF, DAP terms available. Ex-Chennai / Mumbai / Kochi / Mundra. FCL & LCL supported.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {rel.length > 0 && (
        <section className="bg-ivory py-24">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
            <div className="mb-12 flex items-end justify-between">
              <h2 className="font-display text-3xl tracking-tight text-navy lg:text-4xl">Related products</h2>
              <Link href="/products" className="border-b border-navy/30 pb-1 text-sm text-navy transition hover:border-gold hover:text-gold">View all →</Link>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {rel.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-navy/5">
                    <Image src={p.hero} alt={p.name} fill sizes="33vw" className="object-cover transition-transform duration-&lsqb;1200ms&rsqb; group-hover:scale-105" />
                  </div>
                  <div className="mt-4">
                    <div className="font-display text-lg text-navy transition group-hover:text-gold">{p.name}</div>
                    <div className="mt-1 text-sm text-graphite/60">{p.tagline}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </main>
  )
}
