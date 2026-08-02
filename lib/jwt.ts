import { verifyAccessToken, generateTokens } from '@/lib/admin/auth/jwt'

export function createJwt(payload: any) {
  // Map sub payload parameters to match standard admin JWT fields
  const roles = payload.role ? [payload.role] : []
  const { accessToken } = generateTokens(payload.sub, roles, [], payload.email, false)
  return accessToken
}

export function createRefreshToken(payload: any) {
  const roles = payload.role ? [payload.role] : []
  const { refreshToken } = generateTokens(payload.sub, roles, [], payload.email, false)
  return refreshToken
}

export function verifyJwt(token: any) {
  try {
    const decoded: any = verifyAccessToken(token)
    // Map properties back for backwards compatibility with legacy sub payload shapes
    if (decoded && !decoded.sub) {
      decoded.sub = decoded.employeeId || decoded.id
      decoded.role = Array.isArray(decoded.roles) ? decoded.roles[0] : decoded.role
    }
    return decoded
  } catch {
    return null
  }
}
