'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthShell({ eyebrow, title, description, children, footer }: any) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(26,71,42,0.08),_transparent_38%),linear-gradient(180deg,_#f8f6f1_0%,_#ffffff_100%)] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center rounded-full border border-navy/10 bg-white px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-gold shadow-sm">
            {eyebrow}
          </div>
          <h1 className="mt-4 font-display text-4xl tracking-tight text-navy">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-graphite/70">{description}</p>
        </div>
        {children}
        {footer ? <div className="mt-4 text-center text-sm">{footer}</div> : null}
        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-graphite/60 transition hover:text-navy">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
