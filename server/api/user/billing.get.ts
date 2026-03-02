import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.userId },
    include: { project: { select: { title: true, productType: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return purchases
})