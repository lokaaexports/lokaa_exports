'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  Loader2,
  LogOut,
  Plus,
  Sparkles,
  ShieldCheck,
  User,
  Activity,
  Package,
} from 'lucide-react'
import AuthShell from '@/components/site/auth-shell'

function StatCard({ label, value, hint, icon: Icon, tone = 'navy' }) {
  const toneClass =
    tone === 'gold'
      ? 'text-gold bg-gold/10'
      : tone === 'emerald'
        ? 'text-emerald-700 bg-emerald-50'
        : 'text-navy bg-navy/5'

  return (
    <Card className="border border-navy/10 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-graphite/45">{label}</p>
            <p className="mt-2 font-display text-3xl text-navy">{value}</p>
            {hint ? <p className="mt-2 text-sm text-graphite/65">{hint}</p> : null}
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusPill({ status }) {
  const style =
    status === 'quoted'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'new' || status === 'pending'
        ? 'bg-gold/10 text-gold border-gold/20'
        : status === 'rejected'
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${style}`}>
      {status || 'draft'}
    </span>
  )
}

function TimelineItem({ title, detail, time, icon: Icon, tone = 'navy' }) {
  const accent =
    tone === 'gold' ? 'bg-gold text-navy' : tone === 'emerald' ? 'bg-emerald-500 text-white' : 'bg-navy text-white'

  return (
    <div className="flex gap-4 rounded-2xl border border-navy/10 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4">
          <p className="font-semibold text-navy">{title}</p>
          <span className="text-xs uppercase tracking-[0.2em] text-graphite/45">{time}</span>
        </div>
        <p className="mt-1 text-sm text-graphite/70">{detail}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [rfqs, setRfqs] = useState([])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/customer-profile')
        const data = await response.json()
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login')
            return
          }
          throw new Error(data.error || 'Failed to load profile')
        }
        setProfile(data.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router])

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        const response = await fetch('/api/rfqs?customer=true')
        const data = await response.json()
        if (response.ok) setRfqs(data.data || [])
      } catch (err) {
        console.error('Failed to load RFQs:', err)
      }
    }
    if (profile) fetchRFQs()
  }, [profile])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/customer-logout', { method: 'POST' })
      router.push('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const stats = useMemo(() => {
    const pending = rfqs.filter((r) => r.status === 'new' || r.status === 'pending').length
    const quoted = rfqs.filter((r) => r.status === 'quoted').length
    const closed = rfqs.filter((r) => r.status === 'rejected' || r.status === 'converted').length
    return { pending, quoted, closed }
  }, [rfqs])

  const profileCompletion = profile?.fullName && profile?.companyName ? 90 : 70
  const recentRfqs = rfqs.slice(0, 4)

  if (loading) {
    return (
      <AuthShell eyebrow="Customer portal" title="Loading workspace" description="Preparing your RFQ and account overview...">
        <Card className="border border-navy/10 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-navy" />
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  if (!profile) {
    return (
      <AuthShell eyebrow="Customer portal" title="Access required" description="Please sign in again to view your dashboard.">
        <Card className="border border-navy/10 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error || 'Unable to load profile. Please login again.'}</AlertDescription>
            </Alert>
            <Button className="mt-4 w-full bg-navy text-white hover:bg-navy-deep" onClick={() => router.push('/auth/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(26,71,42,0.08),_transparent_30%),linear-gradient(180deg,_#f8faf7_0%,_#ffffff_48%,_#f6f5ef_100%)]">
      <div className="sticky top-0 z-30 border-b border-navy/10 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-white shadow-lg shadow-navy/20">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-gold">Lokaa customer portal</div>
              <div className="mt-1 font-display text-2xl text-navy">Welcome, {profile.fullName || 'Customer'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 rounded-full border-navy/10 bg-white">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 rounded-full border-navy/10 bg-white">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <section className="relative overflow-hidden rounded-[2rem] border border-navy/10 bg-navy-deep p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/80">
                <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                Verified buyer account
              </div>
              <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
                Your export workspace, organized for faster buying.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/75">
                Track RFQs, compare quotations, review recent activity, and keep your company profile ready for repeat sourcing.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/rfq">
                  <Button className="rounded-full bg-gold text-navy hover:bg-[hsl(var(--gold-soft))]">
                    <Plus className="mr-2 h-4 w-4" />
                    New RFQ
                  </Button>
                </Link>
                <Link href="/customer/account">
                  <Button variant="outline" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10">
                    <User className="mr-2 h-4 w-4" />
                    Profile settings
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Profile completion</p>
                  <p className="mt-2 font-display text-3xl text-white">{profileCompletion}%</p>
                </div>
                <Sparkles className="h-10 w-10 text-gold" />
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-gold to-emerald-400" style={{ width: `${profileCompletion}%` }} />
              </div>
              <p className="mt-3 text-sm text-white/70">Complete company and contact details to improve response quality.</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="RFQs" value={rfqs.length} hint="Total enquiries in your account" icon={FileText} tone="navy" />
          <StatCard label="Pending quotes" value={stats.pending} hint="Awaiting commercial response" icon={Clock} tone="gold" />
          <StatCard label="Quoted" value={stats.quoted} hint="Ready for review and follow-up" icon={CheckCircle2} tone="emerald" />
          <StatCard label="Closed" value={stats.closed} hint="Completed or declined" icon={Bell} tone="navy" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border border-navy/10 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="border-b border-navy/5 bg-white/70">
              <CardTitle className="text-lg text-navy">Account summary</CardTitle>
              <CardDescription>Buyer profile and commercial overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-navy/10 bg-ivory p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-graphite/45">Company</p>
                  <p className="mt-2 font-semibold text-navy">{profile.companyName || 'Not specified'}</p>
                </div>
                <div className="rounded-2xl border border-navy/10 bg-ivory p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-graphite/45">Email</p>
                  <p className="mt-2 font-semibold text-navy break-words">{profile.email}</p>
                </div>
                <div className="rounded-2xl border border-navy/10 bg-ivory p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-graphite/45">Country</p>
                  <p className="mt-2 font-semibold text-navy">{profile.country || 'Not specified'}</p>
                </div>
                <div className="rounded-2xl border border-navy/10 bg-ivory p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-graphite/45">Status</p>
                  <div className="mt-2"><StatusPill status="quoted" /></div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                    <ShieldCheck className="h-4 w-4" />
                    Buyer verified
                  </div>
                  <p className="mt-2 text-sm text-emerald-700/80">Profile ready for RFQ follow-up.</p>
                </div>
                <div className="rounded-2xl border border-gold/20 bg-gold/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gold">
                    <Activity className="h-4 w-4" />
                    Recent activity
                  </div>
                  <p className="mt-2 text-sm text-graphite/70">Track quotes and inquiries in one place.</p>
                </div>
                <div className="rounded-2xl border border-navy/10 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-navy">
                    <Package className="h-4 w-4 text-gold" />
                    Quick access
                  </div>
                  <p className="mt-2 text-sm text-graphite/70">Create a new RFQ in seconds.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-navy/10 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="border-b border-navy/5 bg-white/70">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg text-navy">Recent activity</CardTitle>
                  <CardDescription>Latest RFQs and commercial updates</CardDescription>
                </div>
                <Link href="/rfq" className="text-sm font-medium text-gold hover:text-navy">
                  Start RFQ
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
              {recentRfqs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-navy/15 bg-ivory p-8 text-center">
                  <FileText className="mx-auto h-10 w-10 text-gold" />
                  <p className="mt-3 font-semibold text-navy">No RFQs yet</p>
                  <p className="mt-2 text-sm text-graphite/70">Create your first request to start tracking quotes and order progress.</p>
                  <Link href="/rfq" className="mt-4 inline-flex">
                    <Button className="rounded-full bg-navy text-white hover:bg-navy-deep">
                      <Plus className="mr-2 h-4 w-4" />
                      Create RFQ
                    </Button>
                  </Link>
                </div>
              ) : (
                recentRfqs.map((rfq) => (
                  <div key={rfq.id} className={`rounded-2xl border p-4 ${rfq.status === 'quoted' ? 'border-emerald-200 bg-emerald-50/60' : 'border-navy/10 bg-white'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-navy">{rfq.rfqNumber || rfq.reference || 'RFQ'}</div>
                        <div className="mt-1 text-sm text-graphite/70">{rfq.product || rfq.productInterest || 'Product'}</div>
                      </div>
                      <StatusPill status={rfq.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm text-graphite/70">
                      <span>Quantity: {rfq.quantity || 'N/A'}</span>
                      <Link href="/rfq" className="inline-flex items-center gap-1 font-medium text-navy hover:text-gold">
                        View <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border border-navy/10 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="border-b border-navy/5 bg-white/70">
              <CardTitle className="text-lg text-navy">Quick actions</CardTitle>
              <CardDescription>Common tasks for active buyers</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-5 sm:grid-cols-2">
              <Link href="/rfq" className="rounded-2xl border border-navy/10 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy">Request a quote</p>
                    <p className="mt-1 text-sm text-graphite/65">Send product details and quantities.</p>
                  </div>
                  <Plus className="h-5 w-5 text-gold" />
                </div>
              </Link>
              <Link href="/customer/account" className="rounded-2xl border border-navy/10 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy">Update profile</p>
                    <p className="mt-1 text-sm text-graphite/65">Keep company details current.</p>
                  </div>
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-navy/10 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="border-b border-navy/5 bg-white/70">
              <CardTitle className="text-lg text-navy">Activity timeline</CardTitle>
              <CardDescription>High-level journey across buying activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
              <TimelineItem
                title="Profile verified"
                detail="Buyer account is ready for sourcing conversations."
                time="Today"
                icon={ShieldCheck}
                tone="emerald"
              />
              <TimelineItem
                title="RFQ follow-up"
                detail="Monitor incoming quotations and supplier replies."
                time="Recent"
                icon={Bell}
                tone="gold"
              />
              <TimelineItem
                title="Repeat order ready"
                detail="Reuse company details for faster future requests."
                time="Always on"
                icon={Clock}
                tone="navy"
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
