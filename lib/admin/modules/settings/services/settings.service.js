// lib/admin/modules/settings/services/settings.service.js
// System Settings Service

import prisma from '@/lib/prisma'

export class SettingsService {
  // Get all settings
  static async getAllSettings() {
    return await prisma.systemSetting.findMany()
  }

  // Get setting by key
  static async getSettingByKey(key) {
    return await prisma.systemSetting.findUnique({
      where: { key }
    })
  }

  // Update setting
  static async updateSetting(key, value, updatedByUserId) {
    let setting = await prisma.systemSetting.findUnique({
      where: { key }
    })

    if (setting) {
      setting = await prisma.systemSetting.update({
        where: { key },
        data: { value }
      })
    } else {
      setting = await prisma.systemSetting.create({
        data: { key, value }
      })
    }

    return setting
  }

  // Get email settings
  static async getEmailSettings() {
    const [smtpHost, smtpPort, smtpUser, smtpFrom, smtpEnabled] = await Promise.all([
      this.getSettingByKey('SMTP_HOST'),
      this.getSettingByKey('SMTP_PORT'),
      this.getSettingByKey('SMTP_USER'),
      this.getSettingByKey('SMTP_FROM'),
      this.getSettingByKey('SMTP_ENABLED')
    ])

    return {
      smtpHost: smtpHost?.value,
      smtpPort: smtpPort?.value,
      smtpUser: smtpUser?.value,
      smtpFrom: smtpFrom?.value,
      enabled: smtpEnabled?.value === 'true'
    }
  }

  // Update email settings
  static async updateEmailSettings(data, updatedByUserId) {
    const { smtpHost, smtpPort, smtpUser, smtpFrom, enabled } = data

    await Promise.all([
      this.updateSetting('SMTP_HOST', smtpHost, updatedByUserId),
      this.updateSetting('SMTP_PORT', smtpPort, updatedByUserId),
      this.updateSetting('SMTP_USER', smtpUser, updatedByUserId),
      this.updateSetting('SMTP_FROM', smtpFrom, updatedByUserId),
      this.updateSetting('SMTP_ENABLED', enabled ? 'true' : 'false', updatedByUserId)
    ])

    return this.getEmailSettings()
  }

  // Get payment settings
  static async getPaymentSettings() {
    const [paymentGateway, apiKey, enabled] = await Promise.all([
      this.getSettingByKey('PAYMENT_GATEWAY'),
      this.getSettingByKey('PAYMENT_API_KEY'),
      this.getSettingByKey('PAYMENT_ENABLED')
    ])

    return {
      gateway: paymentGateway?.value,
      apiKey: apiKey?.value,
      enabled: enabled?.value === 'true'
    }
  }

  // Get notification settings
  static async getNotificationSettings() {
    const [emailNotifications, smsNotifications, slackNotifications] = await Promise.all([
      this.getSettingByKey('EMAIL_NOTIFICATIONS'),
      this.getSettingByKey('SMS_NOTIFICATIONS'),
      this.getSettingByKey('SLACK_NOTIFICATIONS')
    ])

    return {
      email: emailNotifications?.value === 'true',
      sms: smsNotifications?.value === 'true',
      slack: slackNotifications?.value === 'true'
    }
  }

  // Update notification settings
  static async updateNotificationSettings(data, updatedByUserId) {
    const { email, sms, slack } = data

    await Promise.all([
      this.updateSetting('EMAIL_NOTIFICATIONS', email ? 'true' : 'false', updatedByUserId),
      this.updateSetting('SMS_NOTIFICATIONS', sms ? 'true' : 'false', updatedByUserId),
      this.updateSetting('SLACK_NOTIFICATIONS', slack ? 'true' : 'false', updatedByUserId)
    ])

    return this.getNotificationSettings()
  }

  // Get security settings
  static async getSecuritySettings() {
    const [passwordExpiry, sessionTimeout, twoFactorEnabled] = await Promise.all([
      this.getSettingByKey('PASSWORD_EXPIRY_DAYS'),
      this.getSettingByKey('SESSION_TIMEOUT_MINUTES'),
      this.getSettingByKey('TWO_FACTOR_ENABLED')
    ])

    return {
      passwordExpiryDays: parseInt(passwordExpiry?.value || '90'),
      sessionTimeoutMinutes: parseInt(sessionTimeout?.value || '30'),
      twoFactorEnabled: twoFactorEnabled?.value === 'true'
    }
  }

  // Update security settings
  static async updateSecuritySettings(data, updatedByUserId) {
    const { passwordExpiryDays, sessionTimeoutMinutes, twoFactorEnabled } = data

    await Promise.all([
      this.updateSetting('PASSWORD_EXPIRY_DAYS', passwordExpiryDays.toString(), updatedByUserId),
      this.updateSetting('SESSION_TIMEOUT_MINUTES', sessionTimeoutMinutes.toString(), updatedByUserId),
      this.updateSetting('TWO_FACTOR_ENABLED', twoFactorEnabled ? 'true' : 'false', updatedByUserId)
    ])

    return this.getSecuritySettings()
  }
}

export default SettingsService
