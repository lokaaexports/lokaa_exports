// app/api/admin/auth/forgot-password/route.js
// Forgot Password API Endpoint

import { NextResponse } from 'next/server'
import AuthService from '@/lib/admin/services/auth.service'
import { validateForgotPasswordPayload } from '@/lib/admin/validators/auth.validation'
import { isRateLimited } from '@/lib/rate-limiter'

export async function POST(request: any) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitCheck = isRateLimited(ip, 5, 15 * 60 * 1000)
    if (rateLimitCheck.limited) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    // Validate input
    const validation = validateForgotPasswordPayload(email)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    // Process forgot password request
    const result = await AuthService.forgotPassword(email)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to process request' },
        { status: 500 }
      )
    }

    // Always return success message for security (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: result.message
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
