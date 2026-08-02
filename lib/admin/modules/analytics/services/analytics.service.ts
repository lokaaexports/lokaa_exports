// lib/admin/modules/analytics/services/analytics.service.js
// Analytics and Reporting Service

import prisma from '@/lib/prisma'

export class AnalyticsService {
  // Get dashboard overview
  static async getDashboardOverview() {
    const [users, customers, orders, products, revenue, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.customer.count(),
      prisma.order.count(),
      prisma.dynamicProduct.count({ where: { status: 'published' } }),
      prisma.order.aggregate({
        _sum: { total: true }
      }),
      prisma.order.findMany({
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
  static async getSalesAnalytics(startDate: any, endDate: any) {
    const where = {
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
      prisma.customer.count(),
      prisma.customer.groupBy({
        by: ['country'],
        _count: true
      }),
      prisma.customer.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.customer.findMany({
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
      prisma.rFQ.count(),
      prisma.rFQ.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.rFQ.findMany({
        include: { quotations: true },
        take: 100
      }),
      prisma.rFQ.findMany({
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
  static async exportSalesReport(startDate: any, endDate: any) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: { customer: true, items: true }
    })

    return orders.map(order => ({
      orderNumber: order.reference,
      customerName: order.customer.companyName,
      customerEmail: order.customer.email,
      orderDate: order.createdAt,
      total: order.total,
      status: order.status,
      items: order.items.map(item => ({
        productName: item.productId,
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
          loginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        _count: true
      }),
      prisma.loginHistory.count({
        where: {
          loginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
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
