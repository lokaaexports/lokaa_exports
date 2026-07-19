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
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react'
import AuthShell from '@/components/site/auth-shell'

function VerifyEmailContent() {
  const router = useRouter()
  const email = ''

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleVerifyOTP = async (e) => {
    e.preventDefault(); setError(''); setSuccess(false)
    if (!otp || otp.length !== 6) return setError('Please enter a valid 6-digit OTP')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Verification failed')
      setSuccess(true); setOtp('')
      setTimeout(() => router.push('/auth/login?verified=true'), 2000)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const handleResendOTP = async () => {
    setError(''); setResendMessage(''); setResending(true)
    try {
      const response = await fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, action: 'resend' }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to resend OTP')
      setResendMessage('OTP sent to your email')
    } catch (err) { setError(err.message) } finally { setResending(false) }
  }

  return (
    <AuthShell eyebrow="Verify email" title="Confirm your inbox" description={`Enter the 6-digit OTP sent to ${email || 'your email'}.`}>
      <Card className="border border-navy/10 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
        <CardHeader className="space-y-2 border-b border-navy/5 bg-white/60">
          <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-gold" /><CardTitle className="text-2xl">Verify your email</CardTitle></div>
          <CardDescription>Enter the OTP sent to {email || 'your inbox'}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert className="mb-4 border-green-200 bg-green-50"><CheckCircle2 className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">Email verified. Redirecting to login.</AlertDescription></Alert>}
          {resendMessage && <Alert className="mb-4 border-blue-200 bg-blue-50"><CheckCircle2 className="h-4 w-4 text-blue-600" /><AlertDescription className="text-blue-800">{resendMessage}</AlertDescription></Alert>}
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input id="otp" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength="6" className="text-center text-2xl tracking-widest" />
              <p className="text-xs text-slate-500">Enter the 6-digit OTP sent to your email</p>
            </div>
            <Button type="submit" className="w-full bg-navy text-white hover:bg-navy-deep" disabled={loading || otp.length !== 6}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify Email'}</Button>
          </form>
          <div className="mt-4 space-y-2 text-center text-sm">
            <p className="text-slate-600">Didn't receive the OTP?</p>
            <Button variant="outline" className="w-full" onClick={handleResendOTP} disabled={resending}>{resending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Resend OTP'}</Button>
          </div>
          <div className="mt-4 text-center text-sm"><Link href="/auth/register" className="text-navy hover:text-gold">Back to registration</Link></div>
        </CardContent>
      </Card>
    </AuthShell>
  )
}

export default function VerifyEmailPage() {
  return <VerifyEmailContent />
}
