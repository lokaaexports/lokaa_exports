import { NextResponse } from 'next/server'
import { loginCustomer } from '@/lib/customer-auth-service'
import { createToken } from '@/lib/auth-service'

// POST /api/auth/customer-login
export async function POST(request: any) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const { isRateLimited } = await import('@/lib/rate-limiter')
    const rateCheck = isRateLimited(ip, 5, 15 * 60 * 1000)
    if (rateCheck.limited) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Authenticate customer
    const customer = await loginCustomer(String(email).trim().toLowerCase(), String(password))

    // Create JWT token
    const token = createToken({
      id: customer.customerId,
      email: customer.email,
      type: 'customer',
      customerNumber: customer.customerNumber,
    })

    const isProd = process.env.NODE_ENV === 'production'
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60

    const response = NextResponse.json(
      {
        success: true,
        data: customer,
        message: 'Login successful',
      },
      { status: 200 }
    )

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    return response
  } catch (error: any) {
    // Don't leak internal error details to client
    const isAuthError = error.message.includes('Invalid email or password') ||
      error.message.includes('Too many') ||
      error.message.includes('verify your email') ||
      error.message.includes('not active')

    return NextResponse.json(
      {
        success: false,
        error: isAuthError ? error.message : 'Authentication failed',
      },
      { status: 401 }
    )
  }
}
