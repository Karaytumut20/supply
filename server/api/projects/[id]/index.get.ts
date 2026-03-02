import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if(!id) throw createError({ statusCode: 400 })

  const project = await prisma.project.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, avatar: true } } }
  })

  if(!project) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  return project
})