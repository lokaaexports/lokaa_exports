'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import SectionPage from '@/components/admin/platform/SectionPage'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const submit = async (event) => {
    event.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Search failed')
      setResults(payload.results || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionPage
          subtitle="Global Search"
          title="Search across the platform"
          description="One search box for products, customers, users, RFQs, categories, and countries."
          links={[
            { href: '/admin/platform', label: 'Platform Console' },
            { href: '/admin/media', label: 'Media Library' },
          ]}
          stats={[
            { label: 'Sources', value: 'MySQL + Prisma' },
            { label: 'Entities', value: 'Multi-domain' },
          ]}
          highlights={[
            { title: 'Salesforce-style search', description: 'Search across records from one entry point.' },
            { title: 'Fast filtering', description: 'Limit and scope by entity in the API layer.' },
            { title: 'Reusable results', description: 'Each result links back to the owning domain.' },
          ]}
        />

        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, customers, users, RFQs, categories, countries..."
              className="flex-1 rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm outline-none dark:border-slate-700"
            />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
              Search results will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((item) => (
                <Link key={`${item.type}-${item.id}`} href={item.href || '#'} className="block rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-400 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">{item.type}</p>
                      <h3 className="mt-1 font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                    </div>
                    <span className="text-xs text-slate-400">{item.source}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
