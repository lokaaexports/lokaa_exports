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

export async function GET(request: any, { params }: any) {
  try {
    await verifyAdmin(request)
    const { slug } = params
    const category = await prisma.productCategory.findUnique({ where: { slug } })
    if (!category) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ category: mapCategory(category) })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin category GET error', error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}

const UPDATE_SCHEMA = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
})

export async function PUT(request: any, { params }: any) {
  try {
    await verifyAdmin(request)

    const { slug } = params
    const body = await request.json()
    const parsed = UPDATE_SCHEMA.safeParse(body)
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })

    const existing = await prisma.productCategory.findUnique({ where: { slug } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    const updated = await prisma.productCategory.update({
      where: { id: existing.id },
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
      },
    })
    const categories = await prisma.productCategory.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: { subcategories: true },
    })
    return NextResponse.json({ ok: true, categories: categories.map(mapCategory), category: mapCategory(updated) })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin category PUT error', error)
    return NextResponse.json({ success: false, error: 'Unable to update category' }, { status: 500 })
  }
}

export async function DELETE(request: any, { params }: any) {
  try {
    await verifyAdmin(request)

    const { slug } = params
    const existing = await prisma.productCategory.findUnique({ where: { slug }, select: { id: true } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    await prisma.productCategory.delete({ where: { id: existing.id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin category DELETE error', error)
    return NextResponse.json({ success: false, error: 'Unable to delete category' }, { status: 500 })
  }
}
