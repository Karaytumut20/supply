import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  if (user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Yetkisiz islem' })
  }

  const projects = await prisma.project.findMany({
    include: { purchasedBy: true }
  })

  const purchases = await prisma.purchase.findMany()

  const totalSales = purchases.length
  const totalRevenue = purchases.reduce((acc, p) => acc + (p.pricePaid || 0), 0)

  return { projects, totalSales, totalRevenue }
})