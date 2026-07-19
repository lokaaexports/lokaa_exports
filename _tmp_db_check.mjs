import prisma from './lib/prisma.js'

try {
  const rows = await prisma.$queryRaw`SELECT 1 AS ok`
  console.log(JSON.stringify(rows))
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await prisma.$disconnect().catch(() => {})
}
