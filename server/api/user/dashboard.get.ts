import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) // Token'ı otomatik doğrular
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

  return {
    savedProjects: savedProjects.map(sp => sp.project),
    purchases: purchases.map(p => ({ ...p.project, purchaseDate: p.createdAt })),
    tickets
  }
})