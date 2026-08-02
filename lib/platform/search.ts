import prisma from '@/lib/prisma'
import { getMysqlPool } from '@/lib/mysql-client'

function like(value: any) {
  return `%${String(value || '').trim()}%`
}

function normalizeMysqlItem(type: any, row: any) {
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

function normalizePrismaProduct(row: any) {
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

function normalizePrismaCategory(row: any, type = 'categories') {
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

export async function globalSearch(query: any, { limit = 25 } = {}) {
  const term = String(query || '').trim()
  if (!term) return []

  const pool = await getMysqlPool()
  const searchLike = like(term)

  const [products, categories, subcategories, rfqs, customers, exportCountries, mysqlUsers, prismaUsers, companies] = await Promise.all([
    prisma.dynamicProduct.findMany({
      where: {
        OR: [
          { productName: { contains: term } },
          { slug: { contains: term } },
          { description: { contains: term } },
          { shortDescription: { contains: term } },
          { hsnCode: { contains: term } },
        ],
      },
      take: limit,
      include: { category: true, subcategory: true },
    }),
    prisma.productCategory.findMany({
      where: {
        OR: [
          { name: { contains: term } },
          { slug: { contains: term } },
        ],
      },
      take: limit,
    }),
    prisma.productSubcategory.findMany({
      where: {
        OR: [
          { name: { contains: term } },
          { slug: { contains: term } },
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
          { email: { contains: term } },
          { firstName: { contains: term } },
          { lastName: { contains: term } },
        ],
      },
      take: limit,
      include: { role: true },
    }),
    prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: term } },
          { email: { contains: term } },
          { website: { contains: term } },
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
