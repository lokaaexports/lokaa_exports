'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, Users } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const EMPTY_FORM = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  country: '',
  businessType: 'buyer',
  status: 'active',
}

export default function BuyerPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [buyers, setBuyers] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [form, setForm] = useState(EMPTY_FORM)

  const load = async () => {
    setLoading(true)
    try {
      const [buyersResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/customers?limit=100'),
        fetch('/api/admin/customers?action=stats'),
      ])
      const [buyersPayload, statsPayload] = await Promise.all([buyersResponse.json(), statsResponse.json()])
      if (!buyersResponse.ok) throw new Error(buyersPayload.error || 'Unable to load buyers')
      if (!statsResponse.ok) throw new Error(statsPayload.error || 'Unable to load buyer stats')
      setBuyers((buyersPayload.data || buyersPayload.items || []).filter((customer) => (customer.businessType || '').toLowerCase() === 'buyer' || (customer.companyName || '').toLowerCase().includes('buyer')))
      setStats(statsPayload.data || statsPayload)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const saveBuyer = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to create buyer')
      setForm(EMPTY_FORM)
      toast.success('Buyer saved')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SectionPage
        subtitle="Buyer portal"
        title="Buyer accounts"
        description="Create and manage buyer-side customer records, with live stats and direct links into orders and RFQs."
        links={[{ href: '/admin/customers', label: 'Open CRM customers' }, { href: '/admin/orders', label: 'Open orders' }]}
        stats={[
          { label: 'Buyers', value: buyers.length },
          { label: 'Total customers', value: stats.total || stats.customerCount || 0 },
          { label: 'Orders', value: stats.orders || 0 },
          { label: 'RFQs', value: stats.rfqs || 0 },
        ]}
        highlights={[
          { title: 'Buyer records', description: 'Stores buyer-side account details in the customer model.' },
          { title: 'Order visibility', description: 'Use this as the front door to buyer operations.' },
          { title: 'RFQ intake', description: 'Tie buyer accounts to requests and commercial activity.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} placeholder="Buyer company name" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <input value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} placeholder="Contact name" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Country" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <input value={form.businessType} onChange={(event) => setForm({ ...form, businessType: event.target.value })} placeholder="buyer" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <input value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} placeholder="active" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
            <button onClick={saveBuyer} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save buyer
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Loading buyers...</div>
          ) : buyers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">No buyer accounts found.</div>
          ) : buyers.map((buyer) => (
            <article key={buyer.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{buyer.companyName}</h3>
                  <p className="text-sm text-slate-500">{buyer.email}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{buyer.status || 'active'}</span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <p>{buyer.contactName || 'No contact'}</p>
                <p>{buyer.phone || 'No phone'}</p>
                <p>{buyer.country || 'No country'}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  )
}
