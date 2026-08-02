'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Save, Send, Plus, Trash2, Calendar, FileText, CheckCircle, User } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

function authHeaders() {
  return {}
}

export default function RFQDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rfq, setRfq] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('details')
  
  // Quotation form state
  const [quotationForm, setQuotationForm] = useState<any>({ subtotal: '', tax: '', total: '', currency: 'USD', validUntil: '', notes: '', items: [] })
  
  useEffect(() => {
    if (id) loadRFQ()
  }, [id])

  async function loadRFQ() {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/rfqs/${id}`, { headers: authHeaders() })
      if (!response.ok) {
        const errData = await response.text()
        console.error('RFQ load failed with status:', response.status, errData)
        throw new Error('Failed to load RFQ')
      }
      const data = await response.json()
      setRfq(data.rfq)
    } catch (error: any) {
      console.error('Error in loadRFQ:', error)
      toast.error('Failed to load RFQ details')
      router.push('/admin/rfqs')
    } finally {
      setLoading(false)
    }
  }

  async function saveRFQDetails() {
    try {
      setSaving(true)
      const { customer, items, quotations, ...updateData } = rfq
      const response = await fetch(`/api/admin/rfqs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(updateData)
      })
      if (!response.ok) throw new Error('Failed to save')
      toast.success('RFQ details saved successfully')
    } catch (error: any) {
      toast.error('Failed to save RFQ')
    } finally {
      setSaving(false)
    }
  }

  const addQuotationItem = () => {
    setQuotationForm((prev: any) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }))
  }

  const updateQuotationItem = (index: number, field: string, value: any) => {
    setQuotationForm((prev: any) => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unitPrice)
      }
      return { ...prev, items: newItems }
    })
  }

  const removeQuotationItem = (index: number) => {
    setQuotationForm((prev: any) => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== index)
    }))
  }

  async function createQuotation() {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/rfqs/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ rfqId: id, ...quotationForm })
      })
      if (!response.ok) throw new Error('Failed to create quotation')
      toast.success('Quotation created successfully')
      setQuotationForm({ subtotal: '', tax: '', total: '', currency: 'USD', validUntil: '', notes: '', items: [] })
      loadRFQ()
    } catch (error: any) {
      toast.error('Failed to create quotation')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!rfq) return null

  return (
    <>
      <div className="bg-slate-900 px-6 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <Link href="/admin/rfqs" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to RFQs
          </Link>
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{rfq.reference}</h1>
                <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-300 uppercase tracking-wider">{rfq.status}</span>
              </div>
              <p className="mt-2 text-lg text-slate-400">{rfq.customer?.companyName || 'Unknown Customer'}</p>
            </div>
            <button onClick={saveRFQDetails} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-400 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
            </button>
          </div>

          <div className="mt-8 flex gap-2 border-b border-slate-800">
            {['details', 'items', 'quotations'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'border-emerald-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                {tab} {tab === 'items' && `(${rfq.items?.length || 0})`} {tab === 'quotations' && `(${rfq.quotations?.length || 0})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === 'details' && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-600" /> General Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Reference</label>
                  <input value={rfq.reference} onChange={(e) => setRfq({ ...rfq, reference: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Product Interest</label>
                  <textarea value={rfq.productInterest || ''} onChange={(e) => setRfq({ ...rfq, productInterest: e.target.value })} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Quantity</label>
                    <input type="number" value={rfq.quantity || ''} onChange={(e) => setRfq({ ...rfq, quantity: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Unit</label>
                    <input value={rfq.unit || ''} onChange={(e) => setRfq({ ...rfq, unit: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Calendar className="h-4 w-4 text-emerald-600" /> Lifecycle & Status</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
                    <select value={rfq.status} onChange={(e) => setRfq({ ...rfq, status: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50">
                      <option value="new">New</option>
                      <option value="viewed">Viewed</option>
                      <option value="quoted">Quoted</option>
                      <option value="converted">Converted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Priority</label>
                    <select value={rfq.priority} onChange={(e) => setRfq({ ...rfq, priority: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50">
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Shipment Date</label>
                  <input type="date" value={rfq.shipmentDate ? new Date(rfq.shipmentDate).toISOString().split('T')[0] : ''} onChange={(e) => setRfq({ ...rfq, shipmentDate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Expires At</label>
                  <input type="date" value={rfq.expiresAt ? new Date(rfq.expiresAt).toISOString().split('T')[0] : ''} onChange={(e) => setRfq({ ...rfq, expiresAt: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Internal Notes</label>
                  <textarea value={rfq.internalNotes || ''} onChange={(e) => setRfq({ ...rfq, internalNotes: e.target.value })} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><User className="h-4 w-4 text-emerald-600" /> Customer Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Company / Name</label>
                  <input readOnly value={rfq.customer?.companyName || rfq.customer?.contactName || rfq.fullName || ''} className="mt-1 w-full rounded-xl border border-transparent bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 dark:bg-slate-800/50 dark:text-slate-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
                  <input readOnly value={rfq.customer?.email || rfq.email || ''} className="mt-1 w-full rounded-xl border border-transparent bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 dark:bg-slate-800/50 dark:text-slate-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Phone</label>
                  <input readOnly value={rfq.customer?.phone || rfq.phone || ''} className="mt-1 w-full rounded-xl border border-transparent bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 dark:bg-slate-800/50 dark:text-slate-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Country</label>
                  <input readOnly value={rfq.customer?.country || rfq.country || ''} className="mt-1 w-full rounded-xl border border-transparent bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 dark:bg-slate-800/50 dark:text-slate-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Port</label>
                  <input readOnly value={rfq.destinationPort || ''} className="mt-1 w-full rounded-xl border border-transparent bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 dark:bg-slate-800/50 dark:text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            {(!rfq.items || rfq.items.length === 0) ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                No detailed line items requested for this RFQ.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Custom Specifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rfq.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {item.description || item.productId || 'Unknown Product'}
                      </td>
                      <td className="px-6 py-4">
                        {item.quantity} {item.unit || 'units'}
                      </td>
                      <td className="px-6 py-4">
                        {item.customSpecs ? (
                          <div className="text-xs space-y-1">
                            {typeof item.customSpecs === 'object' 
                              ? Object.entries(item.customSpecs).map(([k, v]: any) => (
                                  <div key={k}><span className="font-semibold text-slate-500">{k}:</span> {v}</div>
                                ))
                              : item.customSpecs}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'quotations' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Create Quotation</h3>
              <div className="space-y-4">
                <div className="grid gap-3 grid-cols-3">
                  <input type="number" value={quotationForm.subtotal} onChange={(event) => setQuotationForm({ ...quotationForm, subtotal: event.target.value })} placeholder="Subtotal" className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/50" />
                  <input type="number" value={quotationForm.tax} onChange={(event) => setQuotationForm({ ...quotationForm, tax: event.target.value })} placeholder="Tax" className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/50" />
                  <input type="number" value={quotationForm.total} onChange={(event) => setQuotationForm({ ...quotationForm, total: event.target.value })} placeholder="Total" className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/50" />
                </div>
                <div className="grid gap-3 grid-cols-2">
                  <input value={quotationForm.currency} onChange={(event) => setQuotationForm({ ...quotationForm, currency: event.target.value })} placeholder="Currency (USD)" className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/50" />
                  <input type="date" value={quotationForm.validUntil} onChange={(event) => setQuotationForm({ ...quotationForm, validUntil: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/50" />
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Line Items</h4>
                    <button onClick={addQuotationItem} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      <Plus className="h-3 w-3" /> Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {quotationForm.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-slate-500">Item {idx + 1}</span>
                          <button onClick={() => removeQuotationItem(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                        <input value={item.description} onChange={e => updateQuotationItem(idx, 'description', e.target.value)} placeholder="Description" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                        <div className="flex gap-2">
                          <input type="number" value={item.quantity} onChange={e => updateQuotationItem(idx, 'quantity', e.target.value)} placeholder="Qty" className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                          <input type="number" value={item.unitPrice} onChange={e => updateQuotationItem(idx, 'unitPrice', e.target.value)} placeholder="Price" className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                          <div className="flex items-center justify-center w-24 rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-medium dark:bg-slate-700">
                            {quotationForm.currency} {item.total || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <textarea value={quotationForm.notes} onChange={(event) => setQuotationForm({ ...quotationForm, notes: event.target.value })} rows={2} placeholder="Additional notes to customer..." className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/50" />
                <button onClick={createQuotation} disabled={saving || quotationForm.items.length === 0} className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 hover:bg-blue-700 transition-colors">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit Quotation
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Past Quotations</h3>
              {(!rfq.quotations || rfq.quotations.length === 0) ? (
                <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700">No quotations have been sent yet.</div>
              ) : (
                rfq.quotations.map((quotation: any) => (
                  <div key={quotation.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">Version {quotation.version}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${quotation.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : quotation.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                            {quotation.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{new Date(quotation.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white text-lg">{quotation.total} <span className="text-sm font-normal text-slate-500">{quotation.currency}</span></p>
                      </div>
                    </div>
                    {quotation.items && Array.isArray(quotation.items) && (
                      <div className="mt-4 space-y-1">
                        {quotation.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">{item.quantity}x {item.description}</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.total}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {quotation.notes && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                        {quotation.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
