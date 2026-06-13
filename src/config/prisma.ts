import * as Prisma from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: Prisma.PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new Prisma.PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}