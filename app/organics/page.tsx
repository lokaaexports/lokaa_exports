'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OrganicsRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/category/organics')
  }, [router])
  
  return null
}
