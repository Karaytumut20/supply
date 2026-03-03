
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { requireAuth } from '../../../utils/jwt'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const admin = await requireAuth(event)
  if (admin.role !== 'ADMIN') throw createError({ statusCode: 403 })
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const updateData: any = {
    name: body.name, email: body.email, role: body.role,
    plan: body.plan, isPro: body.plan === 'PRO', isBanned: body.isBanned, planSource: body.plan === 'PRO' ? (body.planSource || 'ADMIN') : null
  }
  if (body.password) updateData.password = await bcrypt.hash(body.password, 10)

  return await prisma.user.update({ where: { id }, data: updateData })
})