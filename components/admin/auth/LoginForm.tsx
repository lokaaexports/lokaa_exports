'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    showPassword: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setServerError('')

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setServerError(data.error || 'Login failed')
        }
        setLoading(false)
        return
      }

      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }

      // Store email in session storage to avoid exposing it in URL history
      sessionStorage.setItem('otpEmail', formData.email)

      // Redirect to verify OTP page
      // Note: Route groups are transparent in URLs, so just use /admin/verify-otp
      router.push(`/admin/verify-otp`)
    } catch (error: any) {
      setServerError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy relative overflow-hidden font-sans">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 -left-40 w-[500px] h-[500px] bg-gold rounded-full mix-blend-multiply filter blur-[100px] opacity-10"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="relative w-16 h-16">
              <Image
                src="/logo.png"
                alt="Lokaa Exports"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl font-bold tracking-tight text-white mb-2">
              Lokaa Admin
            </h1>
            <p className="text-white/60 text-sm">
              Sign in to the enterprise management portal
            </p>
          </motion.div>

          {/* Error message */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm"
            >
              {serverError}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className={`flex items-center w-full bg-white/5 border rounded-xl px-4 py-3 transition focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent ${errors.email ? 'border-red-500' : 'border-white/10'}`}>
                <Mail className="w-5 h-5 text-white/40 shrink-0 mr-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  className="w-full bg-transparent text-white placeholder-white/30 focus:outline-none"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className={`flex items-center w-full bg-white/5 border rounded-xl px-4 py-3 transition focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent ${errors.password ? 'border-red-500' : 'border-white/10'}`}>
                <Lock className="w-5 h-5 text-white/40 shrink-0 mr-3" />
                <input
                  type={formData.showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-white placeholder-white/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  className="text-white/40 hover:text-white/80 transition-colors shrink-0 ml-3"
                >
                  {formData.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </motion.div>

            {/* Remember me & Forgot password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between text-sm"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 shrink-0 rounded border border-white/20 bg-white/5 cursor-pointer accent-gold"
                />
                <span className="text-white/60">Remember me</span>
              </label>
              <Link
                href="/admin/forgot-password"
                className="text-gold hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gold hover:bg-gold/90 text-navy font-bold rounded-xl transition-all shadow-lg hover:shadow-gold/20 flex items-center justify-center disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center text-sm text-gray-400"
          >
            <p>
              This is a restricted area for authorized personnel only.
            </p>
          </motion.div>
        </motion.div>

        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6 text-center text-xs text-gray-500"
        >
          🔒 Secure SSL Connection | 2FA Enabled | Login attempts tracked
        </motion.div>
      </div>
    </div>
  )
}
