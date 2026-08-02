import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true }
  })
  console.log('USERS IN DB:', JSON.stringify(users, null, 2))
  
  const roles = await prisma.role.findMany()
  console.log('ROLES IN DB:', JSON.stringify(roles, null, 2))
}

main().finally(() => prisma.$disconnect())
