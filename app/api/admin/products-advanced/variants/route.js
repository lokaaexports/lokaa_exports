import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/admin/middleware/auth'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'

function normalizeVariantBody(body) {
  return {
    productId: body.productId,
    variantName: body.variantName || body.name || '',
    sku: body.sku || null,
    attributes: body.attributes ?? null,
    price: body.price !== undefined && body.price !== '' ? Number(body.price) : null,
    moq: body.moq !== undefined && body.moq !== '' ? Number(body.moq) : body.stock !== undefined && body.stock !== '' ? Number(body.stock) : null,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : 0,
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

    const data = await prisma.productVariant.findMany({ where: { productId }, orderBy: { displayOrder: 'asc' } })
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
    const row = await prisma.productVariant.create({ data: normalizeVariantBody(body) })
    return NextResponse.json({ success: true, data: row }, { status: 201 })
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
    if (!id) return NextResponse.json({ error: 'Variant ID required' }, { status: 400 })

    const body = await req.json()
    const row = await prisma.productVariant.update({
      where: { id },
      data: normalizeVariantBody(body),
    })
    return NextResponse.json({ success: true, data: row })
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
    if (!id) return NextResponse.json({ error: 'Variant ID required' }, { status: 400 })

    const row = await prisma.productVariant.delete({ where: { id } })
    return NextResponse.json({ success: true, data: row })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
