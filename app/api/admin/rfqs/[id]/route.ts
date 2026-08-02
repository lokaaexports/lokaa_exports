import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin/middleware/auth.middleware'
import { rfqService } from '@/lib/services'

export async function PATCH(request: any, { params }: any) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const { id } = params
    const body = await request.json()
    const updated = await rfqService.updateById(id, body)
    return NextResponse.json({ ok: true, rfq: updated })
  } catch (error: any) {
    console.error('RFQ update failed', error)
    return NextResponse.json({ success: false, error: 'Unable to update RFQ' }, { status: 500 })
  }
}

export async function GET(request: any, { params }: any) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.success) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const { id } = params
    
    // Use prisma directly here or a service method to get detailed RFQ
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        quotations: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    if (!rfq) {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, rfq })
  } catch (error: any) {
    console.error('Failed to get RFQ', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
