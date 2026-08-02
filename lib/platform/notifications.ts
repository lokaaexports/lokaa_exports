import prisma from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'

export async function listNotifications(userId: any, { unreadOnly = false, limit = 50, offset = 0 } = {}) {
  const where: Record<string, any> = { userId }
  if (unreadOnly) where.read = false

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
  ])

  return { items, total }
}

export async function createNotification({ userId, type, title, message, link = null }: any) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
    },
  })

  void logAuditEvent({
    action: 'notification_created',
    userId,
    email: null,
    details: { type, title, link },
  })

  return notification
}

export async function markNotificationRead(notificationId: any, userId: any) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true, readAt: new Date() },
  })
}

export async function markAllNotificationsRead(userId: any) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  })
}

export async function getNotificationSummary(userId: any) {
  const [total, unread] = await Promise.all([
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, read: false } }),
  ])

  return { total, unread }
}
