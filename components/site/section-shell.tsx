import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export function SectionHeading({ eyebrow, title, description, align = 'left', actionHref, actionLabel, titleClassName = 'text-navy', descriptionClassName = 'text-graphite/70', eyebrowClassName = 'text-graphite/60', actionClassName = 'text-navy border-navy/30 hover:border-gold hover:text-gold' }: any) {
  return (
    <div className={`flex flex-col gap-4 ${align === 'center' ? 'items-center text-center' : 'items-start'}`}>
      <div className={`flex items-center gap-3 text-[11px] tracking-[0.28em] uppercase ${eyebrowClassName}`}>
        <span className="w-8 h-px bg-gold" /> {eyebrow}
      </div>
      <h2 className={`font-display text-3xl lg:text-5xl leading-[1.05] tracking-tight ${titleClassName} text-balance max-w-3xl`}>{title}</h2>
      {description ? <p className={`${descriptionClassName} text-lg leading-relaxed max-w-2xl`}>{description}</p> : null}
      {actionHref ? (
        <Link href={actionHref} className={`inline-flex items-center gap-2 ${actionClassName} font-medium border-b transition pb-1`}>
          {actionLabel} <ArrowUpRight className="w-4 h-4" />
        </Link>
      ) : null}
    </div>
  )
}

export function MetricCard({ value, label }: any) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white/80 p-6 shadow-sm">
      <div className="font-display text-3xl lg:text-4xl text-navy">{value}</div>
      <div className="mt-2 text-sm text-graphite/60">{label}</div>
    </div>
  )
}
