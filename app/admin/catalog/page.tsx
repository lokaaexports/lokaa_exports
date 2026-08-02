'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, RefreshCw, Search, Trash2, Save, Eye, Package, Download, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import SectionPage from '@/components/admin/platform/SectionPage'
import { EmptyState } from '@/components/admin/EmptyState'
import { DataTable } from '@/components/admin/DataTable'
import { ColumnDef } from '@tanstack/react-table'

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
  specifications: {} as Record<string, string>,
}

export default function ProductsAdvancedPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const authHeaders = () => {
    return {}
  }

  const selectedCategoryTemplates = useMemo(() => {
    if (!form.categoryId) return templates
    return templates.filter((template) => String(template.categoryId) === String(form.categoryId))
  }, [templates, form.categoryId])

  const load = async () => {
    setLoading(true)
    try {
      const [productResponse, categoryResponse, subcategoryResponse, statsResponse, templatesResponse] = await Promise.all([
        fetch(`/api/admin/catalog/products?${new URLSearchParams({ limit: '100', ...(search ? { search } : {}), ...(status ? { status } : {}) })}`, { headers: authHeaders() }),
        fetch('/api/admin/catalog/categories', { headers: authHeaders() }),
        fetch('/api/admin/catalog/subcategories', { headers: authHeaders() }),
        fetch('/api/admin/catalog/products?action=stats', { headers: authHeaders() }),
        fetch('/api/admin/catalog/templates', { headers: authHeaders() })
      ])
      const [productPayload, categoryPayload, subcategoryPayload, statsPayload, templatesPayload] = await Promise.all([
        productResponse.json(),
        categoryResponse.json(),
        subcategoryResponse.json().catch(() => ({})),
        statsResponse.json().catch(() => ({})),
        templatesResponse.json().catch(() => ({}))
      ])

      if (productResponse.status === 401 || categoryResponse.status === 401) {
        window.location.href = '/admin/login'
        return
      }

      if (!productResponse.ok) throw new Error(productPayload.error || 'Unable to load products')
      setProducts(productPayload.products || productPayload.data || [])
      setCategories(categoryPayload.data || categoryPayload.categories || [])
      setSubcategories(subcategoryPayload.data || subcategoryPayload.subcategories || [])
      setTemplates(templatesPayload.data || templatesPayload.templates || [])
      setStats(statsPayload || {})
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
      setRowSelection({})
    }
  }

  useEffect(() => {
    load()
  }, [status])

  const saveProduct = async () => {
    try {
      setSaving(true)
      const method = form.id ? 'PUT' : 'POST'
      const endpoint = form.id ? `/api/admin/catalog/products?id=${form.id}` : '/api/admin/catalog/products'
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
      if (response.status === 401) {
        window.location.href = '/admin/login'
        return
      }
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save product')
      
      const productId = form.id || payload.id
      if (productId) {
        const specsToSave = Object.keys(form.specifications).map(fieldId => {
          const templateField = selectedCategoryTemplates.find(t => String(t.id) === String(form.templateId))?.fields?.find((f: any) => String(f.id) === String(fieldId))
          return {
            fieldId,
            specName: templateField?.fieldLabel || templateField?.fieldName || 'Spec',
            specValue: form.specifications[fieldId]
          }
        })
        if (specsToSave.length > 0) {
          await Promise.all(specsToSave.map(spec => 
            fetch('/api/admin/catalog/specifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders() },
              body: JSON.stringify({ productId, ...spec })
            })
          ))
        }
      }
      
      toast.success('Product saved')
      setShowForm(false)
      
      // If it's a new product, redirect them to the full editor to manage images/specs
      if (!form.id && payload.id) {
        window.location.href = `/admin/catalog/${payload.id}`
      } else {
        await load()
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      const response = await fetch(`/api/admin/catalog/products?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok || payload.success === false) {
        const errorMsg = payload.errors ? payload.errors.join(', ') : payload.error;
        throw new Error(errorMsg || 'Unable to delete product')
      }
      toast.success('Product deleted')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const publishProduct = async (id) => {
    try {
      const response = await fetch(`/api/admin/catalog/products?id=${id}&action=publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({}),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) {
        const errorMsg = payload.errors ? payload.errors.join(', ') : payload.error;
        throw new Error(errorMsg || 'Unable to publish product')
      }
      toast.success('Product published')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleBulkPublish = async () => {
    const ids = Object.keys(rowSelection).filter(i => rowSelection[i]).map(i => products[parseInt(i)].id)
    if (!ids.length) return
    if (!confirm(`Publish ${ids.length} products?`)) return
    try {
      setLoading(true)
      for (const id of ids) {
        await fetch(`/api/admin/catalog/products?id=${id}&action=publish`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({}),
        })
      }
      toast.success(`Published ${ids.length} products`)
      await load()
    } catch (error: any) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const ids = Object.keys(rowSelection).filter(i => rowSelection[i]).map(i => products[parseInt(i)].id)
    const dataToExport = ids.length ? products.filter(p => ids.includes(p.id)) : products
    if (!dataToExport.length) return toast.error('No products to export')

    const headers = ['ID', 'Name', 'SKU', 'Status', 'HSN Code', 'Featured']
    const csv = [headers, ...dataToExport.map(p => [
      p.id,
      `"${String(p.productName || p.name || '').replace(/"/g, '""')}"`,
      p.slug || '',
      p.status || '',
      p.hsnCode || '',
      p.isFeatured ? 'Yes' : 'No'
    ])].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const editProduct = async (product) => {
    try {
      const response = await fetch(`/api/admin/catalog/products?id=${product.id}`, { headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Failed to fetch product')
      
      const fullProduct = payload.data
      const specs = {} as Record<string, string>
      if (Array.isArray(fullProduct.specifications)) {
        fullProduct.specifications.forEach((s: any) => {
          if (s.fieldId) specs[s.fieldId] = s.specValue
        })
      }

      setForm({
        id: fullProduct.id,
        productName: fullProduct.productName || fullProduct.name || '',
        categoryId: fullProduct.categoryId || '',
        subcategoryId: fullProduct.subcategoryId || '',
        templateId: fullProduct.templateId || '',
        shortDescription: fullProduct.shortDescription || '',
        description: fullProduct.description || '',
        exportDescription: fullProduct.exportDescription || '',
        hsnCode: fullProduct.hsnCode || '',
        productType: fullProduct.productType || '',
        status: fullProduct.status || 'draft',
        isFeatured: Boolean(fullProduct.isFeatured),
        mainImage: fullProduct.mainImage || '',
        specifications: specs,
      })
      setShowForm(true)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

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
      accessorKey: 'productName',
      header: 'Product',
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            {product.mainImage ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-lg shrink-0 border border-slate-200">
                <Image src={product.mainImage} alt={product.productName || product.name || 'Product'} fill className="object-cover" sizes="40px" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shrink-0" />
            )}
            <div>
              <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{product.productName || product.name}</div>
              <div className="text-xs text-slate-500">{product.slug}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className="text-xs uppercase font-medium tracking-wider text-emerald-600 px-2 py-1 bg-emerald-50 border border-emerald-200 dark:border-emerald-800 dark:bg-emerald-900/30 rounded-full">{row.original.status}</span>
      ),
    },
    {
      accessorKey: 'hsnCode',
      header: 'HSN Code',
      cell: ({ row }) => <span className="text-sm">{row.original.hsnCode || '-'}</span>
    },
    {
      accessorKey: 'isFeatured',
      header: 'Featured',
      cell: ({ row }) => row.original.isFeatured ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <span className="text-slate-300">-</span>
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex flex-wrap gap-2">
            <a href={`/admin/catalog/${product.id}`} className="rounded-lg bg-slate-900 border border-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">Manage Product</a>
            <button onClick={() => publishProduct(product.id)} className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-900/30">Publish</button>
            <button onClick={() => deleteProduct(product.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/30"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        )
      },
    },
  ], [])

  return (
    <>
      <SectionPage
        subtitle="PIM"
        title="Product console"
        description="Manage products as structured records with categories, templates, publishing, and lifecycle controls."
        links={[{ href: '/admin/catalog/categories', label: 'Categories' }, { href: '/admin/catalog/templates', label: 'Templates' }, { href: '/admin/media', label: 'Media Library' }]}
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
        <section className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && load()} placeholder="Search products..." className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={() => { setForm(EMPTY_FORM); setShowForm(true) }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            New product
          </button>
        </section>

        {Object.keys(rowSelection).length > 0 && (
          <section className="flex flex-wrap items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300 px-2">{Object.keys(rowSelection).filter(k => rowSelection[k]).length} selected</span>
            <button onClick={handleBulkPublish} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-sm">
              <CheckCircle className="h-3.5 w-3.5" />
              Bulk Publish
            </button>
            <button onClick={handleExportCSV} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-sm">
              <Download className="h-3.5 w-3.5" />
              Export to CSV
            </button>
          </section>
        )}

        {showForm && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Product Name</label>
                <input value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} placeholder="Product name" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Category</label>
                <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value, subcategoryId: '', templateId: '' })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800">
                  <option value="">Select Category</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Subcategory</label>
                <select value={form.subcategoryId} onChange={(event) => setForm({ ...form, subcategoryId: event.target.value, templateId: '' })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800">
                  <option value="">Select Subcategory</option>
                  {subcategories.filter((subCategory) => !form.categoryId || String(subCategory.categoryId) === String(form.categoryId)).map((subCategory) => <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Template</label>
                <select value={form.templateId} onChange={(event) => setForm({ ...form, templateId: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800">
                  <option value="">Select Template</option>
                  {selectedCategoryTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">HSN Code</label>
                <input value={form.hsnCode} onChange={(event) => setForm({ ...form, hsnCode: event.target.value })} placeholder="HSN code" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Product Type</label>
                <input value={form.productType} onChange={(event) => setForm({ ...form, productType: event.target.value })} placeholder="Product type" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div className="space-y-1 xl:col-span-2">
                <label className="text-xs font-medium text-slate-500">Main Image URL</label>
                <input value={form.mainImage} onChange={(event) => setForm({ ...form, mainImage: event.target.value })} placeholder="https://..." className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div className="space-y-1 flex items-center gap-4 mt-6">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured Product</span>
                </label>
              </div>
              <div className="space-y-1 xl:col-span-3">
                <label className="text-xs font-medium text-slate-500">Short Description</label>
                <textarea value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} placeholder="Short summary" rows={2} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div className="space-y-1 xl:col-span-3">
                <label className="text-xs font-medium text-slate-500">Full Description</label>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Detailed description" rows={4} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800" />
              </div>
            </div>

            {selectedCategoryTemplates.find(t => String(t.id) === String(form.templateId))?.fields && (
              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  Technical Specifications
                </h4>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {selectedCategoryTemplates.find(t => String(t.id) === String(form.templateId))?.fields?.map((field: any) => (
                    <div key={field.id} className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">{field.fieldLabel} {field.isRequired && '*'}</label>
                      {field.fieldType === 'TEXTAREA' ? (
                        <textarea 
                          value={form.specifications[field.id] || ''} 
                          onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, [field.id]: e.target.value } })}
                          placeholder={field.placeholder || ''} 
                          required={field.isRequired}
                          rows={2}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800"
                        />
                      ) : field.fieldType === 'DROPDOWN' && field.options ? (
                        <select 
                          value={form.specifications[field.id] || ''} 
                          onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, [field.id]: e.target.value } })}
                          required={field.isRequired}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800"
                        >
                          <option value="">Select option</option>
                          {field.options.split(',').map((opt: string) => opt.trim()).filter(Boolean).map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type={field.fieldType === 'NUMBER' ? 'number' : 'text'}
                          value={form.specifications[field.id] || ''} 
                          onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, [field.id]: e.target.value } })}
                          placeholder={field.placeholder || ''} 
                          required={field.isRequired}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800" 
                        />
                      )}
                      {field.helpText && <p className="text-[10px] text-slate-400">{field.helpText}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
              <button onClick={saveProduct} disabled={saving || !form.productName || !form.categoryId} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Product
              </button>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
            </div>
          </section>
        )}

        <section>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description="We couldn't find any products matching your criteria."
              actionLabel="Add product"
              onAction={() => { setForm(EMPTY_FORM); setShowForm(true) }}
            />
          ) : (
            <DataTable 
              data={products} 
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
