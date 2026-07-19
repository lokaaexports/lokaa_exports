'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight, CheckCircle2, Leaf, ShieldCheck, Sprout, Warehouse, Globe2, SunMedium, Snowflake, Boxes, TrendingUp } from 'lucide-react'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'
import { CATEGORIES } from '@/lib/products'

const EASE = [0.16, 1, 0.3, 1]

function Reveal({ children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, delay, ease: EASE }}>
      {children}
    </motion.div>
  )
}

export default function OrganicsPageClient() {
  const categoryCards = CATEGORIES.map((category) => ({
    title: category.name,
    description: category.tagline,
    image: category.image,
    metrics: [
      'Export-ready quality',
      'Professional sourcing',
      'Global logistics support',
    ],
  }))

  const seasonal = categoryCards.slice(0, 2)
  const nonSeasonal = categoryCards.slice(2)

  const organicStreams = [
    {
      title: 'Fresh Fruits',
      description: 'Organic fresh fruits harvested at peak ripeness for export to premium grocery, retail and hospitality buyers.',
      items: ['Alphonso Mango', 'Kesar Mango', 'Banganapalli Mango', 'Totapuri Mango', 'Banana', 'Pomegranate', 'Grapes', 'Guava', 'Papaya'],
    },
    {
      title: 'Fresh Vegetables',
      description: 'Cold-chain vegetables with export-grade handling for regional markets in Asia, the Middle East and Europe.',
      items: ['Fresh Coconut', 'Fresh Ginger', 'Fresh Turmeric', 'Garlic', 'Green Chilli', 'Tomato', 'Fresh Onion', 'Potato'],
    },
    {
      title: 'Rice & Staples',
      description: 'Seasonal staples sourced from proven origins, graded for bulk export shipments and retail distribution.',
      items: ['1121 Basmati Rice', 'Pusa Basmati Rice', 'Sona Masoori Rice', 'Ponni Rice', 'IR64 Rice'],
    },
    {
      title: 'Pulses & Millets',
      description: 'High-quality pulses and millets for food manufacturers, retail packers and institutional buyers.',
      items: ['Toor Dal', 'Moong Dal', 'Urad Dal', 'Chana Dal', 'Masoor Dal', 'Foxtail Millet', 'Finger Millet (Ragi)', 'Pearl Millet (Bajra)', 'Little Millet', 'Barnyard Millet'],
    },
    {
      title: 'Whole & Ground Spices',
      description: 'Premium spice grades, ground powders and raw spice kernels for global food, beverage and nutraceutical markets.',
      items: ['Black Pepper', 'Green Cardamom', 'Cumin Seeds', 'Coriander Seeds', 'Dry Red Chilli', 'Fennel Seeds', 'Fenugreek Seeds', 'Mustard Seeds', 'Cloves', 'Cinnamon', 'Turmeric Powder', 'Chilli Powder', 'Coriander Powder', 'Cumin Powder', 'Black Pepper Powder'],
    },
    {
      title: 'Dehydrated & Powdered Goods',
      description: 'Dehydrated vegetables, powdered seasonings and culinary ingredients for shelf-stable processing and private-label brands.',
      items: ['Dehydrated Onion', 'Onion Powder', 'Dehydrated Garlic', 'Garlic Powder', 'Dehydrated Ginger', 'Ginger Powder', 'Dehydrated Tomato', 'Tomato Powder', 'Curry Leaf Powder'],
    },
    {
      title: 'Coconut Products',
      description: 'Coconut derivatives tailored to food, bakery, hospitality and industrial applications.',
      items: ['Fresh Coconut', 'Desiccated Coconut', 'Coconut Powder', 'Virgin Coconut Oil', 'Coconut Flour', 'Coconut Milk Powder'],
    },
    {
      title: 'Tea & Coffee',
      description: 'Selected plantation teas and coffee beans from India’s premier growing regions.',
      items: ['Assam Tea', 'Darjeeling Tea', 'Nilgiri Tea', 'Green Tea', 'Arabica Coffee Beans', 'Robusta Coffee Beans'],
    },
    {
      title: 'Value-Added Organic Ingredients',
      description: 'Superfood and herbal powders for nutraceutical, wellness and functional food product lines.',
      items: ['Moringa Powder', 'Wheatgrass Powder', 'Spirulina Powder', 'Beetroot Powder', 'Spinach Powder', 'Amla Powder', 'Ashwagandha Powder', 'Triphala Powder', 'Neem Powder', 'Brahmi Powder', 'Hibiscus Powder', 'Aloe Vera Powder', 'Aloe Vera Gel'],
    },
  ]

  const productSpecFields = [
    { label: 'Product Name', value: 'Organic Red Onion / Dehydrated Onion' },
    { label: 'Botanical Name', value: 'Allium cepa' },
    { label: 'Origin', value: 'India' },
    { label: 'Grade', value: 'Export Grade' },
    { label: 'Color', value: 'Deep red / purple' },
    { label: 'Size', value: '40-65 mm diameter' },
    { label: 'Moisture', value: 'Max 9%' },
    { label: 'Purity', value: '99%+' },
    { label: 'Shelf Life', value: '30-45 days under cold chain' },
    { label: 'Packaging', value: '10 kg / 20 kg mesh bags, 25 kg jute bags, cartons' },
    { label: 'Storage', value: 'Cool, dry warehouse; avoid direct sunlight' },
    { label: 'MOQ', value: '1 x 20 ft container or 5 MT' },
    { label: 'Lead Time', value: '4-6 weeks after PO' },
  ]

  const certs = ['USDA Organic', 'EU Organic', 'India Organic', 'Fair Trade', 'HACCP', 'ISO 22000']

  return (
    <main>
      <Nav theme="solid" />
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#0b1e0f_0%,#1e3d26_100%)] pb-24 pt-40">
        <div className="absolute inset-0 grain opacity-40" />
        <div className="absolute -right-20 -top-20 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Division · 01
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15, ease: EASE }} className="max-w-4xl font-display text-5xl leading-[1.02] tracking-tight text-white lg:text-7xl">
            <span className="text-emerald-300">AgriOrganicExports</span> for premium organic sourcing.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: EASE }} className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80">
            Certified organic sourcing for seasonal and non-seasonal ingredients, spices, grains, coconut products, herbs and plant-based raw materials across India’s strongest export corridors.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.55, ease: EASE }} className="mt-10 flex flex-wrap gap-3">
            <Link href="/rfq" className="group inline-flex items-center gap-3 rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-200">
              Request organic quote <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-950 text-emerald-300 transition-transform group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span>
            </Link>
            <Link href="/rfq" className="rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">Request sourcing consultation</Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><span className="h-px w-8 bg-gold" /> Organic categories</div>
            <h2 className="mb-14 max-w-3xl font-display text-4xl leading-tight tracking-tight text-navy lg:text-5xl">Distinct product streams for both seasonal harvest cycles and steady year-round demand.</h2>
          </Reveal>
          <div className="mb-16 grid gap-6 md:grid-cols-2">
            {categoryCards.slice(0, 2).map((category, index) => (
              <Reveal key={category.title} delay={index * 0.08}>
                <Link href="/products" className="group block overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={category.image} alt={category.title} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <div className="font-display text-2xl tracking-tight">{category.title}</div>
                    </div>
                  </div>
                  <div className="p-7">
                    <p className="text-sm leading-relaxed text-graphite/70">{category.description}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {category.metrics.map((metric) => (<span key={metric} className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-800">{metric}</span>))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {categoryCards.slice(2).map((category, index) => (
              <Reveal key={category.title} delay={index * 0.08}>
                <Link href="/products" className="group block overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={category.image} alt={category.title} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <div className="font-display text-2xl tracking-tight">{category.title}</div>
                    </div>
                  </div>
                  <div className="p-7">
                    <p className="text-sm leading-relaxed text-graphite/70">{category.description}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {category.metrics.map((metric) => (<span key={metric} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-700">{metric}</span>))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><span className="h-px w-8 bg-gold" /> AgriOrganic product range</div>
            <h2 className="mb-12 max-w-3xl font-display text-4xl leading-tight tracking-tight text-navy lg:text-5xl">Expanded organic product streams for fresh, staple, spice and coconut supply.</h2>
          </Reveal>
          <div className="grid gap-8 lg:grid-cols-2">
            {organicStreams.map((stream) => (
              <Reveal key={stream.title}>
                <div className="rounded-3xl border border-slate-200 bg-ivory p-8">
                  <h3 className="mb-4 text-2xl font-semibold text-navy">{stream.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-graphite/75">{stream.description}</p>
                  <ul className="grid gap-2 text-sm text-graphite/80 sm:grid-cols-2">
                    {stream.items.map((item) => (<li key={item} className="before:content-['•'] before:mr-2 before:text-emerald-500">{item}</li>))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><span className="h-px w-8 bg-gold" /> Product specification template</div>
            <h2 className="mb-8 max-w-3xl font-display text-4xl leading-tight tracking-tight text-navy lg:text-5xl">Sample product details for organic export inquiries.</h2>
          </Reveal>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-px bg-slate-200 text-sm sm:grid-cols-2">
              {productSpecFields.map((field) => (
                <div key={field.label} className="rounded-none bg-white px-6 py-5 sm:px-8">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{field.label}</div>
                  <div className="mt-2 text-base font-medium text-slate-900">{field.value}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-graphite/75">Use this template to request product samples, packaging quotes or export-ready documentation for your chosen AgriOrganicExports item.</p>
        </div>
      </section>

      <section className="bg-navy-deep py-24 text-white lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold"><span className="h-px w-8 bg-gold" /> Quality & compliance</div>
            <h2 className="mb-12 max-w-2xl font-display text-3xl leading-tight tracking-tight lg:text-4xl">A documented supply chain that supports procurement and retailer audits.</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: ShieldCheck, title: 'Traceability', description: 'Verified origin and batch documentation for every shipment.' },
              { icon: Leaf, title: 'Certifications', description: 'USDA, EU, India Organic and fair-trade aligned sourcing.' },
              { icon: Globe2, title: 'Export readiness', description: 'Support for major destination-country regulations and customs.' },
              { icon: Warehouse, title: 'Cold chain', description: 'Handling protocols for fresh and dehydrated cargoes.' },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><item.icon className="h-5 w-5" /></div>
                  <h3 className="font-display text-xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            {certs.map((cert) => <div key={cert} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80">{cert}</div>)}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
