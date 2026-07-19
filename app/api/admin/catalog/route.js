import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth-service'
import { ApiResponse } from '@/lib/admin/utils/api-response'

function mapCatalogProduct(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.productName,
    category: product.category?.slug || product.categoryId || '',
    subcategory: product.subcategory?.slug || product.subcategoryId || '',
    tagline: product.shortDescription || product.exportDescription || '',
    shortDescription: product.shortDescription || '',
    longDescription: product.description || product.exportDescription || '',
    hero: product.mainImage || '',
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
    exportCountries: product.exportInfo?.exportCountries ? JSON.parse(product.exportInfo.exportCountries) : [],
    faq: [],
    relatedProducts: [],
    canonicalUrl: product.canonicalUrl || '',
    ogImage: product.seo?.ogImage || product.mainImage || '',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

function mapCatalogCategory(category) {
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
    sortOrder: category.sortOrder,
    parentCategoryId: category.parentCategoryId || null,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

async function loadCatalogData() {
  const [categories, subcategories, products] = await Promise.all([
    prisma.productCategory.findMany({
      include: {
        subcategories: { where: { status: 'published' }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.productSubcategory.findMany({
      include: { category: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.dynamicProduct.findMany({
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
    }),
  ])

  return {
    categories: categories.map(mapCatalogCategory),
    subcategories: subcategories.map((subcategory) => ({
      id: subcategory.id,
      slug: subcategory.slug,
      name: subcategory.name,
      description: subcategory.description || '',
      bannerImage: subcategory.bannerImage || '',
      icon: subcategory.icon || '',
      seoTitle: subcategory.seoTitle || '',
      seoDescription: subcategory.seoDescription || '',
      keywords: subcategory.keywords ? JSON.parse(subcategory.keywords) : [],
      canonicalUrl: subcategory.canonicalUrl || '',
      ogImage: subcategory.ogImage || subcategory.bannerImage || '',
      status: subcategory.status,
      sortOrder: subcategory.sortOrder,
      categoryId: subcategory.categoryId,
      categorySlug: subcategory.category?.slug || '',
      parentCategoryId: subcategory.parentCategoryId || null,
      createdAt: subcategory.createdAt,
      updatedAt: subcategory.updatedAt,
    })),
    products: products.map(mapCatalogProduct),
  }
}

export async function GET(request) {
  try {
    const user = await verifyAdmin(request)
    if (!user) return ApiResponse.unauthorized()

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const id = searchParams.get('id')

    if (action === 'download' && id) {
      return ApiResponse.success({ url: `/download/${id}.pdf` }, 'Catalog download ready')
    }

    const data = await loadCatalogData()
    if (action === 'list') {
      return ApiResponse.success(data || [], 'Catalogues retrieved successfully')
    }

    return ApiResponse.success(data, 'Catalog data retrieved successfully')
  } catch (error) {
    console.error('Catalog GET error:', error)
    if (error.message === 'Unauthorized') return ApiResponse.unauthorized()
    if (error.message === 'Forbidden') return ApiResponse.forbidden()
    return ApiResponse.error(error.message || 'Catalog read failed', 500)
  }
}

export async function POST(request) {
  try {
    const user = await verifyAdmin(request)
    if (!user) return ApiResponse.unauthorized()

    const body = await request.json()
    const { action } = body

    if (!action) return ApiResponse.badRequest('Action is required')

    if (action === 'generate') {
      const catalogData = {
        id: Date.now().toString(),
        version: `v${Date.now()}`,
        name: body.catalogType || 'Complete Catalog',
        type: body.catalogType || 'complete',
        status: 'draft',
        createdAt: new Date().toLocaleDateString(),
        createdBy: user.id,
        config: {
          includeProducts: body.includeProducts ?? true,
          includeCategories: body.includeCategories ?? true,
          includePricing: body.includePricing ?? true,
          includeImages: body.includeImages ?? true,
        },
      }

      return ApiResponse.success(catalogData, 'Catalog generated successfully', 201)
    }

    return ApiResponse.badRequest('Invalid action')
  } catch (error) {
    console.error('Catalog POST error:', error)
    if (error.message === 'Unauthorized') return ApiResponse.unauthorized()
    return ApiResponse.error(error.message || 'Catalog generation failed', 500)
  }
}

export async function DELETE(request) {
  try {
    const user = await verifyAdmin(request)
    if (!user) return ApiResponse.unauthorized()

    const body = await request.json()
    const { id } = body

    if (!id) return ApiResponse.badRequest('Catalog ID is required')

    return ApiResponse.success({ id }, 'Catalog deleted successfully')
  } catch (error) {
    console.error('Catalog DELETE error:', error)
    if (error.message === 'Unauthorized') return ApiResponse.unauthorized()
    return ApiResponse.error(error.message || 'Catalog deletion failed', 500)
  }
}
