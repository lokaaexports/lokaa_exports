'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ProtectedLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' })
        const data = await res.json()

        if (!active) return

        if (data.authenticated) {
          if (pathname === '/admin/login') {
            router.replace('/admin/dashboard')
          } else {
            setReady(true)
          }
          return
        }

        if (pathname !== '/admin/login') {
          toast.error('Please sign in to continue')
          router.replace('/admin/login')
        } else {
          setReady(true)
        }
      } catch (error) {
        if (!active) return
        if (pathname !== '/admin/login') {
          toast.error('Please sign in to continue')
          router.replace('/admin/login')
        } else {
          setReady(true)
        }
      }
    }

    checkSession()

    return () => {
      active = false
    }
  }, [pathname, router])

  if (!ready && pathname !== '/admin/login') {
    return null
  }

  return <>{children}</>
}
