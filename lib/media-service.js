import { getMysqlPool } from './mysql-client'

export const MEDIA_ASSET_TYPES = [
  'image',
  'video',
  'certificate',
  'pdf',
  'catalogue',
  'brochure',
  'icon',
  'document',
  'other',
]

export const MEDIA_ENTITY_TYPES = [
  'general',
  'product',
  'category',
  'subcategory',
  'rfq',
  'order',
  'customer',
  'supplier',
  'company',
]

function normalizeMediaAsset(row) {
  return {
    id: row.id,
    assetType: row.assetType,
    entityType: row.entityType,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: Number(row.sizeBytes || 0),
    url: row.url,
    fileData: row.fileData,
    contentType: row.contentType,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function listMediaAssets({ assetType, entityType, search, limit = 200, offset = 0 } = {}) {
  const pool = await getMysqlPool()
  const where = []
  const values = []

  if (assetType) {
    where.push('assetType = ?')
    values.push(assetType)
  }

  if (entityType) {
    where.push('entityType = ?')
    values.push(entityType)
  }

  if (search) {
    where.push('(filename LIKE ? OR url LIKE ? OR mimeType LIKE ?)')
    const term = `%${search}%`
    values.push(term, term, term)
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const [rows] = await pool.query(
    `SELECT * FROM media_assets ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [...values, Number(limit), Number(offset)]
  )

  return rows.map(normalizeMediaAsset)
}

export async function getMediaAssetStats() {
  const pool = await getMysqlPool()
  const [[totals]] = await pool.query(`
    SELECT
      COUNT(*) AS totalAssets,
      SUM(CASE WHEN assetType = 'image' THEN 1 ELSE 0 END) AS imageCount,
      SUM(CASE WHEN assetType = 'video' THEN 1 ELSE 0 END) AS videoCount,
      SUM(CASE WHEN assetType IN ('certificate', 'pdf', 'catalogue', 'brochure', 'document') THEN 1 ELSE 0 END) AS documentCount
    FROM media_assets
  `)

  return {
    totalAssets: Number(totals?.totalAssets || 0),
    imageCount: Number(totals?.imageCount || 0),
    videoCount: Number(totals?.videoCount || 0),
    documentCount: Number(totals?.documentCount || 0),
  }
}

export async function deleteMediaAsset(id) {
  const pool = await getMysqlPool()
  await pool.query('DELETE FROM media_assets WHERE id = ?', [id])
  return true
}
