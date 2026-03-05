import { requireAuth } from '../../utils/jwt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const admin = await requireAuth(event)
    if (admin.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Erişim Reddedildi' })

    const body = await readBody(event)
    const { title, message, link, type, targetUserId } = body

    if (!title || !message) throw createError({ statusCode: 400, statusMessage: 'Başlık ve mesaj zorunlu.' })

    if (type === 'ALL') {
        // Tüm kullanıcılara bildirim gönder
        const allUsers = await prisma.user.findMany({ select: { id: true } })
        const notifications = allUsers.map(u => ({
            userId: u.id,
            title,
            message,
            link: link || null
        }))

        // Prisma createMany is supported
        await prisma.notification.createMany({ data: notifications })
        return { success: true, count: notifications.length }

    } else if (type === 'SPECIFIC') {
        if (!targetUserId) throw createError({ statusCode: 400, statusMessage: 'Bir kullanıcı seçmelisiniz.' })

        const notification = await prisma.notification.create({
            data: {
                userId: targetUserId,
                title,
                message,
                link: link || null
            }
        })
        return { success: true, count: 1 }
    }

    throw createError({ statusCode: 400, statusMessage: 'Geçersiz gönderim tipi.' })
})
