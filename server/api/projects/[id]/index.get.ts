import { PrismaClient } from '@prisma/client'
import { verifyToken } from '../../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400 })

  const project = await prisma.project.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, avatar: true } } }
  })

  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found' })

  // Soft Auth Check
  const token = getCookie(event, 'auth_token')
  let isAuthorized = false

  if (project.isPremium === false && project.price === 0) {
    isAuthorized = true
  } else if (token) {
    const user = verifyToken(token)
    if (user) {
      if (user.role === 'ADMIN' || user.plan === 'PRO') {
        isAuthorized = true
      } else {
        const purchase = await prisma.purchase.findUnique({
          where: { userId_projectId: { userId: user.userId, projectId: id } }
        })
        if (purchase) isAuthorized = true
      }
    }
  }

  // Mask Premium Content if Unauthorized
  if (!isAuthorized) {
    project.sourceCodeReact = null as any
    project.sourceCodeVue = null as any
    project.sourceCodeHtml = null as any
    project.fileUrl = null as any
  }

  return project
})