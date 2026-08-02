import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs'

function getAuthPayloadFromRequest(request) {
  try {
    let token = request.cookies.get('authToken')?.value;
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
}


function getAllowedOrigins() {
  const fromEnv = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean) : []
  const prodDefaults = ['https://lokaaexports.com', 'https://www.lokaaexports.com']
  const devOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000']
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd) {
    return fromEnv.length ? fromEnv : prodDefaults
  }
  return [...devOrigins, ...fromEnv]
}

function setCorsHeaders(request, response) {
  const origin = request.headers.get('origin')
  if (!origin) return response

  const allowed = getAllowedOrigins()
  if (!allowed.length) return response

  if (allowed.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Vary', 'Origin')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response
  }

  return response
}

function applySecurityHeaders(response) {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  // 2-year HSTS with preload flag
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // We intentionally do NOT set Content-Security-Policy here — next.config.js handles it for pages
  // We intentionally do NOT set Access-Control-Allow-Origin here (CORS is set conditionally)
  return response
}

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Always handle CORS for API routes only
  const isApi = pathname.startsWith('/api')
  const isOptions = request.method === 'OPTIONS'

  if (isApi) {
    if (isOptions) {
      const res = new NextResponse(null, { status: 204 })
      applySecurityHeaders(res)
      return setCorsHeaders(request, res)
    }

    // Apply RBAC for admin APIs (excluding auth routes like login)
    if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth')) {
      const payload = getAuthPayloadFromRequest(request)
      if (!payload) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
      }

      // Bypass granular checks for super-admin
      const roles = payload.roles || (payload.role ? [payload.role] : [])
      const isSuperAdmin = roles.some((r) => r.toLowerCase() === 'super-admin' || r.toLowerCase() === 'super admin')

      if (!isSuperAdmin) {
        // Simple granular RBAC mapping
        const methodToAction = {
          'GET': 'read',
          'POST': 'write',
          'PUT': 'write',
          'PATCH': 'write',
          'DELETE': 'write'
        }
        
        let resource = ''
        if (pathname.includes('/catalog/products')) resource = 'product'
        else if (pathname.includes('/catalog/categories')) resource = 'category'
        else if (pathname.includes('/rfqs')) resource = 'rfq'
        else if (pathname.includes('/orders')) resource = 'order'
        else if (pathname.includes('/customers')) resource = 'customer'
        else if (pathname.includes('/rbac') || pathname.includes('/employees')) resource = 'employee'

        if (resource) {
          const requiredPermission = `${resource}:${methodToAction[request.method] || 'read'}`
          const userPermissions = payload.permissions || []
          
          if (!userPermissions.includes(requiredPermission)) {
            return new NextResponse(JSON.stringify({ error: `Forbidden: missing ${requiredPermission} permission` }), { status: 403, headers: { 'Content-Type': 'application/json' } })
          }
        }
      }
    }

    const res = NextResponse.next()
    applySecurityHeaders(res)
    return setCorsHeaders(request, res)
  }

  // Admin auth protection
  const adminPath = '/admin'
  const loginPath = '/admin/login'

  if (!pathname.startsWith(adminPath)) {
    const res = NextResponse.next()
    applySecurityHeaders(res)
    return res
  }

  const payload = getAuthPayloadFromRequest(request)

  const isPublicAuthPage =
    pathname === loginPath ||
    pathname.includes('verify-otp') ||
    pathname.includes('forgot-password') ||
    pathname.includes('reset-password')

  if (!payload && !isPublicAuthPage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = loginPath
    redirectUrl.search = `from=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(redirectUrl)
  }

  if (payload && isPublicAuthPage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = adminPath
    return NextResponse.redirect(redirectUrl)
  }

  const res = NextResponse.next()
  applySecurityHeaders(res)
  return res

}

export const config = {
  matcher: ['/:path*'],
}
