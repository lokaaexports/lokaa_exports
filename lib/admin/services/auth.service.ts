// lib/admin/services/auth.service.js
// Authentication Business Logic Service

import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { generateTokens, refreshAccessToken } from '../auth/jwt'
import {
  validateLoginPayload,
  validateOTPPayload,
  validatePasswordReset,
} from '../validators/auth.validation'
import { prisma as sharedPrisma } from '@/lib/prisma'
import { sendOtpEmail, sendPasswordResetEmail } from '@/lib/email-service'

const prisma = sharedPrisma || new PrismaClient()

const OTP_TYPE = 'OTP_LOGIN'
const RESET_TYPE = 'PASSWORD_RESET'
const OTP_TTL_MS = 5 * 60 * 1000
const RESET_TTL_MS = 30 * 60 * 1000

function sha256(value: any) {
  return crypto.createHash('sha256').update(String(value)).digest('hex')
}

function generateOtp() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}

async function applyThrottle(scope: any, identifier: any, limit: any, windowMs: any) {
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowMs)
  const record = await prisma.authThrottle.findUnique({
    where: { scope_identifier: { scope, identifier } },
  })

  if (!record || record.resetAt <= now) {
    await prisma.authThrottle.upsert({
      where: { scope_identifier: { scope, identifier } },
      create: { scope, identifier, count: 1, resetAt },
      update: { count: 1, resetAt },
    })
    return { allowed: true }
  }

  if (record.count >= limit) {
    return { allowed: false }
  }

  await prisma.authThrottle.update({
    where: { scope_identifier: { scope, identifier } },
    data: { count: { increment: 1 } },
  })

  return { allowed: true }
}

async function createAuthToken({ email, userId = null, type, token, expiresAt }: any) {
  await prisma.authToken.updateMany({
    where: {
      email,
      type,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  })

  return prisma.authToken.create({
    data: {
      email,
      userId,
      type,
      tokenHash: sha256(token),
      expiresAt,
    },
  })
}

async function consumeAuthToken({ email, type, token }: any) {
  const candidates = await prisma.authToken.findMany({
    where: {
      email,
      type,
      usedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const tokenHash = sha256(token)
  const match = candidates.find(
    (record) => record.tokenHash === tokenHash && record.expiresAt > new Date()
  )

  if (!match) {
    return { valid: false, error: 'Invalid or expired code' }
  }

  await prisma.authToken.update({
    where: { id: match.id },
    data: {
      usedAt: new Date(),
      attempts: { increment: 1 },
    },
  })

  return { valid: true, token: match }
}

export default class AuthService {
  static generateOTP() {
    return generateOtp()
  }

  static async login(email: any, password: any, deviceInfo: any) {
    const validation = validateLoginPayload(email, password)
    if (!validation.valid) {
      return { success: false, errors: validation.errors }
    }

    const ip = deviceInfo?.ipAddress || deviceInfo?.ip || 'unknown'

    try {
      // Parallel: throttle check + user lookup (saves ~15ms)
      const [throttle, user] = await Promise.all([
        applyThrottle('admin_login_email', email.toLowerCase(), 5, 15 * 60 * 1000),
        prisma.user.findUnique({ where: { email }, include: { role: true } }),
      ])

      if (!throttle.allowed) {
        return { success: false, error: 'Too many requests. Try again later.' }
      }

      // Use constant-time comparison to prevent timing attacks / user enumeration
      if (!user || user.status !== 'active') {
        // Still run bcrypt to avoid timing oracle
        await bcrypt.compare(password, '$2b$10$invalidhashpadding000000000000000000000000000000000000')
        return { success: false, error: 'Invalid credentials' }
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        // Log failed attempt (non-blocking)
        prisma.loginHistory.create({
          data: {
            userId: user.id, ip,
            device: deviceInfo?.deviceId || null,
            userAgent: deviceInfo?.userAgent || null,
            status: 'failed', reason: 'Invalid credentials',
          },
        }).catch(err => console.error('[AUTH] Failed to log login history:', err))

        return { success: false, error: 'Invalid credentials' }
      }

      const otp = generateOtp()
      // Store OTP in DB synchronously (must complete before returning)
      await createAuthToken({
        email: user.email,
        userId: user.id,
        type: OTP_TYPE,
        token: otp,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      })

      // Send email NON-BLOCKING — response returns immediately, email is best-effort
      const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin'
      setImmediate(() => {
        sendOtpEmail(email, displayName, otp, 'admin-login').catch(
          err => console.error('[AUTH] OTP email delivery failed:', err)
        )
      })

      return {
        success: true,
        message: 'OTP sent to your email',
        email,
        deviceInfo,
        requiresOTP: true,
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }


  static async verifyOTPAndLogin(email: any, otp: any, deviceInfo: any, rememberMe = false) {
    const validation = validateOTPPayload(otp, email)
    if (!validation.valid) {
      return { success: false, errors: validation.errors }
    }

    const throttle = await applyThrottle('admin_verify_otp', email.toLowerCase(), 10, 10 * 60 * 1000)
    if (!throttle.allowed) {
      return { success: false, error: 'Too many attempts. Try again later.' }
    }

    const otpVerification = await consumeAuthToken({
      email,
      type: OTP_TYPE,
      token: otp,
    })

    if (!otpVerification.valid) {
      return { success: false, error: otpVerification.error }
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true },
      })

      if (!user) {
        return { success: false, error: 'User not found' }
      }

      const { accessToken, refreshToken } = generateTokens(
        user.id,
        [user.role?.name || 'super-admin'],
        ['*'],
        user.email,
        rememberMe
      )

      // Save refresh token to database
      await prisma.authToken.create({
        data: {
          email: user.email,
          userId: user.id,
          type: 'REFRESH_TOKEN',
          tokenHash: sha256(refreshToken),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })

      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ip: deviceInfo?.ipAddress || 'unknown',
          device: deviceInfo?.deviceId || null,
          userAgent: deviceInfo?.userAgent || null,
          status: 'success',
        },
      })

      return {
        success: true,
        accessToken,
        refreshToken,
        employee: {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          roles: [user.role?.name || 'super-admin'],
          avatar: user.avatar,
        },
      }
    } catch (error: any) {
      console.error('OTP verification error:', error)
      return { success: false, error: 'OTP verification failed' }
    }
  }

  static async resendOTP(email: any, deviceInfo: any = {}) {
    const validation = validateLoginPayload(email, 'temporary-password')
    if (!validation.valid) {
      return { success: false, errors: validation.errors }
    }

    const throttle = await applyThrottle('admin_resend_otp', email.toLowerCase(), 5, 60 * 60 * 1000)
    if (!throttle.allowed) {
      return { success: false, error: 'Too many requests. Try again later.' }
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true },
      })

      if (!user || user.status !== 'active') {
        return { success: true, message: 'OTP sent to your email' }
      }

      const otp = generateOtp()
      await createAuthToken({
        email: user.email,
        userId: user.id,
        type: OTP_TYPE,
        token: otp,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      })

      await sendOtpEmail(
        email,
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin',
        otp,
        'admin-login'
      )

      return { success: true, message: 'OTP sent to your email' }
    } catch (error: any) {
      console.error('Resend OTP error:', error)
      return { success: false, error: 'Failed to resend OTP' }
    }
  }

  static async refreshToken(refreshToken: any) {
    try {
      const tokens = refreshAccessToken(refreshToken)
      return { success: true, ...tokens }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async logout() {
    return { success: true }
  }

  static async forgotPassword(email: any, requestMeta = {}) {
    try {
      const throttle = await applyThrottle(
        'admin_forgot_password',
        String(email || '').toLowerCase(),
        5,
        60 * 60 * 1000
      )

      if (!throttle.allowed) {
        return { success: true, message: 'Password reset link sent to your email' }
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true },
      })

      if (!user) {
        return { success: true, message: 'Password reset link sent to your email' }
      }

      const token = crypto.randomUUID()

      await createAuthToken({
        email: user.email,
        userId: user.id,
        type: RESET_TYPE,
        token,
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      })

      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/reset-password?token=${token}&email=${encodeURIComponent(email)}`

      await sendPasswordResetEmail(
        email,
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin',
        resetUrl
      )

      return { success: true, message: 'Password reset link sent to your email' }
    } catch (error: any) {
      console.error('[ADMIN FORGOT_PASSWORD] FAILED', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      })
      return { success: false, error: 'Failed to process request' }
    }
  }

  static async resetPassword(token: any, password: any, confirmPassword: any) {
    const validation = validatePasswordReset(password, confirmPassword)
    if (!validation.valid) {
      return { success: false, errors: validation.errors }
    }

    try {
      const records = await prisma.authToken.findMany({
        where: {
          type: RESET_TYPE,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
        take: 25,
      })

      const match = records.find((record) => record.tokenHash === sha256(token))
      if (!match) {
        return { success: false, error: 'Reset link not found or expired' }
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      await prisma.user.update({
        where: { email: match.email },
        data: {
          password: hashedPassword,
          isTemporaryPassword: false,
          lastPasswordChange: new Date(),
        },
      })

      await prisma.authToken.update({
        where: { id: match.id },
        data: {
          usedAt: new Date(),
          attempts: { increment: 1 },
        },
      })

      return { success: true, message: 'Password reset successfully' }
    } catch (error: any) {
      return { success: false, error: 'Password reset failed' }
    }
  }

  static getDeviceInfo(userAgent: any) {
    return {
      userAgent,
      deviceId: crypto.randomUUID(),
    }
  }
}
