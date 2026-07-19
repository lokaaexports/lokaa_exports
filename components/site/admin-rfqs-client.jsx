'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChevronDown, Clock3, ListChecks, MessageSquareText, Paperclip, RefreshCcw, UserRound } from 'lucide-react'

function getStatusClasses(status) {
  switch ((status || '').toLowerCase()) {
    case 'new':
      return 'bg-emerald-500/10 text-emerald-300'
    case 'contacted':
      return 'bg-sky-500/10 text-sky-300'
    case 'quotation-sent':
      return 'bg-violet-500/10 text-violet-300'
    case 'negotiation':
      return 'bg-amber-500/10 text-amber-300'
    case 'closed':
    case 'won':
      return 'bg-emerald-500/10 text-emerald-300'
    case 'lost':
      return 'bg-rose-500/10 text-rose-300'
    default:
      return 'bg-slate-500/10 text-slate-300'
  }
}

export default function AdminRfqsClient() {
  const [rfqs, setRfqs] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRfq, setSelectedRfq] = useState(null)
  const [editFields, setEditFields] = useState({ priority: 'normal', assignedSalesPerson: '', followUpDate: '', notes: '' })
  const [updating, setUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const fetchRfqs = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('query', searchQuery)
      if (statusFilter) params.set('status', statusFilter)
      if (priorityFilter) params.set('priority', priorityFilter)
      const url = `/api/admin/rfqs?${params.toString()}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to load RFQs')
      setRfqs(data.rfqs || [])
    } catch (err) {
      setError(err.message || 'Unable to load RFQs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data.customers) ? data.customers : []))
      .catch(() => setCustomers([]))
  }, [])

  useEffect(() => {
    fetchRfqs()
  }, [searchQuery, statusFilter, priorityFilter])

  useEffect(() => {
    if (selectedRfq) {
      setEditFields({
        priority: selectedRfq.priority || 'normal',
        assignedSalesPerson: selectedRfq.assignedSalesPerson || '',
        followUpDate: selectedRfq.followUpDate || '',
        notes: selectedRfq.notes || selectedRfq.message || '',
      })
    }
  }, [selectedRfq])

  const openCount = rfqs.filter((rfq) => ['new', 'contacted', 'quotation-sent', 'negotiation'].includes((rfq.status || '').toLowerCase())).length

  const updateRfqStatus = async (id, status) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/rfqs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to update status')
      setSelectedRfq(data.rfq)
      setRfqs((prev) => prev.map((item) => item.id === id ? data.rfq : item))
    } catch (err) {
      setError(err.message || 'Unable to update status')
    } finally {
      setUpdating(false)
    }
  }

  const updateRfqDetails = async () => {
    if (!selectedRfq) return
    setUpdating(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/rfqs/${selectedRfq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority: editFields.priority,
          assignedSalesPerson: editFields.assignedSalesPerson,
          followUpDate: editFields.followUpDate,
          notes: editFields.notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to save RFQ changes')
      setSelectedRfq(data.rfq)
      setRfqs((prev) => prev.map((item) => item.id === selectedRfq.id ? data.rfq : item))
    } catch (err) {
      setError(err.message || 'Unable to save RFQ changes')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">RFQ management</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Request for quote desk</h1>
            <p className="mt-2 text-slate-400">Review incoming quote requests, status and customer details from the MySQL RFQ store.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/dashboard" className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white hover:border-emerald-400">Dashboard</Link>
            <button onClick={fetchRfqs} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white transition hover:border-emerald-400">Refresh</button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total RFQs</p>
            <p className="mt-4 text-3xl font-semibold text-white">{rfqs.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Open RFQs</p>
            <p className="mt-4 text-3xl font-semibold text-white">{openCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Latest</p>
            <p className="mt-4 text-3xl font-semibold text-white">{rfqs[0]?.reference || '—'}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Last updated</p>
            <p className="mt-4 text-3xl font-semibold text-white">{rfqs[0]?.createdAt ? new Date(rfqs[0].createdAt).toLocaleDateString() : '—'}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Search RFQs</label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Reference, buyer, product, country"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none focus:border-emerald-400"
            />
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none focus:border-emerald-400">
              <option value="">All statuses</option>
              {['new','assigned','contacted','quotation-sent','negotiation','confirmed','order-created','shipment','completed','won','lost'].map((status) => (
                <option key={status} value={status}>{status.replace(/-/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Priority</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none focus:border-emerald-400">
              <option value="">All priorities</option>
              {['normal','high','urgent'].map((priority) => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-3xl border border-rose-500/40 bg-rose-500/10 p-5 text-sm text-rose-200">{error}</div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-lg">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400">
                <tr>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Buyer</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">Loading RFQs…</td></tr>
                ) : rfqs.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No RFQs found.</td></tr>
                ) : (
                  rfqs.map((rfq) => (
                    <tr key={rfq.id || rfq.reference} className={`cursor-pointer hover:bg-slate-950/70 ${selectedRfq?.id === rfq.id ? 'bg-slate-950/80' : ''}`} onClick={() => setSelectedRfq(rfq)}>
                      <td className="px-6 py-4 font-medium text-white">{rfq.reference || '—'}</td>
                      <td className="px-6 py-4">
                        <div>{rfq.fullName || rfq.contactPerson || '—'}</div>
                        <div className="text-xs text-slate-500">{rfq.company || '—'}</div>
                      </td>
                      <td className="px-6 py-4">{rfq.productInterest || rfq.product || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${getStatusClasses(rfq.status)}`}>
                          {rfq.status || 'new'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{rfq.createdAt ? new Date(rfq.createdAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            {selectedRfq ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">RFQ details</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{selectedRfq.reference || 'RFQ'}</h2>
                  </div>
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${getStatusClasses(selectedRfq.status)}`}>
                    {selectedRfq.status || 'new'}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <UserRound className="h-4 w-4 text-emerald-400" /> Buyer profile
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
                    <div><span className="block text-slate-500">Name</span>{selectedRfq.fullName || '—'}</div>
                    <div><span className="block text-slate-500">Company</span>{selectedRfq.company || '—'}</div>
                    <div><span className="block text-slate-500">Email</span>{selectedRfq.email || '—'}</div>
                    <div><span className="block text-slate-500">Phone</span>{selectedRfq.phone || '—'}</div>
                    <div><span className="block text-slate-500">Country</span>{selectedRfq.country || '—'}</div>
                    <div><span className="block text-slate-500">Source</span>{selectedRfq.sourcePage || 'Website'}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <MessageSquareText className="h-4 w-4 text-emerald-400" /> RFQ summary
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
                    <div><span className="block text-slate-500">Product</span>{selectedRfq.productInterest || '—'}</div>
                    <div><span className="block text-slate-500">Quantity</span>{selectedRfq.quantity || '—'}</div>
                    <div><span className="block text-slate-500">Packaging</span>{selectedRfq.packaging || '—'}</div>
                    <div><span className="block text-slate-500">Target price</span>{selectedRfq.targetPrice ? `${selectedRfq.targetPrice} ${selectedRfq.preferredCurrency || ''}`.trim() : '—'}</div>
                    <div><span className="block text-slate-500">Shipment</span>{selectedRfq.shipmentDate || '—'}</div>
                    <div><span className="block text-slate-500">Destination</span>{selectedRfq.destinationPort || '—'}</div>
                    <div><span className="block text-slate-500">Priority</span>{selectedRfq.priority || 'normal'}</div>
                    <div><span className="block text-slate-500">Assigned to</span>{selectedRfq.assignedSalesPerson || '—'}</div>
                    <div><span className="block text-slate-500">Follow-up</span>{selectedRfq.followUpDate || '—'}</div>
                    <div><span className="block text-slate-500">Custom specs</span>{selectedRfq.customSpecifications || '—'}</div>
                    <div><span className="block text-slate-500">Source page</span>{selectedRfq.sourcePage || '—'}</div>
                  </div>
                  <div className="mt-4 text-sm text-slate-400">
                    <span className="mb-2 block text-slate-500">Notes</span>
                    <p className="leading-6 text-slate-300">{selectedRfq.message || selectedRfq.notes || 'No additional notes.'}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Paperclip className="h-4 w-4 text-emerald-400" /> Attachments
                  </div>
                  {selectedRfq.attachments && selectedRfq.attachments.length > 0 ? (
                    <ul className="mt-4 space-y-2 text-sm text-slate-300">
                      {selectedRfq.attachments.map((attachment, index) => (
                        <li key={index} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2">
                          <span className="truncate">{attachment.name}</span>
                          <a href={attachment.url} target="_blank" rel="noreferrer" className="text-sm text-emerald-300 hover:text-emerald-200">Open</a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">No attachments provided.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <ListChecks className="h-4 w-4 text-emerald-400" /> Activity history
                  </div>
                  {selectedRfq.history && selectedRfq.history.length > 0 ? (
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                      {selectedRfq.history.map((entry, index) => (
                        <div key={index} className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-3">
                          <div className="flex items-center justify-between gap-3 text-slate-400">
                            <span>{entry.type.replace(/_/g, ' ')}</span>
                            <span className="text-xs uppercase tracking-[0.2em]">{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="mt-1 text-slate-300">{entry.detail}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">No activity history yet.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
                    <RefreshCcw className="h-4 w-4 text-emerald-400" /> Workflow actions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['new','assigned','contacted','quotation-sent','negotiation','confirmed','order-created','shipment','completed'].map((status) => (
                      <button key={status} onClick={() => updateRfqStatus(selectedRfq.id, status)} disabled={updating} className={`rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${selectedRfq.status === status ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-200'}`}>
                        {status.replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
                    <RefreshCcw className="h-4 w-4 text-emerald-400" /> Manage RFQ details
                  </div>
                  <div className="grid gap-4 text-sm text-slate-300">
                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Priority</span>
                      <select value={editFields.priority} onChange={(e) => setEditFields((prev) => ({ ...prev, priority: e.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none focus:border-emerald-400">
                        {['normal','high','urgent'].map((priority) => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Assigned to</span>
                      <input value={editFields.assignedSalesPerson} onChange={(e) => setEditFields((prev) => ({ ...prev, assignedSalesPerson: e.target.value }))} placeholder="Sales rep name" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none focus:border-emerald-400" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Follow-up date</span>
                      <input type="date" value={editFields.followUpDate} onChange={(e) => setEditFields((prev) => ({ ...prev, followUpDate: e.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none focus:border-emerald-400" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Internal notes</span>
                      <textarea rows={3} value={editFields.notes} onChange={(e) => setEditFields((prev) => ({ ...prev, notes: e.target.value }))} className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none focus:border-emerald-400" />
                    </label>
                    <button onClick={updateRfqDetails} disabled={updating} className="rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60">Save changes</button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Known customers
                  </div>
                  <div className="space-y-2">
                    {customers.length === 0 ? (
                      <div className="text-sm text-slate-500">No customer records yet.</div>
                    ) : customers.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
                        <span>{customer.name || customer.email}</span>
                        <span className="text-slate-500">{customer.company || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-800 text-sm text-slate-500">Select an RFQ to review details.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
