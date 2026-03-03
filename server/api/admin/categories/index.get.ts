import { requireAuth } from '../../../utils/jwt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async () => {
  return await prisma.category.findMany({ orderBy: { name: 'asc' } })
})