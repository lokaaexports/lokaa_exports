// app/api/admin/auth/verify-otp/route.js
// OTP Verification API Endpoint

import { NextResponse } from 'next/server'
import AuthService from '@/lib/admin/services/auth.service'
import { validateOTPPayload } from '@/lib/admin/validators/auth.validation'
import { isRateLimited } from '@/lib/rate-limiter'

export async function POST(request: any) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 }
    )
  }

  try {
    const { email, otp, rememberMe } = body

    // Validate input
    const validation = validateOTPPayload(otp, email)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    // Get device info and IP for rate limiting/logging
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // IP-based Rate Limiter Check
    const rateLimitCheck = isRateLimited(ip, 5, 15 * 60 * 1000)
    if (rateLimitCheck.limited) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const userAgent = request.headers.get('user-agent') || ''
    const deviceInfo = { ...AuthService.getDeviceInfo(userAgent), ipAddress: ip }

    // Verify OTP and login
    const result = await AuthService.verifyOTPAndLogin(email, otp, deviceInfo, rememberMe)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'OTP verification failed', errors: result.errors },
        { status: 401 }
      )
    }

    // Create response with tokens
    const response = NextResponse.json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      employee: result.employee
    })

    // Set secure cookies (middleware reads authToken cookie)
    response.cookies.set('authToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: rememberMe ? 7 * 24 * 60 * 60 : 15 * 60 // 7 days or 15 minutes
    })

    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error: any) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
