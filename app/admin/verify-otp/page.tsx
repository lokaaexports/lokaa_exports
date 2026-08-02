// app/admin/verify-otp/page.js
// Redirect to auth route group version

import { Suspense } from 'react'
import OTPVerification from '@/components/admin/auth/OTPVerification'

export const metadata = {
  title: 'Verify OTP - Lokaa Exports Admin',
  description: 'Verify your email with OTP'
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <OTPVerification />
    </Suspense>
  )
}
