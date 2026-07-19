'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const EMPTY_FORM = {
  id: '',
  customerId: '',
  reference: '',
  productInterest: '',
  quantity: '',
  unit: '',
  shipmentDate: '',
  priority: 'normal',
  status: 'new',
  internalNotes: '',
  expiresAt: '',
}

export default function RFQPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rfqs, setRfqs] = useState([])
  const [customers, setCustomers] = useState([])
  const [stats, setStats] = useState({})
  const [selectedRFQ, setSelectedRFQ] = useState(null)
  const [quotations, setQuotations] = useState([])
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' })
  const [form, setForm] = useState(EMPTY_FORM)
  const [quotationForm, setQuotationForm] = useState({ subtotal: '', tax: '', total: '', currency: 'USD', validUntil: '', notes: '', items: '[]' })

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const load = async () => {
    setLoading(true)
    try {
      const rfqParams = new URLSearchParams({ limit: '100', ...(filters.search ? { search: filters.search } : {}), ...(filters.status ? { status: filters.status } : {}), ...(filters.priority ? { priority: filters.priority } : {}) })
      const [rfqResponse, customerResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/rfqs?${rfqParams.toString()}`, { headers: authHeaders() }),
        fetch('/api/admin/customers?limit=200', { headers: authHeaders() }),
        fetch('/api/admin/rfqs?action=stats', { headers: authHeaders() }),
      ])
      const [rfqPayload, customerPayload, statsPayload] = await Promise.all([rfqResponse.json(), customerResponse.json(), statsResponse.json()])
      if (!rfqResponse.ok) throw new Error(rfqPayload.error || 'Unable to load RFQs')
      setRfqs(rfqPayload.data || rfqPayload.items || [])
      setCustomers(customerPayload.data || customerPayload.items || [])
      setStats(statsPayload.data || statsPayload)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filters.search, filters.status, filters.priority])

  useEffect(() => {
    const loadQuotations = async () => {
      if (!selectedRFQ) {
        setQuotations([])
        return
      }
      try {
        const response = await fetch(`/api/admin/rfqs/quotations?rfqId=${selectedRFQ.id}`, { headers: authHeaders() })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Unable to load quotations')
        setQuotations(payload.data || [])
      } catch (error) {
        toast.error(error.message)
      }
    }
    loadQuotations()
  }, [selectedRFQ])

  const save = async () => {
    try {
      setSaving(true)
      const method = form.id ? 'PUT' : 'POST'
      const endpoint = form.id ? '/api/admin/rfqs' : '/api/admin/rfqs'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          ...form,
          quantity: form.quantity ? Number(form.quantity) : null,
          shipmentDate: form.shipmentDate || null,
          expiresAt: form.expiresAt || null,
        }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save RFQ')
      toast.success(form.id ? 'RFQ updated' : 'RFQ created')
      setForm(EMPTY_FORM)
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteRFQ = async (id) => {
    if (!confirm('Delete this RFQ?')) return
    try {
      const response = await fetch(`/api/admin/rfqs?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to delete RFQ')
      toast.success('RFQ deleted')
      await load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const edit = (rfq) => {
    setForm({
      id: rfq.id,
      customerId: rfq.customerId || '',
      reference: rfq.reference || '',
      productInterest: rfq.productInterest || '',
      quantity: rfq.quantity ?? '',
      unit: rfq.unit || '',
      shipmentDate: rfq.shipmentDate ? new Date(rfq.shipmentDate).toISOString().slice(0, 10) : '',
      priority: rfq.priority || 'normal',
      status: rfq.status || 'new',
      internalNotes: rfq.internalNotes || '',
      expiresAt: rfq.expiresAt ? new Date(rfq.expiresAt).toISOString().slice(0, 10) : '',
    })
  }

  const saveQuotation = async () => {
    if (!selectedRFQ) {
      toast.error('Select an RFQ first')
      return
    }
    try {
      setSaving(true)
      const response = await fetch('/api/admin/rfqs/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          rfqId: selectedRFQ.id,
          subtotal: quotationForm.subtotal,
          tax: quotationForm.tax,
          total: quotationForm.total,
          currency: quotationForm.currency,
          validUntil: quotationForm.validUntil,
          notes: quotationForm.notes,
          items: JSON.parse(quotationForm.items || '[]'),
        }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to create quotation')
      toast.success('Quotation created')
      setQuotationForm({ subtotal: '', tax: '', total: '', currency: 'USD', validUntil: '', notes: '', items: '[]' })
      const refreshed = await fetch(`/api/admin/rfqs/quotations?rfqId=${selectedRFQ.id}`, { headers: authHeaders() })
      const refreshedPayload = await refreshed.json()
      setQuotations(refreshedPayload.data || [])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const customerName = useMemo(() => new Map(customers.map((customer) => [customer.id, customer.companyName])), [customers])

  return (
    <>
      <SectionPage
        subtitle="RFQ"
        title="Request for quote"
        description="Create, edit, and close RFQs using the actual RFQ schema: reference, customer, product interest, quantity, priority, and status."
        links={[{ href: '/admin/orders', label: 'Orders' }, { href: '/admin/platform', label: 'Platform' }]}
        stats={[
          { label: 'Total', value: stats.totalRFQs || rfqs.length || 0 },
          { label: 'New', value: stats.newRFQs || 0 },
          { label: 'Quoted', value: stats.quotedRFQs || 0 },
          { label: 'Converted', value: stats.convertedRFQs || 0 },
        ]}
        highlights={[
          { title: 'Schema aligned', description: 'Uses the actual RFQ model fields from Prisma.' },
          { title: 'Customer linked', description: 'Every request is tied back to a customer record.' },
          { title: 'Lifecycle edits', description: 'Update status and priority without deleting records.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{form.id ? 'Edit RFQ' : 'Create RFQ'}</h2>
              <button onClick={() => setForm(EMPTY_FORM)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">Reset</button>
            </div>
            <div className="mt-4 space-y-3">
              <select value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                <option value="">Customer</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName}</option>)}
              </select>
              <input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} placeholder="Reference" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <textarea value={form.productInterest} onChange={(event) => setForm({ ...form, productInterest: event.target.value })} placeholder="Product interest" rows={3} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <div className="grid gap-3 md:grid-cols-2">
                <input type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="Quantity" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="Unit" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input type="date" value={form.shipmentDate} onChange={(event) => setForm({ ...form, shipmentDate: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <input type="date" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                  <option value="new">New</option>
                  <option value="viewed">Viewed</option>
                  <option value="quoted">Quoted</option>
                  <option value="converted">Converted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <textarea value={form.internalNotes} onChange={(event) => setForm({ ...form, internalNotes: event.target.value })} placeholder="Internal notes" rows={4} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <button onClick={save} disabled={saving || !form.customerId} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save RFQ
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search RFQs" className="flex-1 min-w-[220px] rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                <option value="">All status</option>
                <option value="new">New</option>
                <option value="viewed">Viewed</option>
                <option value="quoted">Quoted</option>
                <option value="converted">Converted</option>
                <option value="rejected">Rejected</option>
              </select>
              <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                <option value="">All priority</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <button onClick={load} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Loading RFQs...</div>
            ) : rfqs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">No RFQs found.</div>
            ) : rfqs.map((rfq) => (
              <article key={rfq.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">{rfq.reference}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{customerName.get(rfq.customerId) || rfq.customer?.companyName || 'Unknown customer'}</h3>
                    <p className="text-sm text-slate-500">{rfq.productInterest || 'No product interest provided.'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { edit(rfq); setSelectedRFQ(rfq) }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Edit</button>
                    <button onClick={() => setSelectedRFQ(rfq)} className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900">Quotes</button>
                    <button onClick={() => deleteRFQ(rfq.id)} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                  <p>Status: <span className="font-medium text-slate-900 dark:text-white">{rfq.status}</span></p>
                  <p>Priority: <span className="font-medium text-slate-900 dark:text-white">{rfq.priority}</span></p>
                  <p>Quantity: <span className="font-medium text-slate-900 dark:text-white">{rfq.quantity ?? '-'}</span></p>
                  <p>Unit: <span className="font-medium text-slate-900 dark:text-white">{rfq.unit || '-'}</span></p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {selectedRFQ && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create quotation</h2>
              <div className="mt-4 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input type="number" value={quotationForm.subtotal} onChange={(event) => setQuotationForm({ ...quotationForm, subtotal: event.target.value })} placeholder="Subtotal" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
                  <input type="number" value={quotationForm.tax} onChange={(event) => setQuotationForm({ ...quotationForm, tax: event.target.value })} placeholder="Tax" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
                  <input type="number" value={quotationForm.total} onChange={(event) => setQuotationForm({ ...quotationForm, total: event.target.value })} placeholder="Total" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700 md:col-span-2" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={quotationForm.currency} onChange={(event) => setQuotationForm({ ...quotationForm, currency: event.target.value })} placeholder="Currency" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
                  <input type="date" value={quotationForm.validUntil} onChange={(event) => setQuotationForm({ ...quotationForm, validUntil: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
                </div>
                <textarea value={quotationForm.items} onChange={(event) => setQuotationForm({ ...quotationForm, items: event.target.value })} rows={4} placeholder="Quotation items JSON" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
                <textarea value={quotationForm.notes} onChange={(event) => setQuotationForm({ ...quotationForm, notes: event.target.value })} rows={3} placeholder="Notes" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
                <button onClick={saveQuotation} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create quotation
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quotations for {selectedRFQ.reference}</h2>
              <div className="mt-4 space-y-3">
                {quotations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700">No quotations yet.</div>
                ) : quotations.map((quotation) => (
                  <div key={quotation.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Version {quotation.version}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{quotation.status}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{quotation.total} {quotation.currency}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{quotation.notes || 'No notes'}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
