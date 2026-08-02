// app/api/admin/super-admin/admins/route.js
// Super Admin User Management API

import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import AdminService from '@/lib/admin/modules/super-admin/services/admin.service'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'
import { safeParseInt, sanitizeSearch, whitelistStatus } from '@/lib/sanitize'

export async function GET(request: any) {
  try {
    const user = await verifyAdmin(request, 'super_admin')
    if (!await hasPermission(user.id, 'super_admin:view_admins')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = safeParseInt(searchParams.get('limit'), 50, 1, 200)
    const offset = safeParseInt(searchParams.get('offset'), 0, 0, 10000)
    const search = sanitizeSearch(searchParams.get('search'))
    const status = searchParams.get('status')
    const role = searchParams.get('role')

    const result = await AdminService.getAllAdmins({ search, status, role }, limit, offset)
    return NextResponse.json({ success: true, data: result.data, pagination: result.pagination })
  } catch (error: any) {
    console.error('[Admin GET Error]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: any) {
  try {
    const user = await verifyAdmin(request, 'super_admin')
    if (!await hasPermission(user.id, 'super_admin:create_admin')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const admin = await AdminService.createAdmin(body, user.id)
    return NextResponse.json({ success: true, data: admin }, { status: 201 })
  } catch (error: any) {
    console.error('[Admin POST Error]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: any) {
  try {
    const user = await verifyAdmin(request, 'super_admin')
    if (!await hasPermission(user.id, 'super_admin:update_admin')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...data } = body
    const admin = await AdminService.updateAdmin(id, data, user.id)
    return NextResponse.json({ success: true, data: admin })
  } catch (error: any) {
    console.error('[Admin PUT Error]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: any) {
  try {
    const user = await verifyAdmin(request, 'super_admin')
    if (!await hasPermission(user.id, 'super_admin:delete_admin')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    await AdminService.deleteAdmin(id, user.id)
    return NextResponse.json({ success: true, message: 'Admin deleted' })
  } catch (error: any) {
    console.error('[Admin DELETE Error]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
