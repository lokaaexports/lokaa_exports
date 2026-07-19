// lib/admin/auth/middleware.js
// Authentication Middleware for API Routes

import { verifyAccessToken } from './jwt'
import { checkPermission } from './rbac'
import { cookies } from 'next/headers'

export const authenticateToken = async (request) => {
  try {
    let token = null

    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }

    // If not in header, try cookies (authToken)
    if (!token) {
      try {
        const cookieStore = await cookies()
        token = cookieStore.get('authToken')?.value
      } catch (error) {
        // Cookie store might not be available, continue
      }
    }

    if (!token) {
      return {
        authenticated: false,
        error: 'No token provided'
      }
    }

    const decoded = verifyAccessToken(token)
    return {
      authenticated: true,
      employeeId: decoded.employeeId,
      email: decoded.email,
      roles: decoded.roles,
      permissions: decoded.permissions
    }
  } catch (error) {
    return {
      authenticated: false,
      error: error.message
    }
  }
}

export const requireAuth = (handler) => {
  return async (request, context) => {
    const auth = await authenticateToken(request)

    if (!auth.authenticated) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: auth.error }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Add auth info to request
    request.auth = auth

    return handler(request, context)
  }
}

export const requirePermission = (requiredPermission) => {
  return (handler) => {
    return async (request, context) => {
      const auth = await authenticateToken(request)

      if (!auth.authenticated) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized', message: 'No token provided' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // Check if user has required permission
      const hasPermission = checkPermission(auth.permissions, requiredPermission)

      if (!hasPermission) {
        return new Response(
          JSON.stringify({ 
            error: 'Forbidden', 
            message: `Permission denied. Required: ${requiredPermission}` 
          }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // Add auth info to request
      request.auth = auth

      return handler(request, context)
    }
  }
}

export const requireRole = (requiredRoles) => {
  return (handler) => {
    return async (request, context) => {
      const auth = await authenticateToken(request)

      if (!auth.authenticated) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized', message: 'No token provided' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // Check if user has required role
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
      const hasRole = auth.roles.some(role => roles.includes(role))

      if (!hasRole) {
        return new Response(
          JSON.stringify({ 
            error: 'Forbidden', 
            message: `Access denied. Required role: ${roles.join(' or ')}` 
          }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // Add auth info to request
      request.auth = auth

      return handler(request, context)
    }
  }
}

export const extractAuthFromRequest = (request) => {
  const authHeader = request.headers.get('authorization')
  const token = authHeader && authHeader.split(' ')[1]
  return token
}

export const createAuthHeaders = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}
