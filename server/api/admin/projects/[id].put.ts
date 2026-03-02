import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  return await prisma.project.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      videoUrl: body.videoUrl,
      sourceUrl: body.sourceUrl,
      price: parseFloat(body.price),
      categories: body.categories,
      tags: body.tags,
      techStack: body.techStack,
      rating: parseFloat(body.rating),
      reviewCount: parseInt(body.reviewCount),
      status: body.status,
      isPremium: body.isPremium,
      sourceCode: body.sourceCode,
      sourceCodeReact: body.sourceCodeReact,
      sourceCodeVue: body.sourceCodeVue,
      sourceCodeHtml: body.sourceCodeHtml
    }
  })
})