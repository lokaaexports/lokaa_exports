'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Building2, Coins, Loader2, RefreshCw, ShieldCheck, ShoppingCart, Users } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

export default function DashboardsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/stats')
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load dashboard stats')
      setStats(payload)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const dashboardCards = [
    { label: 'CEO', icon: Building2, href: '/admin/analytics', value: stats.revenue || 0, note: 'Revenue and strategic KPIs' },
    { label: 'Sales', icon: ShoppingCart, href: '/admin/crm', value: stats.rfqCount || 0, note: 'Pipeline and opportunity flow' },
    { label: 'CRM', icon: Users, href: '/admin/customers', value: stats.customerCount || 0, note: 'Customer relationship hub' },
    { label: 'Finance', icon: Coins, href: '/admin/orders', value: stats.orderCount || 0, note: 'Orders and revenue movement' },
    { label: 'Security', icon: ShieldCheck, href: '/admin/system', value: 'Settings', note: 'Controls and audit configuration' },
  ]

  return (
    <>
      <SectionPage
        subtitle="Dashboards"
        title="Role-based command center"
        description="Move between executive, sales, CRM, finance, and security views. These dashboards now sit on top of live stats rather than static shell pages."
        links={[{ href: '/admin/analytics', label: 'Analytics' }, { href: '/admin/system', label: 'System' }]}
        stats={[
          { label: 'Categories', value: stats.categoryCount || 0 },
          { label: 'Products', value: stats.productCount || 0 },
          { label: 'RFQs', value: stats.rfqCount || 0 },
          { label: 'Customers', value: stats.customerCount || 0 },
        ]}
        highlights={[
          { title: 'Executive view', description: 'High-level operational KPIs at a glance.' },
          { title: 'Department routing', description: 'Direct jumps into the right operational module.' },
          { title: 'Live counters', description: 'Counts are read from the admin stats endpoint.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <div className="flex items-center justify-end">
          <button onClick={load} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboardCards.map((card) => (
            <Link key={card.label} href={card.href} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{card.label}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{card.note}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Live</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </>
  )
}
