import { requireAuth } from '../../utils/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const userAuth = await requireAuth(event)

    const currentUser = await prisma.user.findUnique({
        where: { id: userAuth.userId },
        select: { id: true, email: true, phone: true }
    })

    if (!currentUser) {
        throw createError({ statusCode: 404, statusMessage: 'Kullanıcı bulunamadı.' })
    }

    try {
        // Soft delete the user by setting deletedAt
        await prisma.user.update({
            where: { id: currentUser.id },
            data: { deletedAt: new Date() }
        })

        // Remove cookies
        deleteCookie(event, 'auth_token')
        deleteCookie(event, 'refresh_token')

        return { success: true, message: 'Hesabınız basarıyla silindi.' }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: 'Hesap silinirken bir hata oluştu.' })
    }
})
