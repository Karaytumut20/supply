import { requireAuth } from '../../utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    const body = await readBody(event)

    if (!body?.title || !body?.description) {
        throw createError({ statusCode: 400, statusMessage: 'Başlık ve açıklama zorunludur.' })
    }

    if (body.title.length < 5 || body.description.length < 15) {
        throw createError({ statusCode: 400, statusMessage: 'Başlık en az 5, açıklama 15 karakter olmalı.' })
    }

    const newRequest = await prisma.templateRequest.create({
        data: {
            title: body.title,
            description: body.description,
            userId: user.userId,
            status: 'PENDING'
        }
    })

    // Otomatik olarak kendi fikrine 1 oy ver
    await prisma.templateVote.create({
        data: {
            requestId: newRequest.id,
            userId: user.userId
        }
    })

    return { success: true, request: newRequest }
})
