import { requireAuth } from '../../../utils/jwt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Erişim Reddedildi: Sadece Adminler Girebilir' })

  const id = getRouterParam(event, 'id')
  if(!id) return createError({ statusCode: 400 })
  return await prisma.category.delete({ where: { id } })
})