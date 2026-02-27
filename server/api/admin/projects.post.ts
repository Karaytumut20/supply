import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  try {
    const newProject = await prisma.project.create({
      data: {
        title: body.title,
        videoUrl: body.videoUrl,
        categories: body.categories,
        tags: body.tags || 'new',
        status: body.status || 'Active'
      }
    })
    return newProject
  } catch (error) {
    return createError({ statusCode: 500, statusMessage: 'Failed to create project' })
  }
})
