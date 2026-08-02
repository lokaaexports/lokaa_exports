// app/api/admin/catalog/rfq-enquiries/route.js
import { NextResponse } from 'next/server'
import { RFQEnquiryService } from '@/lib/admin/modules/catalog/services/product-features.service'
import { verifyAdminAuth } from '@/lib/admin/middleware/auth'

export async function GET(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const status = searchParams.get('status')
    const country = searchParams.get('country')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = parseInt(searchParams.get('skip') || '0')
    const enquiryId = searchParams.get('id')

    // Get single enquiry by ID
    if (enquiryId) {
      const enquiry = await RFQEnquiryService.getEnquiryById(enquiryId)
      if (!enquiry) {
        return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: enquiry })
    }

    // Get all enquiries (with optional filters)
    const enquiries = await RFQEnquiryService.getAllEnquiries({
      productId,
      status,
      country,
      priority,
      search,
      limit,
      skip
    })

    return NextResponse.json({ success: true, data: enquiries })
  } catch (error: any) {
    console.error('GET /rfq-enquiries error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: any) {
  try {
    const body = await req.json()
    const { searchParams } = new URL(req.url)
    const isAdminUpdate = searchParams.has('adminUpdate')

    // Check if admin is updating status
    if (isAdminUpdate) {
      const session = await verifyAdminAuth(req)
      if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

      const enquiryId = searchParams.get('enquiryId')
      const result = await RFQEnquiryService.updateEnquiryStatus(enquiryId, body.status)

      return NextResponse.json(result, {
        status: result.success ? 200 : 400
      })
    }

    // Public POST: Create new enquiry (no auth required for form submissions)
    const result = await RFQEnquiryService.createEnquiry(body)

    return NextResponse.json(result, {
      status: result.success ? 201 : 400
    })
  } catch (error: any) {
    console.error('POST /rfq-enquiries error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: any) {
  try {
    const session = await verifyAdminAuth(req)
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const enquiryId = searchParams.get('id')

    if (!enquiryId) {
      return NextResponse.json({ success: false, error: 'Enquiry ID required' }, { status: 400 })
    }

    const body = await req.json()
    const result = await RFQEnquiryService.updateEnquiry(enquiryId, body)

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    })
  } catch (error: any) {
    console.error('PUT /rfq-enquiries error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
