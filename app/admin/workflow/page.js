'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, Clock3, Loader2, Play, Plus, RefreshCw, Send } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const EMPTY_APPROVAL = {
  domainName: 'products',
  entityType: 'product',
  entityId: '',
  title: '',
  notes: '',
}

export default function WorkflowPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState([])
  const [approvals, setApprovals] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [approvalForm, setApprovalForm] = useState(EMPTY_APPROVAL)

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId],
  )

  const load = async () => {
    setLoading(true)
    try {
      const [productResponse, approvalResponse] = await Promise.all([
        fetch('/api/admin/products-advanced/products?limit=25'),
        fetch('/api/admin/approvals'),
      ])
      const [productPayload, approvalPayload] = await Promise.all([productResponse.json(), approvalResponse.json()])
      if (!productResponse.ok) throw new Error(productPayload.error || 'Unable to load products')
      if (!approvalResponse.ok) throw new Error(approvalPayload.error || 'Unable to load approvals')
      setProducts(productPayload.products || productPayload.data || [])
      setApprovals(approvalPayload.items || approvalPayload.approvals || [])
      if (!selectedProductId && (productPayload.products || productPayload.data || []).length > 0) {
        setSelectedProductId((productPayload.products || productPayload.data || [])[0].id)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const publishSelectedProduct = async () => {
    if (!selectedProductId) {
      toast.error('Select a product first')
      return
    }
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/products-advanced/products?id=${selectedProductId}&action=publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to publish product')
      toast.success('Product published')
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const createApproval = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...approvalForm,
          entityId: approvalForm.entityId || selectedProductId,
          status: 'pending_review',
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to create approval')
      toast.success('Approval request created')
      setApprovalForm(EMPTY_APPROVAL)
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const updateApproval = async (id, status) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to update approval')
      await load()
      toast.success(`Approval ${status.replace('_', ' ')}`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SectionPage
        subtitle="Workflow"
        title="Approval and publishing pipeline"
        description="Move products through draft, review, approval, publish, and archive. Approvals are backed by the MySQL workflow table and product publish actions hit Prisma/MySQL directly."
        links={[{ href: '/admin/approvals', label: 'Open Approvals' }, { href: '/admin/pim', label: 'Open PIM' }]}
        stats={[
          { label: 'Products', value: products.length },
          { label: 'Approvals', value: approvals.length },
          { label: 'Selected product', value: selectedProduct?.productName || 'None' },
          { label: 'Pipeline', value: 'Draft → Published' },
        ]}
        highlights={[
          { title: 'Publish action', description: 'One click sends a product from draft to live state.' },
          { title: 'Approval requests', description: 'Create and manage review gates for any entity.' },
          { title: 'Operational trace', description: 'Use the approval queue as the live workflow inbox.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Product publish queue</h2>
              <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.productName || product.name || product.slug}</option>
                ))}
              </select>

              {selectedProduct ? (
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">{selectedProduct.status}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{selectedProduct.productName || selectedProduct.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedProduct.slug}</p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{selectedProduct.shortDescription || selectedProduct.description || 'No description available.'}</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700">No product selected.</div>
              )}

              <button onClick={publishSelectedProduct} disabled={saving || !selectedProductId} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Publish product
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create approval request</h2>
            <div className="mt-4 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <input value={approvalForm.domainName} onChange={(event) => setApprovalForm({ ...approvalForm, domainName: event.target.value })} placeholder="Domain name" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <input value={approvalForm.entityType} onChange={(event) => setApprovalForm({ ...approvalForm, entityType: event.target.value })} placeholder="Entity type" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              </div>
              <input value={approvalForm.entityId} onChange={(event) => setApprovalForm({ ...approvalForm, entityId: event.target.value })} placeholder={selectedProductId ? `Entity id (default: ${selectedProductId})` : 'Entity id'} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <input value={approvalForm.title} onChange={(event) => setApprovalForm({ ...approvalForm, title: event.target.value })} placeholder="Approval title" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <textarea value={approvalForm.notes} onChange={(event) => setApprovalForm({ ...approvalForm, notes: event.target.value })} rows={4} placeholder="Notes" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <button onClick={createApproval} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create approval
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Approval inbox</h2>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading workflow queue...
            </div>
          ) : approvals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700">No approvals yet.</div>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {approvals.map((approval) => (
                <article key={approval.id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">{approval.domainName}</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{approval.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{approval.entityType} • {approval.status}</p>
                    </div>
                    <button onClick={() => updateApproval(approval.id, 'approved')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{approval.notes || 'No approval notes provided.'}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => updateApproval(approval.id, 'pending_review')} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Back to review</button>
                    <button onClick={() => updateApproval(approval.id, 'rejected')} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900">Reject</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
