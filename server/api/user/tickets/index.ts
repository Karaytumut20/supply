import { requireAuth } from '../../../utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    if (event.node.req.method === 'GET') {
        return await prisma.ticket.findMany({
            where: { userId: user.userId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
            orderBy: { createdAt: 'desc' }
        })
    }

    if (event.node.req.method === 'POST') {
        const body = await readBody(event)
        if (!body.subject || !body.message) throw createError({ statusCode: 400, statusMessage: 'Eksik bilgi' })

        return await prisma.ticket.create({
            data: {
                userId: user.userId,
                subject: body.subject,
                message: body.message,
                status: 'OPEN'
            }
        })
    }

    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})
