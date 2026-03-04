import { requireAuth } from '../../../utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    if (user.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })

    const id = getRouterParam(event, 'id')
    const { status } = await readBody(event)

    if (!id || !status) throw createError({ statusCode: 400, statusMessage: 'ID ve yeni durum (status) gerekli' })

    try {
        const updated = await prisma.ticket.update({
            where: { id },
            data: { status }
        })
        return { success: true, ticket: updated, message: 'Talep durumu güncellendi' }
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: 'Talep güncellenirken bir hata oluştu' })
    }
})
