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
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import AuthShell from '@/components/site/auth-shell'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRequestOTP = async (e) => {
    e.preventDefault(); setError(''); setMessage('')
    if (!email) return setError('Email is required')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP')
      setMessage('OTP sent to your email')
      setStep('otp')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault(); setError(''); setMessage('')
    if (!otp || otp.length !== 6) return setError('Please enter a valid 6-digit OTP')
    setStep('reset')
  }

  const handleResetPassword = async (e) => {
    e.preventDefault(); setError(''); setMessage('')
    if (newPassword.length < 8) return setError('Password must be at least 8 characters')
    if (newPassword !== confirmPassword) return setError('Passwords do not match')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp, newPassword, action: 'reset' }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Password reset failed')
      setMessage('Password reset successfully')
      setTimeout(() => router.push('/auth/login'), 2000)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <AuthShell eyebrow="Password help" title="Recover account access" description="Verify your email and set a new password securely.">
      <Card className="border border-navy/10 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
        <CardHeader className="space-y-2 border-b border-navy/5 bg-white/60">
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>{step === 'email' ? 'Enter your email address' : step === 'otp' ? 'Verify with OTP' : 'Set your new password'}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
          {message && <Alert className="mb-4 border-green-200 bg-green-50"><CheckCircle2 className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">{message}</AlertDescription></Alert>}
          {step === 'email' && (<form onSubmit={handleRequestOTP} className="space-y-4"><div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><Button type="submit" className="w-full bg-navy text-white hover:bg-navy-deep" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP...</> : 'Send OTP'}</Button></form>)}
          {step === 'otp' && (<form onSubmit={handleVerifyOTP} className="space-y-4"><div className="space-y-2"><Label htmlFor="otp">Enter OTP</Label><Input id="otp" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength="6" className="text-center text-2xl tracking-widest" /><p className="text-xs text-slate-500">Enter the 6-digit OTP sent to {email}</p></div><Button type="submit" className="w-full bg-navy text-white hover:bg-navy-deep" disabled={otp.length !== 6}>Continue</Button><Button type="button" variant="outline" className="w-full" onClick={() => setStep('email')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></form>)}
          {step === 'reset' && (<form onSubmit={handleResetPassword} className="space-y-4"><div className="space-y-2"><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /><p className="text-xs text-slate-500">Minimum 8 characters</p></div><div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div><Button type="submit" className="w-full bg-navy text-white hover:bg-navy-deep" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</> : 'Reset Password'}</Button></form>)}
          <div className="mt-4 text-center text-sm"><Link href="/auth/login" className="text-navy hover:text-gold">Back to login</Link></div>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
