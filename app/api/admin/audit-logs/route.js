import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import { listAuditLogs } from '@/lib/admin/services/audit.service'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'

export async function GET(request) {
  try {
    const user = await verifyAdmin(request)
    if (!await hasPermission(user.id, 'audit:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit') || 100)
    const offset = Number(searchParams.get('offset') || 0)
    const result = await listAuditLogs({
      userId: searchParams.get('userId'),
      action: searchParams.get('action'),
      entity: searchParams.get('entity'),
      entityId: searchParams.get('recordId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    }, { limit: Math.min(Math.max(limit, 1), 250), offset: Math.max(offset, 0) })

    return NextResponse.json({ success: true, data: result.data, pagination: result.pagination })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Audit log read failed', error)
    return NextResponse.json({ error: 'Unable to load audit logs' }, { status: 500 })
  }
}
