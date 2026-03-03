
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../../utils/jwt'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const admin = await requireAuth(event)
  if (admin.role !== 'ADMIN') throw createError({ statusCode: 403 })
  const id = getRouterParam(event, 'id')
  return await prisma.user.delete({ where: { id } })
})