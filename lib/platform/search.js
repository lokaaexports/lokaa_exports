import prisma from '@/lib/prisma'
import { getMysqlPool } from '@/lib/mysql-client'

function like(value) {
  return `%${String(value || '').trim()}%`
}

function normalizeMysqlItem(type, row) {
  return {
    source: 'mysql',
    type,
    id: String(row.id),
    title: row.name || row.full_name || row.company_name || row.fullName || row.email || row.title || row.reference || row.slug,
    subtitle: row.slug || row.email || row.customer_number || row.reference || row.country || row.status || '',
    href: row.slug ? `/${type}/${row.slug}` : null,
    raw: row,
  }
}

function normalizePrismaProduct(row) {
  return {
    source: 'prisma',
    type: 'products',
    id: String(row.id),
    title: row.productName || row.slug,
    subtitle: row.slug || row.category?.slug || row.status || '',
    href: row.slug ? `/products/${row.slug}` : null,
    raw: row,
  }
}

function normalizePrismaCategory(row, type = 'categories') {
  return {
    source: 'prisma',
    type,
    id: String(row.id),
    title: row.name || row.slug,
    subtitle: row.slug || row.status || '',
    href: row.slug ? `/category/${row.slug}` : null,
    raw: row,
  }
}

export async function globalSearch(query, { limit = 25 } = {}) {
  const term = String(query || '').trim()
  if (!term) return []

  const pool = await getMysqlPool()
  const searchLike = like(term)

  const [products, categories, subcategories, rfqs, customers, exportCountries, mysqlUsers, prismaUsers, companies] = await Promise.all([
    prisma.dynamicProduct.findMany({
      where: {
        OR: [
          { productName: { contains: term, mode: 'insensitive' } },
          { slug: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { shortDescription: { contains: term, mode: 'insensitive' } },
          { hsnCode: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: { category: true, subcategory: true },
    }),
    prisma.productCategory.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { slug: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
    }),
    prisma.productSubcategory.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { slug: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: { category: true },
    }),
    pool.query('SELECT id, reference, fullName, email, country, status FROM rfqs WHERE reference LIKE ? OR fullName LIKE ? OR email LIKE ? OR country LIKE ? LIMIT ?', [searchLike, searchLike, searchLike, searchLike, limit]).then(([rows]) => rows),
    pool.query('SELECT id, customer_number, full_name, company_name, email, country, status FROM customers WHERE full_name LIKE ? OR company_name LIKE ? OR email LIKE ? OR country LIKE ? LIMIT ?', [searchLike, searchLike, searchLike, searchLike, limit]).then(([rows]) => rows),
    pool.query('SELECT id, slug, name, code FROM export_countries WHERE name LIKE ? OR code LIKE ? OR slug LIKE ? LIMIT ?', [searchLike, searchLike, searchLike, limit]).then(([rows]) => rows),
    pool.query('SELECT id, email, name, role, status FROM users WHERE email LIKE ? OR name LIKE ? LIMIT ?', [searchLike, searchLike, limit]).then(([rows]) => rows),
    prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: term, mode: 'insensitive' } },
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: { role: true },
    }),
    prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { website: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
    }),
  ])

  return [
    ...products.map((row) => normalizePrismaProduct(row)),
    ...categories.map((row) => normalizePrismaCategory(row, 'categories')),
    ...subcategories.map((row) => normalizePrismaCategory(row, 'subcategories')),
    ...rfqs.map((row) => normalizeMysqlItem('rfqs', row)),
    ...customers.map((row) => normalizeMysqlItem('customers', row)),
    ...exportCountries.map((row) => normalizeMysqlItem('countries', row)),
    ...mysqlUsers.map((row) => normalizeMysqlItem('users', row)),
    ...prismaUsers.map((user) => ({
      source: 'prisma',
      type: 'admin-users',
      id: user.id,
      title: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      subtitle: user.role?.name || user.status || '',
      href: '/admin/employees',
      raw: user,
    })),
    ...companies.map((company) => ({
      source: 'prisma',
      type: 'companies',
      id: company.id,
      title: company.name,
      subtitle: company.website || company.email || '',
      href: '/admin/settings',
      raw: company,
    })),
  ].slice(0, limit * 3)
}
