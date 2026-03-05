import { requireAuth } from '../../../../utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const admin = await requireAuth(event)
    if (admin.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ticket ID required' })
    if (!body.message) throw createError({ statusCode: 400, statusMessage: 'Mesaj boş olamaz' })

    try {
        const newMsg = await prisma.ticketMessage.create({
            data: {
                ticketId: id,
                userId: admin.userId,
                message: body.message,
                isAdminReply: true
            },
            include: {
                user: { select: { name: true, role: true } }
            }
        })
        return newMsg
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: 'Mesaj gönderilemedi' })
    }
})
