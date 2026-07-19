'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'

const EMPTY_SPEC = { id: '', fieldId: '', specName: '', specValue: '', displayOrder: 0 }
const EMPTY_IMAGE = { id: '', imageUrl: '', imageTitle: '', altText: '', seoDescription: '', imageType: 'gallery', displayOrder: 0 }
const EMPTY_SEO = { metaTitle: '', metaDescription: '', metaKeywords: '', schemaMarkup: '', ogImage: '', ogDescription: '' }
const EMPTY_EXPORT = { exportCountries: '', availabilityStatus: 'year_round', season: '', moq: '', leadTimeDays: '', incoterms: 'FOB' }
const EMPTY_PACKAGING = { id: '', packageType: '', weight: '', unit: 'kg', quantityAvailable: '', displayOrder: 0, isActive: true }
const EMPTY_CERT = { id: '', certName: '', certNumber: '', certImage: '', issueDate: '', expiryDate: '' }

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState(null)
  const [specs, setSpecs] = useState([])
  const [images, setImages] = useState([])
  const [packaging, setPackaging] = useState([])
  const [certifications, setCertifications] = useState([])
  const [seo, setSeo] = useState(EMPTY_SEO)
  const [exportInfo, setExportInfo] = useState(EMPTY_EXPORT)
  const [activeTab, setActiveTab] = useState('overview')
  const [specForm, setSpecForm] = useState(EMPTY_SPEC)
  const [imageForm, setImageForm] = useState(EMPTY_IMAGE)
  const [packagingForm, setPackagingForm] = useState(EMPTY_PACKAGING)
  const [certForm, setCertForm] = useState(EMPTY_CERT)

  const load = async () => {
    if (!productId) return
    setLoading(true)
    try {
      const headers = authHeaders()
      const [productResponse, specResponse, imageResponse, seoResponse, exportResponse, packagingResponse, certResponse] = await Promise.all([
        fetch(`/api/admin/products-advanced/products?id=${productId}`, { headers }),
        fetch(`/api/admin/products-advanced/specifications?productId=${productId}`, { headers }),
        fetch(`/api/admin/products-advanced/images?productId=${productId}`, { headers }),
        fetch(`/api/admin/products-advanced/seo?productId=${productId}`, { headers }),
        fetch(`/api/admin/products-advanced/export-info?productId=${productId}`, { headers }),
        fetch(`/api/admin/products-advanced/packaging?productId=${productId}`, { headers }),
        fetch(`/api/admin/products-advanced/certifications?productId=${productId}`, { headers }),
      ])

      const [productPayload, specPayload, imagePayload, seoPayload, exportPayload, packagingPayload, certPayload] = await Promise.all([
        productResponse.json(),
        specResponse.json(),
        imageResponse.json(),
        seoResponse.json(),
        exportResponse.json(),
        packagingResponse.json(),
        certResponse.json(),
      ])

      if (!productResponse.ok) throw new Error(productPayload.error || 'Unable to load product')
      setProduct(productPayload.data || productPayload.product)
      setSpecs(specPayload.data || [])
      setImages(imagePayload.data || [])
      setSeo(seoPayload.data || EMPTY_SEO)
      const loadedExport = exportPayload.data || {}
      setExportInfo({
        exportCountries: Array.isArray(loadedExport.exportCountries) ? loadedExport.exportCountries.join(', ') : (loadedExport.exportCountries || ''),
        availabilityStatus: loadedExport.availabilityStatus || 'year_round',
        season: loadedExport.season || '',
        moq: loadedExport.moq || '',
        leadTimeDays: loadedExport.leadTimeDays || '',
        incoterms: loadedExport.incoterms || 'FOB',
      })
      setPackaging(packagingPayload.data || [])
      setCertifications(certPayload.data || [])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const saveProduct = async () => {
    try {
      setSaving(true)
      const galleryMainImage =
        images.find((image) => image.imageType === 'main')?.imageUrl ||
        product.mainImage ||
        images[0]?.imageUrl ||
        ''
      const response = await fetch(`/api/admin/products-advanced/products?id=${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          productName: product.productName,
          description: product.description,
          shortDescription: product.shortDescription,
          exportDescription: product.exportDescription,
          hsnCode: product.hsnCode,
          status: product.status,
          isFeatured: product.isFeatured,
          mainImage: galleryMainImage,
        }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save product')
      toast.success('Product saved')
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const saveSpec = async () => {
    try {
      setSaving(true)
      const method = specForm.id ? 'PUT' : 'POST'
      const endpoint = specForm.id ? `/api/admin/products-advanced/specifications?id=${specForm.id}` : '/api/admin/products-advanced/specifications'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ productId, ...specForm }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save specification')
      setSpecForm(EMPTY_SPEC)
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteSpec = async (id) => {
    try {
      const response = await fetch(`/api/admin/products-advanced/specifications?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to delete specification')
      await load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const saveImage = async () => {
    try {
      setSaving(true)
      const method = imageForm.id ? 'PUT' : 'POST'
      const endpoint = imageForm.id ? `/api/admin/products-advanced/images?id=${imageForm.id}` : '/api/admin/products-advanced/images'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ productId, ...imageForm }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save image')
      if (imageForm.imageType === 'main' || !product?.mainImage) {
        setProduct((current) => current ? { ...current, mainImage: imageForm.imageUrl } : current)
      }
      setImageForm(EMPTY_IMAGE)
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteImage = async (id) => {
    try {
      const response = await fetch(`/api/admin/products-advanced/images?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to delete image')
      if (images.find((image) => image.id === id)?.imageType === 'main') {
        const remaining = images.filter((image) => image.id !== id)
        setProduct((current) => current ? { ...current, mainImage: remaining.find((image) => image.imageType === 'main')?.imageUrl || remaining[0]?.imageUrl || '' } : current)
      }
      await load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const saveSEO = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/products-advanced/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ productId, ...seo }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save SEO')
      toast.success('SEO saved')
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const saveExport = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/products-advanced/export-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          productId,
          ...exportInfo,
          exportCountries: exportInfo.exportCountries.split(',').map((item) => item.trim()).filter(Boolean),
        }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save export info')
      toast.success('Export info saved')
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const savePackaging = async () => {
    try {
      setSaving(true)
      const method = packagingForm.id ? 'PUT' : 'POST'
      const endpoint = packagingForm.id ? `/api/admin/products-advanced/packaging?id=${packagingForm.id}` : '/api/admin/products-advanced/packaging'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ productId, ...packagingForm }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save packaging')
      setPackagingForm(EMPTY_PACKAGING)
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deletePackaging = async (id) => {
    try {
      const response = await fetch(`/api/admin/products-advanced/packaging?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to delete packaging')
      await load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const saveCert = async () => {
    try {
      setSaving(true)
      const method = certForm.id ? 'PUT' : 'POST'
      const endpoint = certForm.id ? `/api/admin/products-advanced/certifications?id=${certForm.id}` : '/api/admin/products-advanced/certifications'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ productId, ...certForm }),
      })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to save certification')
      setCertForm(EMPTY_CERT)
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteCert = async (id) => {
    try {
      const response = await fetch(`/api/admin/products-advanced/certifications?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok || payload.success === false) throw new Error(payload.error || 'Unable to delete certification')
      await load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const tabClass = (key) => `rounded-2xl px-4 py-2 text-sm font-semibold ${activeTab === key ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`

  const selectedProductName = useMemo(() => product?.productName || product?.name || 'Product detail', [product])

  if (!productId) return null

  return (
    <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/admin/products-advanced" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 dark:text-slate-300">
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">PIM Detail</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{selectedProductName}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{product?.slug}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={load} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button onClick={saveProduct} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save product
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          {['overview', 'specs', 'images', 'seo', 'export', 'packaging', 'certifications'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={tabClass(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && product && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Product fields</h2>
              <input value={product.productName || ''} onChange={(event) => setProduct({ ...product, productName: event.target.value })} placeholder="Product name" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <textarea value={product.shortDescription || ''} onChange={(event) => setProduct({ ...product, shortDescription: event.target.value })} placeholder="Short description" rows={3} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <textarea value={product.description || ''} onChange={(event) => setProduct({ ...product, description: event.target.value })} placeholder="Description" rows={4} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <textarea value={product.exportDescription || ''} onChange={(event) => setProduct({ ...product, exportDescription: event.target.value })} placeholder="Export description" rows={3} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <div className="grid gap-3 md:grid-cols-2">
                <input value={product.hsnCode || ''} onChange={(event) => setProduct({ ...product, hsnCode: event.target.value })} placeholder="HSN code" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
                <select value={product.status || 'draft'} onChange={(event) => setProduct({ ...product, status: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input type="checkbox" checked={Boolean(product.isFeatured)} onChange={(event) => setProduct({ ...product, isFeatured: event.target.checked })} />
                Featured
              </label>
              <input value={product.mainImage || ''} onChange={(event) => setProduct({ ...product, mainImage: event.target.value })} placeholder="Main image URL" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Snapshot</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Category: {product.category?.name || '—'}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Subcategory: {product.subcategory?.name || '—'}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Template: {product.template?.name || '—'}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Status: {product.status}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Featured: {product.isFeatured ? 'Yes' : 'No'}</p>
            </div>
          </section>
        )}

        {activeTab === 'specs' && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Specification form</h2>
              <input value={specForm.specName} onChange={(event) => setSpecForm({ ...specForm, specName: event.target.value })} placeholder="Spec name" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <textarea value={specForm.specValue} onChange={(event) => setSpecForm({ ...specForm, specValue: event.target.value })} placeholder="Spec value" rows={4} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input type="number" value={specForm.displayOrder} onChange={(event) => setSpecForm({ ...specForm, displayOrder: Number(event.target.value) })} placeholder="Order" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <div className="flex gap-3">
                <button onClick={saveSpec} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Plus className="h-4 w-4" /> Save spec</button>
                <button onClick={() => setSpecForm(EMPTY_SPEC)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Reset</button>
              </div>
            </div>
            <div className="space-y-3">
              {specs.map((spec) => (
                <article key={spec.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{spec.specName}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{spec.specValue}</p>
                    </div>
                    <button onClick={() => deleteSpec(spec.id)} className="rounded-xl border border-red-200 p-2 text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'images' && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Image form</h2>
              <input value={imageForm.imageUrl} onChange={(event) => setImageForm({ ...imageForm, imageUrl: event.target.value })} placeholder="Image URL" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input value={imageForm.imageTitle} onChange={(event) => setImageForm({ ...imageForm, imageTitle: event.target.value })} placeholder="Title" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input value={imageForm.altText} onChange={(event) => setImageForm({ ...imageForm, altText: event.target.value })} placeholder="Alt text" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input value={imageForm.seoDescription} onChange={(event) => setImageForm({ ...imageForm, seoDescription: event.target.value })} placeholder="SEO description" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <div className="grid gap-3 md:grid-cols-2">
                <select value={imageForm.imageType} onChange={(event) => setImageForm({ ...imageForm, imageType: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700">
                  <option value="gallery">Gallery</option>
                  <option value="main">Main</option>
                  <option value="packaging">Packaging</option>
                  <option value="certificate">Certificate</option>
                  <option value="factory">Factory</option>
                </select>
                <input type="number" value={imageForm.displayOrder} onChange={(event) => setImageForm({ ...imageForm, displayOrder: Number(event.target.value) })} placeholder="Order" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              </div>
              <button onClick={saveImage} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Plus className="h-4 w-4" /> Save image</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {images.map((image) => (
                <article key={image.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <img src={image.imageUrl} alt={image.altText || image.imageTitle || 'Product image'} className="h-44 w-full object-cover" />
                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{image.imageTitle || 'Untitled'}</h3>
                        <p className="text-xs text-slate-500">{image.imageType}</p>
                      </div>
                      <button onClick={() => deleteImage(image.id)} className="rounded-xl border border-red-200 p-2 text-red-700"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{image.altText || 'No alt text'}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'seo' && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">SEO form</h2>
              <input value={seo.metaTitle || ''} onChange={(event) => setSeo({ ...seo, metaTitle: event.target.value })} placeholder="Meta title" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <textarea value={seo.metaDescription || ''} onChange={(event) => setSeo({ ...seo, metaDescription: event.target.value })} placeholder="Meta description" rows={3} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <textarea value={seo.metaKeywords || ''} onChange={(event) => setSeo({ ...seo, metaKeywords: event.target.value })} placeholder="Meta keywords" rows={3} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <textarea value={seo.schemaMarkup || ''} onChange={(event) => setSeo({ ...seo, schemaMarkup: event.target.value })} placeholder="Schema markup JSON" rows={6} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input value={seo.ogImage || ''} onChange={(event) => setSeo({ ...seo, ogImage: event.target.value })} placeholder="OG image" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <textarea value={seo.ogDescription || ''} onChange={(event) => setSeo({ ...seo, ogDescription: event.target.value })} placeholder="OG description" rows={3} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <button onClick={saveSEO} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" /> Save SEO</button>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(seo, null, 2)}</pre>
            </div>
          </section>
        )}

        {activeTab === 'export' && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Export info</h2>
              <input value={exportInfo.exportCountries || ''} onChange={(event) => setExportInfo({ ...exportInfo, exportCountries: event.target.value })} placeholder="Countries, comma separated" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <select value={exportInfo.availabilityStatus} onChange={(event) => setExportInfo({ ...exportInfo, availabilityStatus: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700">
                <option value="year_round">Year round</option>
                <option value="seasonal">Seasonal</option>
                <option value="limited">Limited</option>
              </select>
              <input value={exportInfo.season || ''} onChange={(event) => setExportInfo({ ...exportInfo, season: event.target.value })} placeholder="Season" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input value={exportInfo.moq || ''} onChange={(event) => setExportInfo({ ...exportInfo, moq: event.target.value })} placeholder="MOQ" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input value={exportInfo.leadTimeDays || ''} onChange={(event) => setExportInfo({ ...exportInfo, leadTimeDays: event.target.value })} placeholder="Lead time days" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input value={exportInfo.incoterms || ''} onChange={(event) => setExportInfo({ ...exportInfo, incoterms: event.target.value })} placeholder="Incoterms" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <button onClick={saveExport} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" /> Save export info</button>
            </div>
            <pre className="overflow-auto rounded-3xl border border-slate-200 bg-white p-5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">{JSON.stringify(exportInfo, null, 2)}</pre>
          </section>
        )}

        {activeTab === 'packaging' && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Packaging form</h2>
              <input value={packagingForm.packageType} onChange={(event) => setPackagingForm({ ...packagingForm, packageType: event.target.value })} placeholder="Package type" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input value={packagingForm.weight} onChange={(event) => setPackagingForm({ ...packagingForm, weight: event.target.value })} placeholder="Weight" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input value={packagingForm.quantityAvailable} onChange={(event) => setPackagingForm({ ...packagingForm, quantityAvailable: event.target.value })} placeholder="Quantity available" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input value={packagingForm.unit} onChange={(event) => setPackagingForm({ ...packagingForm, unit: event.target.value })} placeholder="Unit" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input type="number" value={packagingForm.displayOrder} onChange={(event) => setPackagingForm({ ...packagingForm, displayOrder: Number(event.target.value) })} placeholder="Order" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input type="checkbox" checked={packagingForm.isActive} onChange={(event) => setPackagingForm({ ...packagingForm, isActive: event.target.checked })} />
                Active
              </label>
              <button onClick={savePackaging} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Plus className="h-4 w-4" /> Save packaging</button>
            </div>
            <div className="space-y-3">
              {packaging.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{item.packageType}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.weight} {item.unit}</p>
                    </div>
                    <button onClick={() => deletePackaging(item.id)} className="rounded-xl border border-red-200 p-2 text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'certifications' && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Certification form</h2>
              <input value={certForm.certName} onChange={(event) => setCertForm({ ...certForm, certName: event.target.value })} placeholder="Certificate name" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input value={certForm.certNumber} onChange={(event) => setCertForm({ ...certForm, certNumber: event.target.value })} placeholder="Certificate number" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <input value={certForm.certImage} onChange={(event) => setCertForm({ ...certForm, certImage: event.target.value })} placeholder="Certificate image URL" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              <div className="grid gap-3 md:grid-cols-2">
                <input type="date" value={certForm.issueDate} onChange={(event) => setCertForm({ ...certForm, issueDate: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
                <input type="date" value={certForm.expiryDate} onChange={(event) => setCertForm({ ...certForm, expiryDate: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" />
              </div>
              <button onClick={saveCert} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Plus className="h-4 w-4" /> Save certification</button>
            </div>
            <div className="space-y-3">
              {certifications.map((certification) => (
                <article key={certification.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{certification.certName}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{certification.certNumber}</p>
                    </div>
                    <button onClick={() => deleteCert(certification.id)} className="rounded-xl border border-red-200 p-2 text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
