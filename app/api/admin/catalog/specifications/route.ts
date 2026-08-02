// app/api/admin/catalog/specifications/route.js
import { NextResponse } from 'next/server'
import { SpecificationService } from '@/lib/admin/modules/catalog/services/product-features.service'
import { verifyAdminAuth } from '@/lib/admin/middleware/auth'

export async function GET(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ success: false, error: 'productId required' }, { status: 400 })
    }

    const specs = await SpecificationService.getProductSpecifications(productId)
    return NextResponse.json({ success: true, data: specs })
  } catch (error: any) {
    console.error('GET /specifications error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const result = await SpecificationService.addSpecification(body.productId, body)

    return NextResponse.json(result, {
      status: result.success ? 201 : 400
    })
  } catch (error: any) {
    console.error('POST /specifications error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const specId = searchParams.get('id')

    if (!specId) {
      return NextResponse.json({ success: false, error: 'Specification ID required' }, { status: 400 })
    }

    const body = await req.json()
    const result = await SpecificationService.updateSpecification(specId, body)

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('PUT /specifications error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const specId = searchParams.get('id')

    if (!specId) {
      return NextResponse.json({ success: false, error: 'Specification ID required' }, { status: 400 })
    }

    const result = await SpecificationService.deleteSpecification(specId)

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('DELETE /specifications error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
