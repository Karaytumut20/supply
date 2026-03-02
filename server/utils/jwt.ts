import jwt from 'jsonwebtoken'
import { H3Event } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key_change_me'

export const signToken = (payload: { userId: string; role: string; plan: string; isPro: boolean }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; plan: string; isPro: boolean }
  } catch (error) {
    return null
  }
}

export const requireAuth = async (event: H3Event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  const decoded = verifyToken(token)
  if (!decoded) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }
  
  // Optionally cross-check with DB if needed, but JWT is stateless by design.
  return decoded
}

export const requireProAccess = async (event: H3Event) => {
  const user = await requireAuth(event)
  
  if (user.role !== 'ADMIN' && user.plan !== 'PRO' && !user.isPro) {
    throw createError({ statusCode: 403, statusMessage: 'Premium Access Required' })
  }
  
  return user
}
