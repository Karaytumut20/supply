import { requireAuth } from '../../../utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const admin = await requireAuth(event)
    if (admin.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id || !body?.status) throw createError({ statusCode: 400, statusMessage: 'Eksik parametre' })

    // Valid statuses: 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED'
    const updated = await prisma.templateRequest.update({
        where: { id },
        data: { status: body.status }
    })

    return updated
})
