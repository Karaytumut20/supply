import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signToken } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, name } = body

  if (!email || !password) throw createError({ statusCode: 400, statusMessage: 'Zorunlu alanlar eksik' })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw createError({ statusCode: 400, statusMessage: 'Bu email zaten kayitli' })

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name: name || email.split('@')[0], role: 'USER', plan: 'FREE', isPro: false }
  })

  const token = signToken({
    userId: user.id,
    role: user.role,
    plan: user.plan,
    isPro: user.isPro
  })

  setCookie(event, 'auth_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
  return { success: true, user: { id: user.id, name: user.name, email: user.email, plan: user.plan, role: user.role } }
})