import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_token')
  if(!userId) throw createError({ statusCode: 401, message: 'Giris yapmalisiniz' })
  const { projectId } = await readBody(event)
  // Gercek bir projede burada Stripe/Iyzico odemesi alinir.
  await prisma.purchase.create({ data: { userId, projectId } })
  return { success: true, message: 'Satin alim basarili!' }
})