import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.userId

  const body = await readBody(event)
  const { projectId } = body

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if(!project) throw createError({ statusCode: 404, statusMessage: 'Proje bulunamadı.' })

  const existing = await prisma.purchase.findUnique({
    where: { userId_projectId: { userId, projectId } }
  })
  if(existing) throw createError({ statusCode: 400, statusMessage: 'Bu ürüne zaten sahipsiniz.' })

  const purchase = await prisma.$transaction([
    prisma.purchase.create({ data: { userId, projectId, pricePaid: project.price } }),
    prisma.project.update({ where: { id: projectId }, data: { downloads: { increment: 1 } } })
  ])

  return { success: true, message: 'Satın alma başarılı!' }
})