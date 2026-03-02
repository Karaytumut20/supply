import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_token')
  if(!userId) throw createError({ statusCode: 401 })
  // Gercek projede odeme basariliysa PRO yapilir.
  await prisma.user.update({ where: { id: userId }, data: { plan: 'PRO' } })
  return { success: true, message: 'Abonelik basarili! Artik PRO uyesiniz.' }
})