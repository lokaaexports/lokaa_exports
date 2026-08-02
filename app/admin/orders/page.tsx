'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, RefreshCw, Save, Trash2, X, CheckSquare, Square } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const EMPTY_FORM = {
  id: '',
  customerId: '',
  rfqId: '',
  reference: '',
  subtotal: '',
  tax: '',
  discount: '',
  shipping: '',
  total: '',
  currency: 'USD',
  shipmentAddress: '',
  shippingMethod: '',
  estimatedDelivery: '',
  status: 'pending',
  paymentStatus: 'unpaid',
  notes: '',
}

export default function OrdersPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [rfqs, setRfqs] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [filters, setFilters] = useState<any>({ search: '', status: '', customerId: '' })
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedOrders, setSelectedOrders] = useState<any[]>([])

  const toggleSelection = (id) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  }
  
  const selectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map(o => o.id))
    }
  }

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedOrders.length} orders?`)) return
    try {
      setLoading(true)
      await Promise.all(selectedOrders.map(id => fetch(`/api/admin/orders?id=${id}`, { method: 'DELETE', headers: authHeaders() })))
      toast.success('Orders deleted')
      setSelectedOrders([])
      await load()
    } catch (error: any) {
      toast.error('Error during bulk delete')
      setLoading(false)
    }
  }

  const bulkUpdateStatus = async (newStatus) => {
    try {
      setLoading(true)
      await Promise.all(selectedOrders.map(id => {
        const order = orders.find(o => o.id === id)
        if (!order) return Promise.resolve()
        return fetch(`/api/admin/orders`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ ...order, status: newStatus })
        })
      }))
      toast.success(`Marked as ${newStatus}`)
      setSelectedOrders([])
      await load()
    } catch (error: any) {
      toast.error('Error during bulk update')
      setLoading(false)
    }
  }

  const authHeaders = () => {
    return {}
  }

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100', ...(filters.search ? { search: filters.search } : {}), ...(filters.status ? { status: filters.status } : {}), ...(filters.customerId ? { customerId: filters.customerId } : {}) })
      const [orderResponse, customerResponse, rfqResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/orders?${params.toString()}`, { headers: authHeaders() }),
        fetch('/api/admin/customers?limit=200', { headers: authHeaders() }),
        fetch('/api/admin/rfqs?limit=200', { headers: authHeaders() }),
        fetch('/api/admin/orders?action=stats', { headers: authHeaders() }),
      ])
      const [orderPayload, customerPayload, rfqPayload, statsPayload] = await Promise.all([orderResponse.json(), customerResponse.json(), rfqResponse.json(), statsResponse.json()])
      if (!orderResponse.ok) throw new Error(orderPayload.error || 'Unable to load orders')
      setOrders(orderPayload.data || orderPayload.items || [])
      setCustomers(customerPayload.data || customerPayload.items || [])
      setRfqs(rfqPayload.data || rfqPayload.items || [])
      setStats(statsPayload.data || statsPayload)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filters.search, filters.status, filters.customerId])

  const save = async () => {
    try {
      setSaving(true)
      const method = form.id ? 'PUT' : 'POST'
      const endpoint = '/api/admin/orders'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          ...form,
          subtotal: form.subtotal || 0,
          tax: form.tax || 0,
          discount: form.discount || 0,
          shipping: form.shipping || 0,
          total: form.total || 0,
          estimatedDelivery: form.estimatedDelivery || null,
        }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save order')
      toast.success(form.id ? 'Order updated' : 'Order created')
      setForm(EMPTY_FORM)
      await load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order?')) return
    try {
      const response = await fetch(`/api/admin/orders?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to delete order')
      toast.success('Order deleted')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const edit = (order) => {
    setForm({
      id: order.id,
      customerId: order.customerId || '',
      rfqId: order.rfqId || '',
      reference: order.reference || '',
      subtotal: order.subtotal ?? '',
      tax: order.tax ?? '',
      discount: order.discount ?? '',
      shipping: order.shipping ?? '',
      total: order.total ?? '',
      currency: order.currency || 'USD',
      shipmentAddress: order.shipmentAddress || '',
      shippingMethod: order.shippingMethod || '',
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().slice(0, 10) : '',
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'unpaid',
      notes: order.notes || '',
    })
  }

  const customerName = useMemo(() => new Map(customers.map((customer) => [customer.id, customer.companyName])), [customers])
  const rfqReference = useMemo(() => new Map(rfqs.map((rfq) => [rfq.id, rfq.reference])), [rfqs])

  return (
    <>
      <SectionPage
        subtitle="Orders"
        title="Order management"
        description="Create, update, and remove orders against the actual order schema, including totals, payment status, shipment details, and optional RFQ linkage."
        links={[{ href: '/admin/rfqs', label: 'RFQs' }, { href: '/admin/platform', label: 'Platform' }]}
        stats={[
          { label: 'Total', value: stats.totalOrders || orders.length || 0 },
          { label: 'Pending', value: stats.pendingOrders || 0 },
          { label: 'Completed', value: stats.completedOrders || 0 },
          { label: 'Revenue', value: stats.totalValue || 0 },
        ]}
        highlights={[
          { title: 'Schema aligned', description: 'Uses reference, customer, totals, shipment, and payment fields.' },
          { title: 'Edit workflow', description: 'Update status and logistics without recreating the order.' },
          { title: 'Cross-linked', description: 'Optionally tie orders back to RFQs and customer records.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{form.id ? 'Edit order' : 'Create order'}</h2>
              <button onClick={() => setForm(EMPTY_FORM)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">Reset</button>
            </div>
            <div className="mt-4 space-y-3">
              <select value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                <option value="">Customer</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName}</option>)}
              </select>
              <select value={form.rfqId} onChange={(event) => setForm({ ...form, rfqId: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                <option value="">Linked RFQ (optional)</option>
                {rfqs.map((rfq) => <option key={rfq.id} value={rfq.id}>{rfq.reference}</option>)}
              </select>
              <input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} placeholder="Reference" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <div className="grid gap-3 md:grid-cols-2">
                <input type="number" value={form.subtotal} onChange={(event) => setForm({ ...form, subtotal: event.target.value })} placeholder="Subtotal" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <input type="number" value={form.tax} onChange={(event) => setForm({ ...form, tax: event.target.value })} placeholder="Tax" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <input type="number" value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} placeholder="Discount" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <input type="number" value={form.shipping} onChange={(event) => setForm({ ...form, shipping: event.target.value })} placeholder="Shipping" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <input type="number" value={form.total} onChange={(event) => setForm({ ...form, total: event.target.value })} placeholder="Total" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700 md:col-span-2" />
              </div>
              <input value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} placeholder="Currency" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <input value={form.shipmentAddress} onChange={(event) => setForm({ ...form, shipmentAddress: event.target.value })} placeholder="Shipment address" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <div className="grid gap-3 md:grid-cols-2">
                <input value={form.shippingMethod} onChange={(event) => setForm({ ...form, shippingMethod: event.target.value })} placeholder="Shipping method" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <input type="date" value={form.estimatedDelivery} onChange={(event) => setForm({ ...form, estimatedDelivery: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
                <select value={form.paymentStatus} onChange={(event) => setForm({ ...form, paymentStatus: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                  <option value="unpaid">Unpaid</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Notes" rows={4} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <button onClick={save} disabled={saving || !form.customerId || !form.total} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save order
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search orders" className="flex-1 min-w-[220px] rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                <option value="">All status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <select value={filters.customerId} onChange={(event) => setFilters({ ...filters, customerId: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                <option value="">All customers</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName}</option>)}
              </select>
              <button onClick={load} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">No orders found.</div>
            ) : (
              <>
                <div className="flex items-center gap-2 px-1 text-sm text-slate-600 dark:text-slate-400">
                  <button onClick={selectAll} className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">
                    {selectedOrders.length === orders.length && orders.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    <span>Select All</span>
                  </button>
                </div>
                {orders.map((order) => (
                  <article key={order.id} className={`rounded-3xl border ${selectedOrders.includes(order.id) ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/10' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'} p-5 shadow-sm transition-colors`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button onClick={() => toggleSelection(order.id)} className="mt-1 text-slate-400 hover:text-emerald-500">
                          {selectedOrders.includes(order.id) ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5" />}
                        </button>
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">{order.reference}</p>
                          <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{customerName.get(order.customerId) || order.customer?.companyName || 'Unknown customer'}</h3>
                          <p className="text-sm text-slate-500">{rfqReference.get(order.rfqId) || order.rfq?.reference || 'No RFQ linked'}</p>
                        </div>
                      </div>
                  <div className="flex gap-2">
                    <button onClick={() => edit(order)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Edit</button>
                    <button onClick={() => deleteOrder(order.id)} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                  <p>Status: <span className="font-medium text-slate-900 dark:text-white">{order.status}</span></p>
                  <p>Payment: <span className="font-medium text-slate-900 dark:text-white">{order.paymentStatus}</span></p>
                  <p>Total: <span className="font-medium text-slate-900 dark:text-white">{order.total} {order.currency}</span></p>
                  <p>Shipping: <span className="font-medium text-slate-900 dark:text-white">{order.shippingMethod || '-'}</span></p>
                </div>
              </article>
            ))}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Bulk Actions Floating Bar */}
      {selectedOrders.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 border border-slate-700 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{selectedOrders.length} selected</span>
          <div className="w-px h-4 bg-slate-700" />
          <button onClick={() => bulkUpdateStatus('processing')} className="text-sm font-medium hover:text-emerald-400 transition-colors">Mark Processing</button>
          <button onClick={() => bulkUpdateStatus('completed')} className="text-sm font-medium hover:text-emerald-400 transition-colors">Mark Completed</button>
          <button onClick={() => bulkDelete()} className="text-sm font-medium hover:text-red-400 transition-colors">Delete</button>
          <button onClick={() => setSelectedOrders([])} className="ml-2 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  )
}
