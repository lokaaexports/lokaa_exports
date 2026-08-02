// app/api/admin/auth/login/route.js
// Admin Login API Endpoint

import { NextResponse } from 'next/server'
import AuthService from '@/lib/admin/services/auth.service'
import { validateLoginPayload } from '@/lib/admin/validators/auth.validation'
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
    const { email, password, rememberMe } = body

    // Validate input
    const validation = validateLoginPayload(email, password)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    // Get device info from user agent and IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // IP-based Rate Limiter Check
    const rateLimitCheck = isRateLimited(ip, 5, 15 * 60 * 1000)
    if (rateLimitCheck.limited) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const userAgent = request.headers.get('user-agent') || ''
    const deviceInfo = { ...AuthService.getDeviceInfo(userAgent), ipAddress: ip }

    // Attempt login
    const loginResult = await AuthService.login(email, password, deviceInfo)

    if (!loginResult.success) {
      // Log failed login attempt
      // await loginHistoryRepo.create({ email, status: 'failed', reason: loginResult.error })
      
      return NextResponse.json(
        { success: false, error: loginResult.error || 'Login failed', errors: loginResult.errors },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: loginResult.message,
      email: loginResult.email,
      requiresOTP: true
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
