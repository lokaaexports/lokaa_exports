import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateUser, createUser, finalizeLogin, getAuthPayloadFromRequest } from '@/lib/auth-service'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
  company: z.string().optional(),
})

function json(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

export async function POST(request: any) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const { isRateLimited } = await import('@/lib/rate-limiter')
    const rateCheck = isRateLimited(ip, 5, 15 * 60 * 1000)
    if (rateCheck.limited) {
      return json({ success: false, error: 'Too many auth requests. Please try again in 15 minutes.' }, 429)
    }

    const url = new URL(request.url)
    const path = url.searchParams.get('action') || 'login'
    const body = await request.json()

    if (path === 'login') {
      const parsed = loginSchema.safeParse(body)
      if (!parsed.success) return json({ success: false, error: parsed.error.issues[0].message }, 400)

      const user = await authenticateUser({ email: parsed.data.email, password: parsed.data.password })
      if (!user) {
        return json({ success: false, error: 'Invalid credentials' }, 401)
      }

      const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role, name: user.name, company: user.company } })
      await finalizeLogin(request, user, response)
      return response
    }

    if (path === 'register') {
      const parsed = registerSchema.safeParse(body)
      if (!parsed.success) return json({ success: false, error: parsed.error.issues[0].message }, 400)

      const user = await createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        role: 'customer',
        name: parsed.data.name || '',
        company: parsed.data.company || '',
      })

      return json({ ok: true, user: { id: user.id, email: user.email, role: user.role, name: user.name, company: user.company } })
    }

    return json({ success: false, error: 'Not found' }, 404)
  } catch (error: any) {
    console.error('Auth route error', error)
    return json({ success: false, error: 'Authentication failed' }, 500)
  }
}

export async function GET(request: any) {
  const payload = getAuthPayloadFromRequest(request)
  return json({ authenticated: Boolean(payload), user: payload ? { id: payload.sub, email: payload.email, role: payload.role } : null })
}
