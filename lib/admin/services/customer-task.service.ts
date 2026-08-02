import { getMysqlPool } from '@/lib/admin/database/connection'

export class CustomerTaskService {
  normalizeTaskRow(task: any) {
    if (!task) return task

    return {
      ...task,
      customerId: task.customer_id ?? task.customerId ?? null,
      leadId: task.lead_id ?? task.leadId ?? null,
      taskType: task.task_type ?? task.taskType ?? null,
      dueDate: task.due_date ?? task.dueDate ?? null,
      assignedTo: task.assigned_to ?? task.assignedTo ?? null,
      createdBy: task.created_by ?? task.createdBy ?? null,
      updatedAt: task.updated_at ?? task.updatedAt ?? null
    }
  }

  async getAllTasks(filters: Record<string, any> = {}, limit = 50, offset = 0) {
    const pool = await getMysqlPool()
    let query = `
      SELECT
        ct.id,
        ct.customer_id,
        ct.lead_id,
        ct.title,
        ct.description,
        ct.task_type,
        ct.due_date,
        ct.priority,
        ct.assigned_to,
        ct.status,
        ct.created_by,
        ct.created_at,
        ct.updated_at,
        ct.deleted_at,
        c.company_name,
        e.first_name,
        e.last_name
      FROM customer_tasks ct
      LEFT JOIN customers c ON ct.customer_id = c.id
      LEFT JOIN employees e ON ct.assigned_to = e.id
      WHERE ct.deleted_at IS NULL
    `
    const params = []

    if (filters.status) {
      query += ` AND ct.status = ?`
      params.push(filters.status)
    }
    if (filters.customerId) {
      query += ` AND ct.customer_id = ?`
      params.push(filters.customerId)
    }
    if (filters.assignedTo) {
      query += ` AND ct.assigned_to = ?`
      params.push(filters.assignedTo)
    }
    if (filters.priority) {
      query += ` AND ct.priority = ?`
      params.push(filters.priority)
    }
    if (filters.search) {
      query += ` AND (ct.title LIKE ? OR c.company_name LIKE ?)`
      params.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    query += ` ORDER BY ct.due_date ASC, ct.created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [tasks] = await pool.query(query, params)
    return tasks.map(task => this.normalizeTaskRow(task))
  }

  async createTask(taskData: any, createdBy: any) {
    const pool = await getMysqlPool()
    const {
      customerId,
      leadId,
      title,
      description,
      taskType,
      dueDate,
      due_date,
      priority = 'medium',
      assignedTo,
      assigned_to,
      status = 'pending'
    } = taskData

    if (!title || (!customerId && !leadId)) {
      throw new Error('title and either customerId or leadId are required')
    }

    const [result] = await pool.query(
      `INSERT INTO customer_tasks (customer_id, lead_id, title, description, task_type, due_date, priority, assigned_to, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId || null,
        leadId || null,
        title,
        description,
        taskType || null,
        dueDate || due_date || null,
        priority,
        assignedTo || assigned_to || null,
        status,
        createdBy
      ]
    )
    return result
  }

  async updateTask(taskId: any, updateData: any) {
    const pool = await getMysqlPool()
    const allowedFields = ['customer_id', 'lead_id', 'title', 'description', 'task_type', 'due_date', 'priority', 'assigned_to', 'status']
    const updates = []
    const values = []

    Object.keys(updateData).forEach(key => {
      const column = ({
        customerId: 'customer_id',
        leadId: 'lead_id',
        taskType: 'task_type',
        dueDate: 'due_date',
        assignedTo: 'assigned_to'
      })[key] || key

      if (allowedFields.includes(column)) {
        updates.push(`${column} = ?`)
        values.push(updateData[key])
      }
    })

    if (updates.length === 0) return { affectedRows: 0 }

    values.push(taskId)
    const [result] = await pool.query(
      `UPDATE customer_tasks SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      values
    )
    return result
  }

  async completeTask(taskId: any) {
    return this.updateTask(taskId, { status: 'completed' })
  }

  async deleteTask(taskId: any) {
    const pool = await getMysqlPool()
    const [result] = await pool.query(
      `UPDATE customer_tasks SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [taskId]
    )
    return result
  }

  async getTasksByCustomer(customerId: any, limit = 20, offset = 0) {
    return this.getAllTasks({ customerId }, limit, offset)
  }

  async getTasksByLead(leadId: any, limit = 20, offset = 0) {
    const pool = await getMysqlPool()
    const [tasks] = await pool.query(
      `SELECT
        ct.id,
        ct.customer_id,
        ct.lead_id,
        ct.title,
        ct.description,
        ct.task_type,
        ct.due_date,
        ct.priority,
        ct.assigned_to,
        ct.status,
        ct.created_by,
        ct.created_at,
        ct.updated_at,
        ct.deleted_at,
        c.company_name,
        e.first_name,
        e.last_name
       FROM customer_tasks ct
       LEFT JOIN customers c ON ct.customer_id = c.id
       LEFT JOIN employees e ON ct.assigned_to = e.id
       WHERE ct.lead_id = ? AND ct.deleted_at IS NULL
       ORDER BY ct.due_date ASC
       LIMIT ? OFFSET ?`,
      [leadId, limit, offset]
    )
    return tasks.map(task => this.normalizeTaskRow(task))
  }

  async getTaskStats() {
    const pool = await getMysqlPool()
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_tasks,
        COUNT(DISTINCT assigned_to) as team_members_involved
       FROM customer_tasks
       WHERE deleted_at IS NULL AND status != 'completed'`
    )
    return stats[0]
  }

  async getOverdueTasks() {
    const pool = await getMysqlPool()
    const [tasks] = await pool.query(
      `SELECT
        ct.id,
        ct.customer_id,
        ct.lead_id,
        ct.title,
        ct.description,
        ct.task_type,
        ct.due_date,
        ct.priority,
        ct.assigned_to,
        ct.status,
        ct.created_by,
        ct.created_at,
        ct.updated_at,
        ct.deleted_at,
        c.company_name,
        e.first_name,
        e.last_name
       FROM customer_tasks ct
       LEFT JOIN customers c ON ct.customer_id = c.id
       LEFT JOIN employees e ON ct.assigned_to = e.id
       WHERE ct.due_date < NOW() 
         AND ct.status != 'completed'
         AND ct.deleted_at IS NULL
       ORDER BY ct.due_date ASC`
    )
    return tasks.map(task => this.normalizeTaskRow(task))
  }
}

export default CustomerTaskService
