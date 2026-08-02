'use client'
import Link from 'next/link'
// Image import removed – machinery cards use CSS gradients + Lucide icons (no external images needed)
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, Factory, Gauge, ShieldCheck, Wrench, Globe2, Cpu, Cog, HardHat, Boxes } from 'lucide-react'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'

const EASE = [0.16, 1, 0.3, 1]

function Reveal({ children, delay = 0 }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, delay, ease: EASE }}>
      {children}
    </motion.div>
  )
}

export default function IndustrialPageClient() {
  const machinery = [
    { title: 'Food Processing Machinery', description: 'Milling, blending, grading, oil extraction and packaging lines for food and agro-processing plants.', Icon: Boxes, gradient: 'from-sky-900 to-slate-900', metrics: ['OEM sourcing', 'CE-ready options', 'Custom skid designs'] },
    { title: 'Packaging & Converting Equipment', description: 'Filling, sealing, conveying and carton handling systems for high-throughput packaging operations.', Icon: HardHat, gradient: 'from-blue-900 to-slate-900', metrics: ['Fast lead times', 'Spare parts support', 'Multi-country shipping'] },
    { title: 'Automation & Electrical Systems', description: 'Panels, sensors, drives, PLCs and machine controls for modern production facilities.', Icon: Cpu, gradient: 'from-indigo-900 to-slate-900', metrics: ['PLC / HMI support', 'Commissioning support', 'Technical documentation'] },
    { title: 'Custom Industrial Machinery', description: 'Made-to-spec equipment for processing plants, facilities and manufacturing setups worldwide.', Icon: Cog, gradient: 'from-slate-800 to-sky-900', metrics: ['Design review', 'Project coordination', 'After-sales service'] },
  ]


  const support = ['ISO 9001', 'CE marking', '24-month warranty', 'On-site commissioning', 'Technical drawings', 'Export documentation']

  return (
    <main>
      <Nav theme="solid" />
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#060f24_0%,#10233d_100%)] pb-24 pt-40">
        <div className="absolute inset-0 grain opacity-40" />
        <div className="absolute -right-20 -top-20 h-[420px] w-[420px] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-sky-200">
            <span className="h-2 w-2 rounded-full bg-sky-400" /> Division · 02
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15, ease: EASE }} className="max-w-4xl font-display text-5xl leading-[1.02] tracking-tight text-white lg:text-7xl">
            <span className="text-sky-300">Veltron Industrial Exports</span> for dependable machinery sourcing.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: EASE }} className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80">
            Global industrial sourcing for processing lines, packaging equipment, OEM manufacturing, electrical systems and automation with technical support from inquiry to commissioning.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.55, ease: EASE }} className="mt-10 flex flex-wrap gap-3">
            <Link href="/rfq" className="group inline-flex items-center gap-3 rounded-full bg-sky-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200">
              Request machinery quote <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sky-300 transition-transform group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span>
            </Link>
            <Link href="/rfq" className="rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">Request technical consultation</Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><span className="h-px w-8 bg-gold" /> Machinery categories</div>
            <h2 className="mb-14 max-w-3xl font-display text-4xl leading-tight tracking-tight text-navy lg:text-5xl">Equipment and project support for manufacturers who need dependable sourcing.</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {machinery.map((category, index) => (
              <Reveal key={category.title} delay={index * 0.08}>
                <div className="group overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-sm">
                  <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                    <category.Icon className="h-20 w-20 text-white/20 transition-transform duration-700 group-hover:scale-110" strokeWidth={1} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <div className="font-display text-2xl tracking-tight">{category.title}</div>
                    </div>
                  </div>
                  <div className="p-7">
                    <p className="text-sm leading-relaxed text-graphite/70">{category.description}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {category.metrics.map((metric) => <span key={metric} className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-sky-800">{metric}</span>)}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-deep py-24 text-white lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold"><span className="h-px w-8 bg-gold" /> Support & compliance</div>
            <h2 className="mb-12 max-w-2xl font-display text-3xl leading-tight tracking-tight lg:text-4xl">Technical support, documentation and logistics built around industrial projects.</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: ShieldCheck, title: 'Quality assurance', description: 'Inspection report, factory audits and technical verification where required.' },
              { icon: Wrench, title: 'After-sales support', description: 'Maintenance guidance, spare parts and service coordination.' },
              { icon: Globe2, title: 'Export documentation', description: 'Shipping, customs, commercial and destination-country paperwork.' },
              { icon: Cpu, title: 'Automation readiness', description: 'Controller, sensor and panel integration support for modern operations.' },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300"><item.icon className="h-5 w-5" /></div>
                  <h3 className="font-display text-xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            {support.map((item) => <div key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80">{item}</div>)}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
