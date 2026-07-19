'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Factory, Loader2, Plus, Truck } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const EMPTY_FORM = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  country: '',
  businessType: 'supplier',
  status: 'active',
}

export default function SuppliersPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/customers?limit=200')
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load suppliers')
      const records = payload.data || payload.items || []
      setSuppliers(records.filter((customer) => {
        const type = String(customer.businessType || '').toLowerCase()
        const company = String(customer.companyName || '').toLowerCase()
        return ['supplier', 'manufacturer', 'factory', 'vendor'].includes(type) || company.includes('supplier') || company.includes('factory')
      }))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const saveSupplier = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to create supplier')
      setForm(EMPTY_FORM)
      toast.success('Supplier saved')
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SectionPage
        subtitle="Supplier portal"
        title="Supplier and factory directory"
        description="Manage supplier, manufacturer, and factory records on the same customer model, so operations can attach documents, contracts, and payments later."
        links={[{ href: '/admin/customers', label: 'Open CRM customers' }, { href: '/admin/platform', label: 'Platform' }]}
        stats={[
          { label: 'Suppliers', value: suppliers.length },
          { label: 'Active', value: suppliers.filter((supplier) => supplier.status === 'active').length },
          { label: 'Types', value: 'Supplier / Factory / Manufacturer' },
          { label: 'Storage', value: 'Customer model' },
        ]}
        highlights={[
          { title: 'Unified partner records', description: 'Suppliers live in the same relational system as customers.' },
          { title: 'Operational document base', description: 'Use this directory as the base for contracts and payment tracking.' },
          { title: 'Reusable directory', description: 'The data can feed export, notifications, and analytics later.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} placeholder="Supplier company name" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <input value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} placeholder="Contact name" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Country" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <input value={form.businessType} onChange={(event) => setForm({ ...form, businessType: event.target.value })} placeholder="supplier" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <input value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} placeholder="active" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <button onClick={saveSupplier} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save supplier
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Loading suppliers...</div>
          ) : suppliers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">No supplier records found.</div>
          ) : suppliers.map((supplier) => (
            <article key={supplier.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {String(supplier.businessType || '').toLowerCase() === 'factory' ? <Factory className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{supplier.companyName}</h3>
                  <p className="text-sm text-slate-500">{supplier.email}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{supplier.businessType || 'supplier'}</span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <p>{supplier.contactName || 'No contact'}</p>
                <p>{supplier.phone || 'No phone'}</p>
                <p>{supplier.country || 'No country'}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  )
}
