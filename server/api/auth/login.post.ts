import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signToken, signRefreshToken } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) throw createError({ statusCode: 400, statusMessage: 'Zorunlu alanlar eksik' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Kullanici bulunamadi' })
  if (user.isBanned) throw createError({ statusCode: 403, statusMessage: 'Hesabınız platform yöneticileri tarafından askıya alınmıştır.' })

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) throw createError({ statusCode: 401, statusMessage: 'Hatali sifre' })

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

  return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, isPro: user.isPro } }
})