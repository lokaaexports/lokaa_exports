import { loginCustomer } from '@/lib/customer-auth-service'
import { createToken } from '@/lib/auth-service'

// POST /api/auth/customer-login
export async function POST(request) {
  try {
    const { email, password, rememberMe } = await request.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email and password required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Authenticate customer
    const customer = await loginCustomer(email, password)

    // Create JWT token
    const token = createToken({
      id: customer.customerId,
      email: customer.email,
      type: 'customer',
      customerNumber: customer.customerNumber,
    })

    // Set cookie with token
    const response = new Response(
      JSON.stringify({
        success: true,
        data: customer,
        message: 'Login successful',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
            rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
          }`,
        },
      }
    )

    return response
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
