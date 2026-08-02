'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, Shield, Mail, Bell, Database } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const EMAIL_DEFAULTS = {
  smtpHost: '',
  smtpPort: '',
  smtpUser: '',
  smtpFrom: '',
  enabled: false,
}

const NOTIFICATION_DEFAULTS = {
  email: true,
  sms: false,
  slack: false,
}

const SECURITY_DEFAULTS = {
  passwordExpiryDays: 90,
  sessionTimeoutMinutes: 30,
  twoFactorEnabled: false,
}

export default function SystemPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [emailSettings, setEmailSettings] = useState(EMAIL_DEFAULTS)
  const [notificationSettings, setNotificationSettings] = useState(NOTIFICATION_DEFAULTS)
  const [securitySettings, setSecuritySettings] = useState(SECURITY_DEFAULTS)
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  const load = async () => {
    setLoading(true)
    try {
      const [emailResponse, notificationResponse, securityResponse, auditResponse] = await Promise.all([
        fetch('/api/admin/settings?category=email'),
        fetch('/api/admin/settings?category=notifications'),
        fetch('/api/admin/settings?category=security'),
        fetch('/api/admin/super-admin/company?action=audit-logs&limit=10'),
      ])
      const [emailPayload, notificationPayload, securityPayload, auditPayload] = await Promise.all([
        emailResponse.json(),
        notificationResponse.json(),
        securityResponse.json(),
        auditResponse.json().catch(() => ({})),
      ])

      if (emailResponse.ok) setEmailSettings(emailPayload.data || EMAIL_DEFAULTS)
      if (notificationResponse.ok) setNotificationSettings(notificationPayload.data || NOTIFICATION_DEFAULTS)
      if (securityResponse.ok) setSecuritySettings(securityPayload.data || SECURITY_DEFAULTS)
      if (auditResponse.ok) setAuditLogs(auditPayload.data || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const saveCategory = async (category, data) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, ...data }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to save settings')
      toast.success(`${category} settings saved`)
      await load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SectionPage
        subtitle="System"
        title="Configuration center"
        description="Manage operational settings for email, notifications, and security directly from MySQL-backed configuration records."
        links={[{ href: '/admin/platform', label: 'Back to Platform' }]}
        stats={[
          { label: 'Email', value: emailSettings.enabled ? 'Enabled' : 'Disabled' },
          { label: 'Notifications', value: notificationSettings.email ? 'On' : 'Off' },
          { label: 'Security', value: securitySettings.twoFactorEnabled ? '2FA On' : '2FA Off' },
          { label: 'Logs', value: auditLogs.length },
        ]}
        highlights={[
          { title: 'Email transport', description: 'SMTP host, port, sender, and enable flag.' },
          { title: 'Notification routing', description: 'Email, SMS, and Slack toggles.' },
          { title: 'Security policy', description: 'Password expiry, session timeout, and 2FA.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Email settings</h2>
            </div>
            <div className="mt-4 space-y-3">
              <input value={emailSettings.smtpHost || ''} onChange={(event) => setEmailSettings({ ...emailSettings, smtpHost: event.target.value })} placeholder="SMTP host" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <input value={emailSettings.smtpPort || ''} onChange={(event) => setEmailSettings({ ...emailSettings, smtpPort: event.target.value })} placeholder="SMTP port" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <input value={emailSettings.smtpUser || ''} onChange={(event) => setEmailSettings({ ...emailSettings, smtpUser: event.target.value })} placeholder="SMTP user" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <input value={emailSettings.smtpFrom || ''} onChange={(event) => setEmailSettings({ ...emailSettings, smtpFrom: event.target.value })} placeholder="From address" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={Boolean(emailSettings.enabled)} onChange={(event) => setEmailSettings({ ...emailSettings, enabled: event.target.checked })} />
                SMTP enabled
              </label>
              <button onClick={() => saveCategory('email', emailSettings)} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save email
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notification settings</h2>
            </div>
            <div className="mt-4 space-y-3">
              {['email', 'sms', 'slack'].map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={Boolean(notificationSettings[key])} onChange={(event) => setNotificationSettings({ ...notificationSettings, [key]: event.target.checked })} />
                  {key.toUpperCase()} notifications
                </label>
              ))}
              <button onClick={() => saveCategory('notifications', notificationSettings)} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save notifications
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security settings</h2>
            </div>
            <div className="mt-4 space-y-3">
              <input type="number" value={securitySettings.passwordExpiryDays ?? 90} onChange={(event) => setSecuritySettings({ ...securitySettings, passwordExpiryDays: Number(event.target.value) })} placeholder="Password expiry days" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <input type="number" value={securitySettings.sessionTimeoutMinutes ?? 30} onChange={(event) => setSecuritySettings({ ...securitySettings, sessionTimeoutMinutes: Number(event.target.value) })} placeholder="Session timeout minutes" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={Boolean(securitySettings.twoFactorEnabled)} onChange={(event) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: event.target.checked })} />
                Require 2FA
              </label>
              <button onClick={() => saveCategory('security', securitySettings)} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save security
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent audit logs</h2>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading settings...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700">No audit logs returned for this account.</div>
          ) : (
            <div className="mt-4 grid gap-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{log.action}</p>
                      <p className="text-xs text-slate-500">{log.entity} {log.entityId ? `• ${log.entityId}` : ''}</p>
                    </div>
                    <p className="text-xs text-slate-500">{log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
