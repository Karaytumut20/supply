import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  return await prisma.project.delete({ where: { id } })
})