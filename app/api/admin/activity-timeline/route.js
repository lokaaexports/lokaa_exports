import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import { listActivityTimeline } from '@/lib/platform/activity'

export async function GET(request) {
  try {
    const user = await verifyAdmin(request)
    const { searchParams } = new URL(request.url)
    const entity = searchParams.get('entity') || undefined
    const limit = Number(searchParams.get('limit') || 100)
    const offset = Number(searchParams.get('offset') || 0)

    const timeline = await listActivityTimeline({ userId: user.sub, entity, limit, offset })

    return NextResponse.json({ success: true, ...timeline })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to load activity timeline' }, { status: 500 })
  }
}
