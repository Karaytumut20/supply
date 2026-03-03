import { PrismaClient } from '@prisma/client'
import { requireAuth, signToken } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) // Token yerine doğru kullanıcı ID'sini getirir

  // Veritabanında kullanıcıyı PRO olarak güncelle
  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: { isPro: true, plan: 'PRO', planSource: 'STRIPE' }
  })

  // Yeni yetkilerle token'ı güncelle (böylece site kullanıcının anında PRO olduğunu anlar)
  const token = signToken({
    userId: updatedUser.id,
    role: updatedUser.role,
    plan: updatedUser.plan,
    isPro: updatedUser.isPro
  })

  setCookie(event, 'auth_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })

  return { success: true, message: 'Harika! Artık Pro üyesin.', user: updatedUser }
})