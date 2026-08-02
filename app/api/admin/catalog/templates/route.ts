// app/api/admin/catalog/templates/route.js
import { NextResponse } from 'next/server'
import { TemplateService } from '@/lib/admin/modules/catalog/services/template.service'
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
    const templateId = searchParams.get('id')
    const categoryId = searchParams.get('categoryId')
    const subcategoryId = searchParams.get('subcategoryId')

    if (templateId) {
      const result = await TemplateService.getTemplateById(templateId)
      return NextResponse.json(result)
    }

    if (categoryId) {
      const templates = await TemplateService.getTemplatesByCategory(categoryId)
      return NextResponse.json({ success: true, data: templates })
    }

    if (subcategoryId) {
      const templates = await TemplateService.getTemplatesBySubcategory(subcategoryId)
      return NextResponse.json({ success: true, data: templates })
    }

    const allTemplates = await TemplateService.getAllTemplates()
    return NextResponse.json({ success: true, data: allTemplates })
  } catch (error: any) {
    console.error('GET /templates error:', error)
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
    const result = await TemplateService.createTemplate(body)
    if (result.success) {
      await logAudit({ userId: (session.user?.id || session.employeeId || session.id), action: 'product_template_created', entity: 'productTemplate', entityId: result.data.id, changes: body, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }

    return NextResponse.json(result, {
      status: result.success ? 201 : 400
    })
  } catch (error: any) {
    console.error('POST /templates error:', error)
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
    const templateId = searchParams.get('id')

    if (!templateId) {
      return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 })
    }

    const body = await req.json()
    const result = await TemplateService.updateTemplate(templateId, body)
    if (result.success) {
      await logAudit({ userId: (session.user?.id || session.employeeId || session.id), action: 'product_template_updated', entity: 'productTemplate', entityId: templateId, changes: body, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('PUT /templates error:', error)
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
    const templateId = searchParams.get('id')

    if (!templateId) {
      return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 })
    }

    const result = await TemplateService.deleteTemplate(templateId)
    if (result.success) {
      await logAudit({ userId: (session.user?.id || session.employeeId || session.id), action: 'product_template_deleted', entity: 'productTemplate', entityId: templateId, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('DELETE /templates error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
