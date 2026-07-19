// lib/admin/modules/crm/services/crm.service.js
// Customer Relationship Management Service

import prisma from '@/lib/prisma'

export class CustomerService {
  // Get all customers
  static async getAllCustomers(filters = {}, pagination = {}) {
    const { limit = 50, offset = 0 } = pagination
    const where = {
      companyId: 1,
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search } },
          { email: { contains: filters.search } },
          { phone: { contains: filters.search } }
        ]
      }),
      ...(filters.status && { status: filters.status }),
      ...(filters.country && { country: filters.country })
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          addresses: true,
          leads: true,
          activities: true,
          assignments: { include: { user: true } },
          products: true
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ])

    return {
      data,
      pagination: { total, limit, offset, pages: Math.ceil(total / limit) }
    }
  }

  // Get customer by ID
  static async getCustomerById(customerId) {
    return await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        addresses: true,
        leads: { include: { assignments: { include: { user: true } } } },
        activities: { include: { createdBy: true } },
        assignments: { include: { user: true } },
        notes: true,
        products: true
      }
    })
  }

  // Create customer
  static async createCustomer(data, createdByUserId) {
    const { name, email, phone, companyName, country, city, website } = data

    return await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        companyName,
        country,
        city,
        website,
        status: 'active',
        companyId: 1,
        createdBy: createdByUserId
      }
    })
  }

  // Update customer
  static async updateCustomer(customerId, data) {
    const { name, email, phone, companyName, country, city, website, status } = data

    return await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(companyName && { companyName }),
        ...(country && { country }),
        ...(city && { city }),
        ...(website && { website }),
        ...(status && { status }),
        updatedAt: new Date()
      }
    })
  }

  // Add customer note
  static async addNote(customerId, content, createdByUserId) {
    return await prisma.note.create({
      data: {
        customerId,
        content,
        createdBy: createdByUserId
      }
    })
  }

  // Get customer statistics
  static async getCustomerStats() {
    const [total, active, byCountry] = await Promise.all([
      prisma.customer.count({ where: { companyId: 1 } }),
      prisma.customer.count({ where: { companyId: 1, status: 'active' } }),
      prisma.customer.groupBy({
        by: ['country'],
        where: { companyId: 1 },
        _count: true
      })
    ])

    return {
      totalCustomers: total,
      activeCustomers: active,
      byCountry
    }
  }

  // Delete customer
  static async deleteCustomer(customerId) {
    // Delete related records
    await Promise.all([
      prisma.customerAddress.deleteMany({ where: { customerId } }),
      prisma.note.deleteMany({ where: { customerId } }),
      prisma.customerAssignment.deleteMany({ where: { customerId } }),
      prisma.activity.deleteMany({ where: { customerId } })
    ])

    return await prisma.customer.delete({
      where: { id: customerId }
    })
  }
}

export class LeadService {
  // Get all leads
  static async getAllLeads(filters = {}, pagination = {}) {
    const { limit = 50, offset = 0 } = pagination
    const where = {
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search } },
          { email: { contains: filters.search } }
        ]
      }),
      ...(filters.status && { status: filters.status }),
      ...(filters.source && { source: filters.source })
    }

    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          customer: true,
          assignments: { include: { user: true } },
          activities: true
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.lead.count({ where })
    ])

    return {
      data,
      pagination: { total, limit, offset, pages: Math.ceil(total / limit) }
    }
  }

  // Get lead by ID
  static async getLeadById(leadId) {
    return await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        customer: true,
        assignments: { include: { user: true } },
        activities: true
      }
    })
  }

  // Create lead
  static async createLead(data, createdByUserId) {
    const { name, email, phone, source, companyName, country, interest } = data

    return await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        source,
        companyName,
        country,
        interest,
        status: 'new',
        createdBy: createdByUserId
      }
    })
  }

  // Update lead
  static async updateLead(leadId, data) {
    const { name, email, phone, status, interest } = data

    return await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(status && { status }),
        ...(interest && { interest }),
        updatedAt: new Date()
      }
    })
  }

  // Convert lead to customer
  static async convertToCustomer(leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) throw new Error('Lead not found')

    const customer = await prisma.customer.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName,
        country: lead.country,
        status: 'active',
        companyId: 1
      }
    })

    // Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'converted', customerId: customer.id }
    })

    return customer
  }

  // Get lead statistics
  static async getLeadStats() {
    const [total, newLeads, converted, lost] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'new' } }),
      prisma.lead.count({ where: { status: 'converted' } }),
      prisma.lead.count({ where: { status: 'lost' } })
    ])

    return {
      totalLeads: total,
      newLeads,
      converted,
      lost,
      conversionRate: total > 0 ? ((converted / total) * 100).toFixed(2) : 0
    }
  }
}

export class ActivityService {
  // Log activity
  static async logActivity(data, createdByUserId) {
    const { customerId, leadId, type, description, dueDate } = data

    return await prisma.activity.create({
      data: {
        customerId: customerId || null,
        leadId: leadId || null,
        type,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'pending',
        createdBy: createdByUserId
      }
    })
  }

  // Get activities
  static async getActivities(filters = {}, limit = 50) {
    const where = {
      ...(filters.customerId && { customerId: filters.customerId }),
      ...(filters.leadId && { leadId: filters.leadId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type })
    }

    return await prisma.activity.findMany({
      where,
      include: { createdBy: true },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  }

  // Complete activity
  static async completeActivity(activityId) {
    return await prisma.activity.update({
      where: { id: activityId },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    })
  }
}

export default {
  CustomerService,
  LeadService,
  ActivityService
}
