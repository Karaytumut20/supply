import { requireAuth } from '../../utils/jwt'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    if (user.plan !== 'PRO') {
        throw createError({ statusCode: 400, statusMessage: 'Sadece PRO kullanıcılar aboneliğini iptal edebilir.' })
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: { plan: 'FREE' }
        })

        return {
            success: true,
            message: 'PRO aboneliğiniz başarıyla iptal edildi ve Ücretsiz Plana geçirildiniz.',
            user: updatedUser
        }
    } catch (error) {
        console.error('Cancel subscription error:', error)
        throw createError({ statusCode: 500, statusMessage: 'Abonelik iptali sırasında bir hata oluştu.' })
    }
})
