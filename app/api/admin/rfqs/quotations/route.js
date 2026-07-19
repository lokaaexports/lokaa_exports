import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import { RFQService, QuotationService } from '@/lib/admin/modules/rfqs/services/rfq.service'

export async function GET(request) {
  try {
    await verifyAdmin(request)
    const { searchParams } = new URL(request.url)
    const rfqId = searchParams.get('rfqId')

    if (!rfqId) {
      return NextResponse.json({ error: 'rfqId is required' }, { status: 400 })
    }

    const quotations = await QuotationService.getRFQQuotations(rfqId)
    return NextResponse.json({ success: true, data: quotations })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to load quotations' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await verifyAdmin(request)
    const payload = await request.json()
    if (!payload.rfqId) {
      return NextResponse.json({ error: 'rfqId is required' }, { status: 400 })
    }

    const quotation = await RFQService.createQuotation(payload, user.sub)
    return NextResponse.json({ success: true, data: quotation }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to create quotation' }, { status: 500 })
  }
}

