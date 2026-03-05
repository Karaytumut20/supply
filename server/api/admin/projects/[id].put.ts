import { requireAuth } from '../../../utils/jwt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Erişim Reddedildi: Sadece Adminler Girebilir' })

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  return await prisma.project.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      videoUrl: body.videoUrl,
      sourceUrl: body.sourceUrl,
      demoUrl: body.demoUrl,
      dependencies: body.dependencies,
      price: parseFloat(body.price),
      discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
      categories: body.categories,
      tags: body.tags,
      techStack: body.techStack,
      rating: parseFloat(body.rating),
      reviewCount: parseInt(body.reviewCount),
      status: body.status,
      isPremium: body.isPremium,
      productType: body.productType,
      sourceCodeReact: body.sourceCodeReact,
      sourceCodeVue: body.sourceCodeVue,
      sourceCodeHtml: body.sourceCodeHtml,
      fileUrl: body.fileUrl,
      images: body.images,
      documentation: body.documentation,
      features: body.features
    }
  })
})