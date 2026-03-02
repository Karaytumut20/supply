import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.userId

  const body = await readBody(event)
  const { projectId, licenseType = 'STANDARD' } = body

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if(!project) throw createError({ statusCode: 404, statusMessage: 'Proje bulunamadı.' })

  const existing = await prisma.purchase.findUnique({
    where: { userId_projectId: { userId, projectId } }
  })
  if(existing) throw createError({ statusCode: 400, statusMessage: 'Bu ürüne zaten sahipsiniz.' })

  const multiplier = licenseType === 'COMMERCIAL' ? 3 : 1
  const finalPrice = project.price * multiplier

  const purchase = await prisma.$transaction([
    prisma.purchase.create({ data: { userId, projectId, pricePaid: finalPrice, licenseType } }),
    prisma.project.update({ where: { id: projectId }, data: { downloads: { increment: 1 } } })
  ])

  // YENİ: EĞER ÜRÜNÜN BİR SATICISI VARSA ONA BİLDİRİM GÖNDER
  if (project.authorId && project.authorId !== userId) {
    await prisma.notification.create({
      data: {
        userId: project.authorId,
        title: "🎉 Yeni Satış!",
        message: `Tebrikler! "${project.title}" adlı ürününüz satıldı. Kazanç: $${finalPrice}`,
        link: "/dashboard?tab=creator"
      }
    })
  }

  return { success: true, message: 'Satın alma başarılı!', purchase }
})