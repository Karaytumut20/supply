import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const usersCount = await prisma.user.count()
  const proUsersCount = await prisma.user.count({ where: { isPro: true } })
  const projectsCount = await prisma.project.count()

  const purchases = await prisma.purchase.aggregate({ _sum: { pricePaid: true } })
  const totalRevenue = purchases._sum.pricePaid || 0

  return { usersCount, proUsersCount, projectsCount, totalRevenue }
})