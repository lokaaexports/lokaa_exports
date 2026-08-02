'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function AdminProductsClient() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/catalog')
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (slug) => {
    if (!confirm('Delete this product? This action cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Delete failed')
      setProducts((prev) => prev.filter((p) => p.slug !== slug))
      toast.success('Product deleted successfully')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Delete failed')
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">Product management</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Products</h1>
            <p className="mt-2 text-slate-400">Browse and manage your export catalog from MySQL.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">Open catalog editor</Link>
            <Link href="/admin" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-white hover:border-emerald-400">New product</Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-lg">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr key="loading-state"><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading products…</td></tr>
              ) : products.length === 0 ? (
                <tr key="empty-state"><td colSpan={5} className="px-6 py-10 text-center text-slate-500">No products found.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-950/70">
                    <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                    <td className="px-6 py-4">{product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}</td>
                    <td className="px-6 py-4 capitalize">{product.status}</td>
                    <td className="px-6 py-4">{new Date(product.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-emerald-400">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                        <button onClick={() => handleDelete(product.slug)} className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 px-3 py-2 text-xs text-rose-300">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
