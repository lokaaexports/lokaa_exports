import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth-service'
import { ApiResponse } from '@/lib/admin/utils/api-response'

function normalizeStatus(status) {
  return String(status || 'published').trim().toLowerCase() === 'active' ? 'published' : String(status || 'published').trim().toLowerCase()
}

function safeJsonParse(value, fallback = []) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function buildProductPayload(body) {
  const slug = String(body.slug || body.name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const gallery = Array.isArray(body.gallery) ? body.gallery : body.gallery ? [body.gallery] : []
  return {
    slug,
    name: String(body.name || '').trim(),
    category: String(body.category || '').trim(),
    subcategory: String(body.subcategory || '').trim(),
    tagline: String(body.tagline || '').trim(),
    shortDescription: String(body.shortDescription || body.description || '').trim(),
    longDescription: String(body.longDescription || body.description || '').trim(),
    hero: String(body.hero || body.image || gallery[0] || '').trim(),
    gallery,
    certifications: Array.isArray(body.certifications) ? body.certifications : [],
    applications: Array.isArray(body.applications) ? body.applications : [],
    packaging: Array.isArray(body.packaging) ? body.packaging : [],
    exportMarkets: Array.isArray(body.exportMarkets) ? body.exportMarkets : [],
    specs: Array.isArray(body.specs) ? body.specs : [],
    details: body.details && typeof body.details === 'object' ? body.details : {},
    status: normalizeStatus(body.status),
    featured: Boolean(body.featured),
    hsCode: String(body.hsnCode || body.hsCode || '').trim(),
    origin: String(body.origin || '').trim(),
    shelfLife: String(body.shelfLife || '').trim(),
    seasonAvailability: String(body.seasonAvailability || '').trim(),
    seoTitle: String(body.seoTitle || '').trim(),
    seoDescription: String(body.seoDescription || '').trim(),
    keywords: Array.isArray(body.keywords) ? body.keywords : [],
    focusKeyword: String(body.focusKeyword || '').trim(),
    productDescription: String(body.productDescription || body.description || '').trim(),
    technicalSpecifications: Array.isArray(body.technicalSpecifications) ? body.technicalSpecifications : [],
    industriesServed: Array.isArray(body.industriesServed) ? body.industriesServed : [],
    exportCountries: Array.isArray(body.exportCountries) ? body.exportCountries : [],
    faq: Array.isArray(body.faq) ? body.faq : [],
    relatedProducts: Array.isArray(body.relatedProducts) ? body.relatedProducts : [],
    canonicalUrl: String(body.canonicalUrl || '').trim(),
    ogImage: String(body.ogImage || body.hero || body.image || gallery[0] || '').trim(),
  }
}

async function resolveCategoryId(categoryValue) {
  if (!categoryValue) return null
  const direct = await prisma.productCategory.findUnique({ where: { id: String(categoryValue) } }).catch(() => null)
  if (direct) return direct.id
  const bySlug = await prisma.productCategory.findUnique({ where: { slug: String(categoryValue) } }).catch(() => null)
  return bySlug?.id || null
}

async function resolveSubcategoryId(subcategoryValue) {
  if (!subcategoryValue) return null
  const direct = await prisma.productSubcategory.findUnique({ where: { id: String(subcategoryValue) } }).catch(() => null)
  if (direct) return direct.id
  const bySlug = await prisma.productSubcategory.findUnique({ where: { slug: String(subcategoryValue) } }).catch(() => null)
  return bySlug?.id || null
}

function mapProduct(product) {
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

async function loadProducts() {
  return prisma.dynamicProduct.findMany({
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
    orderBy: { createdAt: 'desc' },
  })
}

async function loadProductBySlug(slug) {
  return prisma.dynamicProduct.findUnique({
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
}

export async function GET(request) {
  try {
    const user = await verifyAdmin(request)
    if (!user) return ApiResponse.unauthorized()

    const { searchParams } = new URL(request.url)
    const search = String(searchParams.get('search') || '').trim().toLowerCase()
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0
    const action = searchParams.get('action')

    const products = (await loadProducts()).map(mapProduct)

    if (action === 'stats') {
      return ApiResponse.success({
        total: products.length,
        active: products.filter((p) => p.status === 'published' || p.status === 'active').length,
        inactive: products.filter((p) => p.status !== 'published' && p.status !== 'active').length,
      })
    }

    let filtered = products

    if (search) {
      filtered = filtered.filter((p) =>
        String(p.name || '').toLowerCase().includes(search) ||
        String(p.slug || '').toLowerCase().includes(search)
      )
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((p) => String(p.category || '').toLowerCase() === String(category).toLowerCase())
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((p) => String(p.status || '').toLowerCase() === String(status).toLowerCase())
    }

    const total = filtered.length
    const data = filtered.slice(offset, offset + limit)
    return ApiResponse.paginated(data, total, Math.floor(offset / limit) + 1, limit, 'Products retrieved successfully')
  } catch (error) {
    console.error('Products GET error:', error)
    if (error.message === 'Unauthorized') return ApiResponse.unauthorized()
    if (error.message === 'Forbidden') return ApiResponse.forbidden()
    return ApiResponse.error(error.message || 'Failed to fetch products', 500)
  }
}

export async function POST(request) {
  try {
    const user = await verifyAdmin(request)
    if (!user) return ApiResponse.unauthorized()

    const body = await request.json()
    const payload = buildProductPayload(body)

    if (!payload.name) return ApiResponse.badRequest('Product name is required')
    if (!payload.slug) return ApiResponse.badRequest('Product slug is required')
    if (!payload.category) return ApiResponse.badRequest('Category is required')

    const categoryId = await resolveCategoryId(payload.category)
    if (!categoryId) return ApiResponse.badRequest('Category is required')
    const subcategoryId = await resolveSubcategoryId(payload.subcategory)

    const created = await prisma.dynamicProduct.create({
      data: {
        slug: payload.slug,
        productName: payload.name,
        categoryId,
        subcategoryId,
        templateId: body.templateId || body.template,
        description: payload.longDescription || null,
        shortDescription: payload.shortDescription || null,
        exportDescription: payload.productDescription || null,
        hsnCode: payload.hsCode || null,
        productType: body.productType || null,
        status: payload.status || 'draft',
        isFeatured: payload.featured,
        mainImage: payload.hero || null,
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
    ApiResponse.logAdminRequest('POST', '/api/admin/products', user.id, { product: created?.id || payload.slug })
    return ApiResponse.success(mapProduct(created), 'Product created successfully', 201)
  } catch (error) {
    console.error('Products POST error:', error)
    if (error.message === 'Unauthorized') return ApiResponse.unauthorized()
    return ApiResponse.error(error.message || 'Failed to create product', 500)
  }
}

export async function PUT(request) {
  try {
    const user = await verifyAdmin(request)
    if (!user) return ApiResponse.unauthorized()

    const body = await request.json()
    const id = body.id || body.slug
    if (!id) return ApiResponse.badRequest('Product slug or ID is required')

    const payload = buildProductPayload(body)
    if (!payload.name) return ApiResponse.badRequest('Product name is required')
    if (!payload.slug) return ApiResponse.badRequest('Product slug is required')

    const categoryId = await resolveCategoryId(payload.category)
    if (!categoryId) return ApiResponse.badRequest('Category is required')
    const subcategoryId = await resolveSubcategoryId(payload.subcategory)

    const existing = await prisma.dynamicProduct.findFirst({
      where: { OR: [{ slug: String(id) }, { id: String(id) }] },
      select: { id: true },
    })
    if (!existing) return ApiResponse.error('Product not found', 404)

    const updated = await prisma.dynamicProduct.update({
      where: { id: existing.id },
      data: {
        slug: payload.slug,
        productName: payload.name,
        categoryId,
        subcategoryId,
        description: payload.longDescription || null,
        shortDescription: payload.shortDescription || null,
        exportDescription: payload.productDescription || null,
        hsnCode: payload.hsCode || null,
        status: payload.status || 'draft',
        isFeatured: payload.featured,
        mainImage: payload.hero || null,
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
    ApiResponse.logAdminRequest('PUT', '/api/admin/products', user.id, { product: id })
    return ApiResponse.success(mapProduct(updated), 'Product updated successfully')
  } catch (error) {
    console.error('Products PUT error:', error)
    if (error.message === 'Unauthorized') return ApiResponse.unauthorized()
    return ApiResponse.error(error.message || 'Failed to update product', 500)
  }
}

export async function DELETE(request) {
  try {
    const user = await verifyAdmin(request)
    if (!user) return ApiResponse.unauthorized()

    const body = await request.json()
    const id = body.id || body.slug
    if (!id) return ApiResponse.badRequest('Product slug or ID is required')

    const product = await prisma.dynamicProduct.findFirst({
      where: { OR: [{ slug: String(id) }, { id: String(id) }] },
      select: { id: true },
    })
    if (!product) return ApiResponse.error('Product not found', 404)

    await prisma.dynamicProduct.delete({ where: { id: product.id } })
    ApiResponse.logAdminRequest('DELETE', '/api/admin/products', user.id, { product: id })
    return ApiResponse.success({ id }, 'Product deleted successfully')
  } catch (error) {
    console.error('Products DELETE error:', error)
    if (error.message === 'Unauthorized') return ApiResponse.unauthorized()
    return ApiResponse.error(error.message || 'Failed to delete product', 500)
  }
}
