import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import { categoryService, productService, rfqService, customerService, blogService } from '@/lib/services'

export async function GET(request) {
  try {
    await verifyAdmin(request)

    const [categoryCount, productCount, rfqCount, customerCount, blogCount] = await Promise.all([
      categoryService.list().then((items) => items.length),
      productService.list().then((items) => items.length),
      rfqService.count(),
      customerService.count(),
      blogService.count(),
    ])

    const openRfqs = await rfqService.countByStatus(['new', 'contacted', 'quotation-sent', 'negotiation'])
    const pendingQuotes = await rfqService.countByStatus(['quotation-sent'])

    return NextResponse.json({
      categoryCount,
      productCount,
      rfqCount,
      customerCount,
      activeUsers: customerCount,
      openRfqs,
      pendingQuotes,
      revenue: 0,
      blogCount,
    })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin stats error', error)
    return NextResponse.json({ error: 'Unable to load stats' }, { status: 500 })
  }
}
