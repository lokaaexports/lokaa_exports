import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import { listAuditLogs } from '@/lib/admin/services/audit.service'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'
import { safeParseInt } from '@/lib/sanitize'

export async function GET(request: any) {
  try {
    const user = await verifyAdmin(request)
    if (!await hasPermission(user.id, 'audit:view')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const { searchParams } = new URL(request.url)
    // Increased cap from 250 → 1000; page-based pagination supported via offset
    const limit = safeParseInt(searchParams.get('limit'), 100, 1, 1000)
    const offset = safeParseInt(searchParams.get('offset'), 0, 0, 100000)
    const result = await listAuditLogs({
      userId: searchParams.get('userId'),
      action: searchParams.get('action'),
      entity: searchParams.get('entity'),
      entityId: searchParams.get('recordId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    }, { limit, offset })

    return NextResponse.json({ success: true, data: result.data, pagination: result.pagination })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    console.error('Audit log read failed', error)
    return NextResponse.json({ success: false, error: 'Unable to load audit logs' }, { status: 500 })
  }
}
