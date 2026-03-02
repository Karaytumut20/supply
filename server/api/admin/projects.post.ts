import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await prisma.project.create({
    data: {
      title: body.title,
      description: body.description || null,
      videoUrl: body.videoUrl,
      sourceUrl: body.sourceUrl || null,
      price: parseFloat(body.price) || 0,
      categories: body.categories,
      tags: body.tags || 'new',
      techStack: body.techStack || 'HTML, CSS',
      rating: parseFloat(body.rating) || 5.0,
      reviewCount: parseInt(body.reviewCount) || 0,
      status: body.status || 'Active',
      isPremium: body.isPremium || false,
      sourceCode: body.sourceCode || '',
      sourceCodeReact: body.sourceCodeReact || '',
      sourceCodeVue: body.sourceCodeVue || '',
      sourceCodeHtml: body.sourceCodeHtml || ''
    }
  })
})