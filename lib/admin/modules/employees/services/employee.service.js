// lib/admin/modules/employees/services/employee.service.js
// Employee Management Service

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export class EmployeeService {
  static async getEmployeeRoleId() {
    const employeeRole = await prisma.role.findFirst({ where: { slug: 'employee' } })
    return employeeRole?.id ?? null
  }

  // Get all employees
  static async getAllEmployees(filters = {}, pagination = {}) {
    const { limit = 50, offset = 0 } = pagination
    const employeeRoleId = await this.getEmployeeRoleId()
    const where = {
      roleId: filters.roleId || employeeRoleId || undefined,
      ...(filters.search && {
        OR: [
          { firstName: { contains: filters.search } },
          { lastName: { contains: filters.search } },
          { email: { contains: filters.search } }
        ]
      }),
      ...(filters.status && { status: filters.status }),
      ...(filters.department && { department: filters.department })
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
          company: true
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    return {
      data,
      pagination: { total, limit, offset, pages: Math.ceil(total / limit) }
    }
  }

  // Get employee by ID
  static async getEmployeeById(employeeId) {
    return await prisma.user.findUnique({
      where: { id: employeeId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        company: true,
        customerAssignments: { include: { customer: true } },
        productAssignments: { include: { product: true } },
        assignedTasks: {
          include: { task: true },
          take: 10,
          orderBy: { assignedAt: 'desc' }
        },
        createdTasks: { take: 10, orderBy: { createdAt: 'desc' } },
        completedTasks: { take: 10, orderBy: { completedAt: 'desc' } }
      }
    })
  }

  // Create new employee
  static async createEmployee(data, createdByUserId) {
    const { firstName, lastName, email, password, department, phone, joiningDate, roleId } = data

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) throw new Error('Email already exists')

    const employeeRole = roleId
      ? await prisma.role.findUnique({ where: { id: Number(roleId) } })
      : await prisma.role.findFirst({ where: { slug: 'employee' } })
    if (!employeeRole) throw new Error('Employee role not found')

    // Hash password - generate random if not provided
    const passwordHash = await bcrypt.hash(password || Math.random().toString(36).slice(-12), 10)

    // Create employee user
    const employee = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: passwordHash,
        phone,
        department,
        roleId: employeeRole.id,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        status: 'active',
        createdAt: new Date()
      },
      include: {
        role: { include: { permissions: { include: { permission: true } } } }
      }
    })

    return employee
  }

  // Update employee
  static async updateEmployee(employeeId, data, updatedByUserId) {
    const { firstName, lastName, email, phone, department, status, roleId, joiningDate } = data

    // Check if email changing and already exists
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, id: { not: employeeId } }
      })
      if (existing) throw new Error('Email already exists')
    }

    return await prisma.user.update({
      where: { id: employeeId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(department && { department }),
        ...(status && { status }),
        ...(roleId && { roleId: Number(roleId) }),
        ...(joiningDate && { joiningDate: new Date(joiningDate) }),
        updatedAt: new Date()
      },
      include: {
        role: { include: { permissions: { include: { permission: true } } } }
      }
    })
  }

  // Assign customer to employee
  static async assignCustomerToEmployee(employeeId, customerId) {
    return await prisma.customerAssignment.create({
      data: {
        userId: employeeId,
        customerId,
        assignedAt: new Date()
      },
      include: { customer: true, user: true }
    })
  }

  // Assign product to employee
  static async assignProductToEmployee(employeeId, productId) {
    return await prisma.productAssignment.create({
      data: {
        userId: employeeId,
        productId,
        assignedAt: new Date()
      },
      include: { product: true, user: true }
    })
  }

  // Get employee assignments
  static async getEmployeeAssignments(employeeId) {
    const [customers, products, rfqs, tasks] = await Promise.all([
      prisma.customerAssignment.findMany({
        where: { userId: employeeId },
        include: { customer: true }
      }),
      prisma.productAssignment.findMany({
        where: { userId: employeeId },
        include: { product: true }
      }),
      prisma.rfqAssignment.findMany({
        where: { userId: employeeId },
        include: { rfq: true }
      }),
      prisma.taskAssignment.findMany({
        where: { userId: employeeId },
        include: { task: true }
      })
    ])

    return { customers, products, rfqs, tasks }
  }

  // Get employee statistics
  static async getEmployeeStats() {
    const employeeRoleId = await this.getEmployeeRoleId()
    const employeeWhere = employeeRoleId ? { roleId: employeeRoleId } : { roleId: { not: null } }

    const [total, active, suspended, byDepartment] = await Promise.all([
      prisma.user.count({ where: employeeWhere }),
      prisma.user.count({ where: { ...employeeWhere, status: 'active' } }),
      prisma.user.count({ where: { ...employeeWhere, status: 'suspended' } }),
      prisma.user.groupBy({
        by: ['department'],
        where: employeeWhere,
        _count: true
      })
    ])

    return {
      total,
      active,
      suspended,
      byDepartment: byDepartment.map(d => ({ department: d.department, count: d._count }))
    }
  }

  // Delete employee
  static async deleteEmployee(employeeId) {
    // Delete assignments and related records
    await Promise.all([
      prisma.customerAssignment.deleteMany({ where: { userId: employeeId } }),
      prisma.productAssignment.deleteMany({ where: { userId: employeeId } }),
      prisma.rfqAssignment.deleteMany({ where: { userId: employeeId } }),
      prisma.taskAssignment.deleteMany({ where: { userId: employeeId } })
    ])

    // Delete user
    return await prisma.user.delete({
      where: { id: employeeId }
    })
  }

  // Get departments
  static async getDepartments() {
    const employeeRoleId = await this.getEmployeeRoleId()
    return await prisma.user.findMany({
      where: employeeRoleId ? { roleId: employeeRoleId } : {},
      distinct: ['department'],
      select: { department: true }
    })
  }

  // Get employees by department
  static async getEmployeesByDepartment() {
    const employeeRoleId = await this.getEmployeeRoleId()
    return await prisma.user.groupBy({
      by: ['department'],
      where: employeeRoleId ? { roleId: employeeRoleId } : {},
      _count: true
    })
  }

  // Get roles
  static async getRoles() {
    return await prisma.role.findMany({
      include: { permissions: { include: { permission: true } } }
    })
  }
}

export default EmployeeService
