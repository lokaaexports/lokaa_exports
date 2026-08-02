// lib/admin/services/customer.service.ts
// Customer Management Service using Prisma

import prisma from '@/lib/prisma'

export class CustomerService {
  // Get all customers with filtering
  static async getAllCustomers(filters: Record<string, any> = {}, pagination: Record<string, any> = {}) {
    try {
      const limit = Number(pagination.limit) || 20
      const offset = Number(pagination.offset) || 0
      const { country, status, search } = filters

      const where: any = { deletedAt: null }

      if (country) where.country = country
      if (status) where.status = status
      if (search) {
        where.OR = [
          { companyName: { contains: search } },
          { email: { contains: search } },
          { contactName: { contains: search } }
        ]
      }

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
            country: true,
            industry: true,
            website: true,
            status: true,
            createdAt: true,
          }
        }),
        prisma.customer.count({ where })
      ])

      // Map for backwards compatibility with UI
      const mappedCustomers = customers.map(c => ({
        ...c,
        contactPerson: c.contactName,
        contact_person: c.contactName,
        company_name: c.companyName,
        created_at: c.createdAt
      }))

      return {
        data: mappedCustomers,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error: any) {
      console.error('Get customers error:', error)
      throw new Error(`Failed to fetch customers: ${error.message}`)
    }
  }

  // Get customer by ID
  static async getCustomerById(customerId: any) {
    try {
      return await prisma.customer.findUnique({
        where: { id: customerId, deletedAt: null }
      })
    } catch (error: any) {
      console.error('Get customer error:', error)
      throw new Error(`Failed to fetch customer: ${error.message}`)
    }
  }

  // Create new customer
  static async createCustomer(customerData: any, createdBy: any) {
    try {
      const slug = customerData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
      
      const newCustomer = await prisma.customer.create({
        data: {
          companyName: customerData.companyName,
          slug,
          contactName: customerData.contactPerson || customerData.contactName || '',
          email: customerData.email,
          phone: customerData.phone || '',
          country: customerData.country || '',
          industry: customerData.industry || '',
          website: customerData.website || '',
          status: customerData.status || 'active',
        }
      })
      return newCustomer
    } catch (error: any) {
      console.error('Create customer error:', error)
      throw new Error(`Failed to create customer: ${error.message}`)
    }
  }

  // Update customer
  static async updateCustomer(customerId: any, updateData: any, updatedBy: any) {
    try {
      const data: any = {}
      if (updateData.companyName || updateData.company_name) data.companyName = updateData.companyName || updateData.company_name
      if (updateData.contactPerson || updateData.contactName) data.contactName = updateData.contactPerson || updateData.contactName
      if (updateData.email) data.email = updateData.email
      if (updateData.phone) data.phone = updateData.phone
      if (updateData.country) data.country = updateData.country
      if (updateData.industry) data.industry = updateData.industry
      if (updateData.website) data.website = updateData.website
      if (updateData.status) data.status = updateData.status

      return await prisma.customer.update({
        where: { id: customerId },
        data
      })
    } catch (error: any) {
      console.error('Update customer error:', error)
      throw new Error(`Failed to update customer: ${error.message}`)
    }
  }

  // Delete customer (soft delete)
  static async deleteCustomer(customerId: any) {
    try {
      return await prisma.customer.update({
        where: { id: customerId },
        data: { deletedAt: new Date() }
      })
    } catch (error: any) {
      console.error('Delete customer error:', error)
      throw new Error(`Failed to delete customer: ${error.message}`)
    }
  }

  // Get customer stats
  static async getCustomerStats() {
    try {
      const [total, active, newThisMonth] = await Promise.all([
        prisma.customer.count({ where: { deletedAt: null } }),
        prisma.customer.count({ where: { status: 'active', deletedAt: null } }),
        prisma.customer.count({ 
          where: { 
            deletedAt: null,
            createdAt: { gte: new Date(new Date().setDate(1)) }
          }
        })
      ])
      
      return {
        totalCustomers: total,
        activeCustomers: active,
        newThisMonth: newThisMonth
      }
    } catch (error: any) {
      console.error('Get customer stats error:', error)
      throw new Error(`Failed to fetch customer stats: ${error.message}`)
    }
  }
}

export default CustomerService
