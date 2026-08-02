// app/api/admin/auth/change-password/route.js
// Admin Change Password API

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { authenticateToken } from '@/lib/admin/auth/middleware'

export async function POST(request: any) {
  const auth = await authenticateToken(request)
  if (!auth.success) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { success: false, error: 'Both current and new password are required' },
      { status: 400 }
    )
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return NextResponse.json(
      { success: false, error: 'New password must be at least 8 characters' },
      { status: 400 }
    )
  }

  if (newPassword.length > 128) {
    return NextResponse.json(
      { success: false, error: 'New password is too long' },
      { status: 400 }
    )
  }

  try {
    const userId = (auth as any).employeeId || (auth as any).user?.id || (auth as any).payload?.sub
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Could not identify user' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Check new password is different
    const isSame = await bcrypt.compare(newPassword, user.password)
    if (isSame) {
      return NextResponse.json(
        { success: false, error: 'New password must be different from the current password' },
        { status: 400 }
      )
    }

    // Hash and update
    const newHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: userId },
      data: { password: newHash },
    })

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error: any) {
    console.error('[CHANGE PASSWORD]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
