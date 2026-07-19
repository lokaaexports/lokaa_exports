'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const FIELD_TYPES = ['TEXT', 'NUMBER', 'TEXTAREA', 'DROPDOWN', 'MULTI_SELECT', 'DATE', 'BOOLEAN', 'RICH_TEXT', 'IMAGE']

const EMPTY_TEMPLATE = {
  id: '',
  name: '',
  slug: '',
  categoryId: '',
  subcategoryId: '',
  description: '',
  isActive: true,
}

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [templates, setTemplates] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('')
  const [templateForm, setTemplateForm] = useState(EMPTY_TEMPLATE)
  const [fieldForm, setFieldForm] = useState({ fieldName: '', fieldLabel: '', fieldType: 'TEXT', isRequired: false, displayOrder: 0, placeholder: '', helpText: '' })

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const selectedSubcategories = useMemo(
    () => subcategories.filter((subcategory) => !selectedCategoryId || String(subcategory.categoryId) === String(selectedCategoryId)),
    [subcategories, selectedCategoryId],
  )

  const loadCategories = async () => {
    const response = await fetch('/api/admin/products-advanced/categories', { headers: authHeaders() })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'Unable to load categories')
    setCategories(payload.data || payload.categories || [])
  }

  const loadSubcategories = async () => {
    const response = await fetch('/api/admin/products-advanced/subcategories', { headers: authHeaders() })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'Unable to load subcategories')
    setSubcategories(payload.data || payload.subcategories || [])
  }

  const loadTemplates = async (categoryId, subcategoryId) => {
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

  const loadAll = async () => {
    setLoading(true)
    try {
      await Promise.all([loadCategories(), loadSubcategories()])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (selectedCategoryId || selectedSubcategoryId) {
      loadTemplates(selectedCategoryId, selectedSubcategoryId).catch((error) => toast.error(error.message))
    } else {
      setTemplates([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, selectedSubcategoryId])

  const saveTemplate = async () => {
    try {
      setSaving(true)
      const method = templateForm.id ? 'PUT' : 'POST'
      const endpoint = templateForm.id ? `/api/admin/products-advanced/templates?id=${templateForm.id}` : '/api/admin/products-advanced/templates'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(templateForm),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save template')
      toast.success(templateForm.id ? 'Template updated' : 'Template created')
      setTemplateForm(EMPTY_TEMPLATE)
      await loadTemplates(selectedCategoryId, selectedSubcategoryId)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteTemplate = async (id) => {
    if (!confirm('Delete this template?')) return
    try {
      const response = await fetch(`/api/admin/products-advanced/templates?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to delete template')
      toast.success('Template deleted')
      await loadTemplates(selectedCategoryId, selectedSubcategoryId)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const addField = () => {
    if (!fieldForm.fieldName.trim() || !fieldForm.fieldLabel.trim()) {
      toast.error('Field name and label are required')
      return
    }
    setTemplateForm((current) => ({
      ...current,
      fields: [...(current.fields || []), { ...fieldForm, id: crypto.randomUUID?.() || String(Date.now()) }],
    }))
    setFieldForm({ fieldName: '', fieldLabel: '', fieldType: 'TEXT', isRequired: false, displayOrder: 0, placeholder: '', helpText: '' })
  }

  const removeField = (fieldId) => {
    setTemplateForm((current) => ({ ...current, fields: (current.fields || []).filter((field) => field.id !== fieldId) }))
  }

  const editTemplate = (template) => {
    setTemplateForm({
      id: template.id,
      name: template.name || '',
      slug: template.slug || '',
      categoryId: template.categoryId || '',
      subcategoryId: template.subcategoryId || '',
      description: template.description || '',
      isActive: template.isActive ?? true,
      fields: template.fields || [],
    })
    setSelectedCategoryId(template.categoryId || '')
    setSelectedSubcategoryId(template.subcategoryId || '')
  }

  return (
    <>
      <SectionPage
        subtitle="PIM"
        title="Product templates"
        description="Manage dynamic schemas for product capture with fields, categories, and subcategories."
        links={[{ href: '/admin/products-advanced', label: 'Products' }, { href: '/admin/products-advanced/categories', label: 'Categories' }]}
        stats={[
          { label: 'Templates', value: templates.length },
          { label: 'Categories', value: categories.length },
          { label: 'Subcategories', value: subcategories.length },
          { label: 'Fields', value: templates.reduce((count, template) => count + (template.fields?.length || 0), 0) },
        ]}
        highlights={[
          { title: 'Schema control', description: 'Templates define the fields needed for each product family.' },
          { title: 'Category aware', description: 'Templates are filtered by category and subcategory.' },
          { title: 'Editable fields', description: 'Add and remove fields before saving the template.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <section className="flex flex-wrap items-center gap-3">
          <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
            <option value="">Select category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <select value={selectedSubcategoryId} onChange={(event) => setSelectedSubcategoryId(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
            <option value="">All subcategories</option>
            {selectedSubcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>)}
          </select>
          <button onClick={() => loadTemplates(selectedCategoryId, selectedSubcategoryId).catch((error) => toast.error(error.message))} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={() => setTemplateForm(EMPTY_TEMPLATE)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            New template
          </button>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{templateForm.id ? 'Edit template' : 'Create template'}</h2>
            <div className="mt-4 space-y-3">
              <input value={templateForm.name} onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value, slug: templateForm.slug || event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} placeholder="Template name" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <input value={templateForm.slug} onChange={(event) => setTemplateForm({ ...templateForm, slug: event.target.value })} placeholder="slug" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <div className="grid gap-3 md:grid-cols-2">
                <select value={templateForm.categoryId} onChange={(event) => setTemplateForm({ ...templateForm, categoryId: event.target.value, subcategoryId: '' })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                  <option value="">Category</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                <select value={templateForm.subcategoryId} onChange={(event) => setTemplateForm({ ...templateForm, subcategoryId: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                  <option value="">Subcategory</option>
                  {selectedSubcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>)}
                </select>
              </div>
              <textarea value={templateForm.description} onChange={(event) => setTemplateForm({ ...templateForm, description: event.target.value })} placeholder="Description" rows={3} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
                <input type="checkbox" checked={templateForm.isActive} onChange={(event) => setTemplateForm({ ...templateForm, isActive: event.target.checked })} />
                Active
              </label>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="font-medium text-slate-900 dark:text-white">Template fields</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input value={fieldForm.fieldName} onChange={(event) => setFieldForm({ ...fieldForm, fieldName: event.target.value })} placeholder="Field name" className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700" />
                  <input value={fieldForm.fieldLabel} onChange={(event) => setFieldForm({ ...fieldForm, fieldLabel: event.target.value })} placeholder="Field label" className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700" />
                  <select value={fieldForm.fieldType} onChange={(event) => setFieldForm({ ...fieldForm, fieldType: event.target.value })} className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700">
                    {FIELD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <input type="number" value={fieldForm.displayOrder} onChange={(event) => setFieldForm({ ...fieldForm, displayOrder: Number(event.target.value) })} placeholder="Order" className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700" />
                  <input value={fieldForm.placeholder} onChange={(event) => setFieldForm({ ...fieldForm, placeholder: event.target.value })} placeholder="Placeholder" className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700 md:col-span-2" />
                  <textarea value={fieldForm.helpText} onChange={(event) => setFieldForm({ ...fieldForm, helpText: event.target.value })} placeholder="Help text" rows={2} className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700 md:col-span-2" />
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <input type="checkbox" checked={fieldForm.isRequired} onChange={(event) => setFieldForm({ ...fieldForm, isRequired: event.target.checked })} />
                    Required
                  </label>
                  <button onClick={addField} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200 md:col-span-2">
                    <Plus className="h-4 w-4" />
                    Add field
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {(templateForm.fields || []).map((field) => (
                    <div key={field.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{field.fieldLabel || field.fieldName}</p>
                        <p className="text-xs text-slate-500">{field.fieldType} {field.isRequired ? '• required' : ''}</p>
                      </div>
                      <button onClick={() => removeField(field.id)} className="rounded-lg p-2 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={saveTemplate} disabled={saving || !templateForm.categoryId || !templateForm.name} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save template
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Loading templates...</div>
            ) : templates.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">No templates found.</div>
            ) : templates.map((template) => (
              <article key={template.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">{template.isActive ? 'Active' : 'Inactive'}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{template.name}</h3>
                    <p className="text-sm text-slate-500">{template.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editTemplate(template)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Edit</button>
                    <button onClick={() => deleteTemplate(template.id)} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900">Delete</button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{template.description || 'No description provided.'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(template.fields || []).map((field) => (
                    <span key={field.id || field.fieldName} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{field.fieldLabel || field.fieldName}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
