'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Package, TrendingDown, Warehouse } from 'lucide-react'

export default function InventoryPage() {
  const [stats, setStats] = useState<any>({
    total: 0,
    published: 0,
    drafts: 0,
    featured: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/catalog/products?action=stats')
        if (!response.ok) {
          throw new Error('Failed to load inventory stats')
        }
        const data = await response.json()
        setStats(data.data || data || {})
        setError('')
      } catch (err: any) {
        setError(err.message || 'Failed to load inventory stats')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const metrics = [
    { label: 'Published Products', value: stats.published ?? 0, tone: 'emerald', description: 'Available for active catalogue use' },
    { label: 'Draft Products', value: stats.drafts ?? 0, tone: 'orange', description: 'Schema-backed records not yet published' },
    { label: 'Featured Products', value: stats.featured ?? 0, tone: 'blue', description: 'Flagged for priority merchandising' }
  ]

  const toneStyles = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100',
    blue: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-100'
  }

  return (
    <div className="p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Inventory Overview</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Schema-backed product inventory summary from the dynamic product tables
          </p>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-slate-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Products</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : stats.total ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Published</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-700 dark:text-emerald-300">
            {loading ? '...' : stats.published ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-600" />
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Drafts</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-orange-700 dark:text-orange-300">
            {loading ? '...' : stats.drafts ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-sky-600" />
            <p className="text-sm font-medium text-sky-900 dark:text-sky-100">Featured</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-sky-700 dark:text-sky-300">
            {loading ? '...' : stats.featured ?? 0}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map(metric => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`rounded-2xl border p-5 ${toneStyles[metric.tone]}`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-70">{metric.label}</p>
            <p className="mt-3 text-3xl font-bold">{metric.value}</p>
            <p className="mt-2 text-sm opacity-80">{metric.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">What this screen uses</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          This page is wired to the Prisma-backed dynamic product model, so the numbers reflect real inventory-adjacent records instead of a static mock list.
        </p>
      </motion.div>
    </div>
  )
}
