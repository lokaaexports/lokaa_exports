'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

export default function ApprovalsPage() {
  const [loading, setLoading] = useState(true)
  const [approvals, setApprovals] = useState<any[]>([])

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/approvals')
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load approvals')
      setApprovals(payload.items || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const changeStatus = async (id, status) => {
    try {
      const response = await fetch('/api/admin/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to update approval')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionPage
          subtitle="Approvals"
          title="Approval system"
          description="Route products, RFQs, and documents through draft, review, approval, and publish gates."
          links={[
            { href: '/admin/pim', label: 'Back to PIM' },
            { href: '/admin/workflow', label: 'Workflow' },
          ]}
          stats={[
            { label: 'States', value: 'Draft → Publish' },
            { label: 'Gates', value: 'Employee / Manager / Admin' },
          ]}
          highlights={[
            { title: 'Controlled publishing', description: 'No item reaches live state without review.' },
            { title: 'Domain aware', description: 'Supports products, RFQs, documents, and catalogues.' },
            { title: 'Audit friendly', description: 'Every approval can be traced in timeline logs.' },
          ]}
        />

        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading approvals...
            </div>
          ) : approvals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
              No approval requests yet.
            </div>
          ) : (
            approvals.map((approval) => (
              <div key={approval.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">{approval.domainName}</p>
                    <h3 className="mt-1 font-semibold text-slate-900 dark:text-white">{approval.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{approval.entityType} • {approval.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => changeStatus(approval.id, 'approved')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </button>
                    <button onClick={() => changeStatus(approval.id, 'pending_review')} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                      <Clock3 className="h-4 w-4" />
                      Review
                    </button>
                    <button onClick={() => changeStatus(approval.id, 'rejected')} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white">
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  )
}
