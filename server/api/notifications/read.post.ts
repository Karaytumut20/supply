import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  await prisma.notification.updateMany({
    where: { userId: user.userId, isRead: false },
    data: { isRead: true }
  })

  return { success: true }
})