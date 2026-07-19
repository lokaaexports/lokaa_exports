'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ClipboardCheck, PackageCheck, BadgeCheck, ShipWheel, FileCheck2, SearchCheck } from 'lucide-react'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'

const EASE = [0.16, 1, 0.3, 1]

function Reveal({ children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, delay, ease: EASE }}>
      {children}
    </motion.div>
  )
}

export default function ProcessPageClient() {
  const steps = [
    { icon: SearchCheck, title: 'Buyer requirement', description: 'We begin with the importer’s commercial brief, technical specifications, target market, quantity and quality expectations.' },
    { icon: ClipboardCheck, title: 'Requirement analysis', description: 'Our team evaluates the request, defines sourcing priorities and recommends the right category and supplier approach.' },
    { icon: BadgeCheck, title: 'Supplier selection', description: 'We identify suitable factories, processors or manufacturers, then review their capability and compliance profile.' },
    { icon: PackageCheck, title: 'Commercial evaluation', description: 'We assess pricing, lead times, packaging needs, certification requirements and overall suitability for export.' },
    { icon: FileCheck2, title: 'Quality coordination', description: 'Sample review, inspection planning and quality documentation are managed to reduce risk and support buyer confidence.' },
    { icon: ShipWheel, title: 'Documentation & export', description: 'We coordinate packaging, shipping, export paperwork and delivery planning until the order is completed.' },
  ]

  return (
    <main>
      <Nav theme="solid" />
      <section className="relative overflow-hidden bg-[linear-gradient(140deg,#0b1f1e_0%,#13312d_100%)] pb-24 pt-40 text-white">
        <div className="absolute inset-0 grain opacity-40" />
        <div className="absolute -left-20 -top-20 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Our process
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: EASE }} className="max-w-4xl font-display text-5xl leading-[1.02] tracking-tight lg:text-7xl">
            A disciplined export workflow from enquiry to delivery.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: EASE }} className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80">
            Every stage is professionally managed so buyers receive a clear, reliable path from product requirement to international shipment without unnecessary friction.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.45, ease: EASE }} className="mt-10">
            <Link href="/rfq" className="group inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-[hsl(var(--gold-soft))]">
              Request a quotation <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-gold transition-transform group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><span className="h-px w-8 bg-gold" /> Workflow</div>
            <h2 className="mt-6 max-w-3xl font-display text-4xl leading-tight tracking-tight text-navy lg:text-5xl">From buyer requirements to international delivery, we manage every stage with structure and accountability.</h2>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.05}>
                <div className="rounded-3xl border border-navy/10 bg-white p-7 shadow-sm">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-graphite/50">0{index + 1}</div>
                  <h3 className="mt-3 font-display text-xl text-navy">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-graphite/70">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <Reveal>
            <div className="rounded-3xl border border-navy/10 bg-ivory p-8">
              <div className="text-[11px] uppercase tracking-[0.24em] text-gold">Why this matters</div>
              <h3 className="mt-4 font-display text-2xl text-navy">Buyers expect more than product availability; they expect process discipline.</h3>
              <p className="mt-4 text-lg leading-relaxed text-graphite/70">We help importers reduce friction by managing sourcing, quality, documentation and shipment coordination through a single professionally governed workflow.</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-navy/10 bg-navy-deep p-8 text-white">
              <div className="text-[11px] uppercase tracking-[0.24em] text-gold">Long-term outcome</div>
              <h3 className="mt-4 font-display text-2xl text-white">Every enquiry is designed to become a repeatable international partnership.</h3>
              <p className="mt-4 text-lg leading-relaxed text-white/70">Our process is intentionally structured to support repeat orders, larger volumes and long-term account growth rather than one-off transactions.</p>
              <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gold">Learn more about our business model <ArrowRight className="h-4 w-4" /></div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  )
}
