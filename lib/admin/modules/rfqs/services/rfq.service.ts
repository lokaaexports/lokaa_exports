// lib/admin/modules/rfqs/services/rfq.service.js
// Request for Quote Management Service

import prisma from '@/lib/prisma'

export class RFQService {
  // Get all RFQs
  static async getAllRFQs(filters: Record<string, any> = {}, pagination: Record<string, any> = {}) {
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
      prisma.rFQ.findMany({
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
      prisma.rFQ.count({ where })
    ])

    return {
      data,
      pagination: { total, limit, offset, pages: Math.ceil(total / limit) }
    }
  }

  // Get RFQ by ID
  static async getRFQById(rfqId: any) {
    return await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: {
        customer: true,
        items: true,
        quotations: { orderBy: { version: 'desc' } },
        assignment: { include: { user: true } }
      }
    })
  }

  // Create RFQ
  static async createRFQ(data: any, createdByUserId: any) {
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

    const rfq = await prisma.rFQ.create({
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
        items.map((item: any) =>
          prisma.rFQItem.create({
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
  static async updateRFQ(rfqId: any, data: any) {
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

    return await prisma.rFQ.update({
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
      prisma.rFQ.count(),
      prisma.rFQ.count({ where: { status: 'new' } }),
      prisma.rFQ.count({ where: { status: 'quoted' } }),
      prisma.rFQ.count({ where: { status: 'converted' } }),
      prisma.rFQ.count({ where: { status: 'rejected' } })
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
  static async closeRFQ(rfqId: any) {
    return await prisma.rFQ.update({
      where: { id: rfqId },
      data: {
        status: 'converted',
        updatedAt: new Date()
      }
    })
  }

  // Delete RFQ
  static async deleteRFQ(rfqId: any) {
    // Delete RFQ items and quotations
    await Promise.all([
      prisma.rFQItem.deleteMany({ where: { rfqId } }),
      prisma.rFQQuotation.deleteMany({ where: { rfqId } }),
      prisma.rFQAssignment.deleteMany({ where: { rfqId } })
    ])

    return await prisma.rFQ.delete({
      where: { id: rfqId }
    })
  }
}

export class QuotationService {
  // Create quotation for RFQ
  static async createQuotation(data: any, createdByUserId: any) {
    const { rfqId, items = [], subtotal, tax = 0, total, currency = 'USD', validUntil, notes } = data

    const quotation = await prisma.rFQQuotation.create({
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
  static async getRFQQuotations(rfqId: any) {
    return await prisma.rFQQuotation.findMany({
      where: { rfqId },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Accept quotation
  static async acceptQuotation(quotationId: any) {
    const quotation = await prisma.rFQQuotation.findUnique({
      where: { id: quotationId },
      include: { rfq: true }
    })

    if (!quotation) throw new Error('Quotation not found')

    // Reject all other quotations for this RFQ
    await prisma.rFQQuotation.updateMany({
      where: { rfqId: quotation.rfqId, id: { not: quotationId } },
      data: { status: 'rejected' }
    })

    // Accept this quotation
    return await prisma.rFQQuotation.update({
      where: { id: quotationId },
      data: { status: 'accepted' }
    })
  }

  // Reject quotation
  static async rejectQuotation(quotationId: any) {
    return await prisma.rFQQuotation.update({
      where: { id: quotationId },
      data: { status: 'rejected' }
    })
  }
}

export default {
  RFQService,
  QuotationService
}
