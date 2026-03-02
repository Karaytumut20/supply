import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id')
  if(!projectId) return []

  const reviews = await prisma.review.findMany({
    where: { projectId },
    include: {
      user: { select: { name: true, avatar: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return reviews
})