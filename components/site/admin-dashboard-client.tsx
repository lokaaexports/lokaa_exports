'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, Box, ClipboardList, ShoppingBag, Users, Layers, ShieldCheck, TrendingUp, RefreshCw } from 'lucide-react'

const emptyStats = {
  productCount: 0,
  categoryCount: 0,
  rfqCount: 0,
  customerCount: 0,
  activeUsers: 0,
  openRfqs: 0,
  pendingQuotes: 0,
  revenue: 0,
  blogCount: 0,
}

export default function AdminDashboardClient() {
  const router = useRouter()
  const [stats, setStats] = useState(emptyStats)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/audit-logs?limit=8'),
        ])

        if (cancelled) return

        if (statsRes.status === 401 || statsRes.status === 403 || logsRes.status === 401 || logsRes.status === 403) {
          router.replace('/admin/login')
          return
        }

        const [statsJson, logsJson] = await Promise.all([statsRes.json(), logsRes.json()])
        setStats({ ...emptyStats, ...statsJson })
        setLogs(Array.isArray(logsJson.logs) ? logsJson.logs : [])
        setError('')
      } catch (error: any) {
        if (!cancelled) {
          console.error(error)
          setError('Unable to load dashboard data right now.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [router])

  const cards = [
    { title: 'Products', value: stats.productCount, icon: Box },
    { title: 'Categories', value: stats.categoryCount, icon: Layers },
    { title: 'RFQs', value: stats.rfqCount, icon: ClipboardList },
    { title: 'Customers', value: stats.customerCount, icon: Users },
    { title: 'Open RFQs', value: stats.openRfqs, icon: Activity },
    { title: 'Pending Quotes', value: stats.pendingQuotes, icon: ShoppingBag },
    { title: 'Active Users', value: stats.activeUsers, icon: ShieldCheck },
    { title: 'Revenue (est.)', value: stats.revenue || 'N/A', icon: TrendingUp },
  ]

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-[1400px] items-center justify-center px-6 py-10 lg:px-10">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-lg shadow-black/20">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-white">Loading dashboard…</h2>
            <p className="mt-2 text-sm text-slate-400">Preparing your admin overview.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        )}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">Admin dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Lokaa Exports control center</h1>
            <p className="mt-2 text-slate-400">Manage products, RFQs, customers, and orders from one secure portal.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white hover:border-emerald-400">Catalog editor</Link>
            <Link href="/admin?new=1" className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">New product</Link>
            <Link href="/admin/products" className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white hover:border-emerald-400">Products</Link>
            <Link href="/admin/rfqs" className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white hover:border-emerald-400">RFQs</Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.title} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
                <div className="mb-4 flex items-center gap-3 text-slate-400">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300"><Icon className="h-5 w-5" /></span>
                  <span className="text-sm uppercase tracking-[0.24em] text-slate-400">{card.title}</span>
                </div>
                <div className="text-4xl font-semibold text-white">{card.value}</div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">Audit trail</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Recent admin activity</h2>
            </div>
          </div>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">No audit activity recorded yet.</div>
            ) : logs.map((log) => (
              <div key={log.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
                <div>
                  <div className="font-medium text-white">{log.action}</div>
                  <div className="text-slate-400">{log.email || 'System'} • {log.ipAddress || 'unknown'}</div>
                </div>
                <div className="text-right text-slate-400">
                  <div>{new Date(log.createdAt).toLocaleString()}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{log.details ? JSON.stringify(log.details) : '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
