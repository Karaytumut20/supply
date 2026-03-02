import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.userId

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isPro: true, plan: 'PRO' }
  })

  return { success: true, message: 'Hoş geldin! Artık Pro üyesin.' }
})