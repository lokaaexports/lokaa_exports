import LoginForm from '@/components/admin/auth/LoginForm'
import { createPageMetadata } from '@/app/metadata'

export const dynamic = 'force-dynamic'

export const metadata = createPageMetadata({
  title: 'Admin login — Lokaa Exports',
  description: 'Secure administrator login for Lokaa Exports.',
  path: '/admin/login',
})

export default function AdminLoginPage() {
  return <LoginForm />
}
