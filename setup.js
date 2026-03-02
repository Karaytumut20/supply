import fs from 'fs'
import path from 'path'

// 1. ME API (Oturum Kontrolü - JWT Decode eklendi)
const meGetCode = `import { PrismaClient } from '@prisma/client'
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
})`
fs.writeFileSync(path.join(process.cwd(), 'server/api/auth/me.get.ts'), meGetCode, 'utf8')

// 2. DASHBOARD API (requireAuth eklendi)
const dashCode = `import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) // Token'ı otomatik doğrular
  const userId = user.userId

  const savedProjects = await prisma.savedProject.findMany({
    where: { userId },
    include: { project: true },
    orderBy: { createdAt: 'desc' }
  })

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: { project: true },
    orderBy: { createdAt: 'desc' }
  })

  const tickets = await prisma.ticket.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  return {
    savedProjects: savedProjects.map(sp => sp.project),
    purchases: purchases.map(p => ({ ...p.project, purchaseDate: p.createdAt })),
    tickets
  }
})`
fs.writeFileSync(path.join(process.cwd(), 'server/api/user/dashboard.get.ts'), dashCode, 'utf8')

// 3. PURCHASE (Satın Alma) API (requireAuth eklendi)
const purchaseCode = `import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.userId

  const body = await readBody(event)
  const { projectId } = body

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if(!project) throw createError({ statusCode: 404, statusMessage: 'Proje bulunamadı.' })

  const existing = await prisma.purchase.findUnique({
    where: { userId_projectId: { userId, projectId } }
  })
  if(existing) throw createError({ statusCode: 400, statusMessage: 'Bu ürüne zaten sahipsiniz.' })

  const purchase = await prisma.$transaction([
    prisma.purchase.create({ data: { userId, projectId, pricePaid: project.price } }),
    prisma.project.update({ where: { id: projectId }, data: { downloads: { increment: 1 } } })
  ])

  return { success: true, message: 'Satın alma başarılı!' }
})`
fs.writeFileSync(
  path.join(process.cwd(), 'server/api/projects/purchase.post.ts'),
  purchaseCode,
  'utf8'
)

// 4. SAVE (Favori) API (requireAuth eklendi)
const saveCode = `import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.userId

  const body = await readBody(event)
  const { projectId } = body
  if(!projectId) throw createError({ statusCode: 400 })

  const existing = await prisma.savedProject.findUnique({
    where: { userId_projectId: { userId, projectId } }
  })

  if(existing) {
    await prisma.savedProject.delete({ where: { id: existing.id } })
    return { saved: false, message: 'Favorilerden çıkarıldı.' }
  } else {
    await prisma.savedProject.create({ data: { userId, projectId } })
    return { saved: true, message: 'Favorilere eklendi.' }
  }
})`
fs.writeFileSync(path.join(process.cwd(), 'server/api/projects/save.post.ts'), saveCode, 'utf8')

// 5. SUBSCRIBE / UPGRADE API (requireAuth eklendi)
const subCode = `import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.userId

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isPro: true, plan: 'PRO' }
  })

  return { success: true, message: 'Hoş geldin! Artık Pro üyesin.' }
})`
fs.writeFileSync(path.join(process.cwd(), 'server/api/user/subscribe.post.ts'), subCode, 'utf8')

// 6. TICKETS API (requireAuth eklendi)
const ticketCode = `import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.userId

  const body = await readBody(event)
  const { subject, message } = body

  const ticket = await prisma.ticket.create({
    data: { subject, message, userId }
  })

  return ticket
})`
fs.writeFileSync(path.join(process.cwd(), 'server/api/tickets/index.post.ts'), ticketCode, 'utf8')

console.log('✅ Tüm korumalı API yolları JWT (requireAuth) sistemine başarıyla güncellendi!')
