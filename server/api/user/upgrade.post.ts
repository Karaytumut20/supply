import { PrismaClient } from '@prisma/client'
import { requireAuth, signToken } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) // Token yerine doğru kullanıcı ID'sini getirir
  const body = await readBody(event) || {}
  const targetPlan = body.targetPlan || 'PRO'

  let endsAt = null
  let message = 'Harika! Artık Pro üyesin.'

  if (targetPlan === 'ULTIMATE') {
    message = 'Harika! Artık Ultimate üyesin (Limitsiz Ömür Boyu).'
  } else {
    endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }

  // Veritabanında kullanıcıyı PRO/ULTIMATE olarak güncelle
  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: { isPro: true, plan: targetPlan, planSource: 'STRIPE', subscriptionEndsAt: endsAt }
  })

  // Yeni yetkilerle token'ı güncelle (böylece site kullanıcının anında PRO olduğunu anlar)
  const token = signToken({
    userId: updatedUser.id,
    role: updatedUser.role,
    plan: updatedUser.plan,
    isPro: updatedUser.isPro
  })

  setCookie(event, 'auth_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })

  return { success: true, message: message, user: updatedUser }
})