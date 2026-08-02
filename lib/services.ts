import prisma from '@/lib/prisma'
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

function normalizeProductRow(row: any) {
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
    ogImage: row.ogImage,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function normalizePrismaProductRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.productName,
    category: row.category?.slug || row.categoryId || '',
    subcategory: row.subcategory?.slug || row.subcategoryId || '',
    tagline: row.shortDescription || row.exportDescription || '',
    shortDescription: row.shortDescription || '',
    longDescription: row.description || '',
    hero: row.mainImage || '',
    gallery: Array.isArray(row.images) ? row.images.map((image) => image.imageUrl).filter(Boolean) : [],
    certifications: Array.isArray(row.certifications) ? row.certifications : [],
    applications: [],
    packaging: Array.isArray(row.packaging) ? row.packaging : [],
    exportMarkets: [],
    specs: Array.isArray(row.specifications) ? row.specifications : [],
    details: {},
    status: row.status,
    featured: Boolean(row.isFeatured),
    hsCode: row.hsnCode || '',
    origin: '',
    shelfLife: '',
    seasonAvailability: '',
    seoTitle: row.seo?.metaTitle || '',
    seoDescription: row.seo?.metaDescription || '',
    keywords: row.seo?.metaKeywords ? String(row.seo.metaKeywords).split(',').map((entry) => entry.trim()).filter(Boolean) : [],
    ogImage: row.seo?.ogImage || row.mainImage || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function normalizePrismaCategoryRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    image: row.image || '',
    seoTitle: '',
    seoDescription: '',
    keywords: [],
    status: row.status,
    sortOrder: row.displayOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function normalizeCategoryRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    keywords: parseJsonField(row.keywords, []),
    status: row.status,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function normalizeRfqRow(row: any) {
  return {
    ...row,
    attachments: parseJsonField(row.attachments, []),
    history: parseJsonField(row.history, []),
    fullName: row.fullName || row.contactPerson || '',
    message: row.message || row.notes || '',
    targetPrice: row.targetPrice || '',
    preferredCurrency: row.preferredCurrency || 'USD',
    shipmentDate: row.shipmentDate || '',
    customSpecifications: row.customSpecifications || '',
    sourcePage: row.sourcePage || '',
    ipAddress: row.ipAddress || 'unknown',
  }
}

export class ProductService {
  async list() {
    const rows = await prisma.dynamicProduct.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        subcategory: true,
        images: { orderBy: { displayOrder: 'asc' } },
        seo: true,
        exportInfo: true,
        packaging: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
        certifications: true,
        specifications: { orderBy: { displayOrder: 'asc' } },
      },
    })
    return rows.map(normalizePrismaProductRow)
  }

  async getBySlug(slug: any) {
    const row = await prisma.dynamicProduct.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        images: { orderBy: { displayOrder: 'asc' } },
        seo: true,
        exportInfo: true,
        packaging: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
        certifications: true,
        specifications: { orderBy: { displayOrder: 'asc' } },
      },
    })
    return row ? normalizePrismaProductRow(row) : null
  }

  async create(product: any) {
    await prisma.dynamicProduct.create({
      data: {
        slug: product.slug,
        productName: product.name,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || null,
        templateId: product.templateId,
        shortDescription: product.shortDescription || null,
        description: product.longDescription || null,
        exportDescription: product.exportDescription || null,
        mainImage: product.hero || null,
        hsnCode: product.hsCode || null,
        status: product.status || 'draft',
        isFeatured: Boolean(product.featured),
      },
    })

    return this.getBySlug(product.slug)
  }

  async upsert(product: any) {
    const existing = await this.getBySlug(product.slug)
    if (existing) {
      return this.updateBySlug(product.slug, product)
    }
    return this.create(product)
  }

  async updateBySlug(slug: any, product: any) {
    await prisma.dynamicProduct.update({
      where: { slug },
      data: {
        slug: product.slug,
        productName: product.name,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || null,
        templateId: product.templateId,
        shortDescription: product.shortDescription || null,
        description: product.longDescription || null,
        exportDescription: product.exportDescription || null,
        mainImage: product.hero || null,
        hsnCode: product.hsCode || null,
        status: product.status || 'draft',
        isFeatured: Boolean(product.featured),
      },
    })

    return this.getBySlug(product.slug)
  }

  async deleteBySlug(slug: any) {
    await prisma.dynamicProduct.delete({ where: { slug } })
    return true
  }
}

