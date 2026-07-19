import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth-service'

function safeJsonParse(value, fallback = []) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function mapProduct(product) {
  if (!product) return null
  return {
    id: product.id,
    slug: product.slug,
    name: product.productName,
    category: product.category?.slug || product.categoryId || '',
    subcategory: product.subcategory?.slug || product.subcategoryId || '',
    tagline: product.shortDescription || product.exportDescription || '',
    shortDescription: product.shortDescription || '',
    longDescription: product.description || product.exportDescription || product.shortDescription || '',
    hero: product.mainImage || product.images?.[0]?.imageUrl || '',
    gallery: Array.isArray(product.images) ? product.images.map((image) => image.imageUrl).filter(Boolean) : [],
    certifications: Array.isArray(product.certifications) ? product.certifications : [],
    applications: [],
    packaging: Array.isArray(product.packaging) ? product.packaging : [],
    exportMarkets: [],
    specs: Array.isArray(product.specifications) ? product.specifications : [],
    details: {},
    status: product.status,
    featured: Boolean(product.isFeatured),
    hsCode: product.hsnCode || '',
    origin: '',
    shelfLife: '',
    seasonAvailability: product.exportInfo?.availabilityStatus || '',
    seoTitle: product.seo?.metaTitle || '',
    seoDescription: product.seo?.metaDescription || '',
    keywords: product.seo?.metaKeywords ? String(product.seo.metaKeywords).split(',').map((entry) => entry.trim()).filter(Boolean) : [],
    focusKeyword: '',
    productDescription: product.description || product.shortDescription || '',
    technicalSpecifications: Array.isArray(product.specifications) ? product.specifications : [],
    industriesServed: [],
    exportCountries: safeJsonParse(product.exportInfo?.exportCountries, []),
    faq: [],
    relatedProducts: [],
    canonicalUrl: product.canonicalUrl || '',
    ogImage: product.seo?.ogImage || product.mainImage || '',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

export async function GET(request, { params }) {
  try {
    await verifyAdmin(request)
    const { slug } = params
    const product = await prisma.dynamicProduct.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        images: { orderBy: { displayOrder: 'asc' } },
        specifications: { orderBy: { displayOrder: 'asc' } },
        seo: true,
        exportInfo: true,
        packaging: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
        certifications: true,
      },
    })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ product: mapProduct(product) })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin product GET error', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

const UPDATE_SCHEMA = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().optional(),
})

async function resolveCategoryId(categoryValue) {
  if (!categoryValue) return null
  const byId = await prisma.productCategory.findUnique({ where: { id: String(categoryValue) } }).catch(() => null)
  if (byId) return byId.id
  const bySlug = await prisma.productCategory.findUnique({ where: { slug: String(categoryValue) } }).catch(() => null)
  return bySlug?.id || null
}

export async function PUT(request, { params }) {
  try {
    await verifyAdmin(request)

    const { slug } = params
    const body = await request.json()
    const parsed = UPDATE_SCHEMA.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

    const existing = await prisma.dynamicProduct.findUnique({ where: { slug } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const categoryId = parsed.data.category ? await resolveCategoryId(parsed.data.category) : existing.categoryId
    const updated = await prisma.dynamicProduct.update({
      where: { id: existing.id },
      data: {
        slug: parsed.data.slug,
        productName: parsed.data.name,
        categoryId: categoryId || existing.categoryId,
      },
      include: {
        category: true,
        subcategory: true,
        images: { orderBy: { displayOrder: 'asc' } },
        specifications: { orderBy: { displayOrder: 'asc' } },
        seo: true,
        exportInfo: true,
        packaging: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
        certifications: true,
      },
    })
    return NextResponse.json({ ok: true, product: mapProduct(updated) })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin product PUT error', error)
    return NextResponse.json({ error: 'Unable to update product' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await verifyAdmin(request)

    const { slug } = params
    const existing = await prisma.dynamicProduct.findUnique({ where: { slug }, select: { id: true } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await prisma.dynamicProduct.delete({ where: { id: existing.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin product DELETE error', error)
    return NextResponse.json({ error: 'Unable to delete product' }, { status: 500 })
  }
}
