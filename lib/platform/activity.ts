import prisma from '@/lib/prisma'

export async function listActivityTimeline({ userId = null, entity = null, limit = 100, offset = 0 } = {}) {
  const where = {
    ...(userId ? { userId } : {}),
    ...(entity ? { entity } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ])

  return { items, total }
}

export async function logActivity({ userId = null, action, entity, entityId = null, changes = null, ipAddress = null, userAgent = null }: any) {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      changes,
      ipAddress,
      userAgent,
    },
  })
}
