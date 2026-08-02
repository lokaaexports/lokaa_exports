'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Download, FileDown, Loader2 } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const EXPORTS = [
  { label: 'Products', endpoint: '/api/admin/catalog/products?limit=100', key: 'products' },
  { label: 'Customers', endpoint: '/api/admin/customers?limit=100', key: 'data' },
  { label: 'Orders', endpoint: '/api/admin/orders?limit=100', key: 'data' },
  { label: 'RFQs', endpoint: '/api/admin/rfqs?limit=100', key: 'data' },
]

function toCsv(rows: any) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
  return [headers, ...rows.map((row) => headers.map((header) => escape(row[header])))].map((line) => line.join(',')).join('\n')
}

export default function ExportPage() {
  const [loadingKey, setLoadingKey] = useState('')

  const downloadExport = async (item) => {
    try {
      setLoadingKey(item.label)
      const response = await fetch(item.endpoint)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || `Unable to load ${item.label}`)
      const rows = payload[item.key] || payload.data || []
      const csv = toCsv(rows)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${item.label.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      toast.success(`${item.label} exported`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoadingKey('')
    }
  }

  return (
    <>
      <SectionPage
        subtitle="Export"
        title="Export operations"
        description="Download live MySQL-backed records for products, customers, orders, and RFQs."
        links={[{ href: '/admin/analytics', label: 'Analytics' }, { href: '/admin/platform', label: 'Platform' }]}
        stats={[
          { label: 'Formats', value: 'CSV' },
          { label: 'Sources', value: EXPORTS.length },
          { label: 'Mode', value: 'Live data' },
          { label: 'Delivery', value: 'Browser download' },
        ]}
        highlights={[
          { title: 'One-click download', description: 'Use current database data without separate tooling.' },
          { title: 'Operational tables', description: 'Export the records the business actually uses.' },
          { title: 'Extendable', description: 'You can add Excel or PDF output later.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {EXPORTS.map((item) => (
            <button key={item.label} onClick={() => downloadExport(item)} className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Export</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{item.label}</h2>
                </div>
                {loadingKey === item.label ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> : <FileDown className="h-5 w-5 text-emerald-600" />}
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Download the current {item.label.toLowerCase()} dataset as CSV.</p>
            </button>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Export guidance</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            The export module now pulls from live API responses, so operators can keep offline copies of products, customers, orders, and RFQs without manually copying data out of the dashboard.
          </p>
        </section>
      </div>
    </>
  )
}
