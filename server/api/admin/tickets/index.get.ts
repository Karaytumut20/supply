import { requireAuth } from '../../../utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    if (user.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })

    try {
        const tickets = await prisma.ticket.findMany({
            include: { user: { select: { name: true, email: true, plan: true } } },
            orderBy: { createdAt: 'desc' }
        })
        return tickets
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: 'Destek talepleri getirilirken hata oluştu' })
    }
})