export class CategoryService {
  async list() {
    const rows = await prisma.productCategory.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })
    return rows.map(normalizePrismaCategoryRow)
  }

  async getBySlug(slug: any) {
    const row = await prisma.productCategory.findUnique({ where: { slug } })
    return row ? normalizePrismaCategoryRow(row) : null
  }

  async create(category: any) {
    await prisma.productCategory.create({
      data: {
        slug: category.slug,
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        status: category.status || 'published',
        displayOrder: Number(category.sortOrder || 0),
      },
    })
    return this.list()
  }

  async upsert(category: any) {
    const existing = await this.getBySlug(category.slug)
    if (existing) {
      return this.updateBySlug(category.slug, category)
    }
    return this.create(category)
  }

  async updateBySlug(slug: any, category: any) {
    await prisma.productCategory.update({
      where: { slug },
      data: {
        slug: category.slug,
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        status: category.status || 'published',
        displayOrder: Number(category.sortOrder || 0),
      },
    })
    return this.list()
  }

  async deleteBySlug(slug: any) {
    await prisma.productCategory.delete({ where: { slug } })
    return true
  }
}

export class RFQService {
  async list(limit = 200) {
    const pool = await getMysqlPool()
    const [rows] = await pool.query('SELECT * FROM rfqs ORDER BY createdAt DESC LIMIT ?', [limit])
    return rows.map(normalizeRfqRow)
  }

  async create(rfq: any) {
    const pool = await getMysqlPool()
    const now = toSqlDate(rfq.createdAt || new Date())
    await pool.query(
      `INSERT INTO rfqs (id, reference, company, contactPerson, fullName, email, phone, country, productInterest, quantity, packaging, destinationPort, shippingTerms, notes, message, attachments, status, priority, assignedSalesPerson, followUpDate, history, targetPrice, preferredCurrency, shipmentDate, customSpecifications, sourcePage, ipAddress, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        rfq.id,
        rfq.reference,
        rfq.company || '',
        rfq.contactPerson || rfq.fullName || '',
        rfq.fullName || rfq.contactPerson || '',
        rfq.email || '',
        rfq.phone || '',
        rfq.country || '',
        rfq.productInterest || '',
        rfq.quantity || '',
        rfq.packaging || '',
        rfq.destinationPort || '',
        rfq.shippingTerms || '',
        rfq.notes || rfq.message || '',
        rfq.message || rfq.notes || '',
        JSON.stringify(rfq.attachments || []),
        rfq.status || 'new',
        rfq.priority || 'normal',
        rfq.assignedSalesPerson || '',
        rfq.followUpDate || '',
        JSON.stringify(rfq.history || []),
        rfq.targetPrice || '',
        rfq.preferredCurrency || 'USD',
        rfq.shipmentDate || '',
        rfq.customSpecifications || '',
        rfq.sourcePage || '',
        rfq.ipAddress || 'unknown',
        now,
        now,
      ]
    )
    return this.getById(rfq.id)
  }

  async updateById(id: any, updates: Record<string, any> = {}) {
    const pool = await getMysqlPool()
    const now = toSqlDate()
    const existing = await this.getById(id)
    if (!existing) return null

    const fields = []
    const values = []

    const pushValue = (field, value) => {
      if (value === undefined) return
      fields.push(`${field} = ?`)
      values.push(value)
    }

    const history = Array.isArray(existing.history) ? [...existing.history] : []

    if (updates.status && updates.status !== existing.status) {
      history.push({ timestamp: now, type: 'status', detail: `Status changed from ${existing.status || 'new'} to ${updates.status}` })
    }
    if (updates.priority && updates.priority !== existing.priority) {
      history.push({ timestamp: now, type: 'priority', detail: `Priority changed from ${existing.priority || 'normal'} to ${updates.priority}` })
    }
    if (updates.assignedSalesPerson && updates.assignedSalesPerson !== existing.assignedSalesPerson) {
      history.push({ timestamp: now, type: 'assignment', detail: `Assigned to ${updates.assignedSalesPerson}` })
    }
    if (updates.followUpDate && updates.followUpDate !== existing.followUpDate) {
      history.push({ timestamp: now, type: 'follow_up', detail: `Follow-up date set to ${updates.followUpDate}` })
    }
    if (updates.notes && updates.notes !== existing.notes) {
      history.push({ timestamp: now, type: 'notes', detail: 'Notes updated' })
    }

    pushValue('status', updates.status)
    pushValue('priority', updates.priority)
    pushValue('assignedSalesPerson', updates.assignedSalesPerson)
    pushValue('followUpDate', updates.followUpDate)
    pushValue('notes', updates.notes)
    pushValue('message', updates.message)
    pushValue('targetPrice', updates.targetPrice)
    pushValue('preferredCurrency', updates.preferredCurrency)
    pushValue('shipmentDate', updates.shipmentDate)
    pushValue('customSpecifications', updates.customSpecifications)
    pushValue('sourcePage', updates.sourcePage)
    pushValue('ipAddress', updates.ipAddress)
    if (history.length !== (Array.isArray(existing.history) ? existing.history.length : 0)) {
      pushValue('history', JSON.stringify(history))
    }
    pushValue('updatedAt', now)

    if (!fields.length) {
      return this.getById(id)
    }

    await pool.query(`UPDATE rfqs SET ${fields.join(', ')} WHERE id = ?`, [...values, id])
    return this.getById(id)
  }

  async getById(id: any) {
    const pool = await getMysqlPool()
    const [rows] = await pool.query('SELECT * FROM rfqs WHERE id = ? LIMIT 1', [id])
    return rows.length ? normalizeRfqRow(rows[0]) : null
  }

  async count() {
    const pool = await getMysqlPool()
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM rfqs')
    return Number(total || 0)
  }

  async countByStatus(statuses = []) {
    if (!Array.isArray(statuses) || statuses.length === 0) return 0
    const pool = await getMysqlPool()
    const placeholders = statuses.map(() => '?').join(', ')
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM rfqs WHERE status IN (${placeholders})`, statuses)
    return Number(rows[0]?.total || 0)
  }
}

