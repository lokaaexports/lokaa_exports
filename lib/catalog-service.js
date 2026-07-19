import { promises as fsp } from 'fs'
import path from 'path'
import { getMysqlPool } from './mysql-client'
import {
  createCategory as createPimCategory,
  createSubcategory as createPimSubcategory,
  createAttribute as createPimAttribute,
  createPackagingType as createPimPackagingType,
  createExportCountry as createPimExportCountry,
  listAttributes,
  listCategories,
  listExportCountries,
  listPackagingTypes,
  listSubcategories,
  updateCategory as updatePimCategory,
  updateSubcategory as updatePimSubcategory,
  updateAttribute as updatePimAttribute,
  updatePackagingType as updatePimPackagingType,
  updateExportCountry as updatePimExportCountry,
} from './pim-service'

// Legacy catalog service retained for backward compatibility with the old /api/admin/products routes.
// New product management should use Prisma DynamicProduct-backed services under /api/admin/products-advanced.

const CATALOG_FILE = path.join(process.cwd(), 'data', 'catalog.json')

function parseJsonField(value, fallback) {
  try {
    return typeof value === 'string' && value.length ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function normalizeProductRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory || '',
    tagline: row.tagline,
    shortDescription: row.shortDescription,
    longDescription: row.longDescription,
    hero: row.hero,
    gallery: parseJsonField(row.gallery, []),
    certifications: parseJsonField(row.certifications, []),
    applications: parseJsonField(row.applications, []),
    packaging: parseJsonField(row.packaging, []),
    exportMarkets: parseJsonField(row.exportMarkets, []),
    specs: parseJsonField(row.specs, []),
    details: parseJsonField(row.details, {}),
    status: row.status,
    featured: Boolean(row.featured),
    hsCode: row.hsCode,
    origin: row.origin,
    shelfLife: row.shelfLife,
    seasonAvailability: row.seasonAvailability,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    keywords: parseJsonField(row.keywords, []),
    focusKeyword: row.focusKeyword || '',
    productDescription: row.productDescription || row.shortDescription || '',
    technicalSpecifications: parseJsonField(row.technicalSpecifications, []),
    industriesServed: parseJsonField(row.industriesServed, []),
    exportCountries: parseJsonField(row.exportCountries, []),
    faq: parseJsonField(row.faq, []),
    relatedProducts: parseJsonField(row.relatedProducts, []),
    canonicalUrl: row.canonicalUrl || '',
    ogImage: row.ogImage,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function normalizeCategoryRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    image: row.image || row.bannerImage || '',
    bannerImage: row.bannerImage || '',
    icon: row.icon || '',
    seoTitle: row.seoTitle || '',
    seoDescription: row.seoDescription || '',
    keywords: parseJsonField(row.keywords, []),
    canonicalUrl: row.canonicalUrl || '',
    ogImage: row.ogImage || row.bannerImage || '',
    status: row.status,
    sortOrder: row.sortOrder,
    parentCategoryId: row.parentCategoryId ? Number(row.parentCategoryId) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function slugify(value = '') {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function ensureUniqueSlug(value, fallbackPrefix, usedSlugs) {
  const base = slugify(value) || fallbackPrefix
  let slug = base
  let suffix = 2
  while (usedSlugs.has(slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  usedSlugs.add(slug)
  return slug
}

function normalizeEntityList(items, fallbackPrefix, usedSlugs, fallbackName) {
  return (Array.isArray(items) ? items : []).map((item, index) => {
    const normalized = { ...item }
    const baseName = normalized.name || `${fallbackName} ${index + 1}`
    normalized.name = baseName
    normalized.slug = ensureUniqueSlug(normalized.slug || baseName, `${fallbackPrefix}-${index + 1}`, usedSlugs)
    normalized.status = normalized.status || 'published'
    return normalized
  })
}

function normalizeCatalogForSave(catalog) {
  const categories = normalizeEntityList(catalog?.categories || [], 'category', new Set(), 'Category')
  const products = normalizeEntityList(catalog?.products || [], 'product', new Set(), 'Product')
  const subcategories = normalizeEntityList(catalog?.subcategories || [], 'subcategory', new Set(), 'Subcategory')
  const attributes = normalizeEntityList(catalog?.attributes || [], 'attribute', new Set(), 'Attribute')
  const packagingTypes = normalizeEntityList(catalog?.packagingTypes || [], 'packaging', new Set(), 'Packaging')
  const exportCountries = normalizeEntityList(catalog?.exportCountries || [], 'country', new Set(), 'Country')

  return {
    categories,
    products,
    subcategories,
    attributes,
    packagingTypes,
    exportCountries,
  }
}

async function readFileCatalog() {
  try {
    const raw = await fsp.readFile(CATALOG_FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    return { categories: [], products: [] }
  }
}

async function writeCatalogFile(catalog) {
  const normalized = {
    categories: Array.isArray(catalog?.categories) ? catalog.categories : [],
    products: Array.isArray(catalog?.products) ? catalog.products : [],
    subcategories: Array.isArray(catalog?.subcategories) ? catalog.subcategories : [],
    attributes: Array.isArray(catalog?.attributes) ? catalog.attributes : [],
    packagingTypes: Array.isArray(catalog?.packagingTypes) ? catalog.packagingTypes : [],
    exportCountries: Array.isArray(catalog?.exportCountries) ? catalog.exportCountries : [],
  }
  await fsp.writeFile(CATALOG_FILE, JSON.stringify(normalized, null, 2), 'utf8')
}

function mergeCatalogData(fileCatalog, dbCatalog) {
  const fileCategories = Array.isArray(fileCatalog?.categories) ? fileCatalog.categories : []
  const fileProducts = Array.isArray(fileCatalog?.products) ? fileCatalog.products : []
  const dbCategories = Array.isArray(dbCatalog?.categories) ? dbCatalog.categories : []
  const dbProducts = Array.isArray(dbCatalog?.products) ? dbCatalog.products : []

  const categoryBySlug = new Map(dbCategories.map((item) => [item.slug || item.name, item]))
  const mergedCategories = fileCategories.map((category) => ({
    ...category,
    ...(categoryBySlug.get(category.slug) || categoryBySlug.get(category.name) || {}),
  }))

  dbCategories.forEach((category) => {
    const slug = category.slug || category.name
    if (!slug) return
    const exists = mergedCategories.some((item) => (item.slug || item.name) === slug)
    if (!exists) mergedCategories.push(category)
  })

  const productBySlug = new Map(dbProducts.map((item) => [item.slug || item.name, item]))
  const mergedProducts = fileProducts.map((product) => ({
    ...product,
    ...(productBySlug.get(product.slug) || productBySlug.get(product.name) || {}),
  }))

  dbProducts.forEach((product) => {
    const slug = product.slug || product.name
    if (!slug) return
    const exists = mergedProducts.some((item) => (item.slug || item.name) === slug)
    if (!exists) mergedProducts.push(product)
  })

  return {
    categories: mergedCategories,
    products: mergedProducts,
  }
}

async function writeSubcategories(subcategories, categories = []) {
  const pool = await getMysqlPool()
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  for (const subcategory of subcategories) {
    const keywords = JSON.stringify(subcategory.keywords || [])
    let categoryId = null
    if (subcategory.categoryId != null && subcategory.categoryId !== '') {
      categoryId = Number(subcategory.categoryId)
    } else {
      const categorySlug = subcategory.parentCategory || subcategory.category || ''
      if (categorySlug) {
        const [categoryRows] = await pool.query('SELECT id FROM categories WHERE slug = ? LIMIT 1', [categorySlug])
        categoryId = categoryRows[0]?.id ? Number(categoryRows[0].id) : null
      }
    }

    if (!categoryId && Array.isArray(categories)) {
      const match = categories.find((category) => {
        const candidate = String(category.slug || category.name || '')
        return candidate && candidate === String(subcategory.parentCategory || subcategory.category || '')
      })
      if (match?.id != null) categoryId = Number(match.id)
    }

    await pool.query(
      `INSERT INTO subcategories
        (slug, name, description, bannerImage, icon, seoTitle, seoDescription, keywords, canonicalUrl, ogImage, status, sortOrder, categoryId, parentId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name),
         description=VALUES(description),
         bannerImage=VALUES(bannerImage),
         icon=VALUES(icon),
         seoTitle=VALUES(seoTitle),
         seoDescription=VALUES(seoDescription),
         keywords=VALUES(keywords),
         canonicalUrl=VALUES(canonicalUrl),
         ogImage=VALUES(ogImage),
         status=VALUES(status),
         sortOrder=VALUES(sortOrder),
         categoryId=VALUES(categoryId),
         parentId=VALUES(parentId),
         updatedAt=VALUES(updatedAt)
      `,
      [
        subcategory.slug,
        subcategory.name,
        subcategory.description || '',
        subcategory.bannerImage || subcategory.image || '',
        subcategory.icon || '',
        subcategory.seoTitle || '',
        subcategory.seoDescription || '',
        keywords,
        subcategory.canonicalUrl || '',
        subcategory.ogImage || subcategory.bannerImage || subcategory.image || '',
        subcategory.status || 'published',
        Number(subcategory.sortOrder || 0),
        categoryId,
        subcategory.parentId ? Number(subcategory.parentId) : null,
        now,
        now,
      ]
    )
  }
}

async function writeProducts(products) {
  const pool = await getMysqlPool()
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  for (const product of products) {
    const gallery = JSON.stringify(product.gallery || [])
    const certifications = JSON.stringify(product.certifications || [])
    const applications = JSON.stringify(product.applications || [])
    const packaging = JSON.stringify(product.packaging || [])
    const exportMarkets = JSON.stringify(product.exportMarkets || [])
    const specs = JSON.stringify(product.specs || [])
    const details = JSON.stringify(product.details || {})
    const keywords = JSON.stringify(product.keywords || [])
    const technicalSpecifications = JSON.stringify(product.technicalSpecifications || [])
    const industriesServed = JSON.stringify(product.industriesServed || [])
    const exportCountries = JSON.stringify(product.exportCountries || [])
    const faq = JSON.stringify(product.faq || [])
    const relatedProducts = JSON.stringify(product.relatedProducts || [])

    await pool.query(
      `INSERT INTO products
        (slug, name, category, subcategory, tagline, shortDescription, longDescription, hero, gallery, certifications, applications, packaging, exportMarkets, specs, details, status, featured, hsCode, origin, shelfLife, seasonAvailability, seoTitle, seoDescription, keywords, focusKeyword, productDescription, technicalSpecifications, industriesServed, exportCountries, faq, relatedProducts, canonicalUrl, ogImage, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name),
         category=VALUES(category),
         subcategory=VALUES(subcategory),
         tagline=VALUES(tagline),
         shortDescription=VALUES(shortDescription),
         longDescription=VALUES(longDescription),
         hero=VALUES(hero),
         gallery=VALUES(gallery),
         certifications=VALUES(certifications),
         applications=VALUES(applications),
         packaging=VALUES(packaging),
         exportMarkets=VALUES(exportMarkets),
         specs=VALUES(specs),
         details=VALUES(details),
         status=VALUES(status),
         featured=VALUES(featured),
         hsCode=VALUES(hsCode),
         origin=VALUES(origin),
         shelfLife=VALUES(shelfLife),
         seasonAvailability=VALUES(seasonAvailability),
         seoTitle=VALUES(seoTitle),
         seoDescription=VALUES(seoDescription),
         keywords=VALUES(keywords),
         focusKeyword=VALUES(focusKeyword),
         productDescription=VALUES(productDescription),
         technicalSpecifications=VALUES(technicalSpecifications),
         industriesServed=VALUES(industriesServed),
         exportCountries=VALUES(exportCountries),
         faq=VALUES(faq),
         relatedProducts=VALUES(relatedProducts),
         canonicalUrl=VALUES(canonicalUrl),
         ogImage=VALUES(ogImage),
         updatedAt=VALUES(updatedAt)
      `,
      [
        product.slug,
        product.name,
        product.category,
        product.subcategory || '',
        product.tagline || '',
        product.shortDescription || '',
        product.longDescription || '',
        product.hero || '',
        gallery,
        certifications,
        applications,
        packaging,
        exportMarkets,
        specs,
        details,
        product.status || 'published',
        product.featured ? 1 : 0,
        product.hsCode || '',
        product.origin || '',
        product.shelfLife || '',
        product.seasonAvailability || '',
        product.seoTitle || '',
        product.seoDescription || '',
        keywords,
        product.focusKeyword || '',
        product.productDescription || product.shortDescription || '',
        technicalSpecifications,
        industriesServed,
        exportCountries,
        faq,
        relatedProducts,
        product.canonicalUrl || '',
        product.ogImage || '',
        now,
        now,
      ]
    )

    const [productRows] = await pool.query('SELECT id FROM products WHERE slug = ? LIMIT 1', [product.slug])
    const productId = productRows[0]?.id
    if (productId) {
      await pool.query('DELETE FROM product_attribute_values WHERE productId = ?', [productId])
      const attributeValues = product.attributeValues || {}
      const [attributeRows] = await pool.query('SELECT id, slug FROM attributes')
      const attributeMap = new Map(attributeRows.map((attribute) => [attribute.slug, attribute.id]))
      for (const [slug, value] of Object.entries(attributeValues)) {
        const attributeId = attributeMap.get(slug)
        if (!attributeId) continue
        await pool.query(
          'INSERT INTO product_attribute_values (productId, attributeId, value, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
          [productId, attributeId, String(value ?? ''), now, now]
        )
      }
    }
  }
}

async function writeCategories(categories) {
  const pool = await getMysqlPool()
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  for (const category of categories) {
    const keywords = JSON.stringify(category.keywords || [])
    await pool.query(
      `INSERT INTO categories
        (slug, name, description, image, bannerImage, icon, seoTitle, seoDescription, keywords, canonicalUrl, ogImage, status, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name),
         description=VALUES(description),
         image=VALUES(image),
         bannerImage=VALUES(bannerImage),
         icon=VALUES(icon),
         seoTitle=VALUES(seoTitle),
         seoDescription=VALUES(seoDescription),
         keywords=VALUES(keywords),
         canonicalUrl=VALUES(canonicalUrl),
         ogImage=VALUES(ogImage),
         status=VALUES(status),
         sortOrder=VALUES(sortOrder),
         updatedAt=VALUES(updatedAt)
      `,
      [
        category.slug,
        category.name,
        category.description || '',
        category.image || category.bannerImage || '',
        category.bannerImage || category.image || '',
        category.icon || '',
        category.seoTitle || '',
        category.seoDescription || '',
        keywords,
        category.canonicalUrl || '',
        category.ogImage || category.bannerImage || category.image || '',
        category.status || 'published',
        Number(category.sortOrder || 0),
        now,
        now,
      ]
    )
  }
}

export async function getCategoriesFromDb() {
  const pool = await getMysqlPool()
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY sortOrder ASC, createdAt DESC')
  return rows.map(normalizeCategoryRow)
}

export async function getProductsFromDb() {
  const pool = await getMysqlPool()
  const [rows] = await pool.query('SELECT * FROM products ORDER BY createdAt DESC')
  const products = []
  for (const row of rows) {
    const product = normalizeProductRow(row)
    const [attributeRows] = await pool.query(
      'SELECT a.slug, pav.value FROM product_attribute_values pav JOIN attributes a ON a.id = pav.attributeId WHERE pav.productId = ? ORDER BY a.sortOrder ASC',
      [row.id]
    )
    product.attributeValues = Object.fromEntries(attributeRows.map((attribute) => [attribute.slug, attribute.value]))
    products.push(product)
  }
  return products
}

export async function getProductBySlugFromDb(slug) {
  const pool = await getMysqlPool()
  const [rows] = await pool.query('SELECT * FROM products WHERE slug = ? LIMIT 1', [slug])
  if (!rows.length) return null
  const product = normalizeProductRow(rows[0])
  const [attributeRows] = await pool.query(
    'SELECT a.slug, pav.value FROM product_attribute_values pav JOIN attributes a ON a.id = pav.attributeId WHERE pav.productId = ? ORDER BY a.sortOrder ASC',
    [rows[0].id]
  )
  product.attributeValues = Object.fromEntries(attributeRows.map((attribute) => [attribute.slug, attribute.value]))
  return product
}

async function syncPimEntities(catalog) {
  const categories = Array.isArray(catalog.categories) ? catalog.categories : []
  const subcategories = Array.isArray(catalog.subcategories) ? catalog.subcategories : []
  const attributes = Array.isArray(catalog.attributes) ? catalog.attributes : []
  const packagingTypes = Array.isArray(catalog.packagingTypes) ? catalog.packagingTypes : []
  const exportCountries = Array.isArray(catalog.exportCountries) ? catalog.exportCountries : []

  for (const category of categories) {
    if (category.id) {
      await updatePimCategory(category.id, category)
    } else {
      await createPimCategory(category)
    }
  }

  for (const subcategory of subcategories) {
    if (subcategory.id) {
      await updatePimSubcategory(subcategory.id, subcategory)
    } else {
      await createPimSubcategory(subcategory)
    }
  }

  for (const attribute of attributes) {
    if (attribute.id) {
      await updatePimAttribute(attribute.id, attribute)
    } else {
      await createPimAttribute(attribute)
    }
  }

  for (const packagingType of packagingTypes) {
    if (packagingType.id) {
      await updatePimPackagingType(packagingType.id, packagingType)
    } else {
      await createPimPackagingType(packagingType)
    }
  }

  for (const country of exportCountries) {
    if (country.id) {
      await updatePimExportCountry(country.id, country)
    } else {
      await createPimExportCountry(country)
    }
  }
}

export async function saveCatalogData(catalog) {
  const normalizedCatalog = normalizeCatalogForSave(catalog)
  const { categories, products, subcategories, attributes, packagingTypes, exportCountries } = normalizedCatalog

  await writeCategories(categories)
  await writeSubcategories(subcategories, categories)
  await writeProducts(products)
  await syncPimEntities({ categories, subcategories, attributes, packagingTypes, exportCountries })
  await writeCatalogFile({ categories, products, subcategories, attributes, packagingTypes, exportCountries })
  return { categories, products, subcategories, attributes, packagingTypes, exportCountries }
}

export function clearCatalogCache() {
  catalogCache = null
  catalogCacheAt = 0
}

export async function getCatalogData() {
  const fileCatalog = await readFileCatalog()
  const hasFileCatalog = (fileCatalog.categories?.length || 0) > 0 || (fileCatalog.products?.length || 0) > 0

  if (hasFileCatalog) {
    const fileSubcategories = Array.isArray(fileCatalog.subcategories) ? fileCatalog.subcategories : []
    const fileAttributes = Array.isArray(fileCatalog.attributes) ? fileCatalog.attributes : []
    const filePackagingTypes = Array.isArray(fileCatalog.packagingTypes) ? fileCatalog.packagingTypes : []
    const fileExportCountries = Array.isArray(fileCatalog.exportCountries) ? fileCatalog.exportCountries : []

    return {
      categories: Array.isArray(fileCatalog.categories) ? fileCatalog.categories : [],
      products: Array.isArray(fileCatalog.products) ? fileCatalog.products : [],
      subcategories: fileSubcategories,
      attributes: fileAttributes,
      packagingTypes: filePackagingTypes,
      exportCountries: fileExportCountries,
    }
  }

  const [categories, products, subcategories, attributes, packagingTypes, exportCountries] = await Promise.all([
    getCategoriesFromDb(),
    getProductsFromDb(),
    listSubcategories(),
    listAttributes(),
    listPackagingTypes(),
    listExportCountries(),
  ])

  return { categories, products, subcategories, attributes, packagingTypes, exportCountries }
}

// Product CRUD
export async function createProduct(product) {
  const pool = await getMysqlPool()
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const gallery = JSON.stringify(product.gallery || [])
  const certifications = JSON.stringify(product.certifications || [])
  const applications = JSON.stringify(product.applications || [])
  const packaging = JSON.stringify(product.packaging || [])
  const exportMarkets = JSON.stringify(product.exportMarkets || [])
  const specs = JSON.stringify(product.specs || [])
  const details = JSON.stringify(product.details || {})
  const keywords = JSON.stringify(product.keywords || [])
  const technicalSpecifications = JSON.stringify(product.technicalSpecifications || [])
  const industriesServed = JSON.stringify(product.industriesServed || [])
  const exportCountries = JSON.stringify(product.exportCountries || [])
  const faq = JSON.stringify(product.faq || [])
  const relatedProducts = JSON.stringify(product.relatedProducts || [])

  const [result] = await pool.query(
    `INSERT INTO products
      (slug, name, category, subcategory, tagline, shortDescription, longDescription, hero, gallery, certifications, applications, packaging, exportMarkets, specs, details, status, featured, hsCode, origin, shelfLife, seasonAvailability, seoTitle, seoDescription, keywords, focusKeyword, productDescription, technicalSpecifications, industriesServed, exportCountries, faq, relatedProducts, canonicalUrl, ogImage, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.slug,
      product.name,
      product.category || '',
      product.subcategory || '',
      product.tagline || '',
      product.shortDescription || '',
      product.longDescription || '',
      product.hero || '',
      gallery,
      certifications,
      applications,
      packaging,
      exportMarkets,
      specs,
      details,
      product.status || 'published',
      product.featured ? 1 : 0,
      product.hsCode || '',
      product.origin || '',
      product.shelfLife || '',
      product.seasonAvailability || '',
      product.seoTitle || '',
      product.seoDescription || '',
      keywords,
      product.focusKeyword || '',
      product.productDescription || product.shortDescription || '',
      technicalSpecifications,
      industriesServed,
      exportCountries,
      faq,
      relatedProducts,
      product.canonicalUrl || '',
      product.ogImage || '',
      now,
      now,
    ]
  )

  const insertId = result?.insertId
  return getProductBySlugFromDb(product.slug)
}

export async function updateProductBySlug(slug, product) {
  const pool = await getMysqlPool()
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const gallery = JSON.stringify(product.gallery || [])
  const certifications = JSON.stringify(product.certifications || [])
  const applications = JSON.stringify(product.applications || [])
  const packaging = JSON.stringify(product.packaging || [])
  const exportMarkets = JSON.stringify(product.exportMarkets || [])
  const specs = JSON.stringify(product.specs || [])
  const details = JSON.stringify(product.details || {})
  const keywords = JSON.stringify(product.keywords || [])
  const technicalSpecifications = JSON.stringify(product.technicalSpecifications || [])
  const industriesServed = JSON.stringify(product.industriesServed || [])
  const exportCountries = JSON.stringify(product.exportCountries || [])
  const faq = JSON.stringify(product.faq || [])
  const relatedProducts = JSON.stringify(product.relatedProducts || [])

  await pool.query(
    `UPDATE products SET
      slug = ?, name = ?, category = ?, subcategory = ?, tagline = ?, shortDescription = ?, longDescription = ?, hero = ?, gallery = ?, certifications = ?, applications = ?, packaging = ?, exportMarkets = ?, specs = ?, details = ?, status = ?, featured = ?, hsCode = ?, origin = ?, shelfLife = ?, seasonAvailability = ?, seoTitle = ?, seoDescription = ?, keywords = ?, focusKeyword = ?, productDescription = ?, technicalSpecifications = ?, industriesServed = ?, exportCountries = ?, faq = ?, relatedProducts = ?, canonicalUrl = ?, ogImage = ?, updatedAt = ?
     WHERE slug = ?`,
    [
      product.slug,
      product.name,
      product.category || '',
      product.subcategory || '',
      product.tagline || '',
      product.shortDescription || '',
      product.longDescription || '',
      product.hero || '',
      gallery,
      certifications,
      applications,
      packaging,
      exportMarkets,
      specs,
      details,
      product.status || 'published',
      product.featured ? 1 : 0,
      product.hsCode || '',
      product.origin || '',
      product.shelfLife || '',
      product.seasonAvailability || '',
      product.seoTitle || '',
      product.seoDescription || '',
      keywords,
      product.focusKeyword || '',
      product.productDescription || product.shortDescription || '',
      technicalSpecifications,
      industriesServed,
      exportCountries,
      faq,
      relatedProducts,
      product.canonicalUrl || '',
      product.ogImage || '',
      now,
      slug,
    ]
  )

  return getProductBySlugFromDb(product.slug)
}

export async function deleteProductBySlug(slug) {
  const pool = await getMysqlPool()
  await pool.query('DELETE FROM products WHERE slug = ?', [slug])
  return true
}

// Category CRUD
export async function createCategory(category) {
  const pool = await getMysqlPool()
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const keywords = JSON.stringify(category.keywords || [])
  await pool.query(
    `INSERT INTO categories (slug, name, description, image, seoTitle, seoDescription, keywords, canonicalUrl, ogImage, status, sortOrder, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      category.slug,
      category.name,
      category.description || '',
      category.image || '',
      category.seoTitle || '',
      category.seoDescription || '',
      keywords,
      category.canonicalUrl || '',
      category.ogImage || category.bannerImage || category.image || '',
      category.status || 'published',
      Number(category.sortOrder || 0),
      now,
      now,
    ]
  )
  return getCategoriesFromDb()
}

export async function updateCategoryBySlug(slug, category) {
  const pool = await getMysqlPool()
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const keywords = JSON.stringify(category.keywords || [])
  await pool.query(
    `UPDATE categories SET slug = ?, name = ?, description = ?, image = ?, bannerImage = ?, icon = ?, seoTitle = ?, seoDescription = ?, keywords = ?, canonicalUrl = ?, ogImage = ?, status = ?, sortOrder = ?, updatedAt = ? WHERE slug = ?`,
    [
      category.slug,
      category.name,
      category.description || '',
      category.image || '',
      category.seoTitle || '',
      category.seoDescription || '',
      keywords,
      category.canonicalUrl || '',
      category.ogImage || category.bannerImage || category.image || '',
      category.status || 'published',
      Number(category.sortOrder || 0),
      now,
      slug,
    ]
  )
  return getCategoriesFromDb()
}

export async function deleteCategoryBySlug(slug) {
  const pool = await getMysqlPool()
  await pool.query('DELETE FROM categories WHERE slug = ?', [slug])
  return true
}
