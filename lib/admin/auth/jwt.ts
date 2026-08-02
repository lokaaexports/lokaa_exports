// lib/admin/auth/jwt.js
// JWT Token Management

import jwt from 'jsonwebtoken'

function getJwtSecret() {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET environment variable is required')
  return s
}

function getJwtRefreshSecret() {
  const s = process.env.JWT_REFRESH_SECRET
  if (!s) throw new Error('JWT_REFRESH_SECRET environment variable is required')
  return s
}

const ACCESS_TOKEN_EXPIRES_IN = '15m'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

export const generateTokens = (employeeId: any, roles: any, permissions: any, email: any, rememberMe = false) => {
  const expiresIn = rememberMe ? '7d' : ACCESS_TOKEN_EXPIRES_IN
  const accessToken = jwt.sign(
    {
      employeeId,
      email,
      roles,
      permissions,
      type: 'access'
    },
    getJwtSecret(),
    { expiresIn }
  )

  const refreshToken = jwt.sign(
    {
      employeeId,
      type: 'refresh'
    },
    getJwtRefreshSecret(),
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  )

  return { accessToken, refreshToken }
}

export const verifyAccessToken = (token: any) => {
  try {
    return jwt.verify(token, getJwtSecret())
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired')
    }
    throw new Error('Invalid token')
  }
}

export const verifyRefreshToken = (token: any) => {
  try {
    return jwt.verify(token, getJwtRefreshSecret())
  } catch (error: any) {
    throw new Error('Invalid refresh token')
  }
}

export const decodeToken = (token: any) => {
  try {
    return jwt.decode(token)
  } catch (error: any) {
    return null
  }
}

export const refreshAccessToken = (refreshToken: any) => {
  try {
    const decoded = verifyRefreshToken(refreshToken)
    // Generate new access token (refresh token remains same)
    const accessToken = jwt.sign(
      {
        employeeId: decoded.employeeId,
        type: 'access'
      },
      getJwtSecret(),
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    )
    return { accessToken, refreshToken }
  } catch (error: any) {
    throw new Error('Failed to refresh token')
  }
}