export class CustomerService {
  async list() {
    const pool = await getMysqlPool()
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY createdAt DESC')
    return rows
  }

  async getByEmail(email: any) {
    const pool = await getMysqlPool()
    const [rows] = await pool.query('SELECT * FROM customers WHERE email = ? LIMIT 1', [email])
    return rows[0] || null
  }

  async create(customer: any) {
    const pool = await getMysqlPool()
    const now = toSqlDate()
    await pool.query(
      `INSERT INTO customers (id, email, name, company, phone, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
      [customer.id, customer.email, customer.name || '', customer.company || '', customer.phone || '', customer.status || 'active', now, now]
    )
    return this.getByEmail(customer.email)
  }

  async updateById(id: any, customer: any) {
    const pool = await getMysqlPool()
    const now = toSqlDate()
    await pool.query(
      `UPDATE customers SET email = ?, name = ?, company = ?, phone = ?, status = ?, updatedAt = ? WHERE id = ?`,
      [customer.email, customer.name || '', customer.company || '', customer.phone || '', customer.status || 'active', now, id]
    )
    return this.getByEmail(customer.email)
  }

  async upsertByEmail(customer: any) {
    const existing = await this.getByEmail(customer.email)
    if (existing) {
      return this.updateById(existing.id, customer)
    }
    return this.create(customer)
  }

  async count() {
    const pool = await getMysqlPool()
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM customers')
    return Number(total || 0)
  }
}

export class BlogService {
  async list() {
    const pool = await getMysqlPool()
    const [rows] = await pool.query('SELECT * FROM blogs ORDER BY createdAt DESC')
    return rows
  }

  async getBySlug(slug: any) {
    const pool = await getMysqlPool()
    const [rows] = await pool.query('SELECT * FROM blogs WHERE slug = ? LIMIT 1', [slug])
    return rows[0] || null
  }

  async create(blog: any) {
    const pool = await getMysqlPool()
    const now = toSqlDate()
    await pool.query(
      `INSERT INTO blogs (id, slug, title, excerpt, content, authorId, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [blog.id, blog.slug, blog.title, blog.excerpt || '', blog.content || '', blog.authorId || '', blog.status || 'draft', now, now]
    )
    return this.getBySlug(blog.slug)
  }

  async count() {
    const pool = await getMysqlPool()
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM blogs')
    return Number(total || 0)
  }
}

export const productService = new ProductService()
export const categoryService = new CategoryService()
export const rfqService = new RFQService()
export const customerService = new CustomerService()
export const blogService = new BlogService()
