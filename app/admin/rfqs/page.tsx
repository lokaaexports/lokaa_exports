'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, RefreshCw, Save, Trash2, FileText, Download, CheckCircle } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'
import { EmptyState } from '@/components/admin/EmptyState'
import { DataTable } from '@/components/admin/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'

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
  const [rfqs, setRfqs] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [selectedRFQ, setSelectedRFQ] = useState<any>(null)
  const [quotations, setQuotations] = useState<any[]>([])
  const [filters, setFilters] = useState<any>({ search: '', status: '', priority: '' })
  const [form, setForm] = useState(EMPTY_FORM)
  const [quotationForm, setQuotationForm] = useState<any>({ subtotal: '', tax: '', total: '', currency: 'USD', validUntil: '', notes: '', items: [] })
  const [rowSelection, setRowSelection] = useState({})

  const addQuotationItem = () => {
    setQuotationForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }))
  }

  const updateQuotationItem = (index, field, value) => {
    setQuotationForm(prev => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unitPrice)
      }
      return { ...prev, items: newItems }
    })
  }

  const removeQuotationItem = (index) => {
    setQuotationForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const load = async () => {
    setLoading(true)
    try {
      const rfqParams = new URLSearchParams({ limit: '100', ...(filters.search ? { search: filters.search } : {}), ...(filters.status ? { status: filters.status } : {}), ...(filters.priority ? { priority: filters.priority } : {}) })
      const [rfqResponse, customerResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/rfqs?${rfqParams.toString()}`),
        fetch('/api/admin/customers?limit=200'),
        fetch('/api/admin/rfqs?action=stats'),
      ])
      const [rfqPayload, customerPayload, statsPayload] = await Promise.all([rfqResponse.json(), customerResponse.json(), statsResponse.json()])
      if (!rfqResponse.ok) throw new Error(rfqPayload.error || 'Unable to load RFQs')
      setRfqs(rfqPayload.data || rfqPayload.items || [])
      setCustomers(customerPayload.data || customerPayload.items || [])
      setStats(statsPayload.data || statsPayload)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
      setRowSelection({})
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
        const response = await fetch(`/api/admin/rfqs/quotations?rfqId=${selectedRFQ.id}`)
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Unable to load quotations')
        setQuotations(payload.data || [])
      } catch (error: any) {
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
        headers: { 'Content-Type': 'application/json' },
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
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteRFQ = async (id) => {
    if (!confirm('Delete this RFQ?')) return
    try {
      const response = await fetch(`/api/admin/rfqs?id=${id}`, { method: 'DELETE' })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to delete RFQ')
      toast.success('RFQ deleted')
      await load()
    } catch (error: any) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: selectedRFQ.id,
          subtotal: quotationForm.subtotal,
          tax: quotationForm.tax,
          total: quotationForm.total,
          currency: quotationForm.currency,
          validUntil: quotationForm.validUntil,
          notes: quotationForm.notes,
          items: quotationForm.items,
        }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to create quotation')
      toast.success('Quotation created')
      setQuotationForm({ subtotal: '', tax: '', total: '', currency: 'USD', validUntil: '', notes: '', items: [] })
      const refreshed = await fetch(`/api/admin/rfqs/quotations?rfqId=${selectedRFQ.id}`)
      const refreshedPayload = await refreshed.json()
      setQuotations(refreshedPayload.data || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleExportCSV = () => {
    const ids = Object.keys(rowSelection).filter(i => rowSelection[i]).map(i => rfqs[parseInt(i)].id)
    const dataToExport = ids.length ? rfqs.filter(r => ids.includes(r.id)) : rfqs
    if (!dataToExport.length) return toast.error('No RFQs to export')

    const headers = ['Reference', 'Customer', 'Product Interest', 'Status', 'Priority', 'Quantity']
    const csv = [headers, ...dataToExport.map(r => [
      r.reference || '',
      `"${String(customerName.get(r.customerId) || r.customer?.companyName || '').replace(/"/g, '""')}"`,
      `"${String(r.productInterest || '').replace(/"/g, '""')}"`,
      r.status || '',
      r.priority || '',
      r.quantity || ''
    ])].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `rfqs_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const customerName = useMemo(() => new Map(customers.map((customer) => [customer.id, customer.companyName])), [customers])

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-slate-300"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-slate-300"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ row }) => (
        <span className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">{row.original.reference}</span>
      ),
    },
    {
      accessorKey: 'customerId',
      header: 'Customer',
      cell: ({ row }) => {
        const rfq = row.original
        return (
          <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
            {customerName.get(rfq.customerId) || rfq.customer?.companyName || 'Unknown customer'}
          </div>
        )
      }
    },
    {
      accessorKey: 'productInterest',
      header: 'Product Interest',
      cell: ({ row }) => (
        <span className="text-slate-600 dark:text-slate-400 line-clamp-1">{row.original.productInterest || '-'}</span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className="text-xs uppercase font-medium tracking-wider text-blue-600 px-2 py-1 bg-blue-50 border border-blue-200 dark:border-blue-800 dark:bg-blue-900/30 rounded-full">{row.original.status}</span>
      )
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <span className="text-xs uppercase font-medium tracking-wider text-orange-600 px-2 py-1 bg-orange-50 border border-orange-200 dark:border-orange-800 dark:bg-orange-900/30 rounded-full">{row.original.priority}</span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const rfq = row.original
        return (
          <div className="flex gap-2">
            <Link href={`/admin/rfqs/${rfq.id}`} className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-900/30">
              Manage
            </Link>
            <button onClick={() => deleteRFQ(rfq.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/30"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        )
      },
    },
  ], [customerName])

  return (
    <>
      <SectionPage
        subtitle="RFQ"
        title="Request for quote"
        description="Create, edit, and close RFQs using the actual RFQ schema: reference, customer, product interest, quantity, priority, and status."
        links={[{ href: '/admin/rfqs/kanban', label: 'Kanban View' }, { href: '/admin/orders', label: 'Orders' }]}
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
        <section className="space-y-4">
          <div className="flex flex-wrap gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search RFQs" className="flex-1 min-w-[220px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">All status</option>
              <option value="new">New</option>
              <option value="viewed">Viewed</option>
              <option value="quoted">Quoted</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">All priority</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {Object.keys(rowSelection).length > 0 && (
            <div className="flex flex-wrap items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300 px-2">{Object.keys(rowSelection).filter(k => rowSelection[k]).length} selected</span>
              <button onClick={handleExportCSV} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-sm">
                <Download className="h-3.5 w-3.5" />
                Export to CSV
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
          ) : rfqs.length === 0 ? (
            <EmptyState icon={FileText} title="No RFQs found" description="We couldn't find any RFQs matching your criteria." />
          ) : (
            <DataTable 
              data={rfqs} 
              columns={columns} 
              rowSelection={rowSelection} 
              setRowSelection={setRowSelection} 
            />
          )}
        </section>
      </div>
    </>
  )
}
