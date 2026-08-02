// app/api/admin/auth/resend-otp/route.js
// Resend OTP API Endpoint

import { NextResponse } from 'next/server'
import AuthService from '@/lib/admin/services/auth.service'
import { isRateLimited } from '@/lib/rate-limiter'

export async function POST(request: any) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitCheck = isRateLimited(ip, 5, 15 * 60 * 1000)
    if (rateLimitCheck.limited) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const result = await AuthService.resendOTP(email)

    return NextResponse.json({
      success: result.success !== false,
      message: result.message || 'OTP sent to your email'
    })
  } catch (error: any) {
    console.error('Resend OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
