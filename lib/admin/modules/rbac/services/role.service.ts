import { prisma } from '@/lib/prisma'

export class RoleService {
  // Get all roles
  static async getAllRoles(options: Record<string, any> = {}) {
    const { limit = 50, offset = 0, includePermissions = true } = options

    return await prisma.role.findMany({
      include: {
        permissions: includePermissions,
      },
      take: limit,
      skip: offset,
      orderBy: { level: 'asc' },
    })
  }

  // Get role by ID
  static async getRoleById(roleId: any, includePermissions = true) {
    return await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: includePermissions,
      },
    })
  }

  // Get role by slug
  static async getRoleBySlug(slug: any) {
    return await prisma.role.findUnique({
      where: { slug },
      include: { permissions: true },
    })
  }

  // Create new role
  static async createRole(data: any) {
    const { name, slug, description, level, permissionIds = [] } = data

    return await prisma.role.create({
      data: {
        name,
        slug,
        description,
        level,
        permissions: {
          connect: permissionIds.map(id => ({ id })),
        },
      },
      include: { permissions: true },
    })
  }

  // Update role
  static async updateRole(roleId: any, data: any) {
    const { name, slug, description, level, permissionIds } = data

    const updateData: Record<string, any> = {}
    if (name) updateData.name = name
    if (slug) updateData.slug = slug
    if (description !== undefined) updateData.description = description
    if (level !== undefined) updateData.level = level

    if (permissionIds) {
      // Get current permissions
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: { permissions: true },
      })

      // Remove all current permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId },
      })

      // Add new permissions
      await prisma.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId,
          permissionId,
        })),
      })
    }

    return await prisma.role.update({
      where: { id: roleId },
      data: updateData,
      include: { permissions: true },
    })
  }

  // Add permission to role
  static async addPermissionToRole(roleId: any, permissionId: any) {
    return await prisma.rolePermission.create({
      data: { roleId, permissionId },
    })
  }

  // Remove permission from role
  static async removePermissionFromRole(roleId: any, permissionId: any) {
    return await prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    })
  }

  // Delete role
  static async deleteRole(roleId: any) {
    // Remove all permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    })

    return await prisma.role.delete({
      where: { id: roleId },
    })
  }

  // Get role hierarchy
  static async getRoleHierarchy() {
    return await prisma.role.findMany({
      orderBy: { level: 'asc' },
      include: { permissions: true },
    })
  }

  // Check if user can perform action
  static async userHasPermission(userId: any, permissionSlug: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            },
          },
        },
      },
    })

    if (!user) return false

    return user.role.permissions.some(p => p.permission.slug === permissionSlug)
  }

  // Get user permissions
  static async getUserPermissions(userId: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            },
          },
        },
      },
    })

    if (!user) return []

    return user.role.permissions.map(p => p.permission)
  }
}

export default RoleService
