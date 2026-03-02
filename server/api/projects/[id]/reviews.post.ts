import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')
  if(!projectId) throw createError({ statusCode: 400 })

  const body = await readBody(event)
  const { rating, comment } = body

  if(!rating || rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, message: 'Gecerli bir puan verin (1-5).' })
  }

  // Sadece satin alanlar veya PRO uyeler yorum yapabilsin
  if(user.role !== 'ADMIN' && user.plan !== 'PRO') {
    const hasPurchased = await prisma.purchase.findUnique({
      where: { userId_projectId: { userId: user.userId, projectId } }
    })
    if(!hasPurchased) throw createError({ statusCode: 403, message: 'Yorum yapmak icin urunu satin almalisiniz.' })
  }

  try {
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: user.userId,
        projectId
      }
    })
    return { success: true, review }
  } catch (error) {
    return createError({ statusCode: 400, message: 'Bu projeye zaten yorum yaptiniz.' })
  }
})