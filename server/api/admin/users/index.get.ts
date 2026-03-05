
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../../utils/jwt'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const admin = await requireAuth(event)
  if (admin.role !== 'ADMIN') throw createError({ statusCode: 403 })
  return await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, isPro: true, plan: true, isBanned: true, planSource: true, createdAt: true,
      purchases: {
        include: { project: true },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
})