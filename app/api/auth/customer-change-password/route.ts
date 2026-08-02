import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(req: any) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return Response.json(
        { success: false, error: 'Unauthorized - No auth token' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return Response.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return Response.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return Response.json(
        { success: false, error: 'New password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({
      where: { id: decoded.id },
      select: { id: true, passwordHash: true },
    })

    if (!customer) {
      return Response.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, customer.passwordHash || '')
    if (!isPasswordValid) {
      return Response.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in database
    await prisma.customer.update({
      where: { id: decoded.id },
      data: {
        passwordHash: hashedPassword,
        lastPasswordChange: new Date(),
      },
    })

    console.log('[PASSWORD] Password changed successfully for customer:', decoded.id)

    return Response.json(
      { 
        success: true,
        message: 'Password changed successfully'
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('[PASSWORD] Error changing password:', error)
    return Response.json(
      { success: false, error: error.message || 'Failed to change password' },
      { status: 500 }
    )
  }
}
