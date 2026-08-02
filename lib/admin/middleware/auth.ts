import { verifyJwt } from '@/lib/jwt'

/**
 * Verify Admin Authentication
 * Checks if request has valid JWT token in Authorization header
 * @param {Request} req - Next.js request object
 * @returns {Object|null} - User session object or null if unauthorized
 */
export async function verifyAdminAuth(req: any) {
  try {
    let token = ''
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      if (req.cookies && typeof req.cookies.get === 'function') {
        token = req.cookies.get('authToken')?.value || ''
      }
      if (!token) {
        const cookieHeader = req.headers.get('cookie')
        if (cookieHeader) {
          const match = cookieHeader.match(/(?:^|; )authToken=([^;]*)/)
          if (match) {
            token = decodeURIComponent(match[1])
          }
        }
      }
    }

    if (!token) {
      return null
    }

    const decoded = verifyJwt(token)
    
    if (!decoded) {
      return null
    }

    // Check if user has admin role
    const roles = decoded.roles || (decoded.role ? [decoded.role] : [])
    const normalizedRoles = roles.map((r: string) => r.toLowerCase().replace(/_/g, '-'))
    
    if (!normalizedRoles.some((r: string) => ['super-admin', 'super admin', 'admin', 'employee'].includes(r))) {
      return null
    }

    // Attach normalized roles to session for convenience
    decoded.normalizedRoles = normalizedRoles;
    
    // Add user object to match expected session format across API routes
    decoded.user = { id: decoded.employeeId || decoded.id }
    
    return decoded
  } catch (error: any) {
    console.error('Auth verification error:', error)
    return null
  }
}

/**
 * Verify Super Admin Only
 * Stricter check for super-admin role
 * @param {Request} req - Next.js request object
 * @returns {Object|null} - User session object or null if not super-admin
 */
export async function verifySuperAdminAuth(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session || !session.normalizedRoles?.some((r: string) => r === 'super-admin' || r === 'super admin')) {
      return null
    }
    return session
  } catch (error: any) {
    console.error('Super admin verification error:', error)
    return null
  }
}

/**
 * Verify Admin or Employee
 * @param {Request} req - Next.js request object
 * @returns {Object|null} - User session object or null if unauthorized
 */
export async function verifyAdminOrEmployeeAuth(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) {
      return null
    }
    const hasRole = session.normalizedRoles?.some((r: string) => r === 'admin' || r === 'employee' || r === 'super-admin' || r === 'super admin')
    if (!hasRole) {
      return null
    }
    return session
  } catch (error: any) {
    console.error('Admin/employee verification error:', error)
    return null
  }
}
