import {
  registerCustomer,
  verifyEmailOTP,
  resendOTP,
  loginCustomer,
  initiateForgotPassword,
  resetPasswordWithOTP,
} from '@/lib/customer-auth-service'
import { createToken } from '@/lib/auth-service'

// POST /api/auth/register
export async function POST(request) {
  try {
    const data = await request.json()
    console.log(`[REGISTER] Registration attempt for email: ${data.email}`)

    const result = await registerCustomer(data)
    console.log(`[REGISTER] ✅ Registration successful for ${data.email}`)

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: 'Registration successful. Check your email for OTP.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error(`[REGISTER] ❌ Registration error:`, error.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
