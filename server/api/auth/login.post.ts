import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signToken } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) throw createError({ statusCode: 400, statusMessage: 'Zorunlu alanlar eksik' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Kullanici bulunamadi' })

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) throw createError({ statusCode: 401, statusMessage: 'Hatali sifre' })

  const token = signToken({
    userId: user.id,
    role: user.role,
    plan: user.plan,
    isPro: user.isPro
  })

  setCookie(event, 'auth_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })

  return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, isPro: user.isPro } }
})