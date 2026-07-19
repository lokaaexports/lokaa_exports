import { verifyJwt } from '@/lib/jwt'

/**
 * Verify Admin Authentication
 * Checks if request has valid JWT token in Authorization header
 * @param {Request} req - Next.js request object
 * @returns {Object|null} - User session object or null if unauthorized
 */
export async function verifyAdminAuth(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const decoded = verifyJwt(token)
    
    if (!decoded) {
      return null
    }

    // Check if user has admin role
    if (!['super-admin', 'admin', 'employee'].includes(decoded.role)) {
      return null
    }

    return decoded
  } catch (error) {
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
export async function verifySuperAdminAuth(req) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session || session.role !== 'super-admin') {
      return null
    }
    return session
  } catch (error) {
    console.error('Super admin verification error:', error)
    return null
  }
}

/**
 * Verify Admin or Employee
 * @param {Request} req - Next.js request object
 * @returns {Object|null} - User session object or null if unauthorized
 */
export async function verifyAdminOrEmployeeAuth(req) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) {
      return null
    }
    if (!['admin', 'employee'].includes(session.role)) {
      return null
    }
    return session
  } catch (error) {
    console.error('Admin/employee verification error:', error)
    return null
  }
}
