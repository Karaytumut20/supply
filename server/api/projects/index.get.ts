import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineCachedEventHandler(async (event) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'Active' },
      orderBy: { createdAt: 'desc' }
    })
    return projects
  } catch (error) {
    return createError({ statusCode: 500, statusMessage: 'Database error' })
  }
})
