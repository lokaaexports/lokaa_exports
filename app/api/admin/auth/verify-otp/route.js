// app/api/admin/auth/verify-otp/route.js
// OTP Verification API Endpoint

import { NextResponse } from 'next/server'
import AuthService from '@/lib/admin/services/auth.service'
import { validateOTPPayload } from '@/lib/admin/validators/auth.validation'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }

  try {
    const { email, otp } = body

    // Validate input
    const validation = validateOTPPayload(otp, email)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    // Get device info
    const userAgent = request.headers.get('user-agent') || ''
    const deviceInfo = AuthService.getDeviceInfo(userAgent)

    // Verify OTP and login
    const result = await AuthService.verifyOTPAndLogin(email, otp, deviceInfo)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'OTP verification failed', errors: result.errors },
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
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 // 15 minutes
    })

    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
