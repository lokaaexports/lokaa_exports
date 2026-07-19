// lib/admin/modules/analytics/services/analytics.service.js
// Analytics and Reporting Service

import prisma from '@/lib/prisma'

export class AnalyticsService {
  // Get dashboard overview
  static async getDashboardOverview() {
    const [users, customers, orders, products, revenue, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.customer.count({ where: { companyId: 1 } }),
      prisma.order.count({ where: { companyId: 1 } }),
      prisma.dynamicProduct.count({ where: { status: 'published' } }),
      prisma.order.aggregate({
        where: { companyId: 1 },
        _sum: { total: true }
      }),
      prisma.order.findMany({
        where: { companyId: 1 },
        include: { customer: true },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ])

    return {
      totalUsers: users,
      totalCustomers: customers,
      totalOrders: orders,
      totalProducts: products,
      totalRevenue: revenue._sum.total || 0,
      recentOrders
    }
  }

  // Get sales analytics
  static async getSalesAnalytics(startDate, endDate) {
    const where = {
      companyId: 1,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const [orderCount, orderValue, ordersByStatus] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _sum: { total: true }
      }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true,
        _sum: { total: true }
      })
    ])

    return {
      orderCount,
      orderValue: orderValue._sum.total || 0,
      byStatus: ordersByStatus
    }
  }

  // Get customer analytics
  static async getCustomerAnalytics() {
    const [total, byCountry, byStatus, topCustomers] = await Promise.all([
      prisma.customer.count({ where: { companyId: 1 } }),
      prisma.customer.groupBy({
        by: ['country'],
        where: { companyId: 1 },
        _count: true
      }),
      prisma.customer.groupBy({
        by: ['status'],
        where: { companyId: 1 },
        _count: true
      }),
      prisma.customer.findMany({
        where: { companyId: 1 },
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ])

    return {
      total,
      byCountry,
      byStatus,
      topCustomers
    }
  }

  // Get product analytics
  static async getProductAnalytics() {
    const [total, byCategory, lowStock, topProducts] = await Promise.all([
      prisma.dynamicProduct.count(),
      prisma.dynamicProduct.groupBy({
        by: ['categoryId'],
        _count: true
      }),
      prisma.dynamicProduct.findMany({
        where: { availabilityStatus: 'out_of_stock' },
        take: 20,
        include: { category: true, subcategory: true }
      }),
      prisma.dynamicProduct.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { category: true, subcategory: true }
      })
    ])

    return {
      total,
      byCategory,
      lowStock,
      topProducts
    }
  }

  // Get RFQ analytics
  static async getRFQAnalytics() {
    const [total, byStatus, avgConversionTime, topRequests] = await Promise.all([
      prisma.rfq.count({ where: { companyId: 1 } }),
      prisma.rfq.groupBy({
        by: ['status'],
        where: { companyId: 1 },
        _count: true
      }),
      prisma.rfq.findMany({
        where: { companyId: 1 },
        include: { quotations: true },
        take: 100
      }),
      prisma.rfq.findMany({
        where: { companyId: 1 },
        include: { customer: true },
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ])

    return {
      total,
      byStatus,
      topRequests
    }
  }

  // Export sales report
  static async exportSalesReport(startDate, endDate) {
    const orders = await prisma.order.findMany({
      where: {
        companyId: 1,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: { customer: true, items: { include: { product: true } } }
    })

    return orders.map(order => ({
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      orderDate: order.createdAt,
      total: order.total,
      status: order.status,
      items: order.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    }))
  }

  // Get user activity analytics
  static async getUserActivityAnalytics() {
    const [activeUsers, logins, activityByUser] = await Promise.all([
      prisma.loginHistory.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        _count: true
      }),
      prisma.loginHistory.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      })
    ])

    return {
      activeUsers24h: activeUsers.length,
      totalLogins24h: logins,
      recentActivity: activityByUser
    }
  }
}

export default AnalyticsService
