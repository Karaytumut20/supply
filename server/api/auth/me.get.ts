import { PrismaClient } from '@prisma/client'
import { verifyToken } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if(!token) return false;

  // Şifreli JWT'yi çözüyoruz
  const decoded = verifyToken(token)
  if(!decoded || !decoded.userId) return false;

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
  if(!user) return false;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    isPro: user.isPro
  }
})