// app/api/admin/products-advanced/products/route.js
import { NextRequest, NextResponse } from 'next/server'
import ProductService from '@/lib/admin/modules/products-advanced/services/product.service'
import { verifyAdminAuth } from '@/lib/admin/middleware/auth'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'
import { logAudit } from '@/lib/admin/services/audit.service'

export async function GET(req) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission(session.user.id, 'products:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('id')
    const action = searchParams.get('action')

    if (productId) {
      const product = await ProductService.getProductById(productId)
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: product })
    }

    // Handle action-based endpoints
    if (action === 'stats') {
      const stats = await ProductService.getProductStats()
      return NextResponse.json(stats)
    }

    if (action === 'search') {
      const query = searchParams.get('q')
      const limit = parseInt(searchParams.get('limit')) || 20
      const products = await ProductService.searchProducts(query, limit)
      return NextResponse.json({ success: true, data: products })
    }

    // List products with filters
    const filters = {
      categoryId: searchParams.get('categoryId'),
      subcategoryId: searchParams.get('subcategoryId'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
    }
    
    const pagination = {
      limit: parseInt(searchParams.get('limit')) || 50,
      offset: parseInt(searchParams.get('offset')) || 0,
    }

    const result = await ProductService.getAllProducts(filters, pagination)
    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /products error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await hasPermission(session.user.id, 'products:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    // Handle bulk operations
    if (action === 'bulk-update-status') {
      const body = await req.json()
      const result = await ProductService.bulkUpdateStatus(body.productIds, body.status)
      return NextResponse.json(result.success 
        ? { success: true, data: { updated: result.updated } }
        : { success: false, error: result.error },
        { status: result.success ? 200 : 400 }
      )
    }

    if (action === 'bulk-delete') {
      const body = await req.json()
      const result = await ProductService.bulkDelete(body.productIds)
      return NextResponse.json(result.success
        ? { success: true, data: { deleted: result.deleted } }
        : { success: false, error: result.error },
        { status: result.success ? 200 : 400 }
      )
    }

    // Create product
    const body = await req.json()
    const result = await ProductService.createProduct(body)
    if (result.success) {
      await logAudit({ userId: session.user.id, action: 'product_created', entity: 'product', entityId: result.data.id, changes: body, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }
    
    return NextResponse.json(result, {
      status: result.success ? 201 : 400
    })
  } catch (error) {
    console.error('POST /products error:', error)
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
    const productId = searchParams.get('id')
    const action = searchParams.get('action')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const body = await req.json()

    // Handle publish action
    if (action === 'publish') {
      const result = await ProductService.publishProduct(productId)
      if (result.success) {
        await logAudit({ userId: session.user.id, action: 'product_published', entity: 'product', entityId: productId, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
      }
      return NextResponse.json(result, {
        status: result.success ? 200 : 400
      })
    }

    // Update product
    const result = await ProductService.updateProduct(productId, body)
    if (result.success) {
      await logAudit({ userId: session.user.id, action: 'product_updated', entity: 'product', entityId: productId, changes: body, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }
    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error) {
    console.error('PUT /products error:', error)
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
    const productId = searchParams.get('id')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const result = await ProductService.deleteProduct(productId)
    if (result.success) {
      await logAudit({ userId: session.user.id, action: 'product_deleted', entity: 'product', entityId: productId, ipAddress: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') })
    }
    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error) {
    console.error('DELETE /products error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
