import { PrismaClient } from '@prisma/client'
import { verifyToken } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return null;

  const decoded = verifyToken(token)
  if (!decoded || !decoded.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { purchases: true }
  })

  if (!user) return null;

  return {
    id: user.id, name: user.name, email: user.email,
    role: user.role, plan: user.plan, isPro: user.isPro,
    purchases: user.purchases.map(p => p.projectId)
  }
})