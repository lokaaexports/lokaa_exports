// app/api/admin/auth/forgot-password/route.js
// Forgot Password API Endpoint

import { NextResponse } from 'next/server'
import AuthService from '@/lib/admin/services/auth.service'
import { validateForgotPasswordPayload } from '@/lib/admin/validators/auth.validation'

export async function POST(request) {
  try {
    const { email } = await request.json()

    // Validate input
    const validation = validateForgotPasswordPayload(email)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    // Process forgot password request
    const result = await AuthService.forgotPassword(email)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to process request' },
        { status: 500 }
      )
    }

    // Always return success message for security (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
