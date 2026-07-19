import prisma from '@/lib/prisma'

export async function logAudit({
  userId = null,
  action,
  entity,
  entityId = null,
  changes = null,
  ipAddress = null,
  userAgent = null
}) {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      changes,
      ipAddress,
      userAgent
    }
  })
}

export async function listAuditLogs(filters = {}, pagination = {}) {
  const { limit = 100, offset = 0 } = pagination
  const where = {}

  if (filters.userId) where.userId = filters.userId
  if (filters.action) where.action = filters.action
  if (filters.entity) where.entity = filters.entity
  if (filters.entityId) where.entityId = filters.entityId
  if (filters.startDate || filters.endDate) {
    where.createdAt = {}
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate)
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate)
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.auditLog.count({ where })
  ])

  return { data, pagination: { total, limit, offset, pages: Math.ceil(total / limit) } }
}
