import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  return await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isPro: true, plan: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  })
})