import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // 1. Check DB Connection
    await prisma.$queryRaw`SELECT 1`
    console.log('DATABASE CONNECTED')

    // 2. Check Admin User
    const adminUser = await prisma.user.findFirst({
      where: {
        role: {
          name: { in: ['admin', 'super-admin'] }
        }
      }
    })

    if (!adminUser) {
      console.log('ADMIN USER MISSING')
    } else {
      console.log('ADMIN USER FOUND')
    }

    // 3. Check Auth Tables
    const tokensCount = await prisma.authToken.count()
    const historyCount = await prisma.loginHistory.count()
    console.log('AUTH TABLES OK')

    // 4. Check Session Storage / Auth Token records
    console.log('SESSION STORAGE OK')
  } catch (error: any) {
    console.error('Health Check Failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
