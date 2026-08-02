'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { PhoneInput } from '@/components/auth/phone-input'
import { CountrySelect } from '@/components/auth/country-select'
import AuthShell from '@/components/site/auth-shell'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({ fullName: '', companyName: '', email: '', phone: '', country: '', password: '', confirmPassword: '' })

  const validateForm = () => {
    if (!formData.fullName.trim()) return setError('Full name is required'), false
    if (!formData.companyName.trim()) return setError('Company name is required'), false
    if (!formData.email.includes('@')) return setError('Valid email is required'), false
    if (formData.password.length < 8) return setError('Password must be at least 8 characters'), false
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match'), false
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (!validateForm()) return
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Registration failed')
      setSuccess(true)
      setTimeout(() => router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Create account"
      title="Request buyer access"
      description="Register once to manage RFQs, quotes, and account details."
      footer={<span className="text-graphite/70">Already have an account? <Link href="/auth/login" className="text-navy hover:text-gold">Login here</Link></span>}
    >
      <Card className="border border-navy/10 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
        <CardHeader className="space-y-2 border-b border-navy/5 bg-white/60">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Register as a customer to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert className="mb-4 border-green-200 bg-green-50"><CheckCircle2 className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">Registration successful. Redirecting to verification.</AlertDescription></Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))} required /></div>
            <div className="space-y-2"><Label htmlFor="companyName">Company Name</Label><Input id="companyName" name="companyName" placeholder="Acme Corporation" value={formData.companyName} onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))} required /></div>
            <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required /></div>
            <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><PhoneInput value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} country={formData.country} /></div>
            <div className="space-y-2"><Label htmlFor="country">Country</Label><CountrySelect value={formData.country} onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} required /><p className="text-xs text-slate-500">Minimum 8 characters</p></div>
            <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))} required /></div>
            <Button type="submit" className="w-full bg-navy text-white hover:bg-navy-deep" disabled={loading}>{loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registering...</>) : 'Create Account'}</Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
