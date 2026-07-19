// lib/admin/services/customer.service.js
// Customer Management Service

import { getMysqlPool } from '@/lib/admin/database/connection'

export class CustomerService {
  // Get all customers with filtering
  static async getAllCustomers(filters = {}, pagination = {}) {
    try {
      const pool = await getMysqlPool()
      const limit = pagination.limit || 20
      const offset = pagination.offset || 0
      const { country, status, search } = filters

      let query = `
        SELECT 
          id, company_name, contact_person, email, phone, 
          country, industry, website, status, created_at
        FROM customers
        WHERE deleted_at IS NULL
      `

      const params = []

      if (country) {
        query += ` AND country = ?`
        params.push(country)
      }

      if (status) {
        query += ` AND status = ?`
        params.push(status)
      }

      if (search) {
        query += ` AND (company_name LIKE ? OR email LIKE ? OR contact_person LIKE ?)`
        const searchTerm = `%${search}%`
        params.push(searchTerm, searchTerm, searchTerm)
      }

      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
      params.push(limit, offset)

      const [customers] = await pool.query(query, params)

      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM customers WHERE deleted_at IS NULL`
      const countParams = []

      if (country) {
        countQuery += ` AND country = ?`
        countParams.push(country)
      }
      if (status) {
        countQuery += ` AND status = ?`
        countParams.push(status)
      }
      if (search) {
        countQuery += ` AND (company_name LIKE ? OR email LIKE ? OR contact_person LIKE ?)`
        const searchTerm = `%${search}%`
        countParams.push(searchTerm, searchTerm, searchTerm)
      }

      const [[{ total }]] = await pool.query(countQuery, countParams)

      return {
        data: customers,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      console.error('Get customers error:', error)
      throw new Error(`Failed to fetch customers: ${error.message}`)
    }
  }

  // Get customer by ID
  static async getCustomerById(customerId) {
    try {
      const pool = await getMysqlPool()
      const [[customer]] = await pool.query(
        `SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL`,
        [customerId]
      )
      return customer
    } catch (error) {
      console.error('Get customer error:', error)
      throw new Error(`Failed to fetch customer: ${error.message}`)
    }
  }

  // Create new customer
  static async createCustomer(customerData, createdBy) {
    try {
      const pool = await getMysqlPool()
      const { companyName, contactPerson, email, phone, country, industry, website, status, notes } = customerData

      const [result] = await pool.query(
        `INSERT INTO customers 
        (company_name, contact_person, email, phone, country, industry, website, status, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [companyName, contactPerson, email, phone, country, industry, website, status || 'prospect', notes, createdBy]
      )

      return {
        id: result.insertId,
        ...customerData
      }
    } catch (error) {
      console.error('Create customer error:', error)
      throw new Error(`Failed to create customer: ${error.message}`)
    }
  }

  // Update customer
  static async updateCustomer(customerId, updateData, updatedBy) {
    try {
      const pool = await getMysqlPool()
      const allowedFields = ['company_name', 'contact_person', 'email', 'phone', 'country', 'industry', 'website', 'status', 'notes']

      let updateQuery = `UPDATE customers SET `
      const updateParams = []

      Object.keys(updateData).forEach((key, index) => {
        const dbKey = key === 'companyName' ? 'company_name' : 
                     key === 'contactPerson' ? 'contact_person' : key
        
        if (allowedFields.includes(dbKey)) {
          if (updateParams.length > 0) updateQuery += ', '
          updateQuery += `${dbKey} = ?`
          updateParams.push(updateData[key])
        }
      })

      updateQuery += `, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      updateParams.push(customerId)

      await pool.query(updateQuery, updateParams)

      return { id: customerId, ...updateData }
    } catch (error) {
      console.error('Update customer error:', error)
      throw new Error(`Failed to update customer: ${error.message}`)
    }
  }

  // Delete customer (soft delete)
  static async deleteCustomer(customerId) {
    try {
      const pool = await getMysqlPool()
      await pool.query(
        `UPDATE customers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [customerId]
      )
    } catch (error) {
      console.error('Delete customer error:', error)
      throw new Error(`Failed to delete customer: ${error.message}`)
    }
  }

  // Get customer stats
  static async getCustomerStats() {
    try {
      const pool = await getMysqlPool()
      const [[stats]] = await pool.query(`SELECT * FROM customer_stats`)
      return stats
    } catch (error) {
      console.error('Get customer stats error:', error)
      throw new Error(`Failed to fetch customer stats: ${error.message}`)
    }
  }
}

export default CustomerService
