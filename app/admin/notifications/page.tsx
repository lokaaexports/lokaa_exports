'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({ total: 0, unread: 0 })

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/notifications')
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load notifications')
      setNotifications(payload.items || [])
      setSummary(payload.summary || { total: 0, unread: 0 })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const markAllRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to update notifications')
      toast.success('All notifications marked read')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const markRead = async (id) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to update notification')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionPage
          subtitle="Notifications"
          title="Notification Center"
          description="Central bell inbox for RFQ events, assignments, OTPs, order milestones, shipments, and server alerts."
          links={[
            { href: '/admin/search', label: 'Global Search' },
            { href: '/admin/approvals', label: 'Approvals' },
          ]}
          stats={[
            { label: 'Total', value: summary.total || 0 },
            { label: 'Unread', value: summary.unread || 0 },
          ]}
          highlights={[
            { title: 'RFQ received', description: 'Push RFQ events into the bell center.' },
            { title: 'Task due', description: 'Surface due work before it slips.' },
            { title: 'Server error', description: 'Capture operational failures in one place.' },
          ]}
        />

        <div className="flex justify-end">
          <button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>

        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${notification.read ? 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950' : 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-500/5'}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-emerald-600" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">{notification.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{notification.message}</p>
                  <p className="text-xs text-slate-500">{notification.type}</p>
                </div>
                {!notification.read && (
                  <button onClick={() => markRead(notification.id)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-200">
                    Mark read
                  </button>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  )
}
