// lib/admin/modules/super-admin/services/admin.service.js
// Super Admin User Management Service

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export class AdminService {
  // Get all admins with role information
  static async getAllAdmins(filters = {}, limit = 50, offset = 0) {
    const where = {
      role: { in: [0, 1] }, // Super Admin or Admin
      ...(filters.search && {
        OR: [
          { firstName: { contains: filters.search } },
          { lastName: { contains: filters.search } },
          { email: { contains: filters.search } }
        ]
      }),
      ...(filters.status && { status: filters.status }),
      ...(filters.role && { role: parseInt(filters.role) })
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
          company: true,
          loginHistory: { take: 1, orderBy: { createdAt: 'desc' } }
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
  static async getAdminById(adminId) {
    return await prisma.user.findUnique({
      where: { id: adminId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        company: true,
        loginHistory: { take: 5, orderBy: { createdAt: 'desc' } }
      }
    })
  }

  // Create new admin user
  static async createAdmin(data, createdByUserId) {
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
        roleId,
        status,
        companyId: 1, // Default company
        createdAt: new Date()
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
  static async updateAdmin(adminId, data, updatedByUserId) {
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
  static async resetAdminPassword(adminId, newPassword, resetByUserId) {
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
  static async suspendAdmin(adminId, suspendedByUserId) {
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
  static async reactivateAdmin(adminId, reactivatedByUserId) {
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
  static async deleteAdmin(adminId, deletedByUserId) {
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
    const [totalAdmins, activeAdmins, suspendedAdmins, recentLogins] = await Promise.all([
      prisma.user.count({ where: { role: { in: [0, 1] } } }),
      prisma.user.count({ where: { role: { in: [0, 1] }, status: 'active' } }),
      prisma.user.count({ where: { role: { in: [0, 1] }, status: 'suspended' } }),
      prisma.loginHistory.findMany({
        where: { user: { role: { in: [0, 1] } } },
        take: 10,
        orderBy: { createdAt: 'desc' },
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
  static async logAdminAction(userId, action, description, targetUserId = null) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        description,
        targetUserId,
        resource: 'admin_user',
        changes: description,
        ipAddress: '0.0.0.0', // Get from request in real implementation
        userAgent: 'Admin Panel'
      }
    })
  }
}

export default AdminService
