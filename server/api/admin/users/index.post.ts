
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { requireAuth } from '../../../utils/jwt'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const admin = await requireAuth(event)
  if (admin.role !== 'ADMIN') throw createError({ statusCode: 403 })
  const body = await readBody(event)
  if (!body.email || !body.password) throw createError({ statusCode: 400, statusMessage: 'Email ve şifre zorunlu' })

  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  if (existing) throw createError({ statusCode: 400, statusMessage: 'Bu e-posta zaten kullanımda.' })

  const hashedPassword = await bcrypt.hash(body.password, 10)
  return await prisma.user.create({
    data: {
      name: body.name, email: body.email, password: hashedPassword,
      role: body.role || 'USER', plan: body.plan || 'FREE', isPro: body.plan === 'PRO',
      isBanned: body.isBanned || false,
      planSource: body.plan === 'PRO' ? (body.planSource || 'ADMIN') : null
    }
  })
})