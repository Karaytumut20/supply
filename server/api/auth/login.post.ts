import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body
  if(!email || !password) throw createError({ statusCode: 400, statusMessage: 'Zorunlu alanlar eksik' })
  const user = await prisma.user.findUnique({ where: { email } })
  if(!user) throw createError({ statusCode: 401, statusMessage: 'Kullanici bulunamadi' })
  const isValid = await bcrypt.compare(password, user.password)
  if(!isValid) throw createError({ statusCode: 401, statusMessage: 'Hatali sifre' })
  // Sorunsuz, sonsuz dongusuz basit cerez atamasi
  setCookie(event, 'auth_token', user.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
  return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
})