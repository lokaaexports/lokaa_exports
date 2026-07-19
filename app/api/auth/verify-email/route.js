import { verifyEmailOTP, resendOTP } from '@/lib/customer-auth-service'

// POST /api/auth/verify-otp
export async function POST(request) {
  try {
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
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
