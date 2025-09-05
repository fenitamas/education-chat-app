import { PrismaClient } from '@prisma/client'

let globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function connectDB() {
  // Prisma connects lazily; ensure at least one call works
  await prisma.$queryRaw`SELECT 1`
}
