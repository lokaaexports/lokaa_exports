import { NextResponse } from 'next/server'

// POST /api/auth/customer-logout
export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  )

  // Clear the auth cookie with same attributes used when setting it
  const isProd = process.env.NODE_ENV === 'production'
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
