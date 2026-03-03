import { requireAuth } from '../../../utils/jwt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Erişim Reddedildi: Sadece Adminler Girebilir' })

  const body = await readBody(event)
  if(!body.name) return createError({ statusCode: 400, statusMessage: 'Name required' })
  try {
    return await prisma.category.create({ data: { name: body.name } })
  } catch (e) { return createError({ statusCode: 400, statusMessage: 'Category exists' }) }
})