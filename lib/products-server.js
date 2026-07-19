import prisma from '@/lib/prisma'

const normalizeSlug = (value) => String(value || '').trim().toLowerCase()
const isPublished = (item) => item && item.status === 'published'

function parseJsonArray(value, fallback = []) {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string' || !value) return fallback
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function normalizeDynamicProduct(product) {
  if (!product) return null

  const gallery = Array.isArray(product.images)
    ? product.images.map((image) => image?.imageUrl).filter(Boolean)
    : []
  const galleryWithMain = gallery.length ? gallery : (product.mainImage ? [product.mainImage] : [])
  const seoKeywords = product.seo?.metaKeywords ? String(product.seo.metaKeywords).split(',').map((entry) => entry.trim()).filter(Boolean) : []

  return {
    id: product.id,
    slug: product.slug,
    name: product.productName,
    category: product.category?.slug || product.category?.name || product.categoryId || '',
    categorySlug: product.category?.slug || '',
    subcategory: product.subcategory?.slug || product.subcategory?.name || product.subcategoryId || '',
    subcategorySlug: product.subcategory?.slug || '',
    categoryName: product.category?.name || '',
    subcategoryName: product.subcategory?.name || '',
    tagline: product.shortDescription || product.exportDescription || '',
    shortDescription: product.shortDescription || '',
    longDescription: product.description || product.exportDescription || product.shortDescription || '',
    hero: product.mainImage || galleryWithMain[0] || '/placeholder.png',
    gallery: galleryWithMain,
    images: Array.isArray(product.images)
      ? product.images.map((image) => ({
          id: image.id,
          imageUrl: image.imageUrl,
          imageTitle: image.imageTitle || '',
          altText: image.altText || '',
          seoDescription: image.seoDescription || '',
          imageType: image.imageType || 'gallery',
          displayOrder: image.displayOrder ?? 0,
        }))
      : [],
    certifications: Array.isArray(product.certifications)
      ? product.certifications.map((cert) => ({
          id: cert.id,
          certName: cert.certName,
          certNumber: cert.certNumber || '',
          certImage: cert.certImage || '',
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
        }))
      : [],
    applications: [],
    packaging: Array.isArray(product.packaging)
      ? product.packaging.map((entry) => ({
          id: entry.id,
          packageType: entry.packageType,
          weight: entry.weight,
          unit: entry.unit || 'kg',
          quantityAvailable: entry.quantityAvailable,
          isActive: Boolean(entry.isActive),
          displayOrder: entry.displayOrder ?? 0,
        }))
      : [],
    exportMarkets: [],
    specs: Array.isArray(product.specifications)
      ? product.specifications.map((spec) => ({
          label: spec.specName || spec.field?.fieldLabel || spec.field?.fieldName || 'Specification',
          value: spec.specValue || '',
        }))
      : [],
    details: {},
    status: product.status,
    featured: Boolean(product.isFeatured),
    hsCode: product.hsnCode || '',
    origin: product.origin || '',
    shelfLife: product.shelfLife || '',
    seasonAvailability: product.seasonAvailability || product.exportInfo?.availabilityStatus || '',
    seoTitle: product.seo?.metaTitle || '',
    seoDescription: product.seo?.metaDescription || '',
    keywords: seoKeywords,
    focusKeyword: '',
    productDescription: product.description || product.shortDescription || '',
    technicalSpecifications: Array.isArray(product.specifications)
      ? product.specifications.map((spec) => ({
          id: spec.id,
          fieldId: spec.fieldId || null,
          specName: spec.specName,
          specValue: spec.specValue,
          displayOrder: spec.displayOrder ?? 0,
        }))
      : [],
    industriesServed: [],
    exportCountries: parseJsonArray(product.exportInfo?.exportCountries, []),
    faq: [],
    relatedProducts: [],
    canonicalUrl: product.canonicalUrl || '',
    ogImage: product.seo?.ogImage || product.mainImage || gallery[0] || '',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    meta: {
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      templateId: product.templateId,
      productType: product.productType || '',
      availabilityStatus: product.exportInfo?.availabilityStatus || '',
      incoterms: product.exportInfo?.incoterms || '',
      moq: product.exportInfo?.moq ?? null,
      leadTimeDays: product.exportInfo?.leadTimeDays ?? null,
      documents: Array.isArray(product.documents)
        ? product.documents.map((doc) => ({
            id: doc.id,
            title: doc.title,
            documentUrl: doc.documentUrl,
            documentType: doc.documentType || '',
            description: doc.description || '',
            displayOrder: doc.displayOrder ?? 0,
            isPublic: Boolean(doc.isPublic),
          }))
        : [],
      variants: Array.isArray(product.variants)
        ? product.variants.map((variant) => ({
            id: variant.id,
            variantName: variant.variantName,
            sku: variant.sku || '',
            attributes: variant.attributes ?? null,
            price: variant.price ?? null,
            moq: variant.moq ?? null,
            isActive: Boolean(variant.isActive),
            displayOrder: variant.displayOrder ?? 0,
          }))
        : [],
    },
  }
}

function normalizeStaticCategory(category) {
  if (!category) return null
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description || '',
    seoDescription: category.seoDescription || '',
    bannerImage: category.bannerImage || null,
    image: category.image || null,
    ogImage: null,
    keywords: category.keywords || [],
  }
}

function normalizeStaticProduct(product) {
  if (!product) return null
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    hero: product.ogImage || '/placeholder.png',
    tagline: product.shortDescription || product.description || '',
    shortDescription: product.shortDescription || '',
    longDescription: product.description || product.shortDescription || '',
    status: product.status || 'published',
    subcategory: product.subCategory?.slug || product.subCategory?.name || product.subCategoryId || '',
    subcategorySlug: product.subCategory?.slug || '',
    category: product.category?.slug || product.category?.name || product.categoryId || '',
    categorySlug: product.category?.slug || '',
  }
}

async function getPublishedDynamicProducts() {
  const products = await prisma.dynamicProduct.findMany({
    where: { status: 'published' },
    include: {
      category: true,
      subcategory: true,
      images: { orderBy: { displayOrder: 'asc' } },
      specifications: { include: { field: true }, orderBy: { displayOrder: 'asc' } },
      seo: true,
      exportInfo: true,
      packaging: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
      certifications: true,
      documents: { orderBy: { displayOrder: 'asc' } },
      variants: { orderBy: { displayOrder: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return products.map(normalizeDynamicProduct).filter(Boolean)
}

export async function getProductsCatalog() {
  return getPublishedDynamicProducts()
}

export async function getCatalogCategories() {
  return prisma.productCategory.findMany({
    where: { status: 'published' },
    include: {
      subcategories: {
        where: { status: 'published' },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: [
      { displayOrder: 'asc' },
      { createdAt: 'desc' },
    ],
  })
}

export async function getCategoryBySlug(slug) {
  if (!slug) return null
  const normalizedSlug = normalizeSlug(slug)

  // Prefer dynamic storefront model
  const dynamicCategory = await prisma.productCategory.findUnique({
    where: { slug: normalizedSlug },
    include: {
      subcategories: {
        where: { status: 'published' },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      },
      products: {
        where: { status: 'published' },
        include: {
          category: true,
          subcategory: true,
          images: { orderBy: { displayOrder: 'asc' } },
          specifications: { include: { field: true }, orderBy: { displayOrder: 'asc' } },
          seo: true,
          exportInfo: true,
          packaging: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
          certifications: true,
          documents: { orderBy: { displayOrder: 'asc' } },
          variants: { orderBy: { displayOrder: 'asc' } },
        },
      },
    },
  })

  if (dynamicCategory) {
    return {
      ...dynamicCategory,
      products: (dynamicCategory.products || []).map(normalizeDynamicProduct).filter(Boolean),
    }
  }

  // Fallback to static storefront model (Category/SubCategory/Product)
  const staticCategory = await prisma.category.findUnique({
    where: { slug: normalizedSlug },
    include: {
      products: {
        where: { status: 'published' },
        include: { category: true, subCategory: true },
      },
    },
  })

  if (!staticCategory) {
    console.warn('Missing Prisma storefront record', normalizedSlug)
    return null
  }

  return {
    ...normalizeStaticCategory(staticCategory),
    seoTitle: staticCategory.seoTitle,
    products: (staticCategory.products || []).map(normalizeStaticProduct).filter(Boolean),
  }
}

export async function getSubcategoriesForCategory(categorySlug) {
  if (!categorySlug) return []
  const normalizedCategorySlug = normalizeSlug(categorySlug)

  const dynamicCategory = await prisma.productCategory.findUnique({
    where: { slug: normalizedCategorySlug },
    include: {
      subcategories: {
        where: { status: 'published' },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      },
    },
  })

  if (dynamicCategory) return dynamicCategory.subcategories || []

  const staticSubcategories = await prisma.subCategory.findMany({
    where: {
      category: { slug: normalizedCategorySlug },
      status: 'published',
    },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { category: false },
  })

  return staticSubcategories || []
}

export async function getSubcategoryBySlug(categorySlug, subcategorySlug) {
  if (!categorySlug || !subcategorySlug) return null
  const normalizedSubcategorySlug = normalizeSlug(subcategorySlug)
  const subcategory = await prisma.productSubcategory.findFirst({
    where: {
      slug: normalizedSubcategorySlug,
      category: { slug: normalizeSlug(categorySlug) },
    },
    include: {
      category: true,
      products: {
        where: { status: 'published' },
        include: {
          category: true,
          subcategory: true,
          images: { orderBy: { displayOrder: 'asc' } },
          specifications: { include: { field: true }, orderBy: { displayOrder: 'asc' } },
          seo: true,
          exportInfo: true,
          packaging: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
          certifications: true,
          documents: { orderBy: { displayOrder: 'asc' } },
          variants: { orderBy: { displayOrder: 'asc' } },
        },
      },
    },
  })
  if (!subcategory) console.warn('Missing Prisma storefront record', normalizedSubcategorySlug)
  return subcategory ? {
    ...subcategory,
    products: (subcategory.products || []).map(normalizeDynamicProduct).filter(Boolean),
  } : null
}

export async function getProductsByCategory(categorySlug) {
  if (!categorySlug) return []
  const normalizedCategorySlug = normalizeSlug(categorySlug)

  const dynamicProducts = await prisma.dynamicProduct.findMany({
    where: {
      status: 'published',
      category: { slug: normalizedCategorySlug },
    },
    include: {
      category: true,
      subcategory: true,
      images: { orderBy: { displayOrder: 'asc' } },
      specifications: { include: { field: true }, orderBy: { displayOrder: 'asc' } },
      seo: true,
      exportInfo: true,
      packaging: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
      certifications: true,
      documents: { orderBy: { displayOrder: 'asc' } },
      variants: { orderBy: { displayOrder: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (dynamicProducts && dynamicProducts.length) {
    return dynamicProducts.map(normalizeDynamicProduct).filter(Boolean)
  }

  const staticProducts = await prisma.product.findMany({
    where: {
      status: 'published',
      category: { slug: normalizedCategorySlug },
    },
    include: { category: true, subCategory: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!staticProducts.length) console.warn('Missing Prisma storefront record', normalizedCategorySlug)

  return staticProducts.map(normalizeStaticProduct).filter(Boolean)
}

export async function getProductsBySubcategory(categorySlug, subcategorySlug) {
  if (!categorySlug || !subcategorySlug) return []
  const normalizedSubcategorySlug = normalizeSlug(subcategorySlug)
  const products = await prisma.dynamicProduct.findMany({
    where: {
      status: 'published',
      category: { slug: normalizeSlug(categorySlug) },
      subcategory: { slug: normalizedSubcategorySlug },
    },
    include: {
      category: true,
      subcategory: true,
      images: { orderBy: { displayOrder: 'asc' } },
      specifications: { include: { field: true }, orderBy: { displayOrder: 'asc' } },
      seo: true,
      exportInfo: true,
      packaging: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
      certifications: true,
      documents: { orderBy: { displayOrder: 'asc' } },
      variants: { orderBy: { displayOrder: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (!products.length) console.warn('Missing Prisma storefront record', `${normalizeSlug(categorySlug)}/${normalizedSubcategorySlug}`)
  return products.map(normalizeDynamicProduct).filter(Boolean)
}

export async function getProductBySlug(slug) {
  if (!slug) return null
  const normalizedSlug = normalizeSlug(slug)
  const dynamicProduct = await prisma.dynamicProduct.findUnique({
    where: { slug: normalizedSlug },
    include: {
      category: true,
      subcategory: true,
      images: { orderBy: { displayOrder: 'asc' } },
      specifications: { include: { field: true }, orderBy: { displayOrder: 'asc' } },
      seo: true,
      exportInfo: true,
      packaging: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
      certifications: true,
      documents: { orderBy: { displayOrder: 'asc' } },
      variants: { orderBy: { displayOrder: 'asc' } },
    },
  })
  if (!dynamicProduct) {
    console.warn('Missing Prisma storefront record', normalizedSlug)
    return null
  }
  return normalizeDynamicProduct(dynamicProduct)
}
