'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const EMPTY_FORM = { id: '', name: '', slug: '', description: '', status: 'published' }

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/products-advanced/categories', { headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load categories')
      setCategories(payload.data || payload.categories || [])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const saveCategory = async () => {
    try {
      setSaving(true)
      const method = form.id ? 'PUT' : 'POST'
      const endpoint = form.id ? `/api/admin/products-advanced/categories?id=${form.id}` : '/api/admin/products-advanced/categories'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          ...form,
          slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save category')
      toast.success(form.id ? 'Category updated' : 'Category created')
      setForm(EMPTY_FORM)
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      const response = await fetch(`/api/admin/products-advanced/categories?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to delete category')
      toast.success('Category deleted')
      await load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const editCategory = (category) => {
    setForm({
      id: category.id,
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      status: category.status || 'published',
    })
  }

  return (
    <>
      <SectionPage
        subtitle="PIM"
        title="Product categories"
        description="Manage taxonomy and top-level catalog grouping with full create, update, and delete actions."
        links={[{ href: '/admin/products-advanced', label: 'Products' }, { href: '/admin/products-advanced/templates', label: 'Templates' }]}
        stats={[
          { label: 'Categories', value: categories.length },
          { label: 'Published', value: categories.filter((category) => category.status === 'published').length },
          { label: 'Draft', value: categories.filter((category) => category.status !== 'published').length },
          { label: 'Root taxonomy', value: 'Yes' },
        ]}
        highlights={[
          { title: 'Hierarchy ready', description: 'Categories can later be extended into deeper navigation trees.' },
          { title: 'SEO fields', description: 'Slug and description feed the catalog and search layer.' },
          { title: 'Editable records', description: 'Update a category without deleting and recreating it.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <div className="flex items-center justify-end gap-3">
          <button onClick={load} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={() => setForm(EMPTY_FORM)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            New category
          </button>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{form.id ? 'Edit category' : 'Create category'}</h2>
            <div className="mt-4 space-y-3">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: form.slug || event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} placeholder="Category name" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="slug" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" rows={4} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <div className="flex gap-3">
                <button onClick={saveCategory} disabled={saving || !form.name} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save category
                </button>
                <button onClick={() => setForm(EMPTY_FORM)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">No categories found.</div>
            ) : categories.map((category) => (
              <article key={category.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">{category.status || 'published'}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-slate-500">{category.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editCategory(category)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Edit</button>
                    <button onClick={() => deleteCategory(category.id)} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{category.description || 'No description provided.'}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
