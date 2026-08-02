'use client'

import Link from 'next/link'

interface SectionLink {
  href: string;
  label: string;
}

interface SectionStat {
  label: string;
  value: string | number;
}

interface SectionHighlight {
  title: string;
  description: string;
}

interface SectionPageProps {
  title: string;
  subtitle: string;
  description: string;
  highlights: SectionHighlight[];
  links: SectionLink[];
  stats: SectionStat[];
}

export default function SectionPage({ title, subtitle, description, highlights = [], links = [], stats = [] }: SectionPageProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(26,71,42,0.05),_transparent_35%),linear-gradient(180deg,_#f8faf7_0%,_#ffffff_100%)] p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-navy/10 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">{subtitle}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy dark:text-white">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-graphite/70 dark:text-slate-300">{description}</p>
          {links.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-ivory px-4 py-2 text-sm font-medium text-navy transition hover:border-gold hover:text-gold dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </section>

        {stats.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[1.5rem] border border-navy/10 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-navy dark:text-white">{stat.value}</p>
              </div>
            ))}
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-navy/10 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-navy dark:text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-graphite/70 dark:text-slate-300">{item.description}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
