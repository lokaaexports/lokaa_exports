import { useState, useCallback } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface FetchOptions extends RequestInit {
  showToastOnError?: boolean
}

export function useAdminFetch<T = any>() {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const authHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
    }
  }, [])

  const execute = useCallback(
    async (url: string, options: FetchOptions = {}) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...authHeaders(),
            ...options.headers,
          },
        })
        const payload = await response.json()
        if (!response.ok || payload.success === false) {
          throw new Error(payload.error || 'An error occurred during fetch')
        }
        
        // Handle standard Lokaa API response format `{ success: true, data: ... }`
        // or array payloads directly depending on the endpoint
        const finalData = payload.data !== undefined ? payload.data : payload
        
        setState({ data: finalData, loading: false, error: null })
        return finalData as T
      } catch (err: any) {
        setState({ data: null, loading: false, error: err.message })
        throw err
      }
    },
    [authHeaders]
  )

  return { ...state, execute }
}
