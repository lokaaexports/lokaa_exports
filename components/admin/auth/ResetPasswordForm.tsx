'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const canSubmit = useMemo(() => Boolean(token && email && password && confirmPassword), [token, email, password, confirmPassword])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to reset password')
        return
      }
      setDone(true)
      setTimeout(() => router.push('/admin/login'), 1500)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>
      <div className="relative z-10 w-full max-w-md mx-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          <Link href="/admin/login" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
          <div className="flex justify-center mb-8">
            <div className="relative w-16 h-16">
              <Image src="/logo.png" alt="Lokaa" fill className="object-contain" />
            </div>
          </div>
          {done ? (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-20 w-20 text-green-400" />
              <h1 className="text-3xl font-bold text-white mb-2">Password reset</h1>
              <p className="text-gray-300 text-sm">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Create new password</h1>
                <p className="text-gray-300 text-sm">Set a new password for {email || 'your account'}</p>
              </div>
              {error && <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">New password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
                </div>
              </div>
              <button type="submit" disabled={loading || !canSubmit} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Resetting...</> : 'Reset password'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
