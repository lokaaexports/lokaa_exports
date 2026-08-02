import { Suspense } from 'react'
import ResetPasswordForm from '@/components/admin/auth/ResetPasswordForm'

export const metadata = {
  title: 'Reset Password - Lokaa Exports Admin',
  description: 'Set a new password for your admin account',
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
