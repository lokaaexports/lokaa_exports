// lib/admin/modules/orders/services/order.service.js
// Order Management Service

import prisma from '@/lib/prisma'

export class OrderService {
  // Get all orders
  static async getAllOrders(filters = {}, pagination = {}) {
    const { limit = 50, offset = 0 } = pagination
    const where = {
      ...(filters.search && {
        OR: [
          { reference: { contains: filters.search } },
          { shipmentAddress: { contains: filters.search } },
          { customer: { companyName: { contains: filters.search } } }
        ]
      }),
      ...(filters.status && { status: filters.status }),
      ...(filters.customerId && { customerId: filters.customerId })
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: true,
          rfq: true
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ])

    return {
      data,
      pagination: { total, limit, offset, pages: Math.ceil(total / limit) }
    }
  }

  // Get order by ID
  static async getOrderById(orderId) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: true,
        rfq: true
      }
    })
  }

  // Create order
  static async createOrder(data, createdByUserId) {
    const {
      reference,
      customerId,
      rfqId,
      items = [],
      subtotal = 0,
      tax = 0,
      discount = 0,
      shipping = 0,
      total = 0,
      currency = 'USD',
      shipmentAddress,
      shippingMethod,
      estimatedDelivery,
      status = 'pending',
      paymentStatus = 'unpaid',
      notes,
    } = data

    const order = await prisma.order.create({
      data: {
        reference: reference || `ORD-${Date.now()}`,
        customerId,
        rfqId: rfqId || null,
        subtotal: parseFloat(subtotal),
        tax: parseFloat(tax),
        discount: parseFloat(discount),
        shipping: parseFloat(shipping),
        total: parseFloat(total),
        currency,
        shipmentAddress,
        shippingMethod,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        status,
        paymentStatus,
        notes,
        createdBy: createdByUserId
      }
    })

    // Create order items
    if (items && items.length > 0) {
      await Promise.all(
        items.map(item =>
          prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: parseInt(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              total: parseInt(item.quantity) * parseFloat(item.unitPrice)
            }
          })
        )
      )
    }

    return this.getOrderById(order.id)
  }

  // Update order
  static async updateOrder(orderId, data) {
    const {
      customerId,
      rfqId,
      subtotal,
      tax,
      discount,
      shipping,
      total,
      currency,
      shipmentAddress,
      shippingMethod,
      estimatedDelivery,
      status,
      paymentStatus,
      notes,
    } = data

    return await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(customerId && { customerId }),
        ...(rfqId !== undefined && { rfqId }),
        ...(subtotal !== undefined && { subtotal: parseFloat(subtotal) }),
        ...(tax !== undefined && { tax: parseFloat(tax) }),
        ...(discount !== undefined && { discount: parseFloat(discount) }),
        ...(shipping !== undefined && { shipping: parseFloat(shipping) }),
        ...(total !== undefined && { total: parseFloat(total) }),
        ...(currency && { currency }),
        ...(shipmentAddress !== undefined && { shipmentAddress }),
        ...(shippingMethod !== undefined && { shippingMethod }),
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(notes && { notes }),
        updatedAt: new Date()
      }
    })
  }

  // Get order statistics
  static async getOrderStats() {
    const [total, pending, completed, cancelled, total_value] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'completed' } }),
      prisma.order.count({ where: { status: 'cancelled' } }),
      prisma.order.aggregate({
        where: {},
        _sum: { total: true }
      })
    ])

    return {
      totalOrders: total,
      pendingOrders: pending,
      completedOrders: completed,
      cancelledOrders: cancelled,
      totalValue: total_value._sum.total || 0
    }
  }

  // Update order status
  static async updateOrderStatus(orderId, status) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status, updatedAt: new Date() }
    })
  }

  // Cancel order
  static async cancelOrder(orderId) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled', updatedAt: new Date() }
    })
  }

  // Complete order
  static async completeOrder(orderId) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed', updatedAt: new Date() }
    })
  }
}

export default OrderService
