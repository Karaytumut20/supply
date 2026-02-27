import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_token')
  if(!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if(!user) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role }
})