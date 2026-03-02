import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const notifications = await prisma.notification.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' },
    take: 10 // Son 10 bildirim
  })

  const unreadCount = await prisma.notification.count({
    where: { userId: user.userId, isRead: false }
  })

  return { notifications, unreadCount }
})