// app/admin/forgot-password/page.js
// Forgot Password Page

import ForgotPasswordForm from '@/components/admin/auth/ForgotPasswordForm'

export const metadata = {
  title: 'Forgot Password - Lokaa Exports Admin',
  description: 'Reset your admin account password'
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
