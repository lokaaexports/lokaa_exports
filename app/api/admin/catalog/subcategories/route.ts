// app/api/admin/catalog/subcategories/route.js
import { NextResponse } from 'next/server'
import { CategoryService } from '@/lib/admin/modules/catalog/services/category.service'
import { verifyAdminAuth } from '@/lib/admin/middleware/auth'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'
import { logAudit } from '@/lib/admin/services/audit.service'

export async function GET(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission((session.user?.id || session.employeeId || session.id), 'products:view')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')
    const subcategoryId = searchParams.get('id')

    if (subcategoryId) {
      const result = await CategoryService.getSubcategoryById(subcategoryId)
      return NextResponse.json(result)
    }

    if (categoryId) {
      const result = await CategoryService.getSubcategoriesByCategory(categoryId)
      return NextResponse.json({ success: true, data: result })
    }

    return NextResponse.json({ success: false, error: 'categoryId required' }, { status: 400 })
  } catch (error: any) {
    console.error('GET /subcategories error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission((session.user?.id || session.employeeId || session.id), 'products:manage_categories')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const result = await CategoryService.createSubcategory(body)
    if (result.success) {
      await logAudit({ userId: (session.user?.id || session.employeeId || session.id), action: 'product_subcategory_created', entity: 'productSubcategory', entityId: result.data.id, changes: body, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }

    return NextResponse.json(result, {
      status: result.success ? 201 : 400
    })
  } catch (error: any) {
    console.error('POST /subcategories error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission((session.user?.id || session.employeeId || session.id), 'products:manage_categories')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const subcategoryId = searchParams.get('id')

    if (!subcategoryId) {
      return NextResponse.json({ success: false, error: 'Subcategory ID required' }, { status: 400 })
    }

    const body = await req.json()
    const result = await CategoryService.updateSubcategory(subcategoryId, body)
    if (result.success) {
      await logAudit({ userId: (session.user?.id || session.employeeId || session.id), action: 'product_subcategory_updated', entity: 'productSubcategory', entityId: subcategoryId, changes: body, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('PUT /subcategories error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission((session.user?.id || session.employeeId || session.id), 'products:manage_categories')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const subcategoryId = searchParams.get('id')

    if (!subcategoryId) {
      return NextResponse.json({ success: false, error: 'Subcategory ID required' }, { status: 400 })
    }

    const result = await CategoryService.deleteSubcategory(subcategoryId)
    if (result.success) {
      await logAudit({ userId: (session.user?.id || session.employeeId || session.id), action: 'product_subcategory_deleted', entity: 'productSubcategory', entityId: subcategoryId, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('DELETE /subcategories error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
