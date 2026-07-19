// lib/admin/auth/jwt.js
// JWT Token Management

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'lokaa-export-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'lokaa-export-refresh-secret-key'
const ACCESS_TOKEN_EXPIRES_IN = '15m'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

export const generateTokens = (employeeId, roles, permissions, email) => {
  const accessToken = jwt.sign(
    {
      employeeId,
      email,
      roles,
      permissions,
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  )

  const refreshToken = jwt.sign(
    {
      employeeId,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  )

  return { accessToken, refreshToken }
}

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired')
    }
    throw new Error('Invalid token')
  }
}

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET)
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}

export const decodeToken = (token) => {
  try {
    return jwt.decode(token)
  } catch (error) {
    return null
  }
}

export const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken)
    // Generate new access token (refresh token remains same)
    const accessToken = jwt.sign(
      {
        employeeId: decoded.employeeId,
        type: 'access'
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    )
    return { accessToken, refreshToken }
  } catch (error) {
    throw new Error('Failed to refresh token')
  }
}
