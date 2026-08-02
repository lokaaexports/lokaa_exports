// In-memory Rate Limiter for Authentication Routes
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Periodically clean up expired records to avoid memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    rateLimitMap.forEach((record, key) => {
      if (now > record.resetTime) {
        rateLimitMap.delete(key)
      }
    })
  }, 5 * 60 * 1000) // every 5 minutes
}

export function isRateLimited(ip: string, limit = 5, durationMs = 15 * 60 * 1000): { limited: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + durationMs })
    return { limited: false, remaining: limit - 1, resetTime: now + durationMs }
  }

  if (record.count >= limit) {
    return { limited: true, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return { limited: false, remaining: limit - record.count, resetTime: record.resetTime }
}
