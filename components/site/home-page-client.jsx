'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform, animate } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Award, Building2, ChevronRight, Globe2, Leaf, PackageCheck, ShieldCheck, Ship, Sparkles, Timer, Warehouse, ClipboardCheck, CheckCircle2, Quote, Phone, Factory } from 'lucide-react'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'
import { SectionHeading, MetricCard } from '@/components/site/section-shell'

const WorldMap = dynamic(() => import('@/components/site/world-map'), {
  ssr: false,
  loading: () => <div className="h-[320px] rounded-2xl border border-white/10 bg-white/5" />,
})

const EASE = [0.16, 1, 0.3, 1]

function Counter({ to, suffix = '', duration = 2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: (v) => setValue(v) })
    return () => controls.stop()
  }, [inView, to, duration])

  return <span ref={ref}>{Math.round(value).toLocaleString()}{suffix}</span>
}

function Reveal({ children, delay = 0, y = 28 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden bg-navy-deep pt-24 lg:pt-28">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image
          src="/og-image.jpg"
          alt="Export cargo and logistics operations"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 grain" />
      <motion.div style={{ opacity }} className="relative z-10 flex min-h-screen flex-col justify-end pb-24 lg:pb-28">
        <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold">
            <span className="h-px w-8 bg-gold" /> Premium export house · Chennai, India
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.95, delay: 0.15, ease: EASE }} className="max-w-5xl font-display text-[clamp(2.8rem,7vw,6.6rem)] leading-[0.98] tracking-[-0.03em] text-white text-balance">
            Connecting the world’s finest supply chains to buyers.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.95, delay: 0.3, ease: EASE }} className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80 lg:text-xl">
            Our export house supports importers and procurement teams with dependable sourcing, compliance and delivery for premium agricultural products and industrial machinery.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.95, delay: 0.45, ease: EASE }} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/rfq" className="group inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition-all hover:bg-[hsl(var(--gold-soft))]">
              Request a quotation
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-gold transition-transform group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/organics" prefetch={false} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10">
              Explore our export domains <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
        <div className="mt-16 border-t border-white/10 bg-navy-deep/45 backdrop-blur-md">
          <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-4 px-6 py-5 lg:grid-cols-4 lg:px-10">
            {[
              ['42+', 'destination countries'],
              ['4', 'export gateways'],
              ['24h', 'RFQ response target'],
              ['ISO · HACCP · APEDA', 'compliance framework'],
            ].map(([value, label]) => (
              <div key={label} className="px-2 py-2 lg:px-4">
                <div className="font-display text-lg text-white lg:text-xl">{value}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/55">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function BrandsSection() {
  const brands = [
    {
      title: 'Organics',
      href: '/category/organics',
      summary: 'Certified organic produce, spices, grains, coconut products and specialty ingredients for premium global buyers.',
      accent: 'from-emerald-950 to-emerald-700',
      badge: 'Organic exports',
    },
    {
      title: 'Electronic & Machinery',
      href: '/category/electronic-machinery',
      summary: 'Machinery sourcing, industrial automation, electronics and packaging systems for manufacturing and processing plants.',
      accent: 'from-slate-950 to-sky-900',
      badge: 'Machinery & electronics',
    },
    {
      title: 'Others',
      href: '/category/others',
      summary: 'Custom products, services and emerging export categories tailored for bespoke buyer requirements.',
      accent: 'from-amber-950 to-rose-800',
      badge: 'Other products',
    },
  ]

  return (
    <section className="bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading eyebrow="Specialist sectors" title="Three core export categories, one premium export partner." description="Each category now operates as a focused sourcing domain while sharing Lokaa’s enterprise service model, quality controls and export execution." />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {brands.map((brand, index) => (
            <Reveal key={brand.title} delay={index * 0.08}>
              <Link href={brand.href} prefetch={false} className={`group relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${brand.accent} p-8 text-white premium-shadow`}>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/80">
                    <span className="h-2 w-2 rounded-full bg-gold" /> {brand.badge}
                  </div>
                  <h3 className="mt-6 font-display text-3xl tracking-tight">{brand.title}</h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">{brand.summary}</p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-sm text-white/70">View division</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-all group-hover:bg-gold group-hover:text-navy">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function CompanyOverviewSection() {
  const capabilities = [
    'Strategic product sourcing based on buyer specifications and target-market needs',
    'Supplier qualification, quality coordination and export-ready packaging',
    'Documentation, logistics planning and dedicated commercial support',
  ]

  const growth = [
    'Private label manufacturing',
    'Contract manufacturing',
    'Dedicated warehousing',
    'Regional sales offices',
    'ERP and supply-chain technology',
  ]

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <SectionHeading eyebrow="Who we are" title="A global sourcing and export solutions partner built for serious buyers." description="Lokaa Exports is established to connect international importers with trusted suppliers across India and selected Asian markets through a professional, documented and highly responsive export process." />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-graphite/70">Rather than operating as a marketplace, we coordinate sourcing, quality management, packaging, documentation and logistics through a single trusted point of contact. Our role is to simplify international procurement and make each enquiry feel like a structured business project.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {capabilities.map((capability) => (
                <div key={capability} className="rounded-2xl border border-navy/10 bg-ivory p-5 text-sm leading-relaxed text-graphite/70">
                  {capability}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-navy/10 bg-navy-deep p-8 text-white">
              <div className="text-[11px] uppercase tracking-[0.24em] text-gold">Vision</div>
              <h3 className="mt-4 font-display text-2xl text-white">To become one of the world’s most trusted global sourcing and export solution providers.</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/70">We are building a long-term platform that supports repeat export relationships, premium service standards and future-ready supply chain capability.</p>
            </div>
            <div className="rounded-3xl border border-navy/10 bg-ivory p-8">
              <div className="text-[11px] uppercase tracking-[0.24em] text-gold">Mission</div>
              <h3 className="mt-4 font-display text-2xl text-navy">To simplify international sourcing with transparent communication and dependable execution.</h3>
              <p className="mt-4 text-sm leading-relaxed text-graphite/70">Our mission is to help buyers source confidently through one reliable partner that can coordinate quality, packaging, documentation and export delivery.</p>
            </div>
            <div className="rounded-3xl border border-navy/10 bg-white p-8">
              <div className="text-[11px] uppercase tracking-[0.24em] text-gold">Future readiness</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {growth.map((item) => <span key={item} className="rounded-full border border-navy/10 bg-ivory px-3 py-2 text-sm text-navy">{item}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SourcingModelSection() {
  const steps = [
    { title: 'Requirement analysis', description: 'We review your target market, technical specifications, quantity expectations and compliance priorities.' },
    { title: 'Supplier matching', description: 'We identify suitable manufacturers, processors and verified supply partners aligned to your brief.' },
    { title: 'Quality coordination', description: 'Samples, inspections and documentation are managed to reduce risk and support buyer confidence.' },
    { title: 'Quotation & export', description: 'We prepare a commercial proposal, packaging approach and logistics plan for a smooth export handoff.' },
  ]

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading eyebrow="How we work" title="A sourcing partner, not an online marketplace." description="Lokaa Exports manages the commercial and operational flow behind each enquiry so international buyers can focus on growth, not supplier chasing." />
        <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-3xl border border-navy/10 bg-ivory p-8">
            <div className="text-[11px] uppercase tracking-[0.24em] text-gold">What this means</div>
            <h3 className="mt-4 font-display text-2xl text-navy">We coordinate sourcing, verification and export execution for qualified buyers.</h3>
            <p className="mt-4 text-sm leading-relaxed text-graphite/70">The website is designed to present a professional export house that supports importers with supplier discovery, product intelligence, documentation and commercial follow-through.</p>
            <Link href="/rfq" prefetch={false} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold">Start an enquiry <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.06}>
                <div className="rounded-2xl border border-navy/10 bg-ivory p-6">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-graphite/50">0{index + 1}</div>
                  <h3 className="mt-3 font-display text-xl text-navy">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-graphite/70">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function WhyChooseSection() {
  const pillars = [
    { icon: ShieldCheck, title: 'Verified origin', description: 'Traceability from farm, factory or atelier to the shipment document pack.' },
    { icon: Globe2, title: 'Compliance-led exports', description: 'Documentation support for APEDA, FSSAI, organic certifications, customs and buyer audits.' },
    { icon: Ship, title: 'Logistics coordination', description: 'Multi-port strategy and partner carrier allocation from Chennai, Mumbai, Kochi and Mundra.' },
    { icon: Sparkles, title: 'Dedicated account support', description: 'A senior commercial lead manages pricing, samples, inspection and repeat orders.' },
  ]
  return (
    <section id="capabilities" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <SectionHeading eyebrow="Why global buyers choose Lokaa" title="Enterprise-grade sourcing with luxury-grade service." description="We combine strict quality management, transparent communication and deep export experience to help buyers reduce risk and move faster." />
          <div className="rounded-3xl border border-navy/10 bg-ivory p-8">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-graphite/60">
              <Timer className="h-4 w-4 text-gold" /> Response promise
            </div>
            <div className="mt-6 font-display text-3xl text-navy">A formal quotation within 24 hours.</div>
            <p className="mt-3 text-graphite/70">Share your requirement, destination, packaging and target price and our desk will return a concise commercial proposal.</p>
          </div>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.08}>
              <div className="h-full rounded-2xl border border-navy/10 bg-ivory p-7 transition-all hover:-translate-y-1 hover:border-gold/30">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl text-navy">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite/70">{pillar.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  const steps = [
    { icon: ClipboardCheck, title: 'RFQ intake', description: 'Share specifications, destination, target price and estimated volume.' },
    { icon: PackageCheck, title: 'Source & inspect', description: 'Approved supplier selection, quality checks and sample coordination.' },
    { icon: Award, title: 'Document & certify', description: 'Commercial invoice, packing list, certificates and destination paperwork.' },
    { icon: Warehouse, title: 'Load & ship', description: 'Container planning, freight coordination and milestone reporting.' },
  ]

  return (
    <section className="bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading eyebrow="Export process" title="A disciplined workflow from inquiry to delivery." description="Global buyers benefit from a procurement process that is transparent, documented and designed for repeat business." />
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <div className="rounded-3xl border border-navy/10 bg-white p-7 shadow-sm">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-graphite/50">0{index + 1}</div>
                <h3 className="mt-3 font-display text-xl text-navy">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite/70">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function IndustriesSection() {
  const industries = [
    'Food & beverage',
    'Retail & distribution',
    'Hospitality & HoReCa',
    'Private-label brands',
    'Industrial procurement',
    'Government tenders',
  ]

  return (
    <section className="bg-navy-deep py-24 text-white lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading eyebrow="Industries we serve" title="Trusted by commercial buyers across fast-moving sectors." description="Our export desk is built for procurement teams that need consistency, speed and full documentation." titleClassName="text-white" descriptionClassName="text-white/70" />
        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {industries.map((industry, index) => (
            <Reveal key={industry} delay={index * 0.06}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all hover:bg-white/[0.07]">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl text-white">{industry}</h3>
                  <ChevronRight className="h-4 w-4 text-gold" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function NetworkSection() {
  return (
    <section id="network" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading eyebrow="Global reach" title="A multi-port network for dependable freight planning." description="We coordinate sourcing and delivery across 42+ countries with a strategic export footprint in India." />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <MetricCard value="42+" label="Destination countries" />
              <MetricCard value="4" label="Indian export gateways" />
              <MetricCard value="24h" label="Quotation target" />
              <MetricCard value="100%" label="Document-ready shipments" />
            </div>
          </div>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-3xl border border-navy/10 bg-navy-deep p-4">
              <WorldMap />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function CertificationsSection() {
  const certs = ['APEDA', 'ISO 22000', 'HACCP', 'USDA Organic', 'EU Organic', 'FIEO', 'Spices Board', 'BRC']
  return (
    <section className="bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading eyebrow="Certifications & compliance" title="Credentials that support buyer confidence." description="Our documentation and quality framework is aligned to requesting markets, inspections and retailer audit requirements." />
        <div className="mt-14 flex flex-wrap gap-3">
          {certs.map((cert, index) => (
            <Reveal key={cert} delay={index * 0.04}>
              <div className="rounded-full border border-navy/10 bg-white px-4 py-2 text-sm font-medium text-navy">{cert}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const testimonials = [
    { quote: 'Lokaa handled our organic spice import program with accuracy, speed and very strong communication. We now treat them as a strategic partner.', name: 'A. Rahman', title: 'Procurement Director, Dubai' },
    { quote: 'Their compliance documentation made our audit process simple. The commercial team was responsive and professional from first inquiry to shipment.', name: 'M. Chen', title: 'Import Manager, Singapore' },
  ]
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading eyebrow="Customer success stories" title="Buyers trust Lokaa for repeat orders and smooth execution." description="We are privileged to support importers who need reliability at scale." />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {testimonials.map((item, index) => (
            <Reveal key={item.name} delay={index * 0.08}>
              <div className="rounded-3xl border border-navy/10 bg-ivory p-8">
                <div className="flex items-center gap-2 text-gold">
                  {Array.from({ length: 5 }).map((_, star) => <CheckCircle2 key={star} className="h-4 w-4" />)}
                </div>
                <p className="mt-6 text-lg leading-relaxed text-graphite/80">“{item.quote}”</p>
                <div className="mt-8">
                  <div className="font-display text-xl text-navy">{item.name}</div>
                  <div className="text-sm text-graphite/60">{item.title}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const faqs = [
    { question: 'Do you support small and large volume orders?', answer: 'Yes. We handle trial shipments, repeat replenishment and full container programmes depending on the product and destination.' },
    { question: 'Can you support private-label and packaging requirements?', answer: 'We can coordinate private-label packaging, export-ready cartons and buyer-specific labelling where applicable.' },
    { question: 'What information should I send for an RFQ?', answer: 'Please share the product, quantity, target price, destination country, desired incoterms and any compliance requirements.' },
  ]
  return (
    <section className="bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading eyebrow="Frequently asked questions" title="Common questions from importers and procurement teams." />
        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-2xl border border-navy/10 bg-white p-6">
              <summary className="cursor-pointer font-display text-lg text-navy">{faq.question}</summary>
              <p className="mt-3 text-sm leading-relaxed text-graphite/70">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function InsightsSection() {
  const articles = [
    { title: 'How importers evaluate premium export partners', description: 'A practical guide for procurement teams reviewing supplier quality, compliance and response speed.' },
    { title: 'Organic sourcing trends for global buyers', description: 'What buyers are looking for in certification, traceability and seasonal availability.' },
  ]
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow="Latest insights" title="Market perspectives for buyers and sourcing teams." />
          <Link href="/organics" prefetch={false} className="inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-gold">Explore our organic domain <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {articles.map((article, index) => (
            <Reveal key={article.title} delay={index * 0.06}>
              <div className="rounded-3xl border border-navy/10 bg-ivory p-8">
                <div className="text-[10px] uppercase tracking-[0.24em] text-gold">Resource</div>
                <h3 className="mt-4 font-display text-2xl text-navy">{article.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite/70">{article.description}</p>
                <Link href="/rfq" prefetch={false} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-gold">Discuss your requirement <ChevronRight className="h-4 w-4" /></Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-navy-deep p-10 text-white lg:p-16">
            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold">
                  <span className="h-px w-8 bg-gold" /> Start sourcing
                </div>
                <h2 className="mt-6 max-w-3xl font-display text-3xl leading-[1.05] tracking-tight text-white lg:text-5xl">
                  Let our export desk prepare a premium proposal for your next shipment.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">From product selection to freight planning, we help procurement teams move quickly without compromising on quality.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/rfq" className="inline-flex items-center justify-center gap-3 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy">Request quote</Link>
                <a href="tel:+919790607059" className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white">Call our desk <Phone className="h-4 w-4" /></a>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function HomePageClient() {
  return (
    <main className="relative">
      <Nav theme="solid" />
      <Hero />
      <BrandsSection />
      <CompanyOverviewSection />
      <SourcingModelSection />
      <WhyChooseSection />
      <ProcessSection />
      <IndustriesSection />
      <NetworkSection />
      <CertificationsSection />
      <TestimonialsSection />
      <FAQSection />
      <InsightsSection />
      <FinalCTA />
      <Footer />
      <a href="https://wa.me/919790607059" target="_blank" rel="noopener noreferrer" className="relative z-20 mx-auto -mt-8 mb-6 flex w-fit items-center gap-2 rounded-full bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 lg:mr-10">
        <Phone className="h-4 w-4" />
        WhatsApp
      </a>
      <a href="#top" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-navy focus:px-4 focus:py-3 focus:text-sm focus:text-white">Skip to content</a>
    </main>
  )
}
