import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { getMysqlPool } from './mysql-client'
import { createJwt, createRefreshToken, verifyJwt } from './jwt'
import { logAuditEvent } from './audit-log'
import prisma from './prisma'
import crypto from 'crypto'

const userLookupCache = new Map()
const USER_CACHE_TTL_MS = 0

function normalizeRole(role: any) {
  return String(role || '').trim().toLowerCase().replace(/[\s_]+/g, '-')
}

function normalizeEmail(email: any) {
  return String(email || '').trim().toLowerCase()
}

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    path: '/',
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60,
  }
}

function getRefreshCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    path: '/',
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  }
}

export async function hashPassword(password: any) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: any, hash: any) {
  return bcrypt.compare(password, hash)
}

export async function findUserByEmail(email: any) {
  const normalizedEmail = normalizeEmail(email)
  const cached = userLookupCache.get(normalizedEmail)
  if (cached && Date.now() - cached.timestamp < USER_CACHE_TTL_MS) {
    return cached.user
  }

  const pool = await getMysqlPool()
  const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [normalizedEmail])
  const user = rows[0] || null
  if (user) {
    userLookupCache.set(normalizedEmail, { user, timestamp: Date.now() })
  }
  return user
}

export async function createUser({ email, password, role = 'admin', name = '', company = '' }: any) {
  const pool = await getMysqlPool()
  const normalizedEmail = normalizeEmail(email)
  const passwordHash = await hashPassword(password)
  const id = uuidv4()
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  await pool.query(
    `INSERT INTO users (id, email, passwordHash, role, name, company, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)` ,
    [id, normalizedEmail, passwordHash, role, name, company, now, now]
  )
  userLookupCache.delete(normalizedEmail)
  return { id, email: normalizedEmail, role, name, company, status: 'active', createdAt: now, updatedAt: now }
}

export async function upsertAdminUser({ email, password, role = 'super-admin', name = 'Admin', company = 'Lokaa Exports' }: any) {
  const existing = await findUserByEmail(email)
  if (existing) return existing
  return createUser({ email, password, role, name, company })
}

export function createAuthCookies(response: any, payload: any) {
  const token = createJwt(payload)
  const refreshToken = createRefreshToken(payload)
  response.cookies.set('authToken', token, getCookieOptions())
  response.cookies.set('refreshToken', refreshToken, getRefreshCookieOptions())
  return { token, refreshToken }
}

export function clearAuthCookies(response: any) {
  response.cookies.set('authToken', '', { ...getCookieOptions(), maxAge: 0 })
  response.cookies.set('refreshToken', '', { ...getRefreshCookieOptions(), maxAge: 0 })
}

export function getAuthPayloadFromRequest(request: any) {
  const authToken = request.cookies.get('authToken')?.value
  return authToken ? verifyJwt(authToken) : null
}

export async function verifyAdmin(request: any, requiredRole = 'admin') {
  const payload = getAuthPayloadFromRequest(request)
  if (!payload) {
    throw new Error('Unauthorized')
  }

  const tokenRoles = payload.roles || (payload.role ? [payload.role] : [])
  const normalizedRoles = tokenRoles.map((r: any) => normalizeRole(r))
  const normalizedRequiredRole = normalizeRole(requiredRole)

  if (normalizedRequiredRole === 'admin') {
    if (!normalizedRoles.includes('super-admin') && !normalizedRoles.includes('admin')) {
      throw new Error('Forbidden')
    }
  } else if (normalizedRequiredRole) {
    if (!normalizedRoles.includes(normalizedRequiredRole) && !normalizedRoles.includes('super-admin')) {
      throw new Error('Forbidden')
    }
  }

  return { ...payload, id: payload.sub }
}

export async function verifyRole(request: any, allowedRoles: string[] = []) {
  const payload = getAuthPayloadFromRequest(request)
  if (!payload) {
    throw new Error('Unauthorized')
  }

  const tokenRoles = payload.roles || (payload.role ? [payload.role] : [])
  const hasAllowedRole = allowedRoles.length === 0 || allowedRoles.some(r => tokenRoles.includes(r))

  if (!hasAllowedRole) {
    throw new Error('Forbidden')
  }

  return payload
}

export async function authenticateUser({ email, password }: any) {
  const user = await findUserByEmail(email)
  if (!user) return null
  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return null
  return user
}

export async function finalizeLogin(request: any, user: any, response: any) {
  const payload = { sub: user.id, role: user.role, email: user.email }
  const { refreshToken } = createAuthCookies(response, payload)
  
  // Save refresh token in database
  const tokenHash = crypto.createHash('sha256').update(String(refreshToken)).digest('hex')
  await prisma.authToken.create({
    data: {
      email: user.email,
      userId: user.id,
      type: 'REFRESH_TOKEN',
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  })

  void logAuditEvent({
    action: 'admin_login',
    userId: user.id,
    email: user.email,
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    details: { role: user.role },
  })
  return payload
}

export async function finalizeLogout(request: any, response: any, user: any) {
  clearAuthCookies(response)
  if (user?.id) {
    await prisma.authToken.updateMany({
      where: {
        userId: user.id,
        type: 'REFRESH_TOKEN',
        usedAt: null
      },
      data: {
        usedAt: new Date()
      }
    })
  }
  void logAuditEvent({
    action: 'admin_logout',
    userId: user?.id || null,
    email: user?.email || null,
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    details: {},
  })
}

// Create JWT token (wrapper for convenience)
export function createToken(payload: any) {
  return createJwt(payload)
}

// Verify JWT token (wrapper for convenience)
export function verifyToken(token: any) {
  return verifyJwt(token)
}
