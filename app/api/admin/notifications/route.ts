import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import {
  getNotificationSummary,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/platform/notifications'

export async function GET(request: any) {
  try {
    const user = await verifyAdmin(request)
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = Number(searchParams.get('limit') || 50)
    const offset = Number(searchParams.get('offset') || 0)

    const [items, summary] = await Promise.all([
      listNotifications(user.sub, { unreadOnly, limit, offset }),
      getNotificationSummary(user.sub),
    ])

    return NextResponse.json({ success: true, ...items, summary })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to load notifications' }, { status: 500 })
  }
}

export async function POST(request: any) {
  try {
    const user = await verifyAdmin(request)
    const payload = await request.json()

    if (payload.action === 'markAllRead') {
      await markAllNotificationsRead(user.sub)
      return NextResponse.json({ success: true })
    }

    if (!payload.id) {
      return NextResponse.json({ success: false, error: 'Notification id is required' }, { status: 400 })
    }

    await markNotificationRead(payload.id, user.sub)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to update notification' }, { status: 500 })
  }
}
