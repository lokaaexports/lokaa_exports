'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, FileText, Image as ImageIcon, Loader2, Trash2, Upload, Video, LibraryBig, BadgeInfo } from 'lucide-react'

const ASSET_TYPES = ['image', 'video', 'certificate', 'pdf', 'catalogue', 'brochure', 'icon', 'document', 'other']
const ENTITY_TYPES = ['general', 'product', 'category', 'subcategory', 'rfq', 'order', 'customer', 'supplier', 'company']

function formatBytes(bytes) {
  const value = Number(bytes || 0)
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

function assetIcon(assetType) {
  if (assetType === 'video') return <Video className="h-4 w-4" />
  if (['pdf', 'certificate', 'catalogue', 'brochure', 'document'].includes(assetType)) return <FileText className="h-4 w-4" />
  return <ImageIcon className="h-4 w-4" />
}

function resolveAssetUrl(asset) {
  if (!asset?.url) return '#'
  if (asset.url.startsWith('/api/uploads?id=')) return asset.url
  return asset.url
}

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState([])
  const [stats, setStats] = useState({ totalAssets: 0, imageCount: 0, videoCount: 0, documentCount: 0 })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [assetType, setAssetType] = useState('')
  const [entityType, setEntityType] = useState('')

  const loadAssets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (assetType) params.set('assetType', assetType)
      if (entityType) params.set('entityType', entityType)
      const response = await fetch(`/api/admin/media?${params.toString()}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load media library')
      setAssets(payload.assets || [])
      setStats(payload.stats || {})
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [assetType, entityType])

  const filteredCount = useMemo(() => assets.length, [assets])

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', assetType || 'general')
      formData.append('entityType', entityType || 'general')

      const response = await fetch('/api/uploads', { method: 'POST', body: formData })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Upload failed')
      toast.success('Asset uploaded')
      await loadAssets()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return
    try {
      const response = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Delete failed')
      toast.success('Asset deleted')
      await loadAssets()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/pim" className="mb-3 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 dark:text-slate-300">
              <ArrowLeft className="h-4 w-4" />
              Back to PIM
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Media Library</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Central DAM for product images, videos, certificates, brochures, and reusable assets.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload asset
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total assets', value: stats.totalAssets || 0 },
            { label: 'Images', value: stats.imageCount || 0 },
            { label: 'Videos', value: stats.videoCount || 0 },
            { label: 'Documents', value: stats.documentCount || 0 },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onBlur={loadAssets}
              placeholder="Search filename, URL, MIME type"
              className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
            />
            <select
              value={assetType}
              onChange={(event) => setAssetType(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
            >
              <option value="">All asset types</option>
              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
            >
              <option value="">All entities</option>
              {ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <LibraryBig className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Library assets</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">({filteredCount})</span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading assets...
            </div>
          ) : assets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
              No media assets found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => (
                <article key={asset.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex h-44 items-center justify-center bg-slate-100 dark:bg-slate-900">
                    {asset.assetType === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveAssetUrl(asset)} alt={asset.filename} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        {assetIcon(asset.assetType)}
                        <span className="text-xs uppercase tracking-[0.24em]">{asset.assetType}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{asset.filename}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{asset.entityType} • {asset.assetType}</p>
                      </div>
                      <button onClick={() => handleDelete(asset.id)} className="rounded-xl p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <BadgeInfo className="h-3.5 w-3.5" />
                      {asset.mimeType || 'unknown'} • {formatBytes(asset.sizeBytes)}
                    </div>
                    <Link href={resolveAssetUrl(asset)} target="_blank" className="block break-all rounded-2xl bg-white px-3 py-2 text-xs text-emerald-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-emerald-300 dark:ring-slate-800">
                      {asset.url}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
