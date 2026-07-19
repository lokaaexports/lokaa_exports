import { prisma } from '@/lib/prisma'

/**
 * Permission Levels Enum
 */
export const PermissionLevel = {
  SUPER_ADMIN: 0,
  ADMIN: 1,
  EMPLOYEE: 2,
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(userId, permissionSlug) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })

    if (!user) return false

    return user.role.permissions.some(p => p.slug === permissionSlug)
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

/**
 * Check if user has any of the provided permissions
 */
export async function hasAnyPermission(userId, permissionSlugs) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })

    if (!user) return false

    const userPermissions = user.role.permissions.map(p => p.slug)
    return permissionSlugs.some(slug => userPermissions.includes(slug))
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

/**
 * Check if user has all provided permissions
 */
export async function hasAllPermissions(userId, permissionSlugs) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })

    if (!user) return false

    const userPermissions = user.role.permissions.map(p => p.slug)
    return permissionSlugs.every(slug => userPermissions.includes(slug))
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

/**
 * Check if user can access resource (customer, product, etc)
 */
export async function canAccessResource(userId, resourceType, resourceId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) return false

    // Super Admin can access everything
    if (user.roleId === 0) return true

    // Check based on resource type
    switch (resourceType) {
      case 'customer': {
        const assignment = await prisma.customerAssignment.findUnique({
          where: { customerId_userId: { customerId: resourceId, userId } },
        })
        return !!assignment
      }

      case 'product': {
        const assignment = await prisma.productAssignment.findUnique({
          where: { productId_userId: { productId: resourceId, userId } },
        })
        return !!assignment
      }

      case 'country': {
        const assignment = await prisma.countryAssignment.findUnique({
          where: { countryId_userId: { countryId: resourceId, userId } },
        })
        return !!assignment
      }

      case 'rfq': {
        const assignment = await prisma.rfqAssignment.findUnique({
          where: { rfqId: resourceId },
        })
        return assignment?.userId === userId
      }

      case 'task': {
        const assignment = await prisma.taskAssignment.findUnique({
          where: { taskId_userId: { taskId: resourceId, userId } },
        })
        return !!assignment
      }

      default:
        return false
    }
  } catch (error) {
    console.error('Resource access check error:', error)
    return false
  }
}

/**
 * Middleware to require specific permission
 */
export function requirePermission(permissionSlug) {
  return async (request, context, next) => {
    try {
      const user = await getCurrentUser(request)

      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const hasAccess = await hasPermission(user.id, permissionSlug)

      if (!hasAccess) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return next()
    } catch (error) {
      console.error('Permission middleware error:', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}

/**
 * Middleware to require role level
 */
export function requireRoleLevel(minLevel) {
  return async (request, context, next) => {
    try {
      const user = await getCurrentUser(request)

      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const userRole = await prisma.role.findUnique({
        where: { id: user.roleId },
      })

      if (!userRole || userRole.level > minLevel) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return next()
    } catch (error) {
      console.error('Role level middleware error:', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}

/**
 * Get current user from request (placeholder - integrate with your auth)
 */
async function getCurrentUser(request) {
  // This will be implemented based on your authentication method
  // For now, extract from JWT or session
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return null

    // Decode token and get user - implement based on your JWT setup
    // For now, this is a placeholder
    return null
  } catch {
    return null
  }
}

/**
 * Get all user permissions
 */
export async function getUserPermissions(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })

    if (!user) return []

    return user.role.permissions.map(p => p.slug)
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return []
  }
}

/**
 * Get user assigned resources
 */
export async function getUserAssignments(userId) {
  try {
    const [customers, products, countries, rfqs, tasks, leads] = await Promise.all([
      prisma.customerAssignment.findMany({
        where: { userId },
        include: { customer: true },
      }),
      prisma.productAssignment.findMany({
        where: { userId },
        include: { product: true },
      }),
      prisma.countryAssignment.findMany({
        where: { userId },
        include: { country: true },
      }),
      prisma.rfqAssignment.findMany({
        where: { userId },
        include: { rfq: true },
      }),
      prisma.taskAssignment.findMany({
        where: { userId },
        include: { task: true },
      }),
      prisma.leadAssignment.findMany({
        where: { userId },
        include: { lead: true },
      }),
    ])

    return {
      customers: customers.map(c => c.customer),
      products: products.map(p => p.product),
      countries: countries.map(c => c.country),
      rfqs: rfqs.map(r => r.rfq),
      tasks: tasks.map(t => t.task),
      leads: leads.map(l => l.lead),
    }
  } catch (error) {
    console.error('Error fetching user assignments:', error)
    return {
      customers: [],
      products: [],
      countries: [],
      rfqs: [],
      tasks: [],
      leads: [],
    }
  }
}
