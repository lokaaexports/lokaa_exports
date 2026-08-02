import { getMysqlPool } from '@/lib/admin/database/connection'
import { v4 as uuidv4 } from 'uuid'

export class RFQService {
  async getAllRFQs(filters: Record<string, any> = {}, limit = 50, offset = 0) {
    const pool = await getMysqlPool()
    let query = `
      SELECT *
      FROM rfqs
      WHERE 1=1
    `
    const params = []

    if (filters.status) {
      query += ` AND status = ?`
      params.push(filters.status)
    }
    if (filters.priority) {
      query += ` AND priority = ?`
      params.push(filters.priority)
    }
    if (filters.customerId) {
      query += ` AND customer_id = ?`
      params.push(filters.customerId)
    }
    if (filters.search) {
      query += ` AND (reference LIKE ? OR company LIKE ? OR productInterest LIKE ?)`
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`)
    }

    query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rfqs] = await pool.query(query, params)
    return rfqs
  }

  async createRFQ(rfqData: any, createdBy: any) {
    const pool = await getMysqlPool()
    const { customerId, leadId, productDescription, quantity, unit, expectedDeliveryDate, assignedTo, priority = 'normal', notes } = rfqData

    if (!productDescription || !quantity) {
      throw new Error('productDescription and quantity are required')
    }

    const id = uuidv4()
    const reference = 'RFQ' + String(Date.now()).slice(-8)
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    const [result] = await pool.query(
      `INSERT INTO rfqs (id, reference, productInterest, quantity, notes, assignedSalesPerson, priority, status, customer_id, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, reference, productDescription, quantity, notes || '', assignedTo || '', priority, 'new', customerId || null, now, now]
    )
    return { id, reference, ...rfqData }
  }

  async updateRFQ(rfqId: any, updateData: any) {
    const pool = await getMysqlPool()
    const allowedFields = ['productInterest', 'quantity', 'notes', 'assignedSalesPerson', 'priority', 'status']
    const updates = []
    const values = []

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`)
        values.push(updateData[key])
      }
    })

    if (updates.length === 0) return { affectedRows: 0 }

    values.push(rfqId)
    const [result] = await pool.query(
      `UPDATE rfqs SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`,
      values
    )
    return result
  }

  async deleteRFQ(rfqId: any) {
    const pool = await getMysqlPool()
    const [result] = await pool.query(
      `DELETE FROM rfqs WHERE id = ?`,
      [rfqId]
    )
    return result
  }

  async getRFQById(rfqId: any) {
    const pool = await getMysqlPool()
    const [rfqs] = await pool.query(
      `SELECT * FROM rfqs WHERE id = ?`,
      [rfqId]
    )
    return rfqs[0]
  }

  async getRFQsByCustomer(customerId: any, limit = 20, offset = 0) {
    const pool = await getMysqlPool()
    const [rfqs] = await pool.query(
      `SELECT * FROM rfqs WHERE customer_id = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [customerId, limit, offset]
    )
    return rfqs
  }

  async getRFQsByLead(leadId: any, limit = 20, offset = 0) {
    const pool = await getMysqlPool()
    const [rfqs] = await pool.query(
      `SELECT * FROM rfqs ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    )
    return rfqs
  }

  async getRFQStats() {
    const pool = await getMysqlPool()
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_rfqs,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_rfqs,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_rfqs,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_rfqs
       FROM rfqs`
    )
    return stats[0]
  }

  async getRFQsByStatus() {
    const pool = await getMysqlPool()
    const [results] = await pool.query(
      `SELECT status, COUNT(*) as count FROM rfqs GROUP BY status ORDER BY count DESC`
    )
    
    const statusCounts = {}
    results.forEach(row => {
      statusCounts[row.status] = row.count
    })
    return statusCounts
  }

  async getPendingRFQs() {
    const pool = await getMysqlPool()
    const [rfqs] = await pool.query(
      `SELECT * FROM rfqs WHERE status IN ('new', 'processing') ORDER BY createdAt ASC`
    )
    return rfqs
  }
}

export default RFQService
