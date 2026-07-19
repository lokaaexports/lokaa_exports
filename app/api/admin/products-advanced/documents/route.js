import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/admin/middleware/auth'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'

function normalizeDocumentBody(body) {
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

export async function GET(req) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission(session.user.id, 'products:view')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

    const data = await prisma.productDocument.findMany({ where: { productId }, orderBy: { displayOrder: 'asc' } })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission(session.user.id, 'products:edit')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const doc = await prisma.productDocument.create({ data: normalizeDocumentBody(body) })
    return NextResponse.json({ success: true, data: doc }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission(session.user.id, 'products:edit')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Document ID required' }, { status: 400 })

    const body = await req.json()
    const doc = await prisma.productDocument.update({
      where: { id },
      data: normalizeDocumentBody(body),
    })
    return NextResponse.json({ success: true, data: doc })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission(session.user.id, 'products:delete')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Document ID required' }, { status: 400 })

    const doc = await prisma.productDocument.delete({ where: { id } })
    return NextResponse.json({ success: true, data: doc })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
