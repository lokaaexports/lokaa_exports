import { NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/jwt'
import { createAuthCookies } from '@/lib/auth-service'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: any) {
  try {
    const body = await request.json()
    const { refreshToken } = body
    if (!refreshToken) return NextResponse.json({ success: false, error: 'Refresh token missing' }, { status: 400 })

    const payload = verifyJwt(refreshToken)
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid refresh token' }, { status: 401 })

    // Check refresh token in database to prevent stolen token usage
    const tokenHash = crypto.createHash('sha256').update(String(refreshToken)).digest('hex')
    const dbToken = await prisma.authToken.findFirst({
      where: {
        tokenHash,
        type: 'REFRESH_TOKEN',
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    })

    if (!dbToken) {
      return NextResponse.json({ success: false, error: 'Revoked or expired refresh token' }, { status: 401 })
    }

    // Revoke old token
    await prisma.authToken.update({
      where: { id: dbToken.id },
      data: { usedAt: new Date() }
    })

    const response = NextResponse.json({ ok: true })
    const { refreshToken: newRefreshToken } = createAuthCookies(response, { sub: payload.sub, email: payload.email, role: payload.role })
    
    // Save new refresh token to DB
    const newTokenHash = crypto.createHash('sha256').update(String(newRefreshToken)).digest('hex')
    await prisma.authToken.create({
      data: {
        email: payload.email,
        userId: payload.sub,
        type: 'REFRESH_TOKEN',
        tokenHash: newTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    return response
  } catch (error: any) {
    console.error('Refresh token error', error)
    return NextResponse.json({ success: false, error: 'Unable to refresh token' }, { status: 500 })
  }
}
