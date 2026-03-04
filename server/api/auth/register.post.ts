import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signToken, signRefreshToken } from '../../utils/jwt'

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

  const payload = {
    userId: user.id,
    role: user.role,
    plan: user.plan,
    isPro: user.isPro
  }

  const accessToken = signToken(payload)
  const refreshToken = signRefreshToken(payload)

  setCookie(event, 'auth_token', accessToken, { path: '/', maxAge: 15 * 60 }) // 15 mins accessible by client
  setCookie(event, 'refresh_token', refreshToken, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 }) // 7 days HttpOnly
  return { success: true, user: { id: user.id, name: user.name, email: user.email, plan: user.plan, role: user.role } }
})