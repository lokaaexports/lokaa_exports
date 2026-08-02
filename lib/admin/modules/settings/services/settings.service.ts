import prisma from '@/lib/prisma'

export class SettingsService {
  // Get all settings (mocked/queried from Company configuration table)
  static async getAllSettings() {
    const company = await prisma.company.findUnique({
      where: { id: 1 }
    })
    if (!company) return []
    return [
      { key: 'timezone', value: company.timezone },
      { key: 'currency', value: company.currency },
      { key: 'language', value: company.language },
      { key: 'dateFormat', value: company.dateFormat },
    ]
  }

  // Get setting by key
  static async getSettingByKey(key: any) {
    const company = await prisma.company.findUnique({
      where: { id: 1 }
    })
    if (!company) return null

    switch (String(key).toLowerCase()) {
      case 'timezone':
        return { key, value: company.timezone }
      case 'currency':
        return { key, value: company.currency }
      case 'language':
        return { key, value: company.language }
      case 'dateformat':
        return { key, value: company.dateFormat }
      default:
        return null
    }
  }

  // Update setting
  static async updateSetting(key: any, value: any, updatedByUserId: any) {
    const updateData: Record<string, any> = {}
    switch (String(key).toLowerCase()) {
      case 'timezone':
        updateData.timezone = value
        break
      case 'currency':
        updateData.currency = value
        break
      case 'language':
        updateData.language = value
        break
      case 'dateformat':
        updateData.dateFormat = value
        break
      default:
        return null
    }

    return await prisma.company.update({
      where: { id: 1 },
      data: updateData
    })
  }

  // Get email settings (statically mock/fallback to env config since no DB table exists)
  static async getEmailSettings() {
    return {
      smtpHost: process.env.SMTP_HOST || 'localhost',
      smtpPort: process.env.SMTP_PORT || '587',
      smtpUser: process.env.SMTP_USER || '',
      smtpFrom: process.env.SMTP_FROM || 'info@lokaaexports.com',
      enabled: true
    }
  }

  // Update email settings (stub/mock update)
  static async updateEmailSettings(data: any, updatedByUserId: any) {
    return { success: true }
  }

  // Get payment settings (stubbed)
  static async getPaymentSettings() {
    return { stripeEnabled: false, paypalEnabled: false }
  }

  // Get notification settings (stubbed)
  static async getNotificationSettings() {
    return { emailAlerts: true, slackAlerts: false }
  }

  // Get security settings (stubbed)
  static async getSecuritySettings() {
    return { mfaEnabled: false, ipWhitelist: [] }
  }

  // Update notification settings (stubbed)
  static async updateNotificationSettings(data: any, updatedByUserId: any) {
    return { success: true }
  }

  // Update security settings (stubbed)
  static async updateSecuritySettings(data: any, updatedByUserId: any) {
    return { success: true }
  }
}

export default SettingsService
