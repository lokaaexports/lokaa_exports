import { initiateForgotPassword, resetPasswordWithOTP } from '@/lib/customer-auth-service'

// POST /api/auth/forgot-password
export async function POST(request: any) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const { isRateLimited } = await import('@/lib/rate-limiter')
    const rateCheck = isRateLimited(ip, 5, 15 * 60 * 1000)
    if (rateCheck.limited) {
      return new Response(
        JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { email, action, otp, newPassword } = await request.json()

    if (action === 'reset') {
      // Reset password with OTP
      if (!otp || !newPassword) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'OTP and password required',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const result = await resetPasswordWithOTP(email, otp, newPassword)
      return new Response(
        JSON.stringify({
          success: true,
          message: result.message,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initiate forgot password
    const result = await initiateForgotPassword(email)

    return new Response(
      JSON.stringify({
        success: true,
        message: result.message,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
