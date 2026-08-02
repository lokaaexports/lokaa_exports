// lib/admin/modules/super-admin/services/admin.service.js
// Super Admin User Management Service

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export class AdminService {
  // Get all admins with role information
  static async getAllAdmins(filters: Record<string, any> = {}, limit = 50, offset = 0) {
    const roles = await prisma.role.findMany({
      where: { slug: { in: ['super_admin', 'admin'] } }
    })
    const roleIds = roles.map(r => r.id)
    const selectedRoleId = filters.role ? parseInt(filters.role) : undefined

    const where = {
      roleId: selectedRoleId && roleIds.includes(selectedRoleId)
        ? selectedRoleId
        : { in: roleIds },
      ...(filters.search && {
        OR: [
          { firstName: { contains: filters.search } },
          { lastName: { contains: filters.search } },
          { email: { contains: filters.search } }
        ]
      }),
      ...(filters.status && { status: filters.status })
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
          loginHistory: { take: 1, orderBy: { loginAt: 'desc' } }
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

  // Get admin by ID
  static async getAdminById(adminId: any) {
    return await prisma.user.findUnique({
      where: { id: adminId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        loginHistory: { take: 5, orderBy: { loginAt: 'desc' } }
      }
    })
  }

  // Create new admin user
  static async createAdmin(data: any, createdByUserId: any) {
    const { firstName, lastName, email, password, roleId, status = 'active' } = data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) throw new Error('Email already exists')

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        roleId
      },
      include: {
        role: { include: { permissions: { include: { permission: true } } } }
      }
    })

    // Log audit
    await this.logAdminAction(createdByUserId, 'CREATE_ADMIN', `Created admin: ${email}`, user.id)

    return user
  }

  // Update admin details
  static async updateAdmin(adminId: any, data: any, updatedByUserId: any) {
    const { firstName, lastName, email, roleId, status } = data

    // Check if email is changing and already exists
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, id: { not: adminId } }
      })
      if (existingUser) throw new Error('Email already exists')
    }

    const user = await prisma.user.update({
      where: { id: adminId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(roleId && { roleId }),
        ...(status && { status }),
        updatedAt: new Date()
      },
      include: {
        role: { include: { permissions: { include: { permission: true } } } }
      }
    })

    // Log audit
    await this.logAdminAction(updatedByUserId, 'UPDATE_ADMIN', `Updated admin: ${email}`, adminId)

    return user
  }

  // Update admin password
  static async resetAdminPassword(adminId: any, newPassword: any, resetByUserId: any) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const user = await prisma.user.update({
      where: { id: adminId },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    })

    // Log audit
    await this.logAdminAction(resetByUserId, 'RESET_PASSWORD', `Reset password for admin: ${user.email}`, adminId)

    return user
  }

  // Suspend admin account
  static async suspendAdmin(adminId: any, suspendedByUserId: any) {
    const user = await prisma.user.update({
      where: { id: adminId },
      data: {
        status: 'suspended',
        updatedAt: new Date()
      },
      include: { role: true }
    })

    // Log audit
    await this.logAdminAction(suspendedByUserId, 'SUSPEND_ADMIN', `Suspended admin: ${user.email}`, adminId)

    return user
  }

  // Reactivate admin account
  static async reactivateAdmin(adminId: any, reactivatedByUserId: any) {
    const user = await prisma.user.update({
      where: { id: adminId },
      data: {
        status: 'active',
        updatedAt: new Date()
      },
      include: { role: true }
    })

    // Log audit
    await this.logAdminAction(reactivatedByUserId, 'REACTIVATE_ADMIN', `Reactivated admin: ${user.email}`, adminId)

    return user
  }

  // Delete admin
  static async deleteAdmin(adminId: any, deletedByUserId: any) {
    const user = await prisma.user.findUnique({
      where: { id: adminId }
    })

    if (!user) throw new Error('Admin not found')

    // Delete related records
    await Promise.all([
      prisma.loginHistory.deleteMany({ where: { userId: adminId } }),
      prisma.auditLog.deleteMany({ where: { userId: adminId } })
    ])

    // Delete user
    await prisma.user.delete({
      where: { id: adminId }
    })

    // Log audit
    await this.logAdminAction(deletedByUserId, 'DELETE_ADMIN', `Deleted admin: ${user.email}`, adminId)
  }

  // Get admin statistics
  static async getAdminStats() {
    const roles = await prisma.role.findMany({
      where: { slug: { in: ['super_admin', 'admin'] } }
    })
    const roleIds = roles.map(r => r.id)

    const [totalAdmins, activeAdmins, suspendedAdmins, recentLogins] = await Promise.all([
      prisma.user.count({ where: { roleId: { in: roleIds } } }),
      prisma.user.count({ where: { roleId: { in: roleIds }, status: 'active' } }),
      prisma.user.count({ where: { roleId: { in: roleIds }, status: 'suspended' } }),
      prisma.loginHistory.findMany({
        where: { user: { roleId: { in: roleIds } } },
        take: 10,
        orderBy: { loginAt: 'desc' },
        include: { user: true }
      })
    ])

    return {
      totalAdmins,
      activeAdmins,
      suspendedAdmins,
      recentLogins
    }
  }

  // Log admin action for audit trail
  static async logAdminAction(userId: any, action: any, description: any, targetUserId = null) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity: 'admin_user',
        entityId: targetUserId,
        changes: description,
        ipAddress: '0.0.0.0', // Get from request in real implementation
        userAgent: 'Admin Panel'
      }
    })
  }
}

export default AdminService
