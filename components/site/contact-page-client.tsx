'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Mail, Phone, MapPin, Building2, Clock3 } from 'lucide-react'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'

const EASE = [0.16, 1, 0.3, 1]

function Reveal({ children, delay = 0 }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, delay, ease: EASE }}>
      {children}
    </motion.div>
  )
}

export default function ContactPageClient() {
  const contacts = [
    { title: 'Sales enquiries', value: 'info@lokaaexports.com', detail: 'Product sourcing, RFQs and commercial proposals.', icon: Mail },
    { title: 'Support', value: 'info@lokaaexports.com', detail: 'Documentation, shipment follow-up and buyer support.', icon: Phone },
    { title: 'Head office', value: 'Chennai, India', detail: 'Serving importers across India and international markets.', icon: Building2 },
    { title: 'Response window', value: 'Within 24 hours', detail: 'Dedicated export desk coverage for urgent RFQs.', icon: Clock3 },
  ]

  return (
    <main>
      <Nav theme="solid" />
      <section className="relative overflow-hidden bg-[linear-gradient(140deg,#111827_0%,#1f2937_100%)] pb-24 pt-40 text-white">
        <div className="absolute inset-0 grain opacity-40" />
        <div className="absolute -right-12 -top-12 h-[360px] w-[360px] rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-gold">
            <span className="h-2 w-2 rounded-full bg-gold" /> Contact Lokaa
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: EASE }} className="max-w-4xl font-display text-5xl leading-[1.02] tracking-tight lg:text-7xl">
            Talk to our export desk about your next sourcing requirement.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: EASE }} className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80">
            Whether you need a product shortlist, compliance support or a formal quotation, we are ready to assist with professional export coordination.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.45, ease: EASE }} className="mt-10">
            <Link href="/rfq" className="group inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-[hsl(var(--gold-soft))]">
              Submit an RFQ <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-gold transition-transform group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {contacts.map((contact, index) => (
              <Reveal key={contact.title} delay={index * 0.06}>
                <div className="rounded-3xl border border-navy/10 bg-white p-7 shadow-sm">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                    <contact.icon className="h-5 w-5" />
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-gold">{contact.title}</div>
                  <div className="mt-3 font-display text-xl text-navy">{contact.value}</div>
                  <p className="mt-3 text-sm leading-relaxed text-graphite/70">{contact.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.12}>
            <div className="mt-12 rounded-3xl border border-navy/10 bg-white p-8 shadow-sm lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                <div>
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><MapPin className="h-4 w-4 text-gold" /> Office locations</div>
                  <h2 className="mt-6 font-display text-3xl leading-tight tracking-tight text-navy lg:text-4xl">Chennai headquarters with international commercial coordination support.</h2>
                  <p className="mt-4 text-lg leading-relaxed text-graphite/70">Our team is positioned to support buyers across key export corridors and destination markets with responsive commercial management and documentation support.</p>
                </div>
                <div className="rounded-3xl bg-navy-deep p-8 text-white">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-gold">Direct contact</div>
                  <div className="mt-4 space-y-4 text-white/80">
                    <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-gold" /> +91 97906 07059</div>
                    <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-gold" /> info@lokaaexports.com</div>
                    <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-gold" /> Chennai</div>
                  </div>
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
