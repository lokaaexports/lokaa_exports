import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin/middleware/auth'
import { deleteMediaAsset, listMediaAssets, getMediaAssetStats } from '@/lib/media-service'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function GET(request: any) {
  try {
    const session = await verifyAdminAuth(request)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (id) {
      const asset = await prisma.mediaAsset.findUnique({
        where: { id: parseInt(id, 10) },
        select: { filename: true, contentType: true, mimeType: true, fileData: true, assetType: true }
      })

      if (!asset) {
        return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 })
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
          return NextResponse.json({ success: false, error: 'Asset not found on disk' }, { status: 404 })
        }
      }

      const contentType = asset.contentType || asset.mimeType || 'application/octet-stream'
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
          'Content-Disposition': `inline; filename="${asset.filename || 'asset'}"`
        }
      })
    }

    const assetType = searchParams.get('assetType') || undefined
    const entityType = searchParams.get('entityType') || undefined
    const search = searchParams.get('search') || undefined
    const limit = Number(searchParams.get('limit') || 200)
    const offset = Number(searchParams.get('offset') || 0)

    const [assets, stats] = await Promise.all([
      listMediaAssets({ assetType, entityType, search, limit, offset }),
      getMediaAssetStats(),
    ])

    return NextResponse.json({ success: true, assets, stats })
  } catch (error: any) {
    console.error('Media list error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Unable to load media library' }, { status: 500 })
  }
}

export async function DELETE(request: any) {
  try {
    const session = await verifyAdminAuth(request)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ success: false, error: 'Asset id is required' }, { status: 400 })
    }

    await deleteMediaAsset(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Media delete error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Unable to delete asset' }, { status: 500 })
  }
}
