'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Mail, Phone, MapPin, LogIn } from 'lucide-react'

export default function Footer() {
  const pathname = usePathname()
  const isOrganics = pathname?.startsWith('/organics')
  const isIndustrial = pathname?.startsWith('/industrial')
  const brand = isOrganics
    ? { label: 'AgriOrganicExports', subtitle: 'Seasonal & non-seasonal organic sourcing' }
    : isIndustrial
      ? { label: 'Industrial Exports', subtitle: 'Machinery & industrial sourcing' }
      : { label: 'LOKAA', subtitle: 'Exports' }

  return (
    <footer className="relative bg-navy-deep text-white pt-24 pb-10 overflow-hidden">
      <div className="absolute inset-0 grain opacity-40" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 pb-16">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative h-16 w-16 overflow-hidden rounded-md bg-transparent">
                <Image src="/logo.png" alt="Lokaa Exports" fill className="object-contain" priority />
              </div>
              <div className="leading-tight">
                <div className="font-display font-semibold text-white text-lg">{brand.label}</div>
                <div className="text-[10px] tracking-[0.28em] text-gold uppercase">{brand.subtitle}</div>
              </div>
            </div>
            <p className="font-display text-[28px] leading-[1.15] tracking-tight text-white/90 max-w-md text-balance">
              Connecting India&rsquo;s finest products to <span className="text-gold">global markets</span>.
            </p>
            <div className="mt-8 space-y-3 text-sm text-white/60">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gold" /> info@lokaaexports.com</div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gold" /> +91 97906 07059</div>
              <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gold" /> Chennai</div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="text-[11px] tracking-[0.24em] text-gold uppercase mb-5">Explore</div>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link href="/" className="hover:text-gold">Home</Link></li>
              <li><Link href="/about" className="hover:text-gold">About</Link></li>
              <li><Link href="/process" className="hover:text-gold">Process</Link></li>
              <li><Link href="/organics" className="hover:text-gold">AgriOrganicExports</Link></li>
              <li><Link href="/industrial" className="hover:text-gold">Industrial Exports</Link></li>
              <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="text-[11px] tracking-[0.24em] text-gold uppercase mb-5">Specialties</div>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link href="/organics" className="hover:text-gold">Seasonal organics</Link></li>
              <li><Link href="/organics" className="hover:text-gold">Non-seasonal organics</Link></li>
              <li><Link href="/industrial" className="hover:text-gold">Machinery sourcing</Link></li>
              <li><Link href="/industrial" className="hover:text-gold">Industrial equipment</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <div className="text-[11px] tracking-[0.24em] text-gold uppercase mb-5">Start Sourcing</div>
            <p className="text-sm text-white/60 mb-5">Receive a tailored proposal within 24 hours from our export desk.</p>
            <Link href="/rfq" className="inline-flex items-center gap-2 pl-5 pr-2 py-2.5 rounded-full bg-gold text-navy text-[13px] font-semibold hover:bg-[hsl(var(--gold-soft))] transition group">
              Request Quote
              <span className="w-7 h-7 rounded-full bg-navy text-gold flex items-center justify-center group-hover:rotate-45 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>

        <div className="divider-gold" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 text-xs text-white/50">
          <div>&copy; {new Date().getFullYear()} {brand.label}. All rights reserved.</div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span>APEDA · FIEO · Spices Board of India · ISO 22000</span>
            <div className="flex flex-wrap items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <Link href="/admin/login" className="inline-flex items-center gap-2 text-gold hover:text-white">
                <LogIn className="h-4 w-4" />
                Admin login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
