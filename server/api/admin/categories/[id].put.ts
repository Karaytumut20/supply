import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const admin = await requireAuth(event)
  if (admin.role !== 'ADMIN') throw createError({ statusCode: 403 })

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id || !body.name) return createError({ statusCode: 400, statusMessage: 'Eksik bilgi' })

  try {
    return await prisma.category.update({
      where: { id },
      data: { name: body.name }
    })
  } catch (e) {
    return createError({ statusCode: 400, statusMessage: 'Güncelleme başarısız' })
  }
})