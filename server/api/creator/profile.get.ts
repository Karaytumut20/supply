import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const creatorId = query.id as string

  if(!creatorId) throw createError({ statusCode: 400, statusMessage: 'Creator ID gerekli' })

  const creator = await prisma.user.findUnique({
    where: { id: creatorId },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
      createdAt: true,
      createdWorks: {
        where: { status: 'Active' },
        orderBy: { downloads: 'desc' }
      }
    }
  })

  if(!creator) throw createError({ statusCode: 404, statusMessage: 'Satıcı bulunamadı' })

  return creator
})