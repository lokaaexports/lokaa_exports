'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Award, Compass, ShieldCheck, Handshake, Globe2, Factory } from 'lucide-react'
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

export default function AboutPageClient() {
  const pillars = [
    { icon: Compass, title: 'Global sourcing', description: 'We connect international buyers with trusted suppliers and processors across India and selected Asian markets.' },
    { icon: ShieldCheck, title: 'Quality-led execution', description: 'Every shipment is supported by documented evaluation, supplier review and buyer-focused compliance management.' },
    { icon: Handshake, title: 'Single point of contact', description: 'One accountable export team handles the workflow from enquiry through delivery, keeping communication clear and consistent.' },
    { icon: Globe2, title: 'International readiness', description: 'We structure our process for buyers in the UAE, Saudi Arabia, Europe, North America, Australia and beyond.' },
  ]

  const values = [
    { title: 'Trusted network', description: 'Verified manufacturing, processing and supplier relationships built for repeat business.' },
    { title: 'Transparent process', description: 'Professional communication, clear milestones and commercial clarity from first enquiry to final delivery.' },
    { title: 'Long-term partnership', description: 'We support repeat orders, private-label initiatives and scaled procurement programmes.' },
  ]

  return (
    <main>
      <Nav theme="solid" />
      <section className="relative overflow-hidden bg-[linear-gradient(140deg,#0f172a_0%,#111827_100%)] pb-24 pt-40 text-white">
        <div className="absolute inset-0 grain opacity-40" />
        <div className="absolute -right-20 -top-20 h-[420px] w-[420px] rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-gold">
            <span className="h-2 w-2 rounded-full bg-gold" /> About Lokaa
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: EASE }} className="max-w-4xl font-display text-5xl leading-[1.02] tracking-tight lg:text-7xl">
            A premium export partner for buyers who need more than a supplier list.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: EASE }} className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80">
            Founded in 2026, Lokaa Exports supports international importers with sourcing strategy, supplier coordination, quality management, documentation and export execution through one accountable team.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.45, ease: EASE }} className="mt-10 flex flex-wrap gap-3">
            <Link href="/rfq" className="group inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-[hsl(var(--gold-soft))]">
              Start an enquiry <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-gold transition-transform group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span>
            </Link>
            <Link href="/organics" className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">Explore our export domains</Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <Reveal>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><span className="h-px w-8 bg-gold" /> Our story</div>
            <h2 className="mt-6 max-w-3xl font-display text-4xl leading-tight tracking-tight text-navy lg:text-5xl">We were built for modern B2B sourcing — disciplined, global and commercially serious.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-graphite/70">Lokaa Exports was founded to simplify complex international sourcing. Our model combines supplier access, commercial clarity and export execution so buyers do not need to coordinate multiple disconnected partners.</p>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-graphite/70">We are not a marketplace and we are not an e-commerce brand. We are a sourcing and export solutions partner that helps businesses move from enquiry to shipment with confidence.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-navy/10 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-gold"><Factory className="h-4 w-4" /> Business model</div>
              <p className="mt-6 text-lg leading-relaxed text-graphite/70">Instead of maintaining large inventories, Lokaa works through a curated network of trusted manufacturers, processors and industrial suppliers to deliver tailored sourcing solutions to each buyer.</p>
              <div className="mt-8 space-y-4">
                {values.map((value) => (
                  <div key={value.title} className="rounded-2xl border border-navy/10 bg-ivory p-4">
                    <div className="font-display text-xl text-navy">{value.title}</div>
                    <div className="mt-2 text-sm leading-relaxed text-graphite/70">{value.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <SectionTitle eyebrow="Why buyers choose us" title="A professional export house designed for repeat business and long-term partnerships." />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 0.06}>
                <div className="rounded-3xl border border-navy/10 bg-ivory p-7">
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

      <section className="bg-navy-deep py-24 text-white lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold"><Award className="h-4 w-4" /> Vision & mission</div>
                <h2 className="mt-6 font-display text-3xl leading-tight tracking-tight lg:text-4xl">Built to become one of the world’s most trusted sourcing and export solution providers.</h2>
              </div>
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-gold">Vision</div>
                  <p className="mt-4 text-lg leading-relaxed text-white/80">To become a preferred global sourcing and export solutions partner for importers who value dependable quality, strong communication and long-term cooperation.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-gold">Mission</div>
                  <p className="mt-4 text-lg leading-relaxed text-white/80">To simplify international sourcing by combining trusted supplier networks, quality-focused coordination, transparent communication and efficient logistics through one reliable export partner.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div>
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><span className="h-px w-8 bg-gold" /> {eyebrow}</div>
      <h2 className="mt-6 max-w-3xl font-display text-3xl leading-tight tracking-tight text-navy lg:text-4xl">{title}</h2>
    </div>
  )
}
