import { getCustomerProfile, updateCustomerProfile } from '@/lib/customer-auth-service'
import { verifyToken } from '@/lib/auth-service'
import { cookies } from 'next/headers'

// Helper to get customer from auth token
async function getAuthenticatedCustomer(request: any) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    throw new Error('Unauthorized')
  }

  try {
    const decoded = verifyToken(token)
    if (decoded.type !== 'customer') {
      throw new Error('Not a customer session')
    }
    return decoded
  } catch (error: any) {
    throw new Error('Invalid token')
  }
}

// GET /api/auth/customer-profile
export async function GET(request: any) {
  try {
    const customer = await getAuthenticatedCustomer(request)
    const profile = await getCustomerProfile(customer.id)

    return new Response(
      JSON.stringify({
        success: true,
        data: profile,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// PUT /api/auth/customer-profile
export async function PUT(request: any) {
  try {
    const customer = await getAuthenticatedCustomer(request)
    const data = await request.json()

    const result = await updateCustomerProfile(customer.id, data)

    const updatedProfile = await getCustomerProfile(customer.id)

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedProfile,
        message: result.message,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
