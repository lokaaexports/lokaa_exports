// lib/admin/services/lead.service.js
// Lead Management Service

import { getMysqlPool } from '@/lib/admin/database/connection'

export class LeadService {
  // Get all leads with filtering
  static async getAllLeads(filters = {}, pagination = {}) {
    try {
      const pool = await getMysqlPool()
      const limit = pagination.limit || 20
      const offset = pagination.offset || 0
      const { status, priority, assignedEmployee, search } = filters

      let query = `
        SELECT 
          l.id, l.lead_reference, l.customer_id, c.company_name, 
          l.source, l.product_interest, l.country, l.status, l.priority,
          l.assigned_employee, e.first_name, e.last_name, l.created_at,
          l.notes
        FROM leads l
        LEFT JOIN customers c ON l.customer_id = c.id
        LEFT JOIN employees e ON l.assigned_employee = e.id
        WHERE l.deleted_at IS NULL
      `

      const params = []

      if (status) {
        query += ` AND l.status = ?`
        params.push(status)
      }

      if (priority) {
        query += ` AND l.priority = ?`
        params.push(priority)
      }

      if (assignedEmployee) {
        query += ` AND l.assigned_employee = ?`
        params.push(assignedEmployee)
      }

      if (search) {
        query += ` AND (c.company_name LIKE ? OR l.product_interest LIKE ? OR l.lead_reference LIKE ?)`
        const searchTerm = `%${search}%`
        params.push(searchTerm, searchTerm, searchTerm)
      }

      query += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`
      params.push(limit, offset)

      const [leads] = await pool.query(query, params)

      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM leads WHERE deleted_at IS NULL`
      const countParams = []

      if (status) {
        countQuery += ` AND status = ?`
        countParams.push(status)
      }
      if (priority) {
        countQuery += ` AND priority = ?`
        countParams.push(priority)
      }
      if (assignedEmployee) {
        countQuery += ` AND assigned_employee = ?`
        countParams.push(assignedEmployee)
      }
      if (search) {
        countQuery += ` AND (EXISTS(SELECT 1 FROM customers c WHERE c.id = leads.customer_id AND c.company_name LIKE ?) OR product_interest LIKE ? OR lead_reference LIKE ?)`
        const searchTerm = `%${search}%`
        countParams.push(searchTerm, searchTerm, searchTerm)
      }

      const [[{ total }]] = await pool.query(countQuery, countParams)

      return {
        data: leads,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      console.error('Get leads error:', error)
      throw new Error(`Failed to fetch leads: ${error.message}`)
    }
  }

  // Get lead by ID
  static async getLeadById(leadId) {
    try {
      const pool = await getMysqlPool()
      const [[lead]] = await pool.query(
        `SELECT l.*, c.company_name FROM leads l 
         LEFT JOIN customers c ON l.customer_id = c.id 
         WHERE l.id = ? AND l.deleted_at IS NULL`,
        [leadId]
      )
      return lead
    } catch (error) {
      console.error('Get lead error:', error)
      throw new Error(`Failed to fetch lead: ${error.message}`)
    }
  }

  // Create new lead
  static async createLead(leadData, createdBy) {
    try {
      const pool = await getMysqlPool()
      const { customerId, source, productInterest, country, status, priority, assignedEmployee, notes } = leadData

      // Generate lead reference
      const [[{ maxId }]] = await pool.query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING(lead_reference, 4) AS UNSIGNED)), 0) as maxId 
        FROM leads 
        WHERE lead_reference LIKE 'LD%'
      `)
      const leadReference = `LD${String(maxId + 1).padStart(4, '0')}`

      const [result] = await pool.query(
        `INSERT INTO leads 
        (lead_reference, customer_id, source, product_interest, country, status, priority, assigned_employee, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [leadReference, customerId, source, productInterest, country, status || 'new', priority || 'medium', assignedEmployee, notes, createdBy]
      )

      return {
        id: result.insertId,
        lead_reference: leadReference,
        ...leadData
      }
    } catch (error) {
      console.error('Create lead error:', error)
      throw new Error(`Failed to create lead: ${error.message}`)
    }
  }

  // Update lead
  static async updateLead(leadId, updateData) {
    try {
      const pool = await getMysqlPool()
      const allowedFields = ['status', 'priority', 'assigned_employee', 'product_interest', 'country', 'notes']

      let updateQuery = `UPDATE leads SET `
      const updateParams = []

      Object.keys(updateData).forEach((key) => {
        const dbKey = key === 'assignedEmployee' ? 'assigned_employee' :
                     key === 'productInterest' ? 'product_interest' : key
        
        if (allowedFields.includes(dbKey)) {
          if (updateParams.length > 0) updateQuery += ', '
          updateQuery += `${dbKey} = ?`
          updateParams.push(updateData[key])
        }
      })

      updateQuery += `, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      updateParams.push(leadId)

      await pool.query(updateQuery, updateParams)

      return { id: leadId, ...updateData }
    } catch (error) {
      console.error('Update lead error:', error)
      throw new Error(`Failed to update lead: ${error.message}`)
    }
  }

  // Delete lead (soft delete)
  static async deleteLead(leadId) {
    try {
      const pool = await getMysqlPool()
      await pool.query(
        `UPDATE leads SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [leadId]
      )
    } catch (error) {
      console.error('Delete lead error:', error)
      throw new Error(`Failed to delete lead: ${error.message}`)
    }
  }

  // Get leads by status (for pipeline)
  static async getLeadsByStatus() {
    try {
      const pool = await getMysqlPool()
      const query = `
        SELECT 
          status,
          COUNT(*) as count
        FROM leads
        WHERE deleted_at IS NULL
        GROUP BY status
        ORDER BY FIELD(status, 'new', 'contacted', 'requirement_received', 'quote_sent', 'negotiation', 'converted')
      `
      const [stats] = await pool.query(query)
      return stats
    } catch (error) {
      console.error('Get leads by status error:', error)
      throw new Error(`Failed to fetch lead statistics: ${error.message}`)
    }
  }

  // Get lead stats
  static async getLeadStats() {
    try {
      const pool = await getMysqlPool()
      const [[stats]] = await pool.query(`SELECT * FROM lead_stats`)
      return stats
    } catch (error) {
      console.error('Get lead stats error:', error)
      throw new Error(`Failed to fetch lead stats: ${error.message}`)
    }
  }

  // Assign lead to employee
  static async assignLead(leadId, employeeId) {
    try {
      const pool = await getMysqlPool()
      await pool.query(
        `UPDATE leads SET assigned_employee = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [employeeId, leadId]
      )
      
      // Log activity
      await pool.query(
        `INSERT INTO lead_activities (lead_id, activity_type, description, created_by)
         VALUES (?, ?, ?, ?)`,
        [leadId, 'assigned', `Lead assigned to employee ID: ${employeeId}`, employeeId]
      )

      return { id: leadId, assigned_employee: employeeId }
    } catch (error) {
      console.error('Assign lead error:', error)
      throw new Error(`Failed to assign lead: ${error.message}`)
    }
  }
}

export default LeadService
