// app/api/admin/orders/route.js
// Order Management API with standardized response handling

import { ApiResponse, logAdminRequest } from '@/lib/admin/utils/api-response'
import { requireAdminAuth } from '@/lib/admin/middleware/auth.middleware'
import OrderService from '@/lib/admin/modules/orders/services/order.service'
import { safeParseInt, sanitizeSearch, whitelistStatus, orderStatusWhitelist } from '@/lib/sanitize'

export async function GET(request: any) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) {
      return ApiResponse.unauthorized()
    }

    logAdminRequest('GET', '/api/admin/orders', auth.user.id, { action: 'list' })

    const { searchParams } = new URL(request.url)
    const limit = safeParseInt(searchParams.get('limit'), 50, 1, 200)
    const offset = safeParseInt(searchParams.get('offset'), 0, 0, 10000)
    const search = sanitizeSearch(searchParams.get('search'))
    const status = whitelistStatus(searchParams.get('status'), orderStatusWhitelist)
    const customerId = searchParams.get('customerId')
    const action = searchParams.get('action')

    // Stats endpoint
    if (action === 'stats') {
      try {
        const stats = await OrderService.getOrderStats()
        return ApiResponse.success(stats, 'Order statistics retrieved')
      } catch (err) {
        console.error('Stats error:', err)
        return ApiResponse.error(err, 500, 'Failed to retrieve statistics')
      }
    }

    // List endpoint
    const result = await OrderService.getAllOrders(
      { search, status, customerId },
      { limit, offset }
    )

    return ApiResponse.paginated(
      result.data,
      result.pagination.total,
      Math.floor(offset / limit) + 1,
      limit,
      `Retrieved ${result.data.length} orders`
    )
  } catch (error: any) {
    console.error('Orders GET error:', error)
    return ApiResponse.error(error, 500, 'Failed to retrieve orders')
  }
}

export async function POST(request: any) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) {
      return ApiResponse.unauthorized()
    }

    const body = await request.json()
    logAdminRequest('POST', '/api/admin/orders', auth.user.id, { action: 'create' })

    // Validate required fields
    const required = ['customerId', 'total']
    const missing = required.filter(field => !body[field])
    if (missing.length > 0) {
      return ApiResponse.badRequest(`Missing required fields: ${missing.join(', ')}`)
    }

    const order = await OrderService.createOrder(body, auth.user.id)
    return ApiResponse.success(order, 'Order created successfully', 201)
  } catch (error: any) {
    console.error('Orders POST error:', error)
    return ApiResponse.error(error, 500, 'Failed to create order')
  }
}

export async function PUT(request: any) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) {
      return ApiResponse.unauthorized()
    }

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return ApiResponse.badRequest('Order ID is required')
    }

    logAdminRequest('PUT', `/api/admin/orders/${id}`, auth.user.id, { action: 'update' })

    const order = await OrderService.updateOrder(id, data)
    if (!order) {
      return ApiResponse.notFound('Order not found')
    }

    return ApiResponse.success(order, 'Order updated successfully')
  } catch (error: any) {
    console.error('Orders PUT error:', error)
    return ApiResponse.error(error, 500, 'Failed to update order')
  }
}

export async function DELETE(request: any) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) {
      return ApiResponse.unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return ApiResponse.badRequest('Order ID is required')
    }

    logAdminRequest('DELETE', `/api/admin/orders/${id}`, auth.user.id, { action: 'delete' })

    await OrderService.deleteOrder(id)
    return ApiResponse.success({ id }, 'Order deleted successfully')
  } catch (error: any) {
    console.error('Orders DELETE error:', error)
    return ApiResponse.error(error, 500, 'Failed to delete order')
  }
}
