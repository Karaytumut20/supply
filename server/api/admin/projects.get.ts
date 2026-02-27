import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    return await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    return createError({ statusCode: 500, statusMessage: 'Database error' })
  }
})
