'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/admin/EmptyState'

export default function AdminError({ error, reset }: any) {
  useEffect(() => {
    const isChunkLoadError = 
      error?.name === 'ChunkLoadError' || 
      error?.message?.includes('Loading chunk') || 
      error?.message?.includes('fetch dynamically imported module') ||
      error?.message?.includes('Failed to fetch')

    if (isChunkLoadError) {
      window.location.reload()
    }
  }, [error])

  return (
    <div className="flex-1 p-8">
      <ErrorState 
        title="Something went wrong!"
        description={error.message || "An unexpected error occurred while loading this page."}
        onRetry={() => window.location.reload()}
      />
    </div>
  )
}
