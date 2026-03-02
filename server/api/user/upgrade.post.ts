import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_token')
  if(!userId) throw createError({ statusCode: 401, statusMessage: 'Lütfen giriş yapın.' })

  // Mock Ödeme İşlemi (Burada gerçekte Stripe Webhook veya Iyzico onayı olur)
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isPro: true }
  })

  return { success: true, message: 'Hoş geldin! Artık Pro üyesin.' }
})