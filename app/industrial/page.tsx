'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function IndustrialRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/category/machinery')
  }, [router])
  
  return null
}
