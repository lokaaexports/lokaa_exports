// lib/admin/modules/crm/services/crm.service.js
// Customer Relationship Management Service

import prisma from '@/lib/prisma'

export class CustomerService {
  // Get all customers
  static async getAllCustomers(filters: Record<string, any> = {}, pagination: Record<string, any> = {}) {
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
          assignments: { include: { user: true } }
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
  static async getCustomerById(customerId: any) {
    return await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        addresses: true,
        leads: true,
        assignments: { include: { user: true } },
        notes: true
      }
    })
  }

  // Create customer
  static async createCustomer(data: any, createdByUserId: any) {
    const { name, email, phone, companyName, country, website } = data
    const slug = email.split('@')[0] + '-' + Math.floor(Math.random() * 10000)

    return await prisma.customer.create({
      data: {
        contactName: name,
        email,
        phone,
        companyName,
        country,
        website,
        slug,
        status: 'active'
      }
    })
  }

  // Update customer
  static async updateCustomer(customerId: any, data: any) {
    const { name, email, phone, companyName, country, city, website, status } = data

    return await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(name && { contactName: name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(companyName && { companyName }),
        ...(country && { country }),
        ...(website && { website }),
        ...(status && { status }),
        updatedAt: new Date()
      }
    })
  }

  // Add customer note
  static async addNote(customerId: any, content: any, createdByUserId: any) {
    return await prisma.note.create({
      data: {
        customerId,
        content
      }
    })
  }

  // Get customer statistics
  static async getCustomerStats() {
    const [total, active, byCountry] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'active' } }),
      prisma.customer.groupBy({
        by: ['country'],
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
  static async deleteCustomer(customerId: any) {
    // Delete related records
    await Promise.all([
      prisma.customerAddress.deleteMany({ where: { customerId } }),
      prisma.note.deleteMany({ where: { customerId } }),
      prisma.customerAssignment.deleteMany({ where: { customerId } })
    ])

    return await prisma.customer.delete({
      where: { id: customerId }
    })
  }
}

export class LeadService {
  // Get all leads
  static async getAllLeads(filters: Record<string, any> = {}, pagination: Record<string, any> = {}) {
    const { limit = 50, offset = 0 } = pagination
    const where = {
      ...(filters.status && { status: filters.status }),
      ...(filters.source && { source: filters.source })
    }

    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          customer: true,
          assignment: { include: { user: true } },
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
  static async getLeadById(leadId: any) {
    return await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        customer: true,
        assignment: { include: { user: true } },
        activities: true
      }
    })
  }

  static async createLead(data: any, createdByUserId: any) {
    const { customerId, title, description, source, interestedProducts } = data
    const count = await prisma.lead.count()
    const reference = 'LD-' + String(1000 + count)

    return await prisma.lead.create({
      data: {
        reference,
        customerId,
        title,
        description,
        source,
        interestedProducts,
        status: 'new'
      }
    })
  }

  // Update lead
  static async updateLead(leadId: any, data: any) {
    const { title, description, status, interestedProducts } = data

    return await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(interestedProducts && { interestedProducts }),
        updatedAt: new Date()
      }
    })
  }

  static async convertToCustomer(leadId: any) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { customer: true }
    })

    if (!lead) throw new Error('Lead not found')

    const customer = lead.customer

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
    }
  }
}

export class ActivityService {
  // Log activity
  static async logActivity(data: any, createdByUserId: any) {
    const { leadId, type, title, description } = data

    return await prisma.activity.create({
      data: {
        leadId: leadId || null,
        type,
        title: title || type,
        description,
        createdBy: createdByUserId
      }
    })
  }

  // Get activities
  static async getActivities(filters: Record<string, any> = {}, limit = 50) {
    const where = {
      ...(filters.customerId && { customerId: filters.customerId }),
      ...(filters.leadId && { leadId: filters.leadId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type })
    }

    return await prisma.activity.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  }


}

export default {
  CustomerService,
  LeadService,
  ActivityService
}
