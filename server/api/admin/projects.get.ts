import { requireAuth } from '../../utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Erişim Reddedildi: Sadece Adminler Girebilir' })

  try {
    return await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    return createError({ statusCode: 500, statusMessage: 'Database error' })
  }
})
