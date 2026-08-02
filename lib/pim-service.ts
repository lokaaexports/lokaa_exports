import { getMysqlPool } from './mysql-client'

function parseJsonField(value: any, fallback: any) {
  try {
    return typeof value === 'string' && value.length ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function toSqlDate(value = new Date()) {
  return new Date(value).toISOString().slice(0, 19).replace('T', ' ')
}

function normalizeCategoryRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    bannerImage: row.bannerImage || '',
    image: row.image || row.bannerImage || '',
    icon: row.icon || '',
    seoTitle: row.seoTitle || '',
    seoDescription: row.seoDescription || '',
    canonicalUrl: row.canonicalUrl || '',
    ogImage: row.ogImage || row.bannerImage || '',
    status: row.status || 'published',
    sortOrder: Number(row.sortOrder || 0),
    parentCategoryId: row.parentCategoryId ? Number(row.parentCategoryId) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function normalizeSubcategoryRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    bannerImage: row.bannerImage || '',
    image: row.image || row.bannerImage || '',
    icon: row.icon || '',
    seoTitle: row.seoTitle || '',
    seoDescription: row.seoDescription || '',
    keywords: parseJsonField(row.keywords, []),
    canonicalUrl: row.canonicalUrl || '',
    ogImage: row.ogImage || row.bannerImage || '',
    status: row.status || 'published',
    sortOrder: Number(row.sortOrder || 0),
    categoryId: row.categoryId ? Number(row.categoryId) : null,
    parentId: row.parentId ? Number(row.parentId) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function normalizeAttributeRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    attributeType: row.attributeType || 'text',
    units: row.units || '',
    validation: row.validation || '',
    required: Boolean(row.required),
    applicableCategories: parseJsonField(row.applicableCategories, []),
    status: row.status || 'published',
    sortOrder: Number(row.sortOrder || 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function normalizeSimpleEntityRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    status: row.status || 'published',
    sortOrder: Number(row.sortOrder || 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function normalizeCountryRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    code: row.code || '',
    status: row.status || 'published',
    sortOrder: Number(row.sortOrder || 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function listCategories() {
  const pool = await getMysqlPool()
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY sortOrder ASC, createdAt DESC')
  return rows.map(normalizeCategoryRow)
}

export async function createCategory(payload: any) {
  const pool = await getMysqlPool()
  const now = toSqlDate()
  await pool.query(
    `INSERT INTO categories (slug, name, description, image, bannerImage, icon, seoTitle, seoDescription, canonicalUrl, ogImage, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.slug || '',
      payload.name || '',
      payload.description || '',
      payload.image || payload.bannerImage || '',
      payload.bannerImage || payload.image || '',
      payload.icon || '',
      payload.seoTitle || '',
      payload.seoDescription || '',
      payload.canonicalUrl || '',
      payload.ogImage || payload.bannerImage || payload.image || '',
      payload.status || 'published',
      now,
      now,
    ]
  )
  return listCategories()
}

export async function updateCategory(id: any, payload: any) {
  const pool = await getMysqlPool()
  const now = toSqlDate()
  await pool.query(
    `UPDATE categories SET slug = ?, name = ?, description = ?, image = ?, bannerImage = ?, icon = ?, seoTitle = ?, seoDescription = ?, canonicalUrl = ?, ogImage = ?, status = ?, updatedAt = ? WHERE id = ?`,
    [
      payload.slug || '',
      payload.name || '',
      payload.description || '',
      payload.image || payload.bannerImage || '',
      payload.bannerImage || payload.image || '',
      payload.icon || '',
      payload.seoTitle || '',
      payload.seoDescription || '',
      payload.canonicalUrl || '',
      payload.ogImage || payload.bannerImage || payload.image || '',
      payload.status || 'published',
      now,
      Number(id),
    ]
  )
  return listCategories()
}

export async function deleteCategory(id: any) {
  const pool = await getMysqlPool()
  await pool.query('DELETE FROM categories WHERE id = ?', [Number(id)])
  return true
}

export async function listSubcategories() {
  const pool = await getMysqlPool()
  const [rows] = await pool.query('SELECT * FROM subcategories ORDER BY sortOrder ASC, createdAt DESC')
  return rows.map(normalizeSubcategoryRow)
}

export async function createSubcategory(payload: any) {
  const pool = await getMysqlPool()
  const now = toSqlDate()
  await pool.query(
    `INSERT INTO subcategories (slug, name, description, bannerImage, icon, seoTitle, seoDescription, keywords, canonicalUrl, ogImage, status, sortOrder, categoryId, parentId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.slug || '',
      payload.name || '',
      payload.description || '',
      payload.bannerImage || payload.image || '',
      payload.icon || '',
      payload.seoTitle || '',
      payload.seoDescription || '',
      JSON.stringify(payload.keywords || []),
      payload.canonicalUrl || '',
      payload.ogImage || payload.bannerImage || payload.image || '',
      payload.status || 'published',
      Number(payload.sortOrder || 0),
      payload.categoryId ? Number(payload.categoryId) : null,
      payload.parentId ? Number(payload.parentId) : null,
      now,
      now,
    ]
  )
  return listSubcategories()
}

export async function updateSubcategory(id: any, payload: any) {
  const pool = await getMysqlPool()
  const now = toSqlDate()
  await pool.query(
    `UPDATE subcategories SET slug = ?, name = ?, description = ?, bannerImage = ?, icon = ?, seoTitle = ?, seoDescription = ?, keywords = ?, canonicalUrl = ?, ogImage = ?, status = ?, sortOrder = ?, categoryId = ?, parentId = ?, updatedAt = ? WHERE id = ?`,
    [
      payload.slug || '',
      payload.name || '',
      payload.description || '',
      payload.bannerImage || payload.image || '',
      payload.icon || '',
      payload.seoTitle || '',
      payload.seoDescription || '',
      JSON.stringify(payload.keywords || []),
      payload.canonicalUrl || '',
      payload.ogImage || payload.bannerImage || payload.image || '',
      payload.status || 'published',
      Number(payload.sortOrder || 0),
      payload.categoryId ? Number(payload.categoryId) : null,
      payload.parentId ? Number(payload.parentId) : null,
      now,
      Number(id),
    ]
  )
  return listSubcategories()
}

export async function deleteSubcategory(id: any) {
  const pool = await getMysqlPool()
  await pool.query('DELETE FROM subcategories WHERE id = ?', [Number(id)])
  return true
}

export async function listAttributes() {
  const pool = await getMysqlPool()
  const [rows] = await pool.query('SELECT * FROM attributes ORDER BY sortOrder ASC, createdAt DESC')
  return rows.map(normalizeAttributeRow)
}

export async function createAttribute(payload: any) {
  const pool = await getMysqlPool()
  const now = toSqlDate()
  await pool.query(
    `INSERT INTO attributes (slug, name, attributeType, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payload.slug || '',
      payload.name || '',
      payload.attributeType || 'text',
      payload.status || 'published',
      now,
      now,
    ]
  )
  return listAttributes()
}

export async function updateAttribute(id: any, payload: any) {
  const pool = await getMysqlPool()
  const now = toSqlDate()
  await pool.query(
    `UPDATE attributes SET slug = ?, name = ?, attributeType = ?, status = ?, updatedAt = ? WHERE id = ?`,
    [
      payload.slug || '',
      payload.name || '',
      payload.attributeType || 'text',
      payload.status || 'published',
      now,
      Number(id),
    ]
  )
  return listAttributes()
}

export async function deleteAttribute(id: any) {
  const pool = await getMysqlPool()
  await pool.query('DELETE FROM attributes WHERE id = ?', [Number(id)])
  return true
}

export async function listPackagingTypes() {
  const pool = await getMysqlPool()
  const [rows] = await pool.query('SELECT * FROM packaging_types ORDER BY sortOrder ASC, createdAt DESC')
  return rows.map(normalizeSimpleEntityRow)
}

export async function createPackagingType(payload: any) {
  const pool = await getMysqlPool()
  const now = toSqlDate()
  await pool.query(
    `INSERT INTO packaging_types (slug, name, description, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [payload.slug || '', payload.name || '', payload.description || '', payload.status || 'published', now, now]
  )
  return listPackagingTypes()
}

export async function updatePackagingType(id: any, payload: any) {
  const pool = await getMysqlPool()
  const now = toSqlDate()
  await pool.query(
    `UPDATE packaging_types SET slug = ?, name = ?, description = ?, status = ?, updatedAt = ? WHERE id = ?`,
    [payload.slug || '', payload.name || '', payload.description || '', payload.status || 'published', now, Number(id)]
  )
  return listPackagingTypes()
}

export async function deletePackagingType(id: any) {
  const pool = await getMysqlPool()
  await pool.query('DELETE FROM packaging_types WHERE id = ?', [Number(id)])
  return true
}

export async function listExportCountries() {
  const pool = await getMysqlPool()
  const [rows] = await pool.query('SELECT * FROM export_countries ORDER BY sortOrder ASC, createdAt DESC')
  return rows.map(normalizeCountryRow)
}

export async function createExportCountry(payload: any) {
  const pool = await getMysqlPool()
  const now = toSqlDate()
  await pool.query(
    `INSERT INTO export_countries (slug, name, code, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [payload.slug || '', payload.name || '', payload.code || '', payload.status || 'published', now, now]
  )
  return listExportCountries()
}

export async function updateExportCountry(id: any, payload: any) {
  const pool = await getMysqlPool()
  const now = toSqlDate()
  await pool.query(
    `UPDATE export_countries SET slug = ?, name = ?, code = ?, status = ?, updatedAt = ? WHERE id = ?`,
    [payload.slug || '', payload.name || '', payload.code || '', payload.status || 'published', now, Number(id)]
  )
  return listExportCountries()
}

export async function deleteExportCountry(id: any) {
  const pool = await getMysqlPool()
  await pool.query('DELETE FROM export_countries WHERE id = ?', [Number(id)])
  return true
}
