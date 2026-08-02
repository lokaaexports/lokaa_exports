// app/api/admin/super-admin/company/route.js
// Company Configuration API

import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import CompanyConfigService from '@/lib/admin/modules/super-admin/services/company.service'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'

export async function GET(request: any) {
  try {
    const user = await verifyAdmin(request, 'admin')
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'stats') {
      const stats = await CompanyConfigService.getCompanyStats()
      return NextResponse.json({ success: true, data: stats })
    }

    if (action === 'audit-logs') {
      const limit = parseInt(searchParams.get('limit')) || 50
      const offset = parseInt(searchParams.get('offset')) || 0
      const logs = await CompanyConfigService.getAuditLogs({}, limit, offset)
      return NextResponse.json({ success: true, data: logs.data, pagination: logs.pagination })
    }

    if (action === 'system-status') {
      const status = await CompanyConfigService.getSystemStatus()
      return NextResponse.json({ success: true, data: status })
    }

    const settings = await CompanyConfigService.getCompanySettings()
    return NextResponse.json({ success: true, data: settings })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: any) {
  try {
    const user = await verifyAdmin(request, 'super_admin')
    if (!await hasPermission(user.id, 'super_admin:manage_company')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const settings = await CompanyConfigService.updateCompanySettings(1, body, user.id)
    return NextResponse.json({ success: true, data: settings })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
