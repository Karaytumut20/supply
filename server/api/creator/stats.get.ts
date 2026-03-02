import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.userId

  const projects = await prisma.project.findMany({
    where: { authorId: userId },
    include: { purchasedBy: true }
  })

  const totalSales = projects.reduce((acc, p) => acc + p.purchasedBy.length, 0)
  const totalRevenue = projects.reduce((acc, p) => {
     return acc + p.purchasedBy.reduce((sum, purchase) => sum + (purchase.pricePaid || 0), 0)
  }, 0)

  return { projects, totalSales, totalRevenue }
})