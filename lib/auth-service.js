import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { getMysqlPool } from './mysql-client'
import { createJwt, createRefreshToken, verifyJwt } from './jwt'
import { logAuditEvent } from './audit-log'

const userLookupCache = new Map()
const USER_CACHE_TTL_MS = 60_000

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase().replace(/_/g, '-')
}

function normalizeEmail(email) {
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

export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export async function findUserByEmail(email) {
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

export async function createUser({ email, password, role = 'admin', name = '', company = '' }) {
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

export async function upsertAdminUser({ email, password, role = 'super-admin', name = 'Admin', company = 'Lokaa Exports' }) {
  const existing = await findUserByEmail(email)
  if (existing) return existing
  return createUser({ email, password, role, name, company })
}

export function createAuthCookies(response, payload) {
  const token = createJwt(payload)
  const refreshToken = createRefreshToken(payload)
  response.cookies.set('authToken', token, getCookieOptions())
  response.cookies.set('refreshToken', refreshToken, getRefreshCookieOptions())
  return { token, refreshToken }
}

export function clearAuthCookies(response) {
  response.cookies.set('authToken', '', { ...getCookieOptions(), maxAge: 0 })
  response.cookies.set('refreshToken', '', { ...getRefreshCookieOptions(), maxAge: 0 })
}

export function getAuthPayloadFromRequest(request) {
  const authToken = request.cookies.get('authToken')?.value
  return authToken ? verifyJwt(authToken) : null
}

export async function verifyAdmin(request, requiredRole = 'admin') {
  const payload = getAuthPayloadFromRequest(request)
  if (!payload) {
    throw new Error('Unauthorized')
  }

  const normalizedRole = normalizeRole(payload.role)
  const normalizedRequiredRole = normalizeRole(requiredRole)

  if (normalizedRequiredRole === 'admin' && normalizedRole !== 'super-admin' && normalizedRole !== 'admin') {
    throw new Error('Forbidden')
  }

  if (normalizedRequiredRole && normalizedRequiredRole !== 'admin' && normalizedRole !== normalizedRequiredRole) {
    throw new Error('Forbidden')
  }

  return payload
}

export async function verifyRole(request, allowedRoles = []) {
  const payload = getAuthPayloadFromRequest(request)
  if (!payload) {
    throw new Error('Unauthorized')
  }

  if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
    throw new Error('Forbidden')
  }

  return payload
}

export async function authenticateUser({ email, password }) {
  const user = await findUserByEmail(email)
  if (!user) return null
  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return null
  return user
}

export async function finalizeLogin(request, user, response) {
  const payload = { sub: user.id, role: user.role, email: user.email }
  createAuthCookies(response, payload)
  void logAuditEvent({
    action: 'admin_login',
    userId: user.id,
    email: user.email,
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    details: { role: user.role },
  })
  return payload
}

export async function finalizeLogout(request, response, user) {
  clearAuthCookies(response)
  void logAuditEvent({
    action: 'admin_logout',
    userId: user?.id || null,
    email: user?.email || null,
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    details: {},
  })
}

// Create JWT token (wrapper for convenience)
export function createToken(payload) {
  return createJwt(payload)
}

// Verify JWT token (wrapper for convenience)
export function verifyToken(token) {
  return verifyJwt(token)
}
