import { requireAuth } from '../../../utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    const id = getRouterParam(event, 'id')

    if (!id) throw createError({ statusCode: 400, statusMessage: 'Eksik bilgi' })

    const request = await prisma.templateRequest.findUnique({ where: { id } })
    if (!request) throw createError({ statusCode: 404, statusMessage: 'Talep bulunamadı' })

    const existingVote = await prisma.templateVote.findUnique({
        where: {
            requestId_userId: { requestId: id, userId: user.userId }
        }
    })

    if (existingVote) {
        // Zaten oy vermiş, o zaman geri al (Toggle - Remove)
        await prisma.templateVote.delete({ where: { id: existingVote.id } })
        return { success: true, action: 'removed' }
    } else {
        // Oy ver (Toggle - Add)
        await prisma.templateVote.create({
            data: { requestId: id, userId: user.userId }
        })
        return { success: true, action: 'added' }
    }
})
