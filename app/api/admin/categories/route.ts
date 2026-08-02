import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth-service'

function mapCategory(category: any) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description || '',
    image: category.image || '',
    bannerImage: category.bannerImage || '',
    icon: category.icon || '',
    seoTitle: category.seoTitle || '',
    seoDescription: category.seoDescription || '',
    keywords: category.keywords ? JSON.parse(category.keywords) : [],
    canonicalUrl: category.canonicalUrl || '',
    ogImage: category.ogImage || category.bannerImage || category.image || '',
    status: category.status,
    sortOrder: category.displayOrder,
    parentCategoryId: null,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

export async function GET(request: any) {
  try {
    await verifyAdmin(request)
    const categories = await prisma.productCategory.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: { subcategories: true },
    })
    return NextResponse.json({ categories: categories.map(mapCategory) })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin categories GET error', error)
    return NextResponse.json({ success: false, error: 'Unable to load categories' }, { status: 500 })
  }
}

const CREATE_SCHEMA = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
})

export async function POST(request: any) {
  try {
    await verifyAdmin(request)

    const body = await request.json()
    const parsed = CREATE_SCHEMA.safeParse(body)
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })

    await prisma.productCategory.create({
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
      },
    })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin categories POST error', error)
    return NextResponse.json({ success: false, error: 'Unable to create category' }, { status: 500 })
  }
}
