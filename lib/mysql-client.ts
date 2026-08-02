import { createPool } from 'mysql2/promise'

let pool: any = null

/**
 * Get or create the MySQL connection pool.
 *
 * IMPORTANT: Schema creation/migration is handled by Prisma (`prisma db push` or
 * `prisma migrate deploy`). This module only provides a raw mysql2 pool for
 * queries that can't go through Prisma (catalog, audit, legacy auth).
 *
 * The old `ensureSchema()` function that ran ~60 DDL statements on every cold
 * start has been removed — it was the primary cause of 503 errors on Hostinger
 * because it blocked the Node process for 30+ seconds during startup.
 */
export async function getMysqlPool() {
  if (pool) return pool

  const {
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
    MYSQL_SSL,
  } = process.env

  if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE) {
    throw new Error('Missing MySQL connection settings in environment variables')
  }

  pool = createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT || 3306),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 5, // Reduced from 10 to leave headroom for Prisma's pool
    queueLimit: 0,
    ssl:
      MYSQL_SSL === 'true' || MYSQL_SSL === '1'
        ? { rejectUnauthorized: false }
        : undefined,
  })

  return pool
}
