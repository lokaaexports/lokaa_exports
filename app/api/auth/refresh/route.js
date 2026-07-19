import { NextResponse } from 'next/server'
import { verifyJwt, createJwt } from '@/lib/jwt'
import { createAuthCookies } from '@/lib/auth-service'

export async function POST(request) {
  try {
    const body = await request.json()
    const { refreshToken } = body
    if (!refreshToken) return NextResponse.json({ error: 'Refresh token missing' }, { status: 400 })

    const payload = verifyJwt(refreshToken)
    if (!payload) return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })

    const response = NextResponse.json({ ok: true })
    createAuthCookies(response, { sub: payload.sub, email: payload.email, role: payload.role })
    return response
  } catch (error) {
    console.error('Refresh token error', error)
    return NextResponse.json({ error: 'Unable to refresh token' }, { status: 500 })
  }
}
