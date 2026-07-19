// app/api/admin/rfqs/route.js
// RFQ Management API with standardized response handling

import { ApiResponse, logAdminRequest } from '@/lib/admin/utils/api-response'
import { requireAdminAuth, requirePermission } from '@/lib/admin/middleware/auth.middleware'
import { RFQService } from '@/lib/admin/modules/rfqs/services/rfq.service'

export async function GET(request) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) {
      return ApiResponse.unauthorized()
    }

    logAdminRequest('GET', '/api/admin/rfqs', auth.user.id, { action: 'list' })

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 1000)
    const offset = parseInt(searchParams.get('offset')) || 0
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const action = searchParams.get('action')

    // Stats endpoint
    if (action === 'stats') {
      try {
        const stats = await RFQService.getRFQStats()
        return ApiResponse.success(stats, 'RFQ statistics retrieved')
      } catch (err) {
        console.error('Stats error:', err)
        return ApiResponse.error(err, 500, 'Failed to retrieve statistics')
      }
    }

    // List endpoint
    const result = await RFQService.getAllRFQs(
      { search, status, priority },
      { limit, offset }
    )

    return ApiResponse.paginated(
      result.data,
      result.total,
      Math.floor(offset / limit) + 1,
      limit,
      `Retrieved ${result.data.length} RFQs`
    )
  } catch (error) {
    console.error('RFQs GET error:', error)
    return ApiResponse.error(error, 500, 'Failed to retrieve RFQs')
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) {
      return ApiResponse.unauthorized()
    }

    const body = await request.json()
    logAdminRequest('POST', '/api/admin/rfqs', auth.user.id, { action: 'create', data: body })

    // Validate required fields
    const required = ['customerId']
    const missing = required.filter(field => !body[field])
    if (missing.length > 0) {
      return ApiResponse.badRequest(`Missing required fields: ${missing.join(', ')}`)
    }

    const rfq = await RFQService.createRFQ(body, auth.user.id)
    return ApiResponse.success(rfq, 'RFQ created successfully', 201)
  } catch (error) {
    console.error('RFQs POST error:', error)
    return ApiResponse.error(error, 500, 'Failed to create RFQ')
  }
}

export async function PUT(request) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) {
      return ApiResponse.unauthorized()
    }

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return ApiResponse.badRequest('RFQ ID is required')
    }

    logAdminRequest('PUT', `/api/admin/rfqs/${id}`, auth.user.id, { action: 'update' })

    const rfq = await RFQService.updateRFQ(id, data)
    if (!rfq) {
      return ApiResponse.notFound('RFQ not found')
    }

    return ApiResponse.success(rfq, 'RFQ updated successfully')
  } catch (error) {
    console.error('RFQs PUT error:', error)
    return ApiResponse.error(error, 500, 'Failed to update RFQ')
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) {
      return ApiResponse.unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return ApiResponse.badRequest('RFQ ID is required')
    }

    logAdminRequest('DELETE', `/api/admin/rfqs/${id}`, auth.user.id, { action: 'delete' })

    await RFQService.deleteRFQ(id)
    return ApiResponse.success({ id }, 'RFQ deleted successfully')
  } catch (error) {
    console.error('RFQs DELETE error:', error)
    return ApiResponse.error(error, 500, 'Failed to delete RFQ')
  }
}
