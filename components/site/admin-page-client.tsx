'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus, Save, Trash2, Loader2, Boxes, ClipboardList, Users, TrendingUp, LayoutGrid, Search, Sparkles, ShieldCheck, ChevronRight, PanelsTopLeft, Briefcase, Globe2 } from 'lucide-react'

const slugify = (value = '') => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function AdminPageClient() {
  const [catalog, setCatalog] = useState({ categories: [], subcategories: [], attributes: [], packagingTypes: [], exportCountries: [], products: [] })
  const [overviewStats, setOverviewStats] = useState({ categoryCount: 0, productCount: 0, rfqCount: 0, customerCount: 0, openRfqs: 0, pendingQuotes: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [activeItem, setActiveItem] = useState(null)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadingField, setUploadingField] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/catalog').then((res) => res.json()),
      fetch('/api/admin/stats').then((res) => res.json()),
    ])
      .then(([catalogData, statsData]) => {
        setCatalog({
          categories: Array.isArray(catalogData.categories) ? catalogData.categories : [],
          subcategories: Array.isArray(catalogData.subcategories) ? catalogData.subcategories : [],
          attributes: Array.isArray(catalogData.attributes) ? catalogData.attributes : [],
          packagingTypes: Array.isArray(catalogData.packagingTypes) ? catalogData.packagingTypes : [],
          exportCountries: Array.isArray(catalogData.exportCountries) ? catalogData.exportCountries : [],
          products: Array.isArray(catalogData.products) ? catalogData.products : [],
        })
        setOverviewStats({
          categoryCount: Number(statsData.categoryCount || catalogData.categories?.length || 0),
          productCount: Number(statsData.productCount || catalogData.products?.length || 0),
          rfqCount: Number(statsData.rfqCount || 0),
          customerCount: Number(statsData.customerCount || 0),
          openRfqs: Number(statsData.openRfqs || 0),
          pendingQuotes: Number(statsData.pendingQuotes || 0),
          revenue: Number(statsData.revenue || 0),
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const saveCatalog = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catalog),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Unable to save catalog')
      }
      setMessage('✓ All changes saved successfully')
      toast.success('Catalog saved')
    } catch (error: any) {
      setMessage('✗ ' + (error.message || 'Save failed'))
      toast.error(error.message)
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (entityKey, entityId, fieldName, entityType) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      setUploadingField(`${entityKey}:${fieldName}`)
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', entityType)
      formData.append('entityType', entityKey)
      try {
        const response = await fetch('/api/uploads', { method: 'POST', body: formData })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Upload failed')
        updateEntity(entityKey, entityId, { [fieldName]: payload.url })
        if (entityKey === 'categories') {
          setCatalog((prev) => ({ ...prev, categories: prev.categories.map((item) => item.id === entityId || item.slug === entityId ? { ...item, [fieldName]: payload.url, image: payload.url, bannerImage: payload.url } : item) }))
        }
        if (entityKey === 'subcategories') {
          setCatalog((prev) => ({ ...prev, subcategories: prev.subcategories.map((item) => item.id === entityId || item.slug === entityId ? { ...item, [fieldName]: payload.url, image: payload.url, bannerImage: payload.url } : item) }))
        }
        if (entityKey === 'products') {
          setCatalog((prev) => ({ ...prev, products: prev.products.map((item) => item.id === entityId || item.slug === entityId ? { ...item, [fieldName]: payload.url, hero: payload.url } : item) }))
        }
        toast.success('Image uploaded')
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setUploadingField(null)
      }
    }
    input.click()
  }

  const updateEntity = (entityKey, id, updates) => {
    const normalizedId = id == null ? '' : String(id)
    setCatalog((prev) => ({
      ...prev,
      [entityKey]: prev[entityKey].map((item) => {
        const itemId = item.id == null ? '' : String(item.id)
        const itemSlug = item.slug == null ? '' : String(item.slug)
        return itemId === normalizedId || itemSlug === normalizedId ? { ...item, ...updates } : item
      }),
    }))
  }

  const addEntity = (entityKey, defaults) => {
    const slug = defaults?.slug || `new-${entityKey}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const withId = {
      ...defaults,
      id: defaults?.id || `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      slug,
    }
    setCatalog((prev) => ({
      ...prev,
      [entityKey]: [withId, ...prev[entityKey]],
    }))
    return withId
  }

  const removeEntity = (entityKey, id) => {
    if (!confirm('Delete this item? This cannot be undone.')) return
    const normalizedId = id == null ? '' : String(id)
    setCatalog((prev) => ({
      ...prev,
      [entityKey]: prev[entityKey].filter((item) => {
        const itemId = item.id == null ? '' : String(item.id)
        const itemSlug = item.slug == null ? '' : String(item.slug)
        return itemId !== normalizedId && itemSlug !== normalizedId
      }),
    }))
    setActiveItem(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_34%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-slate-300">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-8 py-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            <span>Loading enterprise admin workspace…</span>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', count: overviewStats.rfqCount || 0 },
    { id: 'products', label: 'Products', count: catalog.products?.length || 0 },
    { id: 'categories', label: 'Categories', count: catalog.categories?.length || 0 },
    { id: 'subcategories', label: 'Subcategories', count: catalog.subcategories?.length || 0 },
    { id: 'attributes', label: 'Attributes', count: catalog.attributes?.length || 0 },
    { id: 'packaging', label: 'Packaging', count: catalog.packagingTypes?.length || 0 },
    { id: 'countries', label: 'Countries', count: catalog.exportCountries?.length || 0 },
    { id: 'customers', label: 'Customers', count: overviewStats.customerCount || 0 },
    { id: 'rfqs', label: 'RFQs', count: overviewStats.rfqCount || 0 },
  ]

  const filteredTabs = tabs.filter((tab) => !searchTerm || tab.label.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 lg:px-6 lg:py-6">
        <header className="overflow-hidden rounded-[30px] border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="border-b border-white/10 px-6 py-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-emerald-300">
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5" /> Enterprise admin workspace
                  </div>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Catalog, customer and operations control center</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">A scalable, professional management console for products, categories, subcategories, attributes, markets and commercial workflows.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300 shadow-sm shadow-black/15">
                  <Search className="h-4 w-4 text-emerald-300" />
                  <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search modules" className="w-36 bg-transparent outline-none placeholder:text-slate-500" />
                </label>
                <Link href="/products" className="rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40 hover:text-white">View storefront</Link>
                <button onClick={saveCatalog} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save changes
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 px-6 py-5 lg:grid-cols-3 lg:px-8">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/85 to-slate-900/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Live workspace</p>
                  <p className="mt-2 text-lg font-semibold text-white">{catalog.products?.length || 0} active products</p>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 p-2.5 text-emerald-300">
                  <Boxes className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/85 to-slate-900/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Commercial flow</p>
                  <p className="mt-2 text-lg font-semibold text-white">{overviewStats.rfqCount || 0} RFQs in queue</p>
                </div>
                <div className="rounded-2xl bg-sky-500/10 p-2.5 text-sky-300">
                  <Briefcase className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/85 to-slate-900/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Global reach</p>
                  <p className="mt-2 text-lg font-semibold text-white">{catalog.exportCountries?.length || 0} export markets</p>
                </div>
                <div className="rounded-2xl bg-violet-500/10 p-2.5 text-violet-300">
                  <Globe2 className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {message && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 shadow-lg shadow-emerald-900/10">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-3">
              <div className="rounded-xl bg-slate-700/80 p-2 text-emerald-300">
                <PanelsTopLeft className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Modules</p>
                <p className="text-sm font-semibold text-white">Admin navigation</p>
              </div>
            </div>
            <nav className="mt-4 space-y-2">
              {filteredTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setActiveItem(null)
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-emerald-500/15 text-white shadow-inner shadow-emerald-900/20'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] ${activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4" /> Governance ready
              </div>
              <p className="mt-2 text-xs leading-6 text-emerald-100/80">The workspace is designed to scale from catalog maintenance to enterprise-grade operations without changing the core experience.</p>
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            {activeTab === 'overview' && <OverviewTab stats={overviewStats} />}
            {activeTab === 'products' && <ProductsTab catalog={catalog} updateEntity={updateEntity} addEntity={addEntity} activeItem={activeItem} setActiveItem={setActiveItem} />}
            {activeTab === 'categories' && <CategoriesTab catalog={catalog} updateEntity={updateEntity} addEntity={addEntity} removeEntity={removeEntity} activeItem={activeItem} setActiveItem={setActiveItem} />}
            {activeTab === 'subcategories' && <SubcategoriesTab catalog={catalog} updateEntity={updateEntity} addEntity={addEntity} removeEntity={removeEntity} activeItem={activeItem} setActiveItem={setActiveItem} />}
            {activeTab === 'attributes' && <AttributesTab catalog={catalog} updateEntity={updateEntity} addEntity={addEntity} removeEntity={removeEntity} activeItem={activeItem} setActiveItem={setActiveItem} />}
            {activeTab === 'packaging' && <PackagingTab catalog={catalog} updateEntity={updateEntity} addEntity={addEntity} removeEntity={removeEntity} activeItem={activeItem} setActiveItem={setActiveItem} />}
            {activeTab === 'countries' && <CountriesTab catalog={catalog} updateEntity={updateEntity} addEntity={addEntity} removeEntity={removeEntity} activeItem={activeItem} setActiveItem={setActiveItem} />}
            {activeTab === 'customers' && <CustomersTab />}
            {activeTab === 'rfqs' && <RfqsTab />}
          </section>
        </div>
      </div>
    </main>
  )
}

function OverviewTab({ stats }: any) {
  const cards = [
    { title: 'Products', value: stats.productCount, icon: Boxes, accent: 'from-emerald-500/20 to-emerald-400/5' },
    { title: 'Categories', value: stats.categoryCount, icon: Boxes, accent: 'from-sky-500/20 to-sky-400/5' },
    { title: 'RFQs', value: stats.rfqCount, icon: ClipboardList, accent: 'from-violet-500/20 to-violet-400/5' },
    { title: 'Customers', value: stats.customerCount, icon: Users, accent: 'from-amber-500/20 to-amber-400/5' },
    { title: 'Open RFQs', value: stats.openRfqs, icon: ClipboardList, accent: 'from-rose-500/20 to-rose-400/5' },
    { title: 'Pending Quotations', value: stats.pendingQuotes, icon: TrendingUp, accent: 'from-cyan-500/20 to-cyan-400/5' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.accent} p-5 shadow-lg shadow-black/15`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{card.title}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-2.5 text-emerald-300">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/90 p-6 shadow-xl shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" /> Operational readiness
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">A flexible foundation for growth</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">This workspace is structured to keep catalog management, commercial oversight and scalable content operations aligned in one highly usable experience.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
            <ChevronRight className="h-4 w-4 text-emerald-300" />
            Ready for enterprise expansion
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomersTab() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-lg font-semibold text-white">Customer management</h3>
      <p className="mt-2 text-sm text-slate-400">Customer records can be expanded with company details, buyer contacts, country, GST/VAT, purchase history and notes from the database layer.</p>
    </div>
  )
}

function RfqsTab() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-lg font-semibold text-white">RFQ management</h3>
      <p className="mt-2 text-sm text-slate-400">Incoming quote requests can be reviewed with full buyer information, product details, quantities, target pricing, destination, shipment terms and workflow history.</p>
    </div>
  )
}

function ProductsTab({ catalog, updateEntity, addEntity, activeItem, setActiveItem }: any) {
  const categories = catalog.categories || []
  const subcategories = catalog.subcategories || []
  const [uploadingField, setUploadingField] = useState(null)

  const handleFieldChange = (field, value) => {
    setActiveItem((prev) => {
      const next = prev ? { ...prev, [field]: value } : prev
      if (next?.id) {
        updateEntity('products', next.id, { [field]: value })
      } else if (next?.slug) {
        updateEntity('products', next.slug, { [field]: value })
      }
      return next
    })
  }

  const handleListFieldChange = (field, value) => {
    const parsed = String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    handleFieldChange(field, parsed)
  }

  const handleImageUpload = async (fieldName, entityType) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      setUploadingField(fieldName)
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', entityType)
      formData.append('entityType', 'products')
      try {
        const response = await fetch('/api/uploads', { method: 'POST', body: formData })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Upload failed')
        if (activeItem?.id) {
          updateEntity('products', activeItem.id, { [fieldName]: payload.url })
        } else if (activeItem?.slug) {
          updateEntity('products', activeItem.slug, { [fieldName]: payload.url })
        }
        setActiveItem((prev) => prev ? { ...prev, [fieldName]: payload.url } : prev)
        toast.success('Image uploaded')
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setUploadingField(null)
      }
    }
    input.click()
  }

  const relatedSubcategories = activeItem?.category
    ? subcategories.filter((subcategory) => {
        const categoryValue = subcategory.parentCategory || subcategory.category || subcategory.categorySlug || subcategory.categoryId
        return categoryValue === activeItem.category
      })
    : subcategories

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 h-fit">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Products</h3>
          <button
            onClick={() => {
              const created = addEntity('products', {
                slug: '',
                name: '',
                category: '',
                subcategory: '',
                tagline: '',
                shortDescription: '',
                hero: '',
                gallery: [],
                availability: 'year-round',
                exportCountries: [],
                packaging: [],
                certifications: [],
                moq: '',
                hsCode: '',
                origin: '',
                status: 'published',
                featured: false,
              })
              setActiveItem(created)
            }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {(catalog.products || []).map((product) => (
            <button
              key={product.slug}
              onClick={() => setActiveItem(product)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition truncate ${
                activeItem?.slug === product.slug
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {product.name || 'Untitled'}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        {activeItem ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
              <input value={activeItem.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                <select
                  value={activeItem.category || ''}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id || category.slug} value={category.slug || category.name}>
                      {category.name || category.slug}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Subcategory</label>
                <select
                  value={activeItem.subcategory || ''}
                  onChange={(e) => handleFieldChange('subcategory', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="">Select subcategory</option>
                  {relatedSubcategories.map((subcategory) => (
                    <option key={subcategory.id || subcategory.slug} value={subcategory.slug || subcategory.name}>
                      {subcategory.name || subcategory.slug}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Hero image</label>
                <div className="flex gap-2">
                  <input value={activeItem.hero || ''} onChange={(e) => handleFieldChange('hero', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="https://..." />
                  <button type="button" onClick={() => handleImageUpload('hero', 'products')} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 disabled:opacity-60" disabled={uploadingField === 'hero'}>{uploadingField === 'hero' ? '…' : 'Upload'}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Gallery images</label>
                <input value={(activeItem.gallery || []).join(', ')} onChange={(e) => handleFieldChange('gallery', String(e.target.value).split(',').map((item) => item.trim()).filter(Boolean))} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="https://..., https://..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Short description</label>
              <textarea value={activeItem.shortDescription || ''} onChange={(e) => handleFieldChange('shortDescription', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 min-h-24 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Tagline</label>
              <textarea value={activeItem.tagline || ''} onChange={(e) => handleFieldChange('tagline', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 min-h-24 text-white" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Availability</label>
                <select value={activeItem.availability || 'year-round'} onChange={(e) => handleFieldChange('availability', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
                  <option value="seasonal">Seasonal</option>
                  <option value="year-round">Year-round</option>
                  <option value="coming-soon">Coming soon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                <select value={activeItem.status || 'published'} onChange={(e) => handleFieldChange('status', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Export countries</label>
                <input value={(activeItem.exportCountries || []).join(', ')} onChange={(e) => handleListFieldChange('exportCountries', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="UAE, Germany, Singapore" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Packaging</label>
                <input value={(activeItem.packaging || []).join(', ')} onChange={(e) => handleListFieldChange('packaging', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Carton trays, Export crates" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">MOQ</label>
                <input value={activeItem.moq || ''} onChange={(e) => handleFieldChange('moq', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Origin</label>
                <input value={activeItem.origin || ''} onChange={(e) => handleFieldChange('origin', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">HS Code</label>
                <input value={activeItem.hsCode || ''} onChange={(e) => handleFieldChange('hsCode', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Certifications</label>
                <input value={(activeItem.certifications || []).join(', ')} onChange={(e) => handleListFieldChange('certifications', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Organic, FSSAI, APEDA" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">SEO Title</label>
              <input value={activeItem.seoTitle || ''} onChange={(e) => handleFieldChange('seoTitle', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">SEO Description</label>
              <textarea value={activeItem.seoDescription || ''} onChange={(e) => handleFieldChange('seoDescription', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 min-h-24 text-white" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300">
                <input type="checkbox" checked={Boolean(activeItem.featured)} onChange={(e) => handleFieldChange('featured', e.target.checked)} />
                Featured
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300">
                <input type="checkbox" checked={Boolean(activeItem.exportReady)} onChange={(e) => handleFieldChange('exportReady', e.target.checked)} />
                Export ready
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-4 bg-slate-800 p-3 rounded-lg">Products created here will automatically appear on the public category and product pages after you save.</p>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">Select a product to view details</div>
        )}
      </div>
    </div>
  )
}

function CategoriesTab({ catalog, updateEntity, addEntity, removeEntity, activeItem, setActiveItem }: any) {
  const items = catalog.categories || []
  const [uploadingField, setUploadingField] = useState(null)

  const handleImageUpload = async (fieldName) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      setUploadingField(fieldName)
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'categories')
      formData.append('entityType', 'categories')
      try {
        const response = await fetch('/api/uploads', { method: 'POST', body: formData })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Upload failed')
        const updated = { ...activeItem, [fieldName]: payload.url, image: fieldName === 'image' ? payload.url : activeItem?.image, bannerImage: fieldName === 'bannerImage' ? payload.url : activeItem?.bannerImage }
        setActiveItem(updated)
        updateEntity('categories', activeItem.id, { [fieldName]: payload.url, image: updated.image, bannerImage: updated.bannerImage })
        toast.success('Image uploaded')
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setUploadingField(null)
      }
    }
    input.click()
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 h-fit">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Categories</h3>
          <button
            onClick={() => {
              const created = addEntity('categories', { slug: '', name: '', description: '', status: 'published' })
              setActiveItem(created)
            }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {items.map((item, index) => (
            <button
              key={item.id || item.slug || `${item.name || 'category'}-${index}`}
              onClick={() => setActiveItem(item)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition truncate ${
                activeItem?.id === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.name || 'Untitled'}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        {activeItem ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Name *</label>
              <input
                type="text"
                value={activeItem.name || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none transition"
                onChange={(e) => {
                  const v = e.target.value
                  const updated = { ...activeItem, name: v, slug: slugify(v) }
                  setActiveItem(updated)
                  updateEntity('categories', activeItem.id, { name: v, slug: slugify(v) })
                }}
                placeholder="Enter category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Slug</label>
              <input
                type="text"
                value={activeItem.slug || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none transition"
                onChange={(e) => {
                  const v = e.target.value
                  const updated = { ...activeItem, slug: v }
                  setActiveItem(updated)
                  updateEntity('categories', activeItem.id, { slug: v })
                }}
                placeholder="category-slug"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
              <textarea
                value={activeItem.description || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 min-h-24 text-white focus:border-emerald-500 focus:outline-none transition"
                onChange={(e) => {
                  const updated = { ...activeItem, description: e.target.value }
                  setActiveItem(updated)
                  updateEntity('categories', activeItem.id, { description: e.target.value })
                }}
                placeholder="Enter category description"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Banner image</label>
                <div className="flex gap-2">
                  <input
                    value={activeItem.bannerImage || activeItem.image || ''}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none transition"
                    onChange={(e) => {
                      const v = e.target.value
                      const updated = { ...activeItem, bannerImage: v, image: v }
                      setActiveItem(updated)
                      updateEntity('categories', activeItem.id, { bannerImage: v, image: v })
                    }}
                    placeholder="https://..."
                  />
                  <button type="button" onClick={() => handleImageUpload('bannerImage')} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 disabled:opacity-60" disabled={uploadingField === 'bannerImage'}>{uploadingField === 'bannerImage' ? '…' : 'Upload'}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Icon</label>
                <input
                  value={activeItem.icon || ''}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none transition"
                  onChange={(e) => {
                    const v = e.target.value
                    const updated = { ...activeItem, icon: v }
                    setActiveItem(updated)
                    updateEntity('categories', activeItem.id, { icon: v })
                  }}
                  placeholder="icon name / URL"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">SEO Title</label>
              <input
                value={activeItem.seoTitle || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none transition"
                onChange={(e) => {
                  const v = e.target.value
                  const updated = { ...activeItem, seoTitle: v }
                  setActiveItem(updated)
                  updateEntity('categories', activeItem.id, { seoTitle: v })
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">SEO Description</label>
              <textarea
                value={activeItem.seoDescription || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 min-h-24 text-white focus:border-emerald-500 focus:outline-none transition"
                onChange={(e) => {
                  const v = e.target.value
                  const updated = { ...activeItem, seoDescription: v }
                  setActiveItem(updated)
                  updateEntity('categories', activeItem.id, { seoDescription: v })
                }}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Display order</label>
                <input
                  type="number"
                  value={activeItem.sortOrder ?? 0}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none transition"
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    const updated = { ...activeItem, sortOrder: v }
                    setActiveItem(updated)
                    updateEntity('categories', activeItem.id, { sortOrder: v })
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                <select
                  value={activeItem.status || 'published'}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none transition"
                  onChange={(e) => {
                    const updated = { ...activeItem, status: e.target.value }
                    setActiveItem(updated)
                    updateEntity('categories', activeItem.id, { status: e.target.value })
                  }}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300">
                <input type="checkbox" checked={Boolean(activeItem.featured)} onChange={(e) => {
                  const updated = { ...activeItem, featured: e.target.checked }
                  setActiveItem(updated)
                  updateEntity('categories', activeItem.id, { featured: e.target.checked })
                }} />
                Featured category
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300">
                <input type="checkbox" checked={activeItem.visibility !== false} onChange={(e) => {
                  const updated = { ...activeItem, visibility: e.target.checked }
                  setActiveItem(updated)
                  updateEntity('categories', activeItem.id, { visibility: e.target.checked })
                }} />
                Visible in navigation
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Parent category</label>
              <select
                value={activeItem.parentCategory || activeItem.parentCategoryId || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none transition"
                onChange={(e) => {
                  const value = e.target.value
                  const updated = { ...activeItem, parentCategory: value, parentCategoryId: value }
                  setActiveItem(updated)
                  updateEntity('categories', activeItem.id, { parentCategory: value, parentCategoryId: value })
                }}
              >
                <option value="">No parent category</option>
                {(catalog.categories || []).filter((category) => category.id !== activeItem.id).map((category) => (
                  <option key={category.id || category.slug} value={category.slug || category.name}>{category.name || category.slug}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => removeEntity('categories', activeItem.id)}
              className="w-full rounded-lg border border-rose-500/30 bg-rose-500/5 py-2 text-rose-300 hover:bg-rose-500/10 transition"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Delete
            </button>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">Select a category or create a new one</div>
        )}
      </div>
    </div>
  )
}

function SubcategoriesTab({ catalog, updateEntity, addEntity, removeEntity, activeItem, setActiveItem }: any) {
  const items = catalog.subcategories || []
  const [uploadingField, setUploadingField] = useState(null)

  const handleImageUpload = async (fieldName) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      setUploadingField(fieldName)
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'subcategories')
      formData.append('entityType', 'subcategories')
      try {
        const response = await fetch('/api/uploads', { method: 'POST', body: formData })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Upload failed')
        const updated = { ...activeItem, [fieldName]: payload.url, image: fieldName === 'image' ? payload.url : activeItem?.image, bannerImage: fieldName === 'bannerImage' ? payload.url : activeItem?.bannerImage }
        setActiveItem(updated)
        updateEntity('subcategories', activeItem.id, { [fieldName]: payload.url, image: updated.image, bannerImage: updated.bannerImage })
        toast.success('Image uploaded')
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setUploadingField(null)
      }
    }
    input.click()
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 h-fit">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Subcategories</h3>
          <button
            onClick={() => {
              const created = addEntity('subcategories', { slug: '', name: '', description: '', status: 'published', parentCategory: '' })
              setActiveItem(created)
            }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {items.map((item, index) => (
            <button
              key={item.id || item.slug || `${item.name || 'subcategory'}-${index}`}
              onClick={() => setActiveItem(item)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition truncate ${
                activeItem?.id === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.name || 'Untitled'}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        {activeItem ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
              <input
                value={activeItem.name || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                onChange={(e) => {
                  const v = e.target.value
                  setActiveItem({ ...activeItem, name: v, slug: slugify(v) })
                  updateEntity('subcategories', activeItem.id, { name: v, slug: slugify(v) })
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Parent category</label>
              <select
                value={activeItem.parentCategory || activeItem.category || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                onChange={(e) => {
                  const value = e.target.value
                  setActiveItem({ ...activeItem, parentCategory: value, category: value })
                  updateEntity('subcategories', activeItem.id, { parentCategory: value, category: value })
                }}
              >
                <option value="">No parent category</option>
                {(catalog.categories || []).map((category) => (
                  <option key={category.id || category.slug} value={category.slug || category.name}>
                    {category.name || category.slug}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
              <textarea
                value={activeItem.description || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 min-h-24"
                onChange={(e) => {
                  setActiveItem({ ...activeItem, description: e.target.value })
                  updateEntity('subcategories', activeItem.id, { description: e.target.value })
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Banner image</label>
              <div className="flex gap-2">
                <input
                  value={activeItem.bannerImage || activeItem.image || ''}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                  onChange={(e) => {
                    const v = e.target.value
                    setActiveItem({ ...activeItem, bannerImage: v, image: v })
                    updateEntity('subcategories', activeItem.id, { bannerImage: v, image: v })
                  }}
                />
                <button type="button" onClick={() => handleImageUpload('bannerImage')} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 disabled:opacity-60" disabled={uploadingField === 'bannerImage'}>{uploadingField === 'bannerImage' ? '…' : 'Upload'}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">SEO Title</label>
              <input value={activeItem.seoTitle || ''} onChange={(e) => { const v = e.target.value; setActiveItem({ ...activeItem, seoTitle: v }); updateEntity('subcategories', activeItem.id, { seoTitle: v }) }} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">SEO Description</label>
              <textarea value={activeItem.seoDescription || ''} onChange={(e) => { const v = e.target.value; setActiveItem({ ...activeItem, seoDescription: v }); updateEntity('subcategories', activeItem.id, { seoDescription: v }) }} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 min-h-24" />
            </div>
            <button
              onClick={() => removeEntity('subcategories', activeItem.id)}
              className="w-full rounded-lg border border-rose-500/30 bg-rose-500/5 py-2 text-rose-300 hover:bg-rose-500/10 transition"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Delete
            </button>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">Select a subcategory or create a new one</div>
        )}
      </div>
    </div>
  )
}

function AttributesTab({ catalog, updateEntity, addEntity, removeEntity, activeItem, setActiveItem }: any) {
  const items = catalog.attributes || []
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 h-fit">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Attributes</h3>
          <button
            onClick={() => {
              const newEntity = { slug: '', name: '', attributeType: 'text', status: 'published' }
              addEntity('attributes', newEntity)
              setActiveItem(newEntity)
            }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {items.map((item, index) => (
            <button
              key={item.id || item.slug || `${item.name || 'attribute'}-${index}`}
              onClick={() => setActiveItem(item)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition truncate ${
                activeItem?.id === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.name || 'Untitled'}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        {activeItem ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
              <input
                value={activeItem.name || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                onChange={(e) => {
                  const v = e.target.value
                  setActiveItem({ ...activeItem, name: v, slug: slugify(v) })
                  updateEntity('attributes', activeItem.id, { name: v, slug: slugify(v) })
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
              <select
                value={activeItem.attributeType || 'text'}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                onChange={(e) => {
                  setActiveItem({ ...activeItem, attributeType: e.target.value })
                  updateEntity('attributes', activeItem.id, { attributeType: e.target.value })
                }}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="dropdown">Dropdown</option>
                <option value="textarea">Textarea</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Units (optional)</label>
              <input
                value={activeItem.units || ''}
                placeholder="e.g. kg, meters"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                onChange={(e) => {
                  setActiveItem({ ...activeItem, units: e.target.value })
                  updateEntity('attributes', activeItem.id, { units: e.target.value })
                }}
              />
            </div>
            <button
              onClick={() => removeEntity('attributes', activeItem.id)}
              className="w-full rounded-lg border border-rose-500/30 bg-rose-500/5 py-2 text-rose-300 hover:bg-rose-500/10 transition"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Delete
            </button>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">Select an attribute or create a new one</div>
        )}
      </div>
    </div>
  )
}

function PackagingTab({ catalog, updateEntity, addEntity, removeEntity, activeItem, setActiveItem }: any) {
  const items = catalog.packagingTypes || []
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 h-fit">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Packaging types</h3>
          <button
            onClick={() => {
              const newEntity = { slug: '', name: '', description: '', status: 'published' }
              addEntity('packagingTypes', newEntity)
              setActiveItem(newEntity)
            }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {items.map((item, index) => (
            <button
              key={item.id || item.slug || `${item.name || 'packaging'}-${index}`}
              onClick={() => setActiveItem(item)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition truncate ${
                activeItem?.id === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.name || 'Untitled'}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        {activeItem ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
              <input
                value={activeItem.name || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                onChange={(e) => {
                  const v = e.target.value
                  setActiveItem({ ...activeItem, name: v, slug: slugify(v) })
                  updateEntity('packagingTypes', activeItem.id, { name: v, slug: slugify(v) })
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
              <textarea
                value={activeItem.description || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 min-h-24"
                onChange={(e) => {
                  setActiveItem({ ...activeItem, description: e.target.value })
                  updateEntity('packagingTypes', activeItem.id, { description: e.target.value })
                }}
              />
            </div>
            <button
              onClick={() => removeEntity('packagingTypes', activeItem.id)}
              className="w-full rounded-lg border border-rose-500/30 bg-rose-500/5 py-2 text-rose-300 hover:bg-rose-500/10 transition"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Delete
            </button>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">Select a packaging type or create a new one</div>
        )}
      </div>
    </div>
  )
}

function CountriesTab({ catalog, updateEntity, addEntity, removeEntity, activeItem, setActiveItem }: any) {
  const items = catalog.exportCountries || []
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 h-fit">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Countries</h3>
          <button
            onClick={() => {
              const newEntity = { slug: '', name: '', code: '' }
              addEntity('exportCountries', newEntity)
              setActiveItem(newEntity)
            }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {items.map((item, index) => (
            <button
              key={item.id || item.slug || `${item.name || 'country'}-${index}`}
              onClick={() => setActiveItem(item)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition truncate ${
                activeItem?.id === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="font-medium">{item.name || 'Untitled'}</span>
              {item.code && <span className="ml-1 text-xs text-slate-500">{item.code}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        {activeItem ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Country name</label>
              <input
                value={activeItem.name || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                onChange={(e) => {
                  const v = e.target.value
                  setActiveItem({ ...activeItem, name: v, slug: slugify(v) })
                  updateEntity('exportCountries', activeItem.id, { name: v, slug: slugify(v) })
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Country code (ISO)</label>
              <input
                value={activeItem.code || ''}
                placeholder="e.g. US, IN, GB"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 uppercase"
                onChange={(e) => {
                  const v = e.target.value.toUpperCase()
                  setActiveItem({ ...activeItem, code: v })
                  updateEntity('exportCountries', activeItem.id, { code: v })
                }}
              />
            </div>
            <button
              onClick={() => removeEntity('exportCountries', activeItem.id)}
              className="w-full rounded-lg border border-rose-500/30 bg-rose-500/5 py-2 text-rose-300 hover:bg-rose-500/10 transition"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Delete
            </button>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">Select a country or create a new one</div>
        )}
      </div>
    </div>
  )
}
