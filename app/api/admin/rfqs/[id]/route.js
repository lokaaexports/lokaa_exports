import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import { rfqService } from '@/lib/services'

export async function PATCH(request, { params }) {
  try {
    await verifyAdmin(request)
    const { id } = params
    const body = await request.json()
    const updated = await rfqService.updateById(id, body)
    return NextResponse.json({ ok: true, rfq: updated })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('RFQ update failed', error)
    return NextResponse.json({ error: 'Unable to update RFQ' }, { status: 500 })
  }
}
