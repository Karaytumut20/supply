import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_token')
  if(!userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const body = await readBody(event)
  const { projectId } = body
  if(!projectId) throw createError({ statusCode: 400 })
  const existing = await prisma.savedProject.findUnique({
    where: { userId_projectId: { userId, projectId } }
  })
  if(existing) {
    await prisma.savedProject.delete({ where: { id: existing.id } })
    return { saved: false, message: 'Removed' }
  } else {
    await prisma.savedProject.create({ data: { userId, projectId } })
    return { saved: true, message: 'Saved' }
  }
})