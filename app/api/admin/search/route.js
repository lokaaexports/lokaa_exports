import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import { globalSearch } from '@/lib/platform/search'

export async function GET(request) {
  try {
    await verifyAdmin(request)

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = Number(searchParams.get('limit') || 25)

    const results = await globalSearch(query, { limit })

    return NextResponse.json({ success: true, results })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 })
  }
}
