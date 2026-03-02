import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  return await prisma.project.update({
    where: { id },
    data: {
      title: body.title,
      videoUrl: body.videoUrl,
      categories: body.categories,
      status: body.status,
      isPremium: body.isPremium,
      price: parseFloat(body.price),
      sourceCode: body.sourceCode
    }
  })
})