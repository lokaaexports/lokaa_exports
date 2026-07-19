// lib/admin/modules/rfqs/services/rfq.service.js
// Request for Quote Management Service

import prisma from '@/lib/prisma'

export class RFQService {
  // Get all RFQs
  static async getAllRFQs(filters = {}, pagination = {}) {
    const { limit = 50, offset = 0 } = pagination
    const where = {
      ...(filters.search && {
        OR: [
          { reference: { contains: filters.search } },
          { productInterest: { contains: filters.search } },
          { customer: { companyName: { contains: filters.search } } }
        ]
      }),
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.customerId && { customerId: filters.customerId })
    }

    const [data, total] = await Promise.all([
      prisma.rfq.findMany({
        where,
        include: {
          customer: true,
          items: true,
          quotations: true,
          assignment: { include: { user: true } }
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.rfq.count({ where })
    ])

    return {
      data,
      pagination: { total, limit, offset, pages: Math.ceil(total / limit) }
    }
  }

  // Get RFQ by ID
  static async getRFQById(rfqId) {
    return await prisma.rfq.findUnique({
      where: { id: rfqId },
      include: {
        customer: true,
        items: true,
        quotations: { include: { createdBy: true } },
        assignment: { include: { user: true } }
      }
    })
  }

  // Create RFQ
  static async createRFQ(data, createdByUserId) {
    const {
      reference,
      customerId,
      productInterest,
      quantity,
      unit,
      shipmentDate,
      priority = 'normal',
      status = 'new',
      internalNotes,
      expiresAt,
      items = [],
    } = data

    const rfq = await prisma.rfq.create({
      data: {
        reference: reference || `RFQ-${Date.now()}`,
        customerId,
        submittedDate: new Date(),
        productInterest,
        quantity: quantity ? parseInt(quantity, 10) : null,
        unit,
        shipmentDate: shipmentDate ? new Date(shipmentDate) : null,
        priority,
        status,
        internalNotes,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: createdByUserId
      }
    })

    // Create RFQ items
    if (items && items.length > 0) {
      await Promise.all(
        items.map(item =>
          prisma.rfqItem.create({
            data: {
              rfqId: rfq.id,
              productId: item.productId,
              description: item.description,
              quantity: parseInt(item.quantity),
              unit: item.unit || 'pcs'
            }
          })
        )
      )
    }

    return this.getRFQById(rfq.id)
  }

  // Update RFQ
  static async updateRFQ(rfqId, data) {
    const {
      customerId,
      productInterest,
      quantity,
      unit,
      shipmentDate,
      priority,
      status,
      internalNotes,
      expiresAt,
    } = data

    return await prisma.rfq.update({
      where: { id: rfqId },
      data: {
        ...(customerId && { customerId }),
        ...(productInterest !== undefined && { productInterest }),
        ...(quantity !== undefined && { quantity: quantity === '' ? null : parseInt(quantity, 10) }),
        ...(unit !== undefined && { unit }),
        ...(shipmentDate && { shipmentDate: new Date(shipmentDate) }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(internalNotes !== undefined && { internalNotes }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
        updatedAt: new Date()
      }
    })
  }

  // Get RFQ statistics
  static async getRFQStats() {
    const [total, newCount, quoted, converted, rejected] = await Promise.all([
      prisma.rfq.count(),
      prisma.rfq.count({ where: { status: 'new' } }),
      prisma.rfq.count({ where: { status: 'quoted' } }),
      prisma.rfq.count({ where: { status: 'converted' } }),
      prisma.rfq.count({ where: { status: 'rejected' } })
    ])

    return {
      totalRFQs: total,
      newRFQs: newCount,
      quotedRFQs: quoted,
      convertedRFQs: converted,
      rejectedRFQs: rejected
    }
  }

  // Close RFQ
  static async closeRFQ(rfqId) {
    return await prisma.rfq.update({
      where: { id: rfqId },
      data: {
        status: 'converted',
        updatedAt: new Date()
      }
    })
  }

  // Delete RFQ
  static async deleteRFQ(rfqId) {
    // Delete RFQ items and quotations
    await Promise.all([
      prisma.rfqItem.deleteMany({ where: { rfqId } }),
      prisma.rfqQuotation.deleteMany({ where: { rfqId } }),
      prisma.rfqAssignment.deleteMany({ where: { rfqId } })
    ])

    return await prisma.rfq.delete({
      where: { id: rfqId }
    })
  }
}

export class QuotationService {
  // Create quotation for RFQ
  static async createQuotation(data, createdByUserId) {
    const { rfqId, items = [], subtotal, tax = 0, total, currency = 'USD', validUntil, notes } = data

    const quotation = await prisma.rfqQuotation.create({
      data: {
        rfqId,
        items,
        subtotal: parseFloat(subtotal || total || 0),
        tax: parseFloat(tax || 0),
        total: parseFloat(total || subtotal || 0),
        currency,
        validUntil: new Date(validUntil),
        notes,
        status: 'draft'
      }
    })

    return quotation
  }

  // Get quotations for RFQ
  static async getRFQQuotations(rfqId) {
    return await prisma.rfqQuotation.findMany({
      where: { rfqId },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Accept quotation
  static async acceptQuotation(quotationId) {
    const quotation = await prisma.rfqQuotation.findUnique({
      where: { id: quotationId },
      include: { rfq: true }
    })

    if (!quotation) throw new Error('Quotation not found')

    // Reject all other quotations for this RFQ
    await prisma.rfqQuotation.updateMany({
      where: { rfqId: quotation.rfqId, id: { not: quotationId } },
      data: { status: 'rejected' }
    })

    // Accept this quotation
    return await prisma.rfqQuotation.update({
      where: { id: quotationId },
      data: { status: 'accepted' }
    })
  }

  // Reject quotation
  static async rejectQuotation(quotationId) {
    return await prisma.rfqQuotation.update({
      where: { id: quotationId },
      data: { status: 'rejected' }
    })
  }
}

export default {
  RFQService,
  QuotationService
}
