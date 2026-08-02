// app/api/admin/catalog/seo/route.js
import { NextResponse } from 'next/server'
import { SEOService } from '@/lib/admin/modules/catalog/services/product-features.service'
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

    const seo = await SEOService.getProductSEO(productId)
    return NextResponse.json({ success: true, data: seo })
  } catch (error: any) {
    console.error('GET /seo error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const result = await SEOService.updateProductSEO(body.productId, body)

    return NextResponse.json(result, {
      status: result.success ? 201 : 400
    })
  } catch (error: any) {
    console.error('POST /seo error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ success: false, error: 'productId required' }, { status: 400 })
    }

    const body = await req.json()
    const result = await SEOService.updateProductSEO(productId, body)

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('PUT /seo error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
