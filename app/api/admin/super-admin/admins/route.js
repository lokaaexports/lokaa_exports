// app/api/admin/super-admin/admins/route.js
// Super Admin User Management API

import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import AdminService from '@/lib/admin/modules/super-admin/services/admin.service'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'

export async function GET(request) {
  try {
    const user = await verifyAdmin(request, 'super_admin')
    if (!await hasPermission(user.id, 'super_admin:view_admins')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const role = searchParams.get('role')

    const result = await AdminService.getAllAdmins({ search, status, role }, limit, offset)
    return NextResponse.json({ success: true, data: result.data, pagination: result.pagination })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await verifyAdmin(request, 'super_admin')
    if (!await hasPermission(user.id, 'super_admin:create_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const admin = await AdminService.createAdmin(body, user.id)
    return NextResponse.json({ success: true, data: admin }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await verifyAdmin(request, 'super_admin')
    if (!await hasPermission(user.id, 'super_admin:update_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...data } = body
    const admin = await AdminService.updateAdmin(id, data, user.id)
    return NextResponse.json({ success: true, data: admin })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const user = await verifyAdmin(request, 'super_admin')
    if (!await hasPermission(user.id, 'super_admin:delete_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    await AdminService.deleteAdmin(id, user.id)
    return NextResponse.json({ success: true, message: 'Admin deleted' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
