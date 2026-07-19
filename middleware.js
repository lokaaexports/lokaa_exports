import { NextResponse } from 'next/server'
import { getAuthPayloadFromRequest } from './lib/auth-service'

export const runtime = 'nodejs'

function getAllowedOrigins() {
  const fromEnv = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean) : []
  const devOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000']
  const isProd = process.env.NODE_ENV === 'production'
  return isProd ? fromEnv : [...devOrigins, ...fromEnv]
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
  response.headers.set('Content-Security-Policy', "frame-ancestors 'self';")
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // If some other layer sets these, overwrite/remove CORS-related defaults here.
  // We intentionally do NOT set Access-Control-Allow-Origin here (CORS is set conditionally).
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
    pathname.includes('forgot-password')

  if (!payload && !isPublicAuthPage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = loginPath
    redirectUrl.search = `from=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(redirectUrl)
  }

  if (payload && pathname === loginPath) {
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
