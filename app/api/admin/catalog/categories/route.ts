// app/api/admin/catalog/categories/route.js
import { NextRequest, NextResponse } from 'next/server'
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
    const categoryId = searchParams.get('id')

    if (categoryId) {
      // Get single category
      const result = await CategoryService.getCategoryById(categoryId)
      return NextResponse.json(result)
    }

    // Get all categories
    const categories = await CategoryService.getAllCategories()
    return NextResponse.json({ success: true, data: categories })
  } catch (error: any) {
    console.error('GET /categories error:', error)
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
    const result = await CategoryService.createCategory(body)
    if (result.success) {
      await logAudit({ userId: (session.user?.id || session.employeeId || session.id), action: 'product_category_created', entity: 'productCategory', entityId: result.data.id, changes: body, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }

    return NextResponse.json(result, {
      status: result.success ? 201 : 400
    })
  } catch (error: any) {
    console.error('POST /categories error:', error)
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
    const categoryId = searchParams.get('id')

    if (!categoryId) {
      return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 })
    }

    const body = await req.json()
    const result = await CategoryService.updateCategory(categoryId, body)
    if (result.success) {
      await logAudit({ userId: (session.user?.id || session.employeeId || session.id), action: 'product_category_updated', entity: 'productCategory', entityId: categoryId, changes: body, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('PUT /categories error:', error)
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
    const categoryId = searchParams.get('id')

    if (!categoryId) {
      return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 })
    }

    const result = await CategoryService.deleteCategory(categoryId)
    if (result.success) {
      await logAudit({ userId: (session.user?.id || session.employeeId || session.id), action: 'product_category_deleted', entity: 'productCategory', entityId: categoryId, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('DELETE /categories error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
