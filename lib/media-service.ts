import prisma from './prisma'

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

export async function listMediaAssets({ assetType, entityType, search, limit = 200, offset = 0 }: { assetType?: string; entityType?: string; search?: string; limit?: number; offset?: number } = {}) {
  const where: any = {}

  if (assetType) {
    where.assetType = assetType
  }

  if (entityType) {
    where.entityType = entityType
  }

  if (search) {
    where.OR = [
      { filename: { contains: search } },
      { url: { contains: search } },
      { mimeType: { contains: search } },
    ]
  }

  return await prisma.mediaAsset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
    skip: Number(offset),
  })
}

export async function getMediaAssetStats() {
  const [totalAssets, imageCount, videoCount, documentCount] = await Promise.all([
    prisma.mediaAsset.count(),
    prisma.mediaAsset.count({ where: { assetType: 'image' } }),
    prisma.mediaAsset.count({ where: { assetType: 'video' } }),
    prisma.mediaAsset.count({ where: { assetType: { in: ['certificate', 'pdf', 'catalogue', 'brochure', 'document'] } } }),
  ])

  return {
    totalAssets,
    imageCount,
    videoCount,
    documentCount,
  }
}

export async function deleteMediaAsset(id: any) {
  await prisma.mediaAsset.delete({
    where: { id: parseInt(id, 10) }
  })
  return true
}
