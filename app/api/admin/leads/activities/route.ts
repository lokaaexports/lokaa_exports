import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import LeadActivityService from '@/lib/admin/services/lead-activity.service'

const activityService = new LeadActivityService()

export async function GET(request: any) {
  try {
    await verifyAdmin(request, 'admin')
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'leadId is required' }, { status: 400 })
    }

    if (action === 'stats') {
      const stats = await activityService.getActivityStats(leadId)
      return NextResponse.json({ data: stats })
    }

    const activities = await activityService.getAllActivities(leadId, limit, offset)
    return NextResponse.json({ data: activities })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: any) {
  try {
    await verifyAdmin(request, 'admin')
    const { leadId, activityType, description, createdBy } = await request.json()

    if (!leadId || !activityType || !description) {
      return NextResponse.json(
        { success: false, error: 'leadId, activityType, and description are required' },
        { status: 400 }
      )
    }

    const result = await activityService.logActivity(leadId, activityType, description, createdBy)
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
