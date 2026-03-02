import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_token')
  if(!userId) throw createError({ statusCode: 401, statusMessage: 'Lütfen giriş yapın.' })

  const body = await readBody(event)
  const { projectId } = body

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if(!project) throw createError({ statusCode: 404, statusMessage: 'Proje bulunamadı.' })

  const existing = await prisma.purchase.findUnique({
    where: { userId_projectId: { userId, projectId } }
  })
  if(existing) throw createError({ statusCode: 400, statusMessage: 'Bu ürüne zaten sahipsiniz.' })

  // Satın almayı kaydet ve projenin indirme sayısını 1 artır
  const purchase = await prisma.$transaction([
    prisma.purchase.create({ data: { userId, projectId, pricePaid: project.price } }),
    prisma.project.update({ where: { id: projectId }, data: { downloads: { increment: 1 } } })
  ])

  return { success: true, message: 'Satın alma başarılı!' }
})