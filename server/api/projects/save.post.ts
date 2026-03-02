import { PrismaClient } from '@prisma/client'
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
})