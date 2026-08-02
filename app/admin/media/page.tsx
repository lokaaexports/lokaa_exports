'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, FileText, Image as ImageIcon, Loader2, Trash2, Upload, Video, LibraryBig, BadgeInfo, Copy } from 'lucide-react'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { useAdminFetch } from '@/hooks/useAdminFetch'
import { MediaAsset } from '@/types/admin'

const ASSET_TYPES = ['image', 'video', 'certificate', 'pdf', 'catalogue', 'brochure', 'icon', 'document', 'other']
const ENTITY_TYPES = ['general', 'product', 'category', 'subcategory', 'rfq', 'order', 'customer', 'supplier', 'company']

function formatBytes(bytes: any) {
  const value = Number(bytes || 0)
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

function assetIcon(assetType: any) {
  if (assetType === 'video') return <Video className="h-4 w-4" />
  if (['pdf', 'certificate', 'catalogue', 'brochure', 'document'].includes(assetType)) return <FileText className="h-4 w-4" />
  return <ImageIcon className="h-4 w-4" />
}

function resolveAssetUrl(asset: any) {
  if (!asset?.url) return '#'
  if (asset.url.startsWith('/api/uploads?id=')) return asset.url
  return asset.url
}

export default function MediaLibraryPage() {
  const { execute: fetchApi, loading } = useAdminFetch<any>()
  const { execute: deleteApi } = useAdminFetch()

  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [stats, setStats] = useState<any>({ totalAssets: 0, imageCount: 0, videoCount: 0, documentCount: 0 })
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [assetType, setAssetType] = useState('')
  const [entityType, setEntityType] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadAssets = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (assetType) params.set('assetType', assetType)
      if (entityType) params.set('entityType', entityType)
      const data = await fetchApi(`/api/admin/media?${params.toString()}`)
      setAssets(data?.assets || [])
      setStats(data?.stats || {})
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [assetType, entityType])

  const filteredCount = useMemo(() => assets.length, [assets])

  const handleUpload = async (event: any) => {
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
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
      if (event.target) event.target.value = ''
    }
  }

  const uploadFile = async (file: File) => {
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
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      await uploadFile(file)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteApi('/api/admin/media', {
        method: 'DELETE',
        body: JSON.stringify({ id: deleteId }),
      })
      toast.success('Asset deleted')
      await loadAssets()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setDeleteId(null)
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

        <section 
          className={`rounded-3xl border ${isDragging ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'} p-5 shadow-sm transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
                      <div className="relative h-full w-full">
                        <Image src={resolveAssetUrl(asset)} alt={asset.filename} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
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
                      <button onClick={() => setDeleteId(asset.id)} className="rounded-xl p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <BadgeInfo className="h-3.5 w-3.5" />
                      {asset.mimeType || 'unknown'} • {formatBytes(asset.sizeBytes)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={resolveAssetUrl(asset)} target="_blank" className="flex-1 block break-all rounded-2xl bg-white px-3 py-2 text-xs text-emerald-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-emerald-300 dark:ring-slate-800">
                        {asset.url}
                      </Link>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(asset.url);
                          toast.success('URL copied to clipboard!');
                        }}
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 shrink-0"
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete asset"
        description="Are you sure you want to delete this asset? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </main>
  )
}
