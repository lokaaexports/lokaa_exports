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
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

function LoginContent() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.email || !formData.password) {
      setError('Email and password required')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, rememberMe }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')
      router.push('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(26,71,42,0.08),_transparent_38%),linear-gradient(180deg,_#f8f6f1_0%,_#ffffff_100%)] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center rounded-full border border-navy/10 bg-white px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-gold shadow-sm">
            Lokaa Exports
          </div>
          <h1 className="mt-4 font-display text-4xl tracking-tight text-navy">Customer login</h1>
          <p className="mt-3 text-sm leading-relaxed text-graphite/70">Access RFQs, quotations, and account settings.</p>
        </div>

        <Card className="border border-navy/10 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <CardHeader className="space-y-2 border-b border-navy/5 bg-white/60">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to continue your sourcing journey</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} required />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={setRememberMe} />
                  <label htmlFor="rememberMe" className="text-sm cursor-pointer">Remember me</label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm text-navy hover:text-gold">Forgot password?</Link>
              </div>
              <Button type="submit" className="w-full bg-navy text-white hover:bg-navy-deep" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</>) : 'Login'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Don't have an account? <Link href="/auth/register" className="text-navy hover:text-gold">Register here</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <LoginContent />
}
