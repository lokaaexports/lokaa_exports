'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BarChart3, Calendar, Download, Loader2, PieChart, RefreshCw, TrendingUp } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const REPORTS = [
  { value: 'overview', label: 'Overview' },
  { value: 'sales', label: 'Sales' },
  { value: 'customers', label: 'Customers' },
  { value: 'products', label: 'Products' },
  { value: 'rfqs', label: 'RFQs' },
  { value: 'activity', label: 'Activity' },
]

export default function AnalyticsPage() {
  const [report, setReport] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState({})
  const [data, setData] = useState({})
  const [dateRange, setDateRange] = useState('30days')

  const load = async () => {
    setLoading(true)
    try {
      const [statsResponse, reportResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/analytics/dashboard?report=${report}`),
      ])
      const [statsPayload, reportPayload] = await Promise.all([statsResponse.json(), reportResponse.json()])
      if (!statsResponse.ok) throw new Error(statsPayload.error || 'Unable to load stats')
      if (!reportResponse.ok) throw new Error(reportPayload.error || 'Unable to load analytics')
      setOverview(statsPayload)
      setData(reportPayload.data || {})
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [report])

  const renderValue = (value) => {
    if (Array.isArray(value)) return value.length
    if (value && typeof value === 'object') return Object.keys(value).length
    return value ?? 0
  }

  const stats = [
    { label: 'Categories', value: overview.categoryCount || 0, icon: PieChart },
    { label: 'Products', value: overview.productCount || 0, icon: BarChart3 },
    { label: 'RFQs', value: overview.rfqCount || 0, icon: TrendingUp },
    { label: 'Customers', value: overview.customerCount || 0, icon: Calendar },
  ]

  return (
    <>
      <SectionPage
        subtitle="Analytics"
        title="Business reporting"
        description="View live KPIs from the MySQL-backed analytics stack and switch between overview, sales, customers, products, RFQs, and activity reports."
        links={[{ href: '/admin/dashboards', label: 'Role Dashboards' }, { href: '/admin/export', label: 'Export Data' }]}
        stats={stats.map((item) => ({ label: item.label, value: item.value }))}
        highlights={[
          { title: 'Live KPIs', description: 'Counts and totals from the operational database.' },
          { title: 'Report switcher', description: 'Swap between sales, RFQ, product, and activity views.' },
          { title: 'Export readiness', description: 'The same data can be downloaded from the export module.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <section className="flex flex-wrap items-center gap-3">
          <select value={report} onChange={(event) => setReport(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
            {REPORTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select value={dateRange} onChange={(event) => setDateRange(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            <Download className="h-4 w-4" />
            Export report
          </button>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(data || {}).map(([key, value]) => (
            <div key={key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{renderValue(value)}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Raw report payload</h2>
            </div>
            <pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
              {loading ? 'Loading...' : JSON.stringify(data, null, 2)}
            </pre>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top metrics</h2>
            </div>
            <div className="mt-4 space-y-3">
              {Object.entries(overview || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{key}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{typeof value === 'number' ? value : Array.isArray(value) ? value.length : String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
