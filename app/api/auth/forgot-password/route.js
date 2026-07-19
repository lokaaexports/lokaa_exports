import { initiateForgotPassword, resetPasswordWithOTP } from '@/lib/customer-auth-service'

// POST /api/auth/forgot-password
export async function POST(request) {
  try {
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
