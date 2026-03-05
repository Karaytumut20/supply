import { requireAuth } from '../../../../utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) throw createError({ statusCode: 400, statusMessage: 'Bilet ID gerekli' })
    if (!body.message) throw createError({ statusCode: 400, statusMessage: 'Mesaj boş olamaz' })

    try {
        // Doğrulama: bilet gerçekten bu kullanıcının mı?
        const ticket = await prisma.ticket.findUnique({ where: { id } })
        if (!ticket || ticket.userId !== user.userId) {
            throw createError({ statusCode: 403, statusMessage: 'Geçersiz bilet veya yetkisiz işlem' })
        }

        const newMsg = await prisma.ticketMessage.create({
            data: {
                ticketId: id,
                userId: user.userId,
                message: body.message,
                isAdminReply: false
            }
        })

        // Kullanıcı cevap yazarsa bileti tekrar OPEN yap
        if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
            await prisma.ticket.update({
                where: { id },
                data: { status: 'OPEN' }
            })
        }

        return newMsg
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: err.message || 'Hata' })
    }
})
