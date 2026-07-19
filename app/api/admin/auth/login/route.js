// app/api/admin/auth/login/route.js
// Admin Login API Endpoint

import { NextResponse } from 'next/server'
import AuthService from '@/lib/admin/services/auth.service'
import { validateLoginPayload } from '@/lib/admin/validators/auth.validation'

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
    const { email, password, rememberMe } = body

    // Validate input
    const validation = validateLoginPayload(email, password)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    // Get device info from user agent
    const userAgent = request.headers.get('user-agent') || ''
    const deviceInfo = AuthService.getDeviceInfo(userAgent)

    // Attempt login
    const loginResult = await AuthService.login(email, password, deviceInfo)

    if (!loginResult.success) {
      // Log failed login attempt
      // await loginHistoryRepo.create({ email, status: 'failed', reason: loginResult.error })
      
      return NextResponse.json(
        { error: loginResult.error || 'Login failed', errors: loginResult.errors },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: loginResult.message,
      email: loginResult.email,
      requiresOTP: true
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
