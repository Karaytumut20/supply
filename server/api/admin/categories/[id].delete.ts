import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if(!id) return createError({ statusCode: 400 })
  return await prisma.category.delete({ where: { id } })
})