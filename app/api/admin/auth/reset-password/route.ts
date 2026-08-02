import { NextResponse } from 'next/server'
import AuthService from '@/lib/admin/services/auth.service'
import { validatePasswordReset } from '@/lib/admin/validators/auth.validation'
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

    const { token, password, confirmPassword } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, error: 'Reset token is required' }, { status: 400 })
    }

    const validation = validatePasswordReset(password, confirmPassword)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    const result = await AuthService.resetPassword(token, password, confirmPassword)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to reset password', errors: result.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, message: result.message })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
