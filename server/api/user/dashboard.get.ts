import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.userId

  const savedProjects = await prisma.savedProject.findMany({
    where: { userId },
    include: { project: true },
    orderBy: { createdAt: 'desc' }
  })

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: { project: true },
    orderBy: { createdAt: 'desc' }
  })

  const tickets = await prisma.ticket.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  let adminStats = null
  if (user.role === 'ADMIN') {
    const totalUsers = await prisma.user.count()
    const proUsers = await prisma.user.count({ where: { plan: 'PRO' } })
    const purchasesList = await prisma.purchase.findMany({
      include: { project: true }
    })
    const totalSales = purchasesList.reduce((acc, p) => acc + (p.project?.price || 0), 0)

    adminStats = {
      totalUsers,
      proUsers,
      totalSales
    }
  }

  return {
    savedProjects: savedProjects.map(sp => sp.project),
    purchasedProjects: purchases.map(p => p.project),
    tickets,
    admin: adminStats
  }
})