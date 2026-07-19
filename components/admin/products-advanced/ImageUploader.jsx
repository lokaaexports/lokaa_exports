'use client'

import { useEffect, useState } from 'react'
import { Trash2, Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'

/**
 * ImageUploader - Manage product images
 * Upload, organize, and delete product images with types (main, gallery, packaging, certificate)
 */
export default function ImageUploader({ 
  productId,
  onImagesChange
}) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [imageType, setImageType] = useState('gallery')

  useEffect(() => {
    if (productId) {
      fetchImages()
    }
  }, [productId])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/products-advanced/images?productId=${productId}`
      )
      const data = await response.json()
      
      if (data.success) {
        setImages(data.data || [])
        onImagesChange?.(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching images:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      // For demo, convert to base64
      const reader = new FileReader()
      reader.onload = async (event) => {
        const imageUrl = event.target?.result

        const response = await fetch('/api/admin/products-advanced/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            imageUrl,
            imageTitle: file.name,
            altText: file.name.split('.')[0],
            imageType,
            displayOrder: images.length
          })
        })
        const data = await response.json()
        
        if (data.success) {
          setImages([...images, data.data])
          onImagesChange?.([...images, data.data])
          e.target.value = '' // Reset input
        } else {
          alert(`Error: ${data.error}`)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Delete this image?')) return

    try {
      const response = await fetch(
        `/api/admin/products-advanced/images?id=${imageId}`,
        { method: 'DELETE' }
      )
      const data = await response.json()
      
      if (data.success) {
        const updated = images.filter(img => img.id !== imageId)
        setImages(updated)
        onImagesChange?.(updated)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const imagesByType = {
    main: images.filter(img => img.imageType === 'main'),
    gallery: images.filter(img => img.imageType === 'gallery'),
    packaging: images.filter(img => img.imageType === 'packaging'),
    certificate: images.filter(img => img.imageType === 'certificate'),
  }

  if (!productId) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
        Create product first to add images
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Product Images</h3>

      {/* Upload Section */}
      <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
        <h4 className="font-medium text-sm text-gray-700">Upload Image</h4>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="image-type" className="text-xs">Image Type</Label>
            <select
              id="image-type"
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded text-sm"
            >
              <option value="main">Main Image</option>
              <option value="gallery">Gallery</option>
              <option value="packaging">Packaging</option>
              <option value="certificate">Certificate</option>
            </select>
          </div>
          <div className="flex-1">
            <Label htmlFor="image-file" className="text-xs">File</Label>
            <div className="relative mt-1">
              <input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
              <Button
                as="label"
                htmlFor="image-file"
                variant="outline"
                className="w-full cursor-pointer"
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-1" />
                {uploading ? 'Uploading...' : 'Choose Image'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Images by Type */}
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading images...</div>
      ) : images.length > 0 ? (
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="main">Main ({imagesByType.main.length})</TabsTrigger>
            <TabsTrigger value="gallery">Gallery ({imagesByType.gallery.length})</TabsTrigger>
            <TabsTrigger value="packaging">Packaging ({imagesByType.packaging.length})</TabsTrigger>
            <TabsTrigger value="certificate">Certificate ({imagesByType.certificate.length})</TabsTrigger>
          </TabsList>

          {['main', 'gallery', 'packaging', 'certificate'].map((type) => (
            <TabsContent key={type} value={type}>
              {imagesByType[type].length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {imagesByType[type].map((image) => (
                    <div key={image.id} className="relative border rounded-lg overflow-hidden group">
                      <img
                        src={image.imageUrl}
                        alt={image.altText}
                        className="w-full h-32 object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteImage(image.id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 text-white hover:bg-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <div className="text-xs text-gray-600 p-2 bg-gray-50">
                        {image.imageTitle}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No {type} images uploaded
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-6 text-gray-500 text-sm">
          No images uploaded yet
        </div>
      )}
    </div>
  )
}
