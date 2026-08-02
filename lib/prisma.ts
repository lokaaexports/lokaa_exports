import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

let dbUrl = process.env.DATABASE_URL
if (dbUrl && process.env.NODE_ENV === 'production') {
  if (dbUrl.includes('?')) {
    dbUrl = dbUrl + '&connection_limit=3&pool_timeout=30'
  } else {
    dbUrl = dbUrl + '?connection_limit=3&pool_timeout=30'
  }
}

// Always use the global singleton to avoid creating multiple PrismaClient
// instances in production (serverless cold starts) and development (HMR).
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  })

globalForPrisma.prisma = prisma

export default prisma
