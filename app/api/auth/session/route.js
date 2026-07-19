import { NextResponse } from 'next/server'
import { getAuthPayloadFromRequest } from '@/lib/auth-service'

export async function GET(request) {
  try {
    const payload = getAuthPayloadFromRequest(request)
    return NextResponse.json({ authenticated: Boolean(payload), user: payload ? { id: payload.sub, email: payload.email, role: payload.role } : null })
  } catch (error) {
    console.error('Session route error', error)
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 })
  }
}
