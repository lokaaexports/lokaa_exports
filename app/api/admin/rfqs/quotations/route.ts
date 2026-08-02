import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin/middleware/auth.middleware'
import { RFQService, QuotationService } from '@/lib/admin/modules/rfqs/services/rfq.service'

export async function GET(request: any) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const rfqId = searchParams.get('rfqId')

    if (!rfqId) {
      return NextResponse.json({ success: false, error: 'rfqId is required' }, { status: 400 })
    }

    const quotations = await QuotationService.getRFQQuotations(rfqId)
    return NextResponse.json({ success: true, data: quotations })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to load quotations' }, { status: 500 })
  }
}

export async function POST(request: any) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const user = auth.user
    const payload = await request.json()
    if (!payload.rfqId) {
      return NextResponse.json({ success: false, error: 'rfqId is required' }, { status: 400 })
    }

    const quotation = await QuotationService.createQuotation(payload, user.sub || user.employeeId || user.id || 'admin')
    return NextResponse.json({ success: true, data: quotation }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to create quotation' }, { status: 500 })
  }
}
