// app/api/admin/analytics/dashboard/route.js
// Analytics Dashboard API with RBAC

import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import AnalyticsService from '@/lib/admin/modules/analytics/services/analytics.service'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'

export async function GET(request) {
  try {
    const user = await verifyAdmin(request, 'admin')
    if (!await hasPermission(user.id, 'analytics:read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const report = searchParams.get('report') || 'overview'

    let data
    switch (report) {
      case 'sales':
        const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const endDate = searchParams.get('endDate') || new Date()
        data = await AnalyticsService.getSalesAnalytics(startDate, endDate)
        break
      case 'customers':
        data = await AnalyticsService.getCustomerAnalytics()
        break
      case 'products':
        data = await AnalyticsService.getProductAnalytics()
        break
      case 'rfqs':
        data = await AnalyticsService.getRFQAnalytics()
        break
      case 'activity':
        data = await AnalyticsService.getUserActivityAnalytics()
        break
      default:
        data = await AnalyticsService.getDashboardOverview()
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
