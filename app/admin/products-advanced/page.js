'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, RefreshCw, Search, Trash2, Save, Eye } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const EMPTY_FORM = {
  id: '',
  productName: '',
  categoryId: '',
  subcategoryId: '',
  templateId: '',
  shortDescription: '',
  description: '',
  exportDescription: '',
  hsnCode: '',
  productType: '',
  status: 'draft',
  isFeatured: false,
  mainImage: '',
}

export default function ProductsAdvancedPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [templates, setTemplates] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [stats, setStats] = useState({})
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const selectedCategoryTemplates = useMemo(() => {
    if (!form.categoryId) return templates
    return templates.filter((template) => String(template.categoryId) === String(form.categoryId))
  }, [templates, form.categoryId])

  const loadTemplates = async (categoryId = selectedCategoryId, subcategoryId = selectedSubcategoryId) => {
    if (!categoryId && !subcategoryId) {
      setTemplates([])
      return
    }
    const params = new URLSearchParams()
    if (categoryId) params.set('categoryId', categoryId)
    if (subcategoryId) params.set('subcategoryId', subcategoryId)
    const response = await fetch(`/api/admin/products-advanced/templates?${params.toString()}`, { headers: authHeaders() })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'Unable to load templates')
    setTemplates(payload.data || payload.templates || [])
  }

  const load = async () => {
    setLoading(true)
    try {
      const [productResponse, categoryResponse, subcategoryResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/products-advanced/products?${new URLSearchParams({ limit: '100', ...(search ? { search } : {}), ...(status ? { status } : {}) })}`, { headers: authHeaders() }),
        fetch('/api/admin/products-advanced/categories', { headers: authHeaders() }),
        fetch('/api/admin/products-advanced/subcategories', { headers: authHeaders() }),
        fetch('/api/admin/products-advanced/products?action=stats', { headers: authHeaders() }),
      ])
      const [productPayload, categoryPayload, subcategoryPayload, statsPayload] = await Promise.all([
        productResponse.json(),
        categoryResponse.json(),
        subcategoryResponse.json().catch(() => ({})),
        statsResponse.json().catch(() => ({})),
      ])

      if (!productResponse.ok) throw new Error(productPayload.error || 'Unable to load products')
      setProducts(productPayload.products || productPayload.data || [])
      setCategories(categoryPayload.data || categoryPayload.categories || [])
      setSubcategories(subcategoryPayload.data || subcategoryPayload.subcategories || [])
      setStats(statsPayload || {})
      if (!selectedCategoryId && (categoryPayload.data || categoryPayload.categories || []).length > 0) {
        setSelectedCategoryId((categoryPayload.data || categoryPayload.categories || [])[0].id)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    if (!selectedCategoryId && !selectedSubcategoryId) {
      setTemplates([])
      return
    }
    loadTemplates(selectedCategoryId, selectedSubcategoryId)
      .then(() => {})
      .catch((error) => toast.error(error.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, selectedSubcategoryId])

  const saveProduct = async () => {
    try {
      setSaving(true)
      const method = form.id ? 'PUT' : 'POST'
      const endpoint = form.id ? `/api/admin/products-advanced/products?id=${form.id}` : '/api/admin/products-advanced/products'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          ...form,
          name: form.productName,
          hsn: form.hsnCode,
        }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save product')
      toast.success(form.id ? 'Product updated' : 'Product created')
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      const response = await fetch(`/api/admin/products-advanced/products?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to delete product')
      toast.success('Product deleted')
      await load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const publishProduct = async (id) => {
    try {
      const response = await fetch(`/api/admin/products-advanced/products?id=${id}&action=publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({}),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to publish product')
      toast.success('Product published')
      await load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const editProduct = (product) => {
    setForm({
      id: product.id,
      productName: product.productName || '',
      categoryId: product.categoryId || '',
      subcategoryId: product.subcategoryId || '',
      templateId: product.templateId || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      exportDescription: product.exportDescription || '',
      hsnCode: product.hsnCode || '',
      productType: product.productType || '',
      status: product.status || 'draft',
      isFeatured: Boolean(product.isFeatured),
      mainImage: product.mainImage || '',
    })
    setShowForm(true)
  }

  return (
    <>
      <SectionPage
        subtitle="PIM"
        title="Product console"
        description="Manage products as structured records with categories, templates, publishing, and lifecycle controls."
        links={[{ href: '/admin/products-advanced/categories', label: 'Categories' }, { href: '/admin/products-advanced/templates', label: 'Templates' }, { href: '/admin/media', label: 'Media Library' }]}
        stats={[
          { label: 'Products', value: stats.total || products.length || 0 },
          { label: 'Published', value: stats.published || 0 },
          { label: 'Draft', value: stats.draft || 0 },
          { label: 'Low stock', value: stats.lowStock || 0 },
        ]}
        highlights={[
          { title: 'Lifecycle aware', description: 'Draft, publish, and archive product states.' },
          { title: 'Template driven', description: 'Attach a template per category/subcategory.' },
          { title: 'Operational fields', description: 'HSN, export info, imagery, and featured flags.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <section className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && load()} placeholder="Search products..." className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={() => { setForm(EMPTY_FORM); setShowForm(true) }} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            New product
          </button>
        </section>

        {showForm && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <input value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} placeholder="Product name" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value, subcategoryId: '', templateId: '' })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                <option value="">Category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <select value={form.subcategoryId} onChange={(event) => setForm({ ...form, subcategoryId: event.target.value, templateId: '' })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                <option value="">Subcategory</option>
                {subcategories.filter((subCategory) => !form.categoryId || String(subCategory.categoryId) === String(form.categoryId)).map((subCategory) => <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>)}
              </select>
              <select value={form.templateId} onChange={(event) => setForm({ ...form, templateId: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                <option value="">Template</option>
                {selectedCategoryTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </select>
              <input value={form.hsnCode} onChange={(event) => setForm({ ...form, hsnCode: event.target.value })} placeholder="HSN code" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <input value={form.productType} onChange={(event) => setForm({ ...form, productType: event.target.value })} placeholder="Product type" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <input value={form.mainImage} onChange={(event) => setForm({ ...form, mainImage: event.target.value })} placeholder="Main image URL" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
                <input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} />
                Featured
              </label>
              <textarea value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} placeholder="Short description" rows={3} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700 xl:col-span-3" />
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" rows={4} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700 xl:col-span-3" />
              <textarea value={form.exportDescription} onChange={(event) => setForm({ ...form, exportDescription: event.target.value })} placeholder="Export description" rows={3} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700 xl:col-span-3" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={saveProduct} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save product
              </button>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Cancel
              </button>
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">No products found.</div>
          ) : products.map((product) => (
            <article key={product.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">{product.status}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{product.productName || product.name}</h3>
                  <p className="text-sm text-slate-500">{product.slug}</p>
                </div>
                {product.mainImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.mainImage} alt={product.productName || product.name} className="h-14 w-14 rounded-2xl object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                )}
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{product.shortDescription || product.description || 'No description provided.'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`/admin/products-advanced/${product.id}`} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                  Details
                </a>
                <button onClick={() => editProduct(product)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Edit</button>
                <button onClick={() => publishProduct(product.id)} className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900">Publish</button>
                <button onClick={() => deleteProduct(product.id)} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900">Delete</button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  )
}
