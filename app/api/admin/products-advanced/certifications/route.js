// app/api/admin/products-advanced/certifications/route.js
import { NextResponse } from 'next/server'
import { CertificationService } from '@/lib/admin/modules/products-advanced/services/product-features.service'
import { verifyAdminAuth } from '@/lib/admin/middleware/auth'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'

export async function GET(req) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission(session.user.id, 'products:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 })
    }

    const certs = await CertificationService.getProductCertifications(productId)
    return NextResponse.json({ success: true, data: certs })
  } catch (error) {
    console.error('GET /certifications error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission(session.user.id, 'products:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const result = await CertificationService.addCertification(body.productId, body)

    return NextResponse.json(result, {
      status: result.success ? 201 : 400
    })
  } catch (error) {
    console.error('POST /certifications error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission(session.user.id, 'products:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const certId = searchParams.get('id')

    if (!certId) {
      return NextResponse.json({ error: 'Certification ID required' }, { status: 400 })
    }

    const body = await req.json()
    const result = await CertificationService.updateCertification(certId, body)

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error) {
    console.error('PUT /certifications error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission(session.user.id, 'products:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const certId = searchParams.get('id')

    if (!certId) {
      return NextResponse.json({ error: 'Certification ID required' }, { status: 400 })
    }

    const result = await CertificationService.deleteCertification(certId)

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error) {
    console.error('DELETE /certifications error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
