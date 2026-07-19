import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <p className="text-[11px] tracking-[0.28em] uppercase text-gold">Page not found</p>
        <h1 className="mt-4 font-display text-4xl lg:text-5xl text-navy">The page you requested is unavailable.</h1>
        <p className="mt-4 text-graphite/70 leading-relaxed">Please return to the homepage or use the RFQ form to connect with our export desk.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
            <ArrowLeft className="w-4 h-4" /> Return home
          </Link>
          <Link href="/rfq" className="rounded-full border border-navy/20 px-5 py-3 text-sm font-semibold text-navy">Request quote</Link>
        </div>
      </div>
    </main>
  )
}
