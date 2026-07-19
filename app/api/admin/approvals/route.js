import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import { createApprovalRequest, listApprovals, updateApprovalStatus } from '@/lib/platform/approval'

export async function GET(request) {
  try {
    await verifyAdmin(request)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const domainName = searchParams.get('domainName') || undefined
    const limit = Number(searchParams.get('limit') || 100)
    const offset = Number(searchParams.get('offset') || 0)

    const approvals = await listApprovals({ status, domainName, limit, offset })
    return NextResponse.json({ success: true, ...approvals })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to load approvals' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await verifyAdmin(request)
    const payload = await request.json()
    const approval = await createApprovalRequest(payload)
    return NextResponse.json({ success: true, approval })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to create approval' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    await verifyAdmin(request)
    const payload = await request.json()
    if (!payload.id || !payload.status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
    }
    const approval = await updateApprovalStatus(payload.id, payload.status, payload.notes || '')
    return NextResponse.json({ success: true, approval })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to update approval' }, { status: 500 })
  }
}
