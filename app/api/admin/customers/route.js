// app/api/admin/customers/route.js
// Customer Management API with standardized response handling

import { ApiResponse, logAdminRequest } from '@/lib/admin/utils/api-response'
import { requireAdminAuth } from '@/lib/admin/middleware/auth.middleware'
import CustomerService from '@/lib/admin/services/customer.service'

export async function GET(request) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) {
      return ApiResponse.unauthorized()
    }

    logAdminRequest('GET', '/api/admin/customers', auth.user.id, { action: 'list' })

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 1000)
    const offset = parseInt(searchParams.get('offset')) || 0
    const country = searchParams.get('country')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const action = searchParams.get('action')

    // Stats endpoint
    if (action === 'stats') {
      try {
        const stats = await CustomerService.getCustomerStats()
        return ApiResponse.success(stats, 'Customer statistics retrieved')
      } catch (err) {
        console.error('Stats error:', err)
        return ApiResponse.error(err, 500, 'Failed to retrieve statistics')
      }
    }

    // List endpoint
    const filters = { country, status, search }
    const pagination = { limit, offset }
    const result = await CustomerService.getAllCustomers(filters, pagination)

    return ApiResponse.paginated(
      result.data,
      result.total,
      Math.floor(offset / limit) + 1,
      limit,
      `Retrieved ${result.data.length} customers`
    )
  } catch (error) {
    console.error('Customers GET error:', error)
    return ApiResponse.error(error, 500, 'Failed to retrieve customers')
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) {
      return ApiResponse.unauthorized()
    }

    const body = await request.json()
    logAdminRequest('POST', '/api/admin/customers', auth.user.id, { action: 'create' })

    // Validate required fields
    if (!body.companyName?.trim()) {
      return ApiResponse.badRequest('Company name is required')
    }
    if (!body.email?.trim()) {
      return ApiResponse.badRequest('Email is required')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return ApiResponse.badRequest('Invalid email format')
    }

    const customer = await CustomerService.createCustomer(body, auth.user.id)
    return ApiResponse.success(customer, 'Customer created successfully', 201)
  } catch (error) {
    console.error('Create customer error:', error)
    return ApiResponse.error(error, 500, 'Failed to create customer')
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
      return ApiResponse.badRequest('Customer ID is required')
    }

    logAdminRequest('PUT', `/api/admin/customers/${id}`, auth.user.id, { action: 'update' })

    // Validate email if provided
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return ApiResponse.badRequest('Invalid email format')
    }

    const customer = await CustomerService.updateCustomer(id, data, auth.user.id)
    if (!customer) {
      return ApiResponse.notFound('Customer not found')
    }

    return ApiResponse.success(customer, 'Customer updated successfully')
  } catch (error) {
    console.error('Update customer error:', error)
    return ApiResponse.error(error, 500, 'Failed to update customer')
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
      return ApiResponse.badRequest('Customer ID is required')
    }

    logAdminRequest('DELETE', `/api/admin/customers/${id}`, auth.user.id, { action: 'delete' })

    await CustomerService.deleteCustomer(id)
    return ApiResponse.success({ id }, 'Customer deleted successfully')
  } catch (error) {
    console.error('Delete customer error:', error)
    return ApiResponse.error(error, 500, 'Failed to delete customer')
  }
}
