import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  return await prisma.user.update({
    where: { id },
    data: { role: body.role, plan: body.plan }
  })
})