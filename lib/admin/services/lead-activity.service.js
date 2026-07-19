import { getMysqlPool } from '@/lib/admin/database/connection'

export class LeadActivityService {
  async getAllActivities(leadId, limit = 50, offset = 0) {
    const pool = await getMysqlPool()
    const [activities] = await pool.query(
      `SELECT la.*, u.name as created_by_name 
       FROM lead_activities la
       LEFT JOIN users u ON la.created_by = u.id
       WHERE la.lead_id = ?
       ORDER BY la.created_at DESC
       LIMIT ? OFFSET ?`,
      [leadId, limit, offset]
    )
    return activities
  }

  async logActivity(leadId, activityType, description, createdBy) {
    const pool = await getMysqlPool()
    const [result] = await pool.query(
      `INSERT INTO lead_activities (lead_id, activity_type, description, created_by) 
       VALUES (?, ?, ?, ?)`,
      [leadId, activityType, description, createdBy]
    )
    return result
  }

  async logStatusChange(leadId, oldStatus, newStatus, createdBy) {
    return this.logActivity(
      leadId,
      'status_change',
      `Status changed from ${oldStatus} to ${newStatus}`,
      createdBy
    )
  }

  async logAssignment(leadId, employeeName, createdBy) {
    return this.logActivity(
      leadId,
      'assignment',
      `Lead assigned to ${employeeName}`,
      createdBy
    )
  }

  async logNote(leadId, note, createdBy) {
    return this.logActivity(
      leadId,
      'note',
      note,
      createdBy
    )
  }

  async getActivityStats(leadId) {
    const pool = await getMysqlPool()
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_activities,
        SUM(CASE WHEN activity_type = 'status_change' THEN 1 ELSE 0 END) as status_changes,
        SUM(CASE WHEN activity_type = 'assignment' THEN 1 ELSE 0 END) as assignments,
        SUM(CASE WHEN activity_type = 'note' THEN 1 ELSE 0 END) as notes,
        SUM(CASE WHEN activity_type = 'communication' THEN 1 ELSE 0 END) as communications
       FROM lead_activities
       WHERE lead_id = ?`,
      [leadId]
    )
    return stats[0]
  }
}

export default LeadActivityService
