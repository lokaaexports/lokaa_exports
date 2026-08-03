import { createPool } from 'mysql2/promise'

let pool: any = null

/**
 * Get or create the MySQL connection pool.
 *
 * Environment variables are loaded automatically by Next.js from .env/.env.local.
 * Fallback defaults are used when a variable is missing (suitable for local development).
 */
export async function getMysqlPool() {
  if (pool) return pool

  const {
    MYSQL_HOST = '127.0.0.1',
    MYSQL_PORT = '3306',
    MYSQL_USER = 'root',
    MYSQL_PASSWORD = '',
    MYSQL_DATABASE = 'lokaa_exports',
    MYSQL_SSL,
  } = process.env

  // If critical credentials are still missing (e.g., no password for non‑dev)
  if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
    throw new Error('Missing MySQL connection settings in environment variables')
  }

  pool = createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
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
