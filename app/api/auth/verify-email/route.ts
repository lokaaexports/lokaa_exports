import { verifyEmailOTP, resendOTP } from '@/lib/customer-auth-service'

// POST /api/auth/verify-otp
export async function POST(request: any) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const { isRateLimited } = await import('@/lib/rate-limiter')
    const rateCheck = isRateLimited(ip, 5, 15 * 60 * 1000)
    if (rateCheck.limited) {
      return new Response(
        JSON.stringify({ success: false, error: 'Too many verification attempts. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { email, otp, action } = await request.json()

    if (action === 'resend') {
      const result = await resendOTP(email)
      return new Response(
        JSON.stringify({
          success: true,
          message: result.message,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = await verifyEmailOTP(email, otp)

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: 'Email verified successfully',
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
