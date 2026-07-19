// app/api/admin/employees/route.js
// Employee Management API Endpoint with RBAC

import { verifyAdmin } from '@/lib/auth-service'
import EmployeeService from '@/lib/admin/modules/employees/services/employee.service'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'
import { logAudit } from '@/lib/admin/services/audit.service'

export async function GET(request) {
  try {
    // Authenticate and verify admin role
    const user = await verifyAdmin(request, 'admin')

    // Check permission
    if (!await hasPermission(user.id, 'employees:read')) {
      return Response.json({ error: 'Forbidden: No permission to view employees' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 20
    const offset = parseInt(searchParams.get('offset')) || 0
    const department = searchParams.get('department')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const action = searchParams.get('action')

    // Handle different actions
    if (action === 'stats') {
      const stats = await EmployeeService.getEmployeeStats()
      return Response.json({ success: true, data: stats })
    }

    if (action === 'departments') {
      const departments = await EmployeeService.getEmployeesByDepartment()
      return Response.json({ success: true, data: departments })
    }

    if (action === 'list-departments') {
      const departments = await EmployeeService.getDepartments()
      return Response.json({ success: true, data: departments })
    }

    if (action === 'roles') {
      const roles = await EmployeeService.getRoles()
      return Response.json({ success: true, data: roles })
    }

    // Get all employees with filters
    const filters = { department, status, search }
    const pagination = { limit, offset }
    const result = await EmployeeService.getAllEmployees(filters, pagination)

    return Response.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    })
  } catch (error) {
    console.error('Employee API error:', error)
    return Response.json(
      { error: error.message || 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // Authenticate and verify admin role
    const user = await verifyAdmin(request, 'admin')

    // Check permission
    if (!await hasPermission(user.id, 'employees:create')) {
      return Response.json({ error: 'Forbidden: No permission to create employees' }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, email, password, phone, department, roleId, joiningDate } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !department) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create employee
    const employee = await EmployeeService.createEmployee(
      { firstName, lastName, email, password, phone, department, roleId, joiningDate },
      user.id
    )
    await logAudit({ userId: user.id, action: 'employee_created', entity: 'employee', entityId: employee.id, changes: body, ipAddress: request.headers.get('x-forwarded-for'), userAgent: request.headers.get('user-agent') })

    return Response.json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    })
  } catch (error) {
    console.error('Create employee error:', error.message, error.stack)
    return Response.json(
      { error: error.message || 'Failed to create employee', details: error.toString() },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    // Authenticate and verify admin role
    const user = await verifyAdmin(request, 'admin')

    // Check permission
    if (!await hasPermission(user.id, 'employees:update')) {
      return Response.json({ error: 'Forbidden: No permission to update employees' }, { status: 403 })
    }

    const body = await request.json()
    const { id, firstName, lastName, email, phone, department, status, roleId, joiningDate } = body

    if (!id) {
      return Response.json({ error: 'Employee ID is required' }, { status: 400 })
    }

    // Update employee
    const updated = await EmployeeService.updateEmployee(
      id,
      { firstName, lastName, email, phone, department, status, roleId, joiningDate },
      user.id
    )
    await logAudit({ userId: user.id, action: 'employee_updated', entity: 'employee', entityId: id, changes: body, ipAddress: request.headers.get('x-forwarded-for'), userAgent: request.headers.get('user-agent') })

    return Response.json({
      success: true,
      message: 'Employee updated successfully',
      data: updated
    })
  } catch (error) {
    console.error('Update employee error:', error)
    return Response.json(
      { error: error.message || 'Failed to update employee' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    // Authenticate and verify admin role
    const user = await verifyAdmin(request, 'admin')

    // Check permission
    if (!await hasPermission(user.id, 'employees:delete')) {
      return Response.json({ error: 'Forbidden: No permission to delete employees' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Employee ID is required' }, { status: 400 })
    }

    // Delete employee
    await EmployeeService.deleteEmployee(id)
    await logAudit({ userId: user.id, action: 'employee_deleted', entity: 'employee', entityId: id, ipAddress: request.headers.get('x-forwarded-for'), userAgent: request.headers.get('user-agent') })

    return Response.json({
      success: true,
      message: 'Employee deleted successfully'
    })
  } catch (error) {
    console.error('Delete employee error:', error)
    return Response.json(
      { error: error.message || 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
