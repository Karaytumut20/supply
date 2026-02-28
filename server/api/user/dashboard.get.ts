import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_token')
  if(!userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const savedProjects = await prisma.savedProject.findMany({
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
    tickets
  }
})