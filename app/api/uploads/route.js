import { NextResponse } from 'next/server'
import { getMysqlPool } from '@/lib/mysql-client'

export const runtime = 'nodejs'

const STORAGE_MODE = String(process.env.UPLOAD_STORAGE_MODE || 'db').toLowerCase()
const PUBLIC_BASE_URL = process.env.UPLOAD_PUBLIC_BASE_URL || ''

function sanitizeSegment(value) {
  return String(value || 'general').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'general'
}

function sanitizeFileName(filename) {
  return String(filename)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function getUploadUrl(id, filename, type) {
  if (PUBLIC_BASE_URL && STORAGE_MODE === 'filesystem') {
    return `${PUBLIC_BASE_URL.replace(/\/$/, '')}/uploads/${type}/${filename}`
  }

  return `/api/uploads?id=${id}`
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image')
    const type = sanitizeSegment(formData.get('type'))
    const entityType = sanitizeSegment(formData.get('entityType'))
    if (!file || typeof file !== 'object' || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
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
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: 'File exceeds maximum size of 10MB' }, { status: 400 })
    }

    const pool = await getMysqlPool()
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const [result] = await pool.query(
      'INSERT INTO media_assets (assetType, entityType, filename, mimeType, sizeBytes, url, fileData, contentType, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [type, entityType, filename, mime, buffer.length, '', buffer, mime, now, now]
    )
    const id = result.insertId
    const url = getUploadUrl(id, filename, type)
    await pool.query('UPDATE media_assets SET url = ?, updatedAt = ? WHERE id = ?', [url, now, id])

    return NextResponse.json({ ok: true, url, id })
  } catch (error) {
    console.error('Upload error', error)
    return NextResponse.json({ error: 'Unable to upload image' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const pool = await getMysqlPool()
    const [rows] = await pool.query(
      'SELECT filename, contentType, mimeType, fileData FROM media_assets WHERE id = ? LIMIT 1',
      [id]
    )

    const asset = rows?.[0]
    if (!asset || !asset.fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const contentType = asset.contentType || asset.mimeType || 'application/octet-stream'
    return new NextResponse(asset.fileData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${asset.filename || 'upload'}"`,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('Upload fetch error', error)
    return NextResponse.json({ error: 'Unable to load file' }, { status: 500 })
  }
}
