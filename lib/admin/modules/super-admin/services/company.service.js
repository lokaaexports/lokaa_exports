// lib/admin/modules/super-admin/services/company.service.js
// Company Configuration Service

import prisma from '@/lib/prisma'

export class CompanyConfigService {
  // Get company settings
  static async getCompanySettings(companyId = 1) {
    return await prisma.company.findUnique({
      where: { id: companyId }
    })
  }

  // Update company settings
  static async updateCompanySettings(companyId, data, updatedByUserId) {
    const { name, email, phone, address, city, state, zipCode, country, website, logo, currency } = data

    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zipCode && { zipCode }),
        ...(country && { country }),
        ...(website && { website }),
        ...(logo && { logo }),
        ...(currency && { currency }),
        updatedAt: new Date()
      }
    })

    // Log audit
    await this.logAudit(updatedByUserId, 'UPDATE_COMPANY', `Updated company settings`, companyId)

    return company
  }

  // Get company statistics
  static async getCompanyStats(companyId = 1) {
    const [users, customers, products, orders, revenue] = await Promise.all([
      prisma.user.count({ where: { companyId } }),
      prisma.customer.count({ where: { companyId } }),
      prisma.dynamicProduct.count(),
      prisma.order.count({ where: { companyId } }),
      prisma.order.aggregate({
        where: { companyId },
        _sum: { total: true }
      })
    ])

    return {
      users,
      customers,
      products,
      orders,
      totalRevenue: revenue._sum.total || 0
    }
  }

  // Get audit logs
  static async getAuditLogs(filters = {}, limit = 50, offset = 0) {
    const where = {
      ...(filters.action && { action: filters.action }),
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.resource && { resource: filters.resource }),
      ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && { createdAt: { lte: new Date(filters.endDate) } })
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: true },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ])

    return {
      data: logs,
      pagination: { total, limit, offset, pages: Math.ceil(total / limit) }
    }
  }

  // Export audit logs
  static async exportAuditLogs(filters = {}) {
    const logs = await prisma.auditLog.findMany({
      where: {
        ...(filters.action && { action: filters.action }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.startDate && { createdAt: { gte: new Date(filters.startDate) } }),
        ...(filters.endDate && { createdAt: { lte: new Date(filters.endDate) } })
      },
      include: { user: true, targetUser: true },
      orderBy: { createdAt: 'desc' }
    })

    return logs.map(log => ({
      timestamp: log.createdAt,
      user: log.user?.email,
      action: log.action,
      resource: log.resource,
      description: log.description,
      ipAddress: log.ipAddress,
      status: log.status
    }))
  }

  // Get system status
  static async getSystemStatus() {
    const [users, activeUsers, systemErrors] = await Promise.all([
      prisma.user.count(),
      prisma.loginHistory.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        _count: true
      }),
      prisma.auditLog.findMany({
        where: { status: 'error' },
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ])

    return {
      totalUsers: users,
      activeUsers24h: activeUsers.length,
      systemHealth: systemErrors.length === 0 ? 'healthy' : 'warning',
      recentErrors: systemErrors.length
    }
  }

  // Log audit action
  static async logAudit(userId, action, description, targetId = null) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        description,
        resource: 'company_settings',
        targetUserId: targetId,
        changes: description,
        ipAddress: '0.0.0.0',
        userAgent: 'Admin Panel'
      }
    })
  }
}

export default CompanyConfigService
