import jwt from 'jsonwebtoken'
import { H3Event, getCookie, setCookie } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key_change_me'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super_secret_refresh_key_change_me'

export const signToken = (payload: { userId: string; role: string; plan: string; isPro: boolean }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' }) // 15 dakika kısa süreli
}

export const signRefreshToken = (payload: { userId: string; role: string; plan: string; isPro: boolean }) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' }) // 7 gün uzun süreli
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; plan: string; isPro: boolean }
  } catch (error) {
    return null
  }
}

export const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as any
    // Sadece gerekli alanları geri döndür ki payload temiz kalsın
    return { userId: decoded.userId, role: decoded.role, plan: decoded.plan, isPro: decoded.isPro }
  } catch (error) {
    return null
  }
}

export const getDecodedUser = (event: H3Event) => {
  const token = getCookie(event, 'auth_token')
  let decoded = token ? verifyToken(token) : null

  // Otomatik Token Yenileme (Transparent Refresh)
  if (!decoded) {
    const refreshToken = getCookie(event, 'refresh_token')
    if (refreshToken) {
      const refreshedUser = verifyRefreshToken(refreshToken)
      if (refreshedUser) {
        // Yeni bir kısa süreli access token üret ve cookie'ye koy
        const newAccessToken = signToken(refreshedUser)
        setCookie(event, 'auth_token', newAccessToken, { maxAge: 15 * 60, path: '/' })
        decoded = refreshedUser
      }
    }
  }

  return decoded
}

export const requireAuth = async (event: H3Event) => {
  const decoded = getDecodedUser(event)
  if (!decoded) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized or expired token' })
  }

  return decoded
}

export const requireProAccess = async (event: H3Event) => {
  const user = await requireAuth(event)

  if (user.role !== 'ADMIN' && user.plan !== 'PRO' && !user.isPro) {
    throw createError({ statusCode: 403, statusMessage: 'Premium Access Required' })
  }

  return user
}
