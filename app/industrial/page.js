'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function IndustrialRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/category/industrial')
  }, [router])
  
  return null
}
