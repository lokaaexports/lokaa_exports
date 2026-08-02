// lib/admin/services/employee.service.js
// Employee Management Service - Production-ready

import { getMysqlPool } from '@/lib/admin/database/connection'

export class EmployeeService {
  // Get all employees with filtering
  static async getAllEmployees(filters: Record<string, any> = {}, pagination: Record<string, any> = {}) {
    try {
      const pool = await getMysqlPool()
      const limit = pagination.limit || 20
      const offset = pagination.offset || 0
      const { department, status, search } = filters

      let query = `
        SELECT 
          e.id, e.employee_id, e.first_name, e.last_name, e.email, 
          e.phone, e.department, e.role, e.status, e.hire_date,
          e.manager_id, e.profile_image_url, e.created_at,
          CASE WHEN m.id IS NOT NULL THEN CONCAT(m.first_name, ' ', m.last_name) ELSE NULL END as manager_name
        FROM employees e
        LEFT JOIN employees m ON e.manager_id = m.id
        WHERE e.deleted_at IS NULL
      `

      const params = []

      if (department) {
        query += ` AND e.department = ?`
        params.push(department)
      }

      if (status) {
        query += ` AND e.status = ?`
        params.push(status)
      }

      if (search) {
        query += ` AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?)`
        const searchTerm = `%${search}%`
        params.push(searchTerm, searchTerm, searchTerm)
      }

      query += ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`
      params.push(limit, offset)

      const [employees] = await pool.query(query, params)

      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM employees WHERE deleted_at IS NULL`
      const countParams = []

      if (department) {
        countQuery += ` AND department = ?`
        countParams.push(department)
      }
      if (status) {
        countQuery += ` AND status = ?`
        countParams.push(status)
      }
      if (search) {
        countQuery += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`
        const searchTerm = `%${search}%`
        countParams.push(searchTerm, searchTerm, searchTerm)
      }

      const [[{ total }]] = await pool.query(countQuery, countParams)

      return {
        data: employees,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error: any) {
      console.error('Get employees error:', error)
      throw new Error(`Failed to fetch employees: ${error.message}`)
    }
  }

  // Get employee by ID
  static async getEmployeeById(employeeId: any) {
    try {
      const pool = await getMysqlPool()
      const [[employee]] = await pool.query(
        `SELECT * FROM employees WHERE id = ? AND deleted_at IS NULL`,
        [employeeId]
      )
      return employee
    } catch (error: any) {
      console.error('Get employee error:', error)
      throw new Error(`Failed to fetch employee: ${error.message}`)
    }
  }

  // Create new employee
  static async createEmployee(employeeData: any, createdBy: any) {
    try {
      const pool = await getMysqlPool()
      const { firstName, lastName, email, phone, department, role, hireDate } = employeeData

      // Generate employee ID
      const [[{ maxId }]] = await pool.query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING(employee_id, 4) AS UNSIGNED)), 0) as maxId 
        FROM employees 
        WHERE employee_id LIKE 'EMP%'
      `)
      const employeeId = `EMP${String(maxId + 1).padStart(3, '0')}`

      const result = await pool.query(
        `INSERT INTO employees 
        (employee_id, first_name, last_name, email, phone, department, role, status, hire_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
        [employeeId, firstName, lastName, email, phone, department, role, hireDate, createdBy]
      )

      return {
        id: result[0].insertId,
        employee_id: employeeId,
        ...employeeData
      }
    } catch (error: any) {
      console.error('Create employee error:', error)
      throw new Error(`Failed to create employee: ${error.message}`)
    }
  }

  // Update employee
  static async updateEmployee(employeeId: any, updateData: any, updatedBy: any) {
    try {
      const pool = await getMysqlPool()
      const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'department', 'role', 'status', 'hire_date']

      let updateQuery = `UPDATE employees SET `
      const updateParams = []

      Object.keys(updateData).forEach((key, index) => {
        if (allowedFields.includes(key)) {
          if (index > 0) updateQuery += ', '
          updateQuery += `${key} = ?`
          updateParams.push(updateData[key])
        }
      })

      updateQuery += `, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      updateParams.push(updatedBy, employeeId)

      const result = await pool.query(updateQuery, updateParams)

      return result[0].affectedRows > 0
    } catch (error: any) {
      console.error('Update employee error:', error)
      throw new Error(`Failed to update employee: ${error.message}`)
    }
  }

  // Soft delete employee
  static async deleteEmployee(employeeId: any) {
    try {
      const pool = await getMysqlPool()
      await pool.query(
        `UPDATE employees SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [employeeId]
      )
      return true
    } catch (error: any) {
      console.error('Delete employee error:', error)
      throw new Error(`Failed to delete employee: ${error.message}`)
    }
  }

  // Get employee statistics
  static async getEmployeeStats() {
    try {
      const pool = await getMysqlPool()
      const [[stats]] = await pool.query(`
        SELECT 
          COUNT(*) as total_employees,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_employees,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_employees,
          SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END) as on_leave_employees
        FROM employees
        WHERE deleted_at IS NULL
      `)
      return stats
    } catch (error: any) {
      console.error('Get employee stats error:', error)
      throw new Error(`Failed to fetch employee statistics: ${error.message}`)
    }
  }

  // Get employees by department
  static async getEmployeesByDepartment() {
    try {
      const pool = await getMysqlPool()
      const [departments] = await pool.query(`
        SELECT 
          department,
          COUNT(*) as employee_count,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
        FROM employees
        WHERE deleted_at IS NULL
        GROUP BY department
        ORDER BY employee_count DESC
      `)
      return departments
    } catch (error: any) {
      console.error('Get employees by department error:', error)
      throw new Error(`Failed to fetch department data: ${error.message}`)
    }
  }

  // Get all departments
  static async getDepartments() {
    try {
      const pool = await getMysqlPool()
      const [departments] = await pool.query(`
        SELECT id, name, status FROM departments WHERE status = 'active'
      `)
      return departments
    } catch (error: any) {
      console.error('Get departments error:', error)
      throw new Error(`Failed to fetch departments: ${error.message}`)
    }
  }

  // Get all roles
  static async getRoles() {
    try {
      const pool = await getMysqlPool()
      const [roles] = await pool.query(`
        SELECT id, role_name FROM employee_roles WHERE status = 'active'
      `)
      return roles
    } catch (error: any) {
      console.error('Get roles error:', error)
      throw new Error(`Failed to fetch roles: ${error.message}`)
    }
  }
}

export default EmployeeService
