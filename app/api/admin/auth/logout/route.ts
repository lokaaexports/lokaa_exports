import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin/middleware/auth'
import prisma from '@/lib/prisma'

export async function POST(request: any) {
  try {
    const session = await verifyAdminAuth(request)
    if (session) {
      const userId = session.employeeId || session.id || session.sub
      if (userId) {
        await prisma.authToken.updateMany({
          where: {
            userId: userId,
            type: 'REFRESH_TOKEN',
            usedAt: null
          },
          data: {
            usedAt: new Date()
          }
        })
      }
    }
  } catch (error) {
    console.error('Logout token revocation error:', error)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('adminToken')
  response.cookies.delete('adminRefreshToken')
  response.cookies.delete('authToken')
  response.cookies.delete('refreshToken')
  return response
}
