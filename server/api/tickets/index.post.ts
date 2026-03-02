import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.userId

  const body = await readBody(event)
  const { subject, message } = body

  const ticket = await prisma.ticket.create({
    data: { subject, message, userId }
  })

  return ticket
})