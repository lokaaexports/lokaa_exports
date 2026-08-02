import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/admin/middleware/auth'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'

function normalizeDocumentBody(body: any) {
  return {
    productId: body.productId,
    title: body.title || body.name || '',
    documentUrl: body.documentUrl || body.url || '',
    documentType: body.documentType || body.type || null,
    description: body.description || null,
    displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : 0,
    isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : false,
  }
}

export async function GET(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission((session.user?.id || session.employeeId || session.id), 'products:view')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    if (!productId) return NextResponse.json({ success: false, error: 'productId required' }, { status: 400 })

    const data = await prisma.productDocument.findMany({ where: { productId }, orderBy: { displayOrder: 'asc' } })
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission((session.user?.id || session.employeeId || session.id), 'products:edit')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const doc = await prisma.productDocument.create({ data: normalizeDocumentBody(body) })
    return NextResponse.json({ success: true, data: doc }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission((session.user?.id || session.employeeId || session.id), 'products:edit')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Document ID required' }, { status: 400 })

    const body = await req.json()
    const doc = await prisma.productDocument.update({
      where: { id },
      data: normalizeDocumentBody(body),
    })
    return NextResponse.json({ success: true, data: doc })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission((session.user?.id || session.employeeId || session.id), 'products:delete')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Document ID required' }, { status: 400 })

    const doc = await prisma.productDocument.delete({ where: { id } })
    return NextResponse.json({ success: true, data: doc })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
