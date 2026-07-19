import { NextResponse } from 'next/server'
import AuthService from '@/lib/admin/services/auth.service'
import { validatePasswordReset } from '@/lib/admin/validators/auth.validation'

export async function POST(request) {
  try {
    const { token, password, confirmPassword } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 })
    }

    const validation = validatePasswordReset(password, confirmPassword)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    const result = await AuthService.resetPassword(token, password, confirmPassword)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to reset password', errors: result.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, message: result.message })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
