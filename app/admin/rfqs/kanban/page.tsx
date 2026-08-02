'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowLeft, RefreshCw, LayoutList, Calendar } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const STATUSES = ['new', 'viewed', 'quoted', 'converted', 'rejected']
const STATUS_COLORS = {
  new: 'border-blue-200 bg-blue-50 text-blue-700',
  viewed: 'border-purple-200 bg-purple-50 text-purple-700',
  quoted: 'border-orange-200 bg-orange-50 text-orange-700',
  converted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
}

export default function RFQKanbanPage() {
  const [rfqs, setRfqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/rfqs?limit=200')
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load RFQs')
      setRfqs(payload.data || payload.items || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDragStart = (id: string) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow dropping
  }

  const handleDrop = async (status: string) => {
    if (!draggedId) return
    const id = draggedId
    setDraggedId(null)
    
    const rfq = rfqs.find((r) => r.id === id)
    if (!rfq || rfq.status === status) return

    const previousStatus = rfq.status
    // Optimistic update
    setRfqs((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))

    try {
      const res = await fetch('/api/admin/rfqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      toast.success(`RFQ moved to ${status}`)
    } catch (error: any) {
      toast.error(error.message)
      // Revert on failure
      setRfqs((prev) => prev.map((r) => (r.id === id ? { ...r, status: previousStatus } : r)))
    }
  }

  const getColumnRfqs = (status: string) => rfqs.filter((r) => r.status === status)

  return (
    <>
      <SectionPage
        subtitle="RFQ"
        title="Kanban Pipeline"
        description="Drag and drop Request For Quotations across the sales pipeline."
        links={[
          { href: '/admin/rfqs', label: 'List View' },
          { href: '/admin/orders', label: 'Orders' },
        ]}
        stats={[
          { label: 'Total', value: rfqs.length },
          { label: 'Columns', value: STATUSES.length },
        ]}
        highlights={[
          { title: 'Interactive', description: 'Drag and drop cards to update status.' },
          { title: 'Real-time', description: 'Updates are saved instantly to the database.' },
        ]}
      />

      <div className="mx-auto max-w-[1600px] space-y-6 px-6 pb-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/admin/rfqs" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            <LayoutList className="h-4 w-4" />
            Switch to List
          </Link>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        </div>

        {loading && rfqs.length === 0 ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="flex gap-6 min-w-max pb-4">
            {STATUSES.map((status) => (
              <div
                key={status}
                className="w-80 flex-shrink-0 flex flex-col gap-3"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(status)}
              >
                <div className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {status}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {getColumnRfqs(status).length}
                  </span>
                </div>

                <div className="flex flex-col gap-3 min-h-[200px] rounded-2xl bg-slate-100/50 p-3 border border-slate-100 dark:bg-slate-900/30 dark:border-slate-800/50">
                  <AnimatePresence>
                    {getColumnRfqs(status).map((rfq) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={rfq.id}
                        draggable
                        onDragStart={() => handleDragStart(rfq.id)}
                        className={`cursor-grab active:cursor-grabbing rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900 ${STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'border-slate-200'}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider opacity-80">{rfq.reference}</span>
                          {rfq.priority === 'urgent' && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 uppercase">Urgent</span>}
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1 mb-1">
                          {rfq.customer?.companyName || 'Unknown Customer'}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                          {rfq.productInterest || 'General Inquiry'}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs font-medium opacity-80 mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                          {rfq.quantity && <span>Qty: {rfq.quantity} {rfq.unit}</span>}
                          {rfq.createdAt && (
                            <span className="flex items-center gap-1 ml-auto">
                              <Calendar className="h-3 w-3" />
                              {new Date(rfq.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
