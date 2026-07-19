// app/api/admin/settings/route.js
// System Settings API with RBAC

import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import SettingsService from '@/lib/admin/modules/settings/services/settings.service'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'

export async function GET(request) {
  try {
    const user = await verifyAdmin(request, 'admin')
    if (!await hasPermission(user.id, 'settings:read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'

    let data
    switch (category) {
      case 'email':
        data = await SettingsService.getEmailSettings()
        break
      case 'payment':
        data = await SettingsService.getPaymentSettings()
        break
      case 'notifications':
        data = await SettingsService.getNotificationSettings()
        break
      case 'security':
        data = await SettingsService.getSecuritySettings()
        break
      default:
        data = await SettingsService.getAllSettings()
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await verifyAdmin(request, 'admin')
    if (!await hasPermission(user.id, 'settings:update')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { category, ...data } = body

    let result
    switch (category) {
      case 'email':
        result = await SettingsService.updateEmailSettings(data, user.id)
        break
      case 'notifications':
        result = await SettingsService.updateNotificationSettings(data, user.id)
        break
      case 'security':
        result = await SettingsService.updateSecuritySettings(data, user.id)
        break
      default:
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
