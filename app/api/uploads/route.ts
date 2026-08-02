import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import { verifyAdminAuth } from '@/lib/admin/middleware/auth'

export const runtime = 'nodejs'

const STORAGE_MODE = String(process.env.UPLOAD_STORAGE_MODE || 'db').toLowerCase()
const PUBLIC_BASE_URL = process.env.UPLOAD_PUBLIC_BASE_URL || ''

function sanitizeSegment(value: any) {
  return String(value || 'general').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'general'
}

function sanitizeFileName(filename: any) {
  return String(filename)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function getUploadUrl(id: any, filename: any, type: any) {
  if (PUBLIC_BASE_URL && STORAGE_MODE === 'filesystem') {
    return `${PUBLIC_BASE_URL.replace(/\/$/, '')}/uploads/${type}/${filename}`
  }

  return `/api/uploads?id=${id}`
}

export async function POST(request: any) {
  try {
    const session = await verifyAdminAuth(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    // Robust file key extraction: check 'image', 'file', 'upload', 'attachment', or first file entry
    const file = formData.get('image') ||
      formData.get('file') ||
      formData.get('upload') ||
      formData.get('attachment') ||
      Array.from(formData.values()).find((v: any) => v && typeof v === 'object' && typeof v.arrayBuffer === 'function')

    const type = sanitizeSegment(formData.get('type'))
    const entityType = sanitizeSegment(formData.get('entityType'))
    if (!file || typeof file !== 'object' || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ success: false, error: 'Image file is required' }, { status: 400 })
    }
    const originalName = sanitizeFileName(file.name || `upload-${Date.now()}`)
    const filename = `${Date.now()}-${originalName}`

    const buffer = Buffer.from(await file.arrayBuffer())

    // Basic validation
    const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-matroska',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ]
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv', '.json']
    const mime = file.type || ''
    const lowerName = originalName.toLowerCase()
    const isAllowed = allowedTypes.includes(mime) || allowedExtensions.some((ext) => lowerName.endsWith(ext))
    if (!isAllowed) {
      return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 })
    }
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'File exceeds maximum size of 10MB' }, { status: 400 })
    }

    let finalAssetType = type;
    if (finalAssetType === 'general' && mime.startsWith('image/')) {
        finalAssetType = 'image';
    } else if (finalAssetType === 'general' && mime.startsWith('video/')) {
        finalAssetType = 'video';
    } else if (finalAssetType === 'general' && mime === 'application/pdf') {
        finalAssetType = 'pdf';
    }

    let mediaAsset;
    let usedFilesystem = (STORAGE_MODE === 'filesystem');

    if (usedFilesystem) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', finalAssetType)
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      const filePath = path.join(uploadDir, filename)
      fs.writeFileSync(filePath, buffer)

      mediaAsset = await prisma.mediaAsset.create({
        data: {
          assetType: finalAssetType,
          entityType: entityType,
          filename: filename,
          mimeType: mime,
          sizeBytes: buffer.length,
          url: '',
          fileData: null,
          contentType: mime,
        }
      })
    } else {
      try {
        // Try inserting into DB first
        mediaAsset = await prisma.mediaAsset.create({
          data: {
            assetType: finalAssetType,
            entityType: entityType,
            filename: filename,
            mimeType: mime,
            sizeBytes: buffer.length,
            url: '',
            fileData: buffer,
            contentType: mime,
          }
        })
      } catch (dbError: any) {
        console.warn('DB upload failed, falling back to filesystem storage:', dbError.message)
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', finalAssetType)
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        const filePath = path.join(uploadDir, filename)
        fs.writeFileSync(filePath, buffer)

        mediaAsset = await prisma.mediaAsset.create({
          data: {
            assetType: finalAssetType,
            entityType: entityType,
            filename: filename,
            mimeType: mime,
            sizeBytes: buffer.length,
            url: '',
            fileData: null,
            contentType: mime,
          }
        })
      }
    }
    
    const id = mediaAsset.id
    const url = getUploadUrl(id, filename, finalAssetType)
    
    await prisma.mediaAsset.update({
      where: { id },
      data: { url }
    })

    return NextResponse.json({ ok: true, url, id })
  } catch (error: any) {
    console.error('Upload error', error)
    return NextResponse.json({ success: false, error: error.message || 'Unable to upload image' }, { status: 500 })
  }
}

export async function GET(request: any) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    }

    const asset = await prisma.mediaAsset.findUnique({
      where: { id: parseInt(id, 10) },
      select: { filename: true, contentType: true, mimeType: true, fileData: true, assetType: true }
    })

    if (!asset) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 })
    }

    let fileBuffer: Buffer;
    if (asset.fileData) {
      fileBuffer = asset.fileData;
    } else {
      const type = asset.assetType || 'general';
      const filePath = path.join(process.cwd(), 'public', 'uploads', type, asset.filename);
      if (fs.existsSync(filePath)) {
        fileBuffer = fs.readFileSync(filePath);
      } else {
        return NextResponse.json({ success: false, error: 'File not found on disk' }, { status: 404 })
      }
    }

    const contentType = asset.contentType || asset.mimeType || 'application/octet-stream'
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `inline; filename="${asset.filename || 'upload'}"`,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error: any) {
    console.error('Upload fetch error', error)
    return NextResponse.json({ success: false, error: 'Unable to load file' }, { status: 500 })
  }
}
