// app/api/admin/catalog/export-info/route.js
import { NextResponse } from 'next/server'
import { ExportInfoService } from '@/lib/admin/modules/catalog/services/product-features.service'
import { verifyAdminAuth } from '@/lib/admin/middleware/auth'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'

export async function GET(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission((session.user?.id || session.employeeId || session.id), 'products:view')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ success: false, error: 'productId required' }, { status: 400 })
    }

    const info = await ExportInfoService.getExportInfo(productId)
    return NextResponse.json({ success: true, data: info })
  } catch (error: any) {
    console.error('GET /export-info error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission((session.user?.id || session.employeeId || session.id), 'products:edit')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const result = await ExportInfoService.updateExportInfo(body.productId, body)

    return NextResponse.json(result, {
      status: result.success ? 201 : 400
    })
  } catch (error: any) {
    console.error('POST /export-info error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission((session.user?.id || session.employeeId || session.id), 'products:edit')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ success: false, error: 'productId required' }, { status: 400 })
    }

    const body = await req.json()
    const result = await ExportInfoService.updateExportInfo(productId, body)

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('PUT /export-info error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
