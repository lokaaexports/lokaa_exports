// app/api/admin/catalog/template-fields/route.js
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
    const templateId = searchParams.get('templateId')

    if (!templateId) {
      return NextResponse.json({ success: false, error: 'templateId required' }, { status: 400 })
    }

    const template = await TemplateService.getTemplateById(templateId)
    return NextResponse.json(template)
  } catch (error: any) {
    console.error('GET /template-fields error:', error)
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
    const result = await TemplateService.addTemplateField(body.templateId, body)
    if (result.success) {
      await logAudit({ userId: (session.user?.id || session.employeeId || session.id), action: 'product_template_field_created', entity: 'productTemplateField', entityId: result.data.id, changes: body, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }

    return NextResponse.json(result, {
      status: result.success ? 201 : 400
    })
  } catch (error: any) {
    console.error('POST /template-fields error:', error)
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
    const fieldId = searchParams.get('id')
    const action = searchParams.get('action')

    if (action === 'reorder') {
      const body = await req.json()
      const result = await TemplateService.reorderTemplateFields(body.templateId, body.fields)
      return NextResponse.json(result, {
        status: result.success ? 200 : 400
      })
    }

    if (!fieldId) {
      return NextResponse.json({ success: false, error: 'Field ID required' }, { status: 400 })
    }

    const body = await req.json()
    const result = await TemplateService.updateTemplateField(fieldId, body)
    if (result.success) {
      await logAudit({ userId: (session.user?.id || session.employeeId || session.id), action: 'product_template_field_updated', entity: 'productTemplateField', entityId: fieldId, changes: body, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('PUT /template-fields error:', error)
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
    const fieldId = searchParams.get('id')

    if (!fieldId) {
      return NextResponse.json({ success: false, error: 'Field ID required' }, { status: 400 })
    }

    const result = await TemplateService.deleteTemplateField(fieldId)
    if (result.success) {
      await logAudit({ userId: (session.user?.id || session.employeeId || session.id), action: 'product_template_field_deleted', entity: 'productTemplateField', entityId: fieldId, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('DELETE /template-fields error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
