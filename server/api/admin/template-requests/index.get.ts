import { requireAuth } from '../../../utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const admin = await requireAuth(event)
    if (admin.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })

    const requests = await prisma.templateRequest.findMany({
        include: {
            user: { select: { name: true, email: true } },
            votes: { select: { id: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Yüzeyde 'voteCount' hesaplayalım ki frontend işlesin
    return requests.map(r => ({
        ...r,
        voteCount: r.votes.length
    }))
})
