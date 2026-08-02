// app/api/admin/crm/customers/route.js
// Customer Management API with RBAC

import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import { CustomerService } from '@/lib/admin/modules/crm/services/crm.service'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'

export async function GET(request: any) {
  try {
    const user = await verifyAdmin(request, 'admin')
    if (!await hasPermission(user.id, 'crm:read_customers')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const country = searchParams.get('country')
    const action = searchParams.get('action')

    if (action === 'stats') {
      const stats = await CustomerService.getCustomerStats()
      return NextResponse.json({ success: true, data: stats })
    }

    const result = await CustomerService.getAllCustomers(
      { search, status, country },
      { limit, offset }
    )
    return NextResponse.json({ success: true, data: result.data, pagination: result.pagination })
  } catch (error: any) {
    console.error('Customers GET error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: any) {
  try {
    const user = await verifyAdmin(request, 'admin')
    if (!await hasPermission(user.id, 'crm:create_customers')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const customer = await CustomerService.createCustomer(body, user.id)
    return NextResponse.json({ success: true, data: customer }, { status: 201 })
  } catch (error: any) {
    console.error('Customers POST error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: any) {
  try {
    const user = await verifyAdmin(request, 'admin')
    if (!await hasPermission(user.id, 'crm:update_customers')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...data } = body
    const customer = await CustomerService.updateCustomer(id, data)
    return NextResponse.json({ success: true, data: customer })
  } catch (error: any) {
    console.error('Customers PUT error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: any) {
  try {
    const user = await verifyAdmin(request, 'admin')
    if (!await hasPermission(user.id, 'crm:delete_customers')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    await CustomerService.deleteCustomer(id)
    return NextResponse.json({ success: true, message: 'Customer deleted' })
  } catch (error: any) {
    console.error('Customers DELETE error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
