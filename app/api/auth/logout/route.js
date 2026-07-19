import { NextResponse } from 'next/server'
import { finalizeLogout, getAuthPayloadFromRequest } from '@/lib/auth-service'

export async function POST(request) {
  const response = NextResponse.json({ ok: true })
  const payload = getAuthPayloadFromRequest(request)
  const user = payload ? { id: payload.sub, email: payload.email, role: payload.role } : null
  await finalizeLogout(request, response, user)
  return response
}
