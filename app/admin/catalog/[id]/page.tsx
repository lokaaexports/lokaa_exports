'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Plus, RefreshCw, Save, Trash2, LayoutTemplate } from 'lucide-react'
import Image from 'next/image'

const EMPTY_SPEC = { id: '', fieldId: '', specName: '', specValue: '', displayOrder: 0 }
const EMPTY_IMAGE = { id: '', imageUrl: '', imageTitle: '', altText: '', seoDescription: '', imageType: 'gallery', displayOrder: 0 }
const EMPTY_SEO = { metaTitle: '', metaDescription: '', metaKeywords: '', schemaMarkup: '', ogImage: '', ogDescription: '' }
const EMPTY_EXPORT = { exportCountries: '', availabilityStatus: 'year_round', season: '', moq: '', leadTimeDays: '', incoterms: 'FOB' }
const EMPTY_PACKAGING = { id: '', packageType: '', weight: '', unit: 'kg', quantityAvailable: '', displayOrder: 0, isActive: true }
const EMPTY_CERT = { id: '', certName: '', certNumber: '', certImage: '', issueDate: '', expiryDate: '' }

function authHeaders() {
  return {}
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<any>(null)
  
  // Specifications state
  const [templateFields, setTemplateFields] = useState<any[]>([])
  const [dynamicSpecs, setDynamicSpecs] = useState<Record<string, string>>({})
  const [customSpecs, setCustomSpecs] = useState<any[]>([])
  const [specForm, setSpecForm] = useState(EMPTY_SPEC)
  
  // Other arrays
  const [images, setImages] = useState<any[]>([])
  const [packaging, setPackaging] = useState<any[]>([])
  const [certifications, setCertifications] = useState<any[]>([])
  const [seo, setSeo] = useState(EMPTY_SEO)
  const [exportInfo, setExportInfo] = useState(EMPTY_EXPORT)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Forms
  const [imageForm, setImageForm] = useState(EMPTY_IMAGE)
  const [packagingForm, setPackagingForm] = useState(EMPTY_PACKAGING)
  const [certForm, setCertForm] = useState(EMPTY_CERT)

  const load = async () => {
    if (!productId) return
    setLoading(true)
    try {
      const headers = authHeaders()
      
      const productRes = await fetch(`/api/admin/catalog/products?id=${productId}`, { headers })
      const productPayload = await productRes.json()
      if (!productRes.ok) throw new Error(productPayload.error || 'Unable to load product')
      const loadedProduct = productPayload.data || productPayload.product
      setProduct(loadedProduct)

      // Fetch related data in parallel
      const [specRes, imageRes, seoRes, exportRes, pkgRes, certRes] = await Promise.all([
        fetch(`/api/admin/catalog/specifications?productId=${productId}`, { headers }),
        fetch(`/api/admin/catalog/images?productId=${productId}`, { headers }),
        fetch(`/api/admin/catalog/seo?productId=${productId}`, { headers }),
        fetch(`/api/admin/catalog/export-info?productId=${productId}`, { headers }),
        fetch(`/api/admin/catalog/packaging?productId=${productId}`, { headers }),
        fetch(`/api/admin/catalog/certifications?productId=${productId}`, { headers }),
      ])

      const [specPayload, imagePayload, seoPayload, exportPayload, pkgPayload, certPayload] = await Promise.all([
        specRes.json(), imageRes.json(), seoRes.json(), exportRes.json(), pkgRes.json(), certRes.json()
      ])

      setImages(imagePayload.data || [])
      setSeo(seoPayload.data || EMPTY_SEO)
      setPackaging(pkgPayload.data || [])
      setCertifications(certPayload.data || [])
      
      const loadedExport = exportPayload.data || {}
      setExportInfo({
        exportCountries: Array.isArray(loadedExport.exportCountries) ? loadedExport.exportCountries.join(', ') : (loadedExport.exportCountries || ''),
        availabilityStatus: loadedExport.availabilityStatus || 'year_round',
        season: loadedExport.season || '',
        moq: loadedExport.moq || '',
        leadTimeDays: loadedExport.leadTimeDays || '',
        incoterms: loadedExport.incoterms || 'FOB',
      })

      // Load Template Fields if template exists
      const templateId = loadedProduct?.templateId || loadedProduct?.template?.id
      if (templateId) {
        const tplRes = await fetch(`/api/admin/catalog/template-fields?templateId=${templateId}`, { headers })
        if (tplRes.ok) {
          const tplPayload = await tplRes.json()
          setTemplateFields(tplPayload.data?.fields || tplPayload.fields || [])
        }
      }

      // Sort specifications into template-bound vs custom
      const allSpecs = specPayload.data || []
      const dynSpecMap: Record<string, string> = {}
      const customSpecList: any[] = []

      allSpecs.forEach((sp: any) => {
        if (sp.fieldId) {
          dynSpecMap[sp.fieldId] = sp.specValue
        } else {
          customSpecList.push(sp)
        }
      })
      setDynamicSpecs(dynSpecMap)
      setCustomSpecs(customSpecList)

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [productId])

  const saveProduct = async () => {
    try {
      setSaving(true)
      const galleryMainImage = images.find((image) => image.imageType === 'main')?.imageUrl || product.mainImage || images[0]?.imageUrl || ''
      
      const response = await fetch(`/api/admin/catalog/products?id=${productId}`, {
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
      if (!response.ok) throw new Error('Unable to save product')
      toast.success('Product saved')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const saveDynamicSpecs = async () => {
    try {
      setSaving(true)
      // Save all dynamic specs. We will iterate over template fields and save those that have values
      for (const field of templateFields) {
        const val = dynamicSpecs[field.id]
        if (val !== undefined && val !== '') {
          // Find existing spec for this field to see if PUT or POST
          // For simplicity, API usually handles upsert if we pass fieldId. Let's assume standard POST endpoint upserts or adds.
          // The current API might not support bulk upsert, so let's call them individually.
          const payload = { productId, fieldId: field.id, specName: field.fieldName, specValue: val }
          await fetch('/api/admin/catalog/specifications', {
            method: 'POST', // The endpoint might need tweaking to support upsert by fieldId, but we'll try POST
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(payload)
          })
        }
      }
      toast.success('Dynamic specifications saved')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const saveCustomSpec = async () => {
    try {
      setSaving(true)
      const method = specForm.id ? 'PUT' : 'POST'
      const endpoint = specForm.id ? `/api/admin/catalog/specifications?id=${specForm.id}` : '/api/admin/catalog/specifications'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ productId, ...specForm }),
      })
      if (!response.ok) throw new Error('Unable to save custom specification')
      setSpecForm(EMPTY_SPEC)
      toast.success('Custom specification added')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteSpec = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/catalog/specifications?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      if (!response.ok) throw new Error('Unable to delete specification')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Reuse original functions for Images, SEO, Export, Certs, Packaging...
  const saveImage = async () => {
    try {
      setSaving(true)
      const method = imageForm.id ? 'PUT' : 'POST'
      const endpoint = imageForm.id ? `/api/admin/catalog/images?id=${imageForm.id}` : '/api/admin/catalog/images'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ productId, ...imageForm }),
      })
      if (!response.ok) throw new Error('Unable to save image')
      setImageForm(EMPTY_IMAGE)
      await load()
    } catch (error: any) { toast.error(error.message) } finally { setSaving(false) }
  }

  const deleteImage = async (id: string) => {
    try {
      await fetch(`/api/admin/catalog/images?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      await load()
    } catch (error: any) { toast.error(error.message) }
  }

  const saveSEO = async () => {
    try {
      setSaving(true)
      await fetch('/api/admin/catalog/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ productId, ...seo }),
      })
      toast.success('SEO saved')
      await load()
    } catch (error: any) { toast.error(error.message) } finally { setSaving(false) }
  }

  const saveExport = async () => {
    try {
      setSaving(true)
      await fetch('/api/admin/catalog/export-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          productId,
          ...exportInfo,
          exportCountries: exportInfo.exportCountries.split(',').map((item: string) => item.trim()).filter(Boolean),
        }),
      })
      toast.success('Export info saved')
      await load()
    } catch (error: any) { toast.error(error.message) } finally { setSaving(false) }
  }

  const savePackaging = async () => {
    try {
      if (!packagingForm.packageType) {
        toast.error('Package type is required')
        return
      }
      setSaving(true)
      const method = packagingForm.id ? 'PUT' : 'POST'
      const endpoint = packagingForm.id ? `/api/admin/catalog/packaging?id=${packagingForm.id}` : '/api/admin/catalog/packaging'
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          productId,
          packageType: packagingForm.packageType,
          weight: Math.round(Number(packagingForm.weight) || 0),
          unit: packagingForm.unit || 'kg',
          quantityAvailable: Math.round(Number(packagingForm.quantityAvailable) || 0),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save packaging option')
      }
      toast.success('Packaging option added')
      setPackagingForm(EMPTY_PACKAGING)
      await load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deletePackaging = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/catalog/packaging?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete packaging option')
      toast.success('Packaging option deleted')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const saveCert = async () => {
    try {
      setSaving(true)
      const method = certForm.id ? 'PUT' : 'POST'
      const endpoint = certForm.id ? `/api/admin/catalog/certifications?id=${certForm.id}` : '/api/admin/catalog/certifications'
      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ productId, ...certForm }),
      })
      setCertForm(EMPTY_CERT)
      await load()
    } catch (error: any) { toast.error(error.message) } finally { setSaving(false) }
  }

  const deleteCert = async (id: string) => {
    try {
      await fetch(`/api/admin/catalog/certifications?id=${id}`, { method: 'DELETE', headers: authHeaders() })
      await load()
    } catch (error: any) { toast.error(error.message) }
  }

  const tabClass = (key: string) => `rounded-md px-4 py-2 text-sm font-semibold transition ${activeTab === key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`

  const selectedProductName = useMemo(() => product?.productName || product?.name || 'Product detail', [product])

  if (!productId || loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>

  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/admin/catalog/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>

        {/* Header */}
        <section className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">PIM Details</p>
            <h1 className="text-3xl font-bold text-slate-900">{selectedProductName}</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={load} className="inline-flex items-center gap-2 rounded-sm border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button onClick={saveProduct} disabled={saving} className="inline-flex items-center gap-2 rounded-sm bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Product
            </button>
          </div>
        </section>

        {/* Tabs navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {['overview', 'specs', 'images', 'packaging', 'certifications', 'seo'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={tabClass(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && product && (
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-sm border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">General Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Product Name</label>
                  <input value={product.productName || ''} onChange={(event) => setProduct({ ...product, productName: event.target.value })} className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm focus:border-slate-500 focus:ring-0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Short Description (Tagline)</label>
                  <textarea value={product.shortDescription || ''} onChange={(event) => setProduct({ ...product, shortDescription: event.target.value })} rows={2} className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm focus:border-slate-500 focus:ring-0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Long Description</label>
                  <textarea value={product.description || ''} onChange={(event) => setProduct({ ...product, description: event.target.value })} rows={5} className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm focus:border-slate-500 focus:ring-0" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">HSN/HS Code</label>
                    <input value={product.hsnCode || ''} onChange={(event) => setProduct({ ...product, hsnCode: event.target.value })} className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm focus:border-slate-500 focus:ring-0" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status</label>
                    <select value={product.status || 'draft'} onChange={(event) => setProduct({ ...product, status: event.target.value })} className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm focus:border-slate-500 focus:ring-0">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 mt-2 cursor-pointer">
                  <input type="checkbox" checked={Boolean(product.isFeatured)} onChange={(event) => setProduct({ ...product, isFeatured: event.target.checked })} className="rounded text-slate-900 focus:ring-slate-900" />
                  Feature this product on homepage
                </label>
              </div>
            </div>
            <div className="rounded-sm border border-slate-200 bg-slate-50 p-6 shadow-sm space-y-4 h-fit">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Classification</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-900">{product.category?.name || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Template:</span>
                  <span className="font-semibold text-slate-900">{product.template?.name || '—'}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SPECIFICATIONS TAB (Dynamic + Custom) */}
        {activeTab === 'specs' && (
          <section className="space-y-6">
            
            {/* Dynamic Template Fields */}
            {templateFields.length > 0 && (
              <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <LayoutTemplate className="h-5 w-5 text-slate-400" /> 
                    Category Specifications ({product.template?.name})
                  </h2>
                  <button onClick={saveDynamicSpecs} disabled={saving} className="inline-flex items-center gap-2 rounded-sm bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60">
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save Specs
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templateFields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                        {field.fieldName} {field.isRequired && <span className="text-red-500">*</span>}
                      </label>
                      <input 
                        type="text"
                        value={dynamicSpecs[field.id] || ''} 
                        onChange={(e) => setDynamicSpecs(prev => ({ ...prev, [field.id]: e.target.value }))}
                        placeholder={field.fieldOptions?.split(',')[0] || `Enter ${field.fieldName.toLowerCase()}`}
                        className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:ring-0" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Specs */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-sm border border-slate-200 bg-slate-50 p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Add Custom Specification</h2>
                <div className="space-y-3">
                  <input value={specForm.specName} onChange={(event) => setSpecForm({ ...specForm, specName: event.target.value })} placeholder="Label (e.g. Storage Temp)" className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm" />
                  <input value={specForm.specValue} onChange={(event) => setSpecForm({ ...specForm, specValue: event.target.value })} placeholder="Value (e.g. 15-20°C)" className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm" />
                  <div className="flex justify-end gap-2 pt-2">
                    {specForm.id && <button onClick={() => setSpecForm(EMPTY_SPEC)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">Cancel</button>}
                    <button onClick={saveCustomSpec} disabled={saving} className="inline-flex items-center gap-2 rounded-sm bg-slate-900 px-4 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add Custom Spec</button>
                  </div>
                </div>
              </div>
              <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Custom Specifications List</h2>
                {customSpecs.length === 0 ? (
                  <p className="text-sm text-slate-500">No custom specifications added.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {customSpecs.map((spec) => (
                      <div key={spec.id} className="flex items-center justify-between py-3 group">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{spec.specName}</p>
                          <p className="text-sm text-slate-500">{spec.specValue}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => setSpecForm(spec)} className="text-blue-600 text-xs font-semibold hover:underline">Edit</button>
                          <button onClick={() => deleteSpec(spec.id)} className="text-red-600 text-xs font-semibold hover:underline">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* EXPORT INFO TAB */}
        {activeTab === 'export' && (
          <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-sm space-y-4 max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Export Logistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Export Countries</label>
                <input value={exportInfo.exportCountries || ''} onChange={(event) => setExportInfo({ ...exportInfo, exportCountries: event.target.value })} placeholder="US, UK, UAE" className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Availability Status</label>
                <select value={exportInfo.availabilityStatus} onChange={(event) => setExportInfo({ ...exportInfo, availabilityStatus: event.target.value })} className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm">
                  <option value="year_round">Year Round</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="limited">Limited</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Minimum Order Qty (MOQ)</label>
                <input value={exportInfo.moq || ''} onChange={(event) => setExportInfo({ ...exportInfo, moq: event.target.value })} placeholder="e.g. 1 FCL" className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Lead Time</label>
                <input value={exportInfo.leadTimeDays || ''} onChange={(event) => setExportInfo({ ...exportInfo, leadTimeDays: event.target.value })} placeholder="e.g. 14 Days" className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Incoterms Supported</label>
                <input value={exportInfo.incoterms || ''} onChange={(event) => setExportInfo({ ...exportInfo, incoterms: event.target.value })} placeholder="e.g. FOB, CIF" className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm" />
              </div>
            </div>
            <div className="pt-4">
              <button onClick={saveExport} disabled={saving} className="inline-flex items-center gap-2 rounded-sm bg-slate-900 px-6 py-2 text-sm font-bold text-white"><Save className="h-4 w-4" /> Save Export Info</button>
            </div>
          </section>
        )}

        {/* IMAGES TAB */}
        {activeTab === 'images' && (
          <section className="space-y-6">
            <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Add Media Asset</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <input value={imageForm.imageUrl} onChange={(event) => setImageForm({ ...imageForm, imageUrl: event.target.value })} placeholder="Media URL (from Media Library)" className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm" />
                </div>
                <div>
                  <select value={imageForm.imageType} onChange={(event) => setImageForm({ ...imageForm, imageType: event.target.value })} className="w-full rounded-sm border border-slate-300 px-4 py-2 text-sm">
                    <option value="gallery">Gallery Image</option>
                    <option value="main">Main Thumbnail</option>
                    <option value="document">Document (PDF)</option>
                  </select>
                </div>
                <div>
                  <button onClick={saveImage} disabled={saving} className="w-full inline-flex justify-center items-center gap-2 rounded-sm bg-slate-900 px-4 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add Asset</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image) => {
                const src = (image?.imageUrl || image?.url || '').trim() || '/images/placeholders/product-placeholder.jpg';
                const isPdf = typeof src === 'string' && src.toLowerCase().endsWith('.pdf');

                return (
                  <div key={image.id} className="relative rounded-sm border border-slate-200 bg-white shadow-sm overflow-hidden group">
                    <div className="aspect-[4/3] bg-slate-100 relative">
                       {isPdf ? (
                         <div className="flex h-full items-center justify-center font-bold text-slate-400">PDF Document</div>
                       ) : (
                         <Image src={src} alt="Asset" fill className="object-cover" />
                       )}
                    </div>
                    <div className="p-3 flex justify-between items-center bg-white border-t border-slate-100">
                      <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">{image.imageType}</span>
                      <button onClick={() => deleteImage(image.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {activeTab === 'packaging' && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add Packaging Option</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <input value={packagingForm.packageType} onChange={(e) => setPackagingForm({ ...packagingForm, packageType: e.target.value })} placeholder="Package Type (e.g. Carton, Mesh Bag)" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20" />
              <input type="number" value={packagingForm.weight || ''} onChange={(e) => setPackagingForm({ ...packagingForm, weight: String(parseInt(e.target.value) || '') })} placeholder="Weight" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20" />
              <input value={packagingForm.unit} onChange={(e) => setPackagingForm({ ...packagingForm, unit: e.target.value })} placeholder="Unit (e.g. kg, lbs)" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20" />
              <input type="number" value={packagingForm.quantityAvailable || ''} onChange={(e) => setPackagingForm({ ...packagingForm, quantityAvailable: String(parseInt(e.target.value) || '') })} placeholder="Quantity Available" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <button onClick={savePackaging} disabled={saving} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 flex items-center justify-center space-x-2">
              <Plus className="h-4 w-4" /> <span>Add Packaging</span>
            </button>
            <div className="mt-8 border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Weight / Unit</th>
                    <th className="px-6 py-3">Quantity</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {packaging.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{pkg.packageType}</td>
                      <td className="px-6 py-4">{pkg.weight} {pkg.unit}</td>
                      <td className="px-6 py-4">{pkg.quantityAvailable}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deletePackaging(pkg.id)} className="text-red-500 hover:text-red-700 transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {packaging.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No packaging options added.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'certifications' && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add Certification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <input value={certForm.certName} onChange={(e) => setCertForm({ ...certForm, certName: e.target.value })} placeholder="Certificate Name (e.g. ISO 9001)" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20" />
              <input value={certForm.certNumber} onChange={(e) => setCertForm({ ...certForm, certNumber: e.target.value })} placeholder="Certificate Number" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20" />
              <input type="date" value={certForm.issueDate ? String(certForm.issueDate).substring(0, 10) : ''} onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20" title="Issue Date" />
              <input type="date" value={certForm.expiryDate ? String(certForm.expiryDate).substring(0, 10) : ''} onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20" title="Expiry Date" />
            </div>
            <button onClick={saveCert} disabled={saving} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 flex items-center justify-center space-x-2">
              <Plus className="h-4 w-4" /> <span>Add Certification</span>
            </button>
            <div className="mt-8 border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Number</th>
                    <th className="px-6 py-3">Issue / Expiry</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certifications.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{cert.certName}</td>
                      <td className="px-6 py-4">{cert.certNumber}</td>
                      <td className="px-6 py-4">
                        {cert.issueDate && new Date(cert.issueDate).toLocaleDateString()} - {cert.expiryDate && new Date(cert.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteCert(cert.id)} className="text-red-500 hover:text-red-700 transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {certifications.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No certifications added.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'seo' && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">SEO Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Meta Title</label>
                <input value={seo.metaTitle || ''} onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })} placeholder="SEO Title" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Meta Description</label>
                <textarea rows={4} value={seo.metaDescription || ''} onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })} placeholder="SEO Description" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Meta Keywords</label>
                <input value={seo.metaKeywords || ''} onChange={(e) => setSeo({ ...seo, metaKeywords: e.target.value })} placeholder="Keywords (comma separated)" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <button onClick={saveSEO} disabled={saving} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 flex items-center justify-center space-x-2 w-full mt-4">
                <span>Save SEO Configuration</span>
              </button>
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
