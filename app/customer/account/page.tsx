'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Building,
  CheckCircle2,
  Globe,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Save,
  Shield,
  User,
  Phone,
} from 'lucide-react'

function SectionBadge({ children }: any) {
  return <div className="inline-flex items-center rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gold">{children}</div>
}

function SettingRow({ title, description, action }: any) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-navy">{title}</p>
        <p className="mt-1 text-sm text-graphite/65">{description}</p>
      </div>
      <div>{action}</div>
    </div>
  )
}

export default function CustomerAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profile, setProfile] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

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
        setFormData(data.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/customer-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to save profile')

      setProfile(data.data)
      setEditMode(false)
      setSuccess('Profile updated successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      setSaving(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      setSaving(false)
      return
    }

    try {
      const response = await fetch('/api/auth/customer-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to change password')

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccess('Password changed successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/customer-logout', { method: 'POST' })
      router.push('/')
    } catch (err: any) {
      console.error('Logout failed:', err)
    }
  }

  const profileCompletion = useMemo(() => {
    if (!profile) return 0
    const filled = ['fullName', 'companyName', 'phone', 'country', 'address', 'website'].filter((key) => Boolean(profile[key])).length
    return Math.round((filled / 6) * 100)
  }, [profile])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(26,71,42,0.08),_transparent_28%),linear-gradient(180deg,_#f8faf7_0%,_#ffffff_100%)]">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-[radial-gradient(circle_at_top,_rgba(26,71,42,0.08),_transparent_28%),linear-gradient(180deg,_#f8faf7_0%,_#ffffff_100%)]">
        <Card className="w-full max-w-md border border-navy/10 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || 'Unable to load profile. Please login again.'}</AlertDescription>
            </Alert>
            <Button className="mt-4 w-full bg-navy text-white hover:bg-navy-deep" onClick={() => router.push('/auth/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(26,71,42,0.08),_transparent_28%),linear-gradient(180deg,_#f8faf7_0%,_#ffffff_45%,_#f6f5ef_100%)]">
      <nav className="border-b border-navy/10 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-graphite/70 transition hover:text-navy">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="text-center sm:text-left">
              <SectionBadge>Buyer account</SectionBadge>
              <h1 className="mt-2 font-display text-3xl text-navy">Account Settings</h1>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 rounded-full border-navy/10 bg-white">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border border-navy/10 bg-navy-deep text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <SectionBadge>Profile overview</SectionBadge>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                  {profileCompletion}% complete
                </span>
              </div>
              <h2 className="mt-5 font-display text-3xl leading-tight sm:text-4xl">Manage your company profile, password, and notification settings in one place.</h2>
              <p className="mt-4 max-w-2xl text-white/75">
                Keep your buyer profile current so RFQ responses and quotation follow-ups stay accurate.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">Verified</p>
                  <p className="mt-2 font-semibold text-white">Email active</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">Security</p>
                  <p className="mt-2 font-semibold text-white">Password controls</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">Notifications</p>
                  <p className="mt-2 font-semibold text-white">RFQ alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-navy/10 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <CardHeader className="border-b border-navy/5 bg-white/70">
              <CardTitle className="text-lg text-navy">Profile completion</CardTitle>
              <CardDescription>Complete your company details for faster responses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="h-3 overflow-hidden rounded-full bg-ivory">
                <div className="h-full rounded-full bg-gradient-to-r from-gold to-emerald-500" style={{ width: `${profileCompletion}%` }} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-navy/10 bg-ivory p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-graphite/45">Company</p>
                  <p className="mt-2 font-semibold text-navy">{profile.companyName || 'Not specified'}</p>
                </div>
                <div className="rounded-2xl border border-navy/10 bg-ivory p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-graphite/45">Country</p>
                  <p className="mt-2 font-semibold text-navy">{profile.country || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-6 border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-navy/10">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'password', label: 'Password', icon: Lock },
            { key: 'security', label: 'Security', icon: Shield },
            { key: 'notifications', label: 'Notifications', icon: Bell },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === key ? 'border-navy text-navy' : 'border-transparent text-graphite/60 hover:text-navy'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <Card className="mt-6 border border-navy/10 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <CardHeader className="border-b border-navy/5 bg-white/70">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-2xl text-navy">Profile Information</CardTitle>
                  <CardDescription>Manage your account details and company identity.</CardDescription>
                </div>
                <Button
                  variant={editMode ? 'outline' : 'default'}
                  className={editMode ? 'rounded-full' : 'rounded-full bg-navy text-white hover:bg-navy-deep'}
                  onClick={() => {
                    if (editMode) {
                      handleSaveProfile()
                    } else {
                      setEditMode(true)
                      setError('')
                    }
                  }}
                  disabled={saving}
                >
                  {editMode ? (
                    saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {editMode ? (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={formData.fullName || ''} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" value={formData.email || ''} disabled className="bg-ivory" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" value={formData.companyName || ''} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={formData.country || ''} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" value={formData.website || ''} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street address" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                      <Input id="gstNumber" value={formData.gstNumber || ''} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleSaveProfile} disabled={saving} className="rounded-full bg-navy text-white hover:bg-navy-deep">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => { setEditMode(false); setFormData(profile) }} className="rounded-full border-navy/10">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { icon: User, label: 'Full Name', value: profile.fullName },
                    { icon: Mail, label: 'Email Address', value: profile.email },
                    { icon: Building, label: 'Company Name', value: profile.companyName },
                    { icon: Phone, label: 'Phone Number', value: profile.phone || 'Not provided' },
                    { icon: MapPin, label: 'Country', value: profile.country || 'Not specified' },
                    { icon: Globe, label: 'Website', value: profile.website || 'Not provided' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 rounded-2xl border border-navy/10 bg-ivory p-4">
                      <Icon className="mt-1 h-5 w-5 text-gold" />
                      <div>
                        <p className="text-sm text-graphite/60">{label}</p>
                        <p className="font-semibold text-navy break-words">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'password' && (
          <Card className="mt-6 border border-navy/10 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <CardHeader className="border-b border-navy/5 bg-white/70">
              <CardTitle className="flex items-center gap-2 text-2xl text-navy">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Keep your account secure with a fresh password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {[
                { id: 'currentPassword', label: 'Current Password', value: passwordData.currentPassword },
                { id: 'newPassword', label: 'New Password', value: passwordData.newPassword },
                { id: 'confirmPassword', label: 'Confirm Password', value: passwordData.confirmPassword },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input
                    id={field.id}
                    type="password"
                    value={field.value}
                    onChange={(e) => setPasswordData({ ...passwordData, [field.id]: e.target.value })}
                  />
                </div>
              ))}
              <Button onClick={handleChangePassword} disabled={saving} className="rounded-full bg-navy text-white hover:bg-navy-deep">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card className="mt-6 border border-navy/10 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <CardHeader className="border-b border-navy/5 bg-white/70">
              <CardTitle className="flex items-center gap-2 text-2xl text-navy">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage login trust and account protection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <SettingRow
                title="Email verification"
                description="Your email is verified and secure."
                action={<span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Verified</span>}
              />
              <SettingRow
                title="Login sessions"
                description="1 active session on this device."
                action={<Button variant="outline" size="sm" className="rounded-full border-navy/10">View all</Button>}
              />
              <SettingRow
                title="Two-factor authentication"
                description="Add an extra layer of security when it becomes available."
                action={<Button variant="outline" size="sm" className="rounded-full border-navy/10" disabled>Coming soon</Button>}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card className="mt-6 border border-navy/10 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <CardHeader className="border-b border-navy/5 bg-white/70">
              <CardTitle className="flex items-center gap-2 text-2xl text-navy">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to receive buyer updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {[
                ['quote-updates', 'Quote Updates', 'Receive notifications when quotes are sent', true],
                ['rfq-updates', 'RFQ Status Updates', 'Get updates on your RFQ status', true],
                ['marketing', 'Marketing Emails', 'Receive updates about new products and offers', false],
              ].map(([id, title, description, checked]) => (
                <div key={String(id)} className="flex items-start gap-4 rounded-2xl border border-navy/10 bg-ivory p-4">
                  <input type="checkbox" id={String(id)} className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#1a472a]" defaultChecked={Boolean(checked)} />
                  <label htmlFor={String(id)} className="flex-1 cursor-pointer">
                    <p className="font-semibold text-navy">{title}</p>
                    <p className="text-sm text-graphite/65">{description}</p>
                  </label>
                </div>
              ))}
              <Button className="rounded-full bg-navy text-white hover:bg-navy-deep">Save Preferences</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
