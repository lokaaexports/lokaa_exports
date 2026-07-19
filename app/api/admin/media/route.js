import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import { deleteMediaAsset, listMediaAssets, getMediaAssetStats } from '@/lib/media-service'
import { getMysqlPool } from '@/lib/mysql-client'

export async function GET(request) {
  try {
    await verifyAdmin(request)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (id) {
      const pool = await getMysqlPool()
      const [rows] = await pool.query(
        'SELECT filename, contentType, mimeType, fileData FROM media_assets WHERE id = ? LIMIT 1',
        [id]
      )

      const asset = rows?.[0]
      if (!asset || !asset.fileData) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
      }

      const contentType = asset.contentType || asset.mimeType || 'application/octet-stream'
      return new NextResponse(asset.fileData, {
        status: 200,
        headers: {
          'Content-Type': contentType,
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
  } catch (error) {
    console.error('Media list error:', error)
    return NextResponse.json({ error: error.message || 'Unable to load media library' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    await verifyAdmin(request)

    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'Asset id is required' }, { status: 400 })
    }

    await deleteMediaAsset(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Media delete error:', error)
    return NextResponse.json({ error: error.message || 'Unable to delete asset' }, { status: 500 })
  }
}
