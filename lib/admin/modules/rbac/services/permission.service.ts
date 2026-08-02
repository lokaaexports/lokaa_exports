import { prisma } from '@/lib/prisma'

export class PermissionService {
  // Get all permissions
  static async getAllPermissions(filters: Record<string, any> = {}) {
    const { module, action, limit = 100, offset = 0 } = filters

    const where: Record<string, any> = {}
    if (module) where.module = module
    if (action) where.action = action

    return await prisma.permission.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { module: 'asc' },
    })
  }

  // Get permission by ID
  static async getPermissionById(id: any) {
    return await prisma.permission.findUnique({
      where: { id },
    })
  }

  // Get permission by slug
  static async getPermissionBySlug(slug: any) {
    return await prisma.permission.findUnique({
      where: { slug },
    })
  }

  // Create permission
  static async createPermission(data: any) {
    const { name, slug, description, module, action } = data

    return await prisma.permission.create({
      data: {
        name,
        slug,
        description,
        module,
        action,
      },
    })
  }

  // Update permission
  static async updatePermission(id: any, data: any) {
    const { name, slug, description, module, action } = data

    const updateData: Record<string, any> = {}
    if (name) updateData.name = name
    if (slug) updateData.slug = slug
    if (description !== undefined) updateData.description = description
    if (module) updateData.module = module
    if (action) updateData.action = action

    return await prisma.permission.update({
      where: { id },
      data: updateData,
    })
  }

  // Delete permission
  static async deletePermission(id: any) {
    // Remove from all roles first
    await prisma.rolePermission.deleteMany({
      where: { permissionId: id },
    })

    return await prisma.permission.delete({
      where: { id },
    })
  }

  // Get permissions by module
  static async getPermissionsByModule(module: any) {
    return await prisma.permission.findMany({
      where: { module },
      orderBy: { action: 'asc' },
    })
  }

  // Get all modules and their permissions
  static async getModulePermissionMatrix() {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    })

    // Group by module
    const matrix: Record<string, any> = {}
    permissions.forEach(perm => {
      if (!matrix[perm.module]) {
        matrix[perm.module] = []
      }
      matrix[perm.module].push(perm)
    })

    return matrix
  }

  // Seed default permissions
  static async seedDefaultPermissions() {
    const defaultPermissions = [
      // RBAC Module
      { name: 'Manage Roles', slug: 'rbac:manage_roles', module: 'rbac', action: 'manage', description: 'Create, update, delete roles' },
      { name: 'View Roles', slug: 'rbac:view_roles', module: 'rbac', action: 'read', description: 'View all roles' },
      { name: 'Manage Permissions', slug: 'rbac:manage_permissions', module: 'rbac', action: 'manage', description: 'Create, update, delete permissions' },

      // Super Admin Module
      { name: 'Manage Admins', slug: 'super_admin:manage_admins', module: 'super_admin', action: 'manage', description: 'Create, update, delete admin users' },
      { name: 'View System Logs', slug: 'super_admin:view_logs', module: 'super_admin', action: 'read', description: 'View audit and activity logs' },
      { name: 'System Configuration', slug: 'super_admin:configure', module: 'super_admin', action: 'manage', description: 'Configure system settings' },
      { name: 'Database Management', slug: 'super_admin:database', module: 'super_admin', action: 'manage', description: 'Database backup, restore, maintenance' },

      // Employees Module
      { name: 'Manage Employees', slug: 'employees:manage', module: 'employees', action: 'manage', description: 'Create, update, delete employees' },
      { name: 'View Employees', slug: 'employees:view', module: 'employees', action: 'read', description: 'View employee list and details' },
      { name: 'Assign Permissions', slug: 'employees:assign_permissions', module: 'employees', action: 'manage', description: 'Assign permissions to employees' },

      // Products Module
      { name: 'Create Products', slug: 'products:create', module: 'products', action: 'create' },
      { name: 'View Products', slug: 'products:view', module: 'products', action: 'read' },
      { name: 'Edit Products', slug: 'products:edit', module: 'products', action: 'update' },
      { name: 'Delete Products', slug: 'products:delete', module: 'products', action: 'delete' },
      { name: 'Manage Categories', slug: 'products:manage_categories', module: 'products', action: 'manage' },
      { name: 'Manage Pricing', slug: 'products:manage_pricing', module: 'products', action: 'manage' },
      { name: 'Manage Inventory', slug: 'products:manage_inventory', module: 'products', action: 'manage' },

      // CRM Module
      { name: 'Manage Customers', slug: 'crm:manage_customers', module: 'crm', action: 'manage' },
      { name: 'View Customers', slug: 'crm:view_customers', module: 'crm', action: 'read' },
      { name: 'Manage Leads', slug: 'crm:manage_leads', module: 'crm', action: 'manage' },
      { name: 'View Leads', slug: 'crm:view_leads', module: 'crm', action: 'read' },
      { name: 'Manage Activities', slug: 'crm:manage_activities', module: 'crm', action: 'manage' },

      // RFQ Module
      { name: 'Create RFQ', slug: 'rfqs:create', module: 'rfqs', action: 'create' },
      { name: 'View RFQ', slug: 'rfqs:view', module: 'rfqs', action: 'read' },
      { name: 'Edit RFQ', slug: 'rfqs:edit', module: 'rfqs', action: 'update' },
      { name: 'Delete RFQ', slug: 'rfqs:delete', module: 'rfqs', action: 'delete' },
      { name: 'Quote RFQ', slug: 'rfqs:quote', module: 'rfqs', action: 'manage' },

      // Orders Module
      { name: 'Create Orders', slug: 'orders:create', module: 'orders', action: 'create' },
      { name: 'View Orders', slug: 'orders:view', module: 'orders', action: 'read' },
      { name: 'Edit Orders', slug: 'orders:edit', module: 'orders', action: 'update' },
      { name: 'Cancel Orders', slug: 'orders:cancel', module: 'orders', action: 'delete' },

      // Analytics Module
      { name: 'View Dashboard', slug: 'analytics:dashboard', module: 'analytics', action: 'read' },
      { name: 'View Reports', slug: 'analytics:reports', module: 'analytics', action: 'read' },
      { name: 'Export Data', slug: 'analytics:export', module: 'analytics', action: 'read' },

      // Tasks Module
      { name: 'View Tasks', slug: 'tasks:view', module: 'tasks', action: 'read' },
      { name: 'Create Tasks', slug: 'tasks:create', module: 'tasks', action: 'create' },
      { name: 'Edit Tasks', slug: 'tasks:edit', module: 'tasks', action: 'update' },
      { name: 'Delete Tasks', slug: 'tasks:delete', module: 'tasks', action: 'delete' },
      { name: 'Manage Task Workflow', slug: 'tasks:manage', module: 'tasks', action: 'manage' },

      // Notifications Module
      { name: 'View Notifications', slug: 'notifications:view', module: 'notifications', action: 'read' },
      { name: 'Manage Notifications', slug: 'notifications:manage', module: 'notifications', action: 'manage' },

      // Audit Module
      { name: 'View Audit Logs', slug: 'audit:view', module: 'audit', action: 'read', description: 'View system audit trail' },

      // Settings Module
      { name: 'View Settings', slug: 'settings:view', module: 'settings', action: 'read' },
      { name: 'Update Settings', slug: 'settings:update', module: 'settings', action: 'update' },
    ]

    for (const perm of defaultPermissions) {
      await prisma.permission.upsert({
        where: { slug: perm.slug },
        update: perm,
        create: perm,
      })
    }

    return defaultPermissions.length
  }
}

export default PermissionService
