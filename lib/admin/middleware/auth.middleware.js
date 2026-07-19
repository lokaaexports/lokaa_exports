// Centralized admin auth middleware
import { NextResponse } from 'next/server'
import { getAuthPayloadFromRequest } from '@/lib/auth-service'

/**
 * Verify admin is authenticated
 * @throws {Error} Unauthorized if no auth token
 */
export async function requireAdminAuth(request) {
  try {
    const payload = getAuthPayloadFromRequest(request)
    if (!payload) {
      return {
        success: false,
        error: 'Unauthorized',
        statusCode: 401,
      }
    }
    return { success: true, user: payload }
  } catch (error) {
    return {
      success: false,
      error: 'Invalid authentication',
      statusCode: 401,
    }
  }
}

/**
 * Verify admin has specific permission
 */
export async function requirePermission(request, permission) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) return auth

    const { hasPermission } = await import('@/lib/admin/modules/rbac/utils/permissions')
    const granted = await hasPermission(auth.user.id, permission)

    if (!granted) {
      return {
        success: false,
        error: 'Forbidden',
        statusCode: 403,
      }
    }

    return { success: true, user: auth.user }
  } catch (error) {
    return {
      success: false,
      error: 'Permission check failed',
      statusCode: 500,
    }
  }
}

/**
 * Middleware factory for route handlers
 */
export function adminAuthMiddleware(handler) {
  return async (request, context) => {
    const auth = await requireAdminAuth(request)
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error, message: 'Authentication required' },
        { status: auth.statusCode }
      )
    }

    // Attach user to request for handler use
    request.user = auth.user
    return handler(request, context)
  }
}
