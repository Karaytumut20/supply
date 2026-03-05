import { requireAuth } from '../../utils/jwt'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const userAuth = await requireAuth(event)
    const body = await readBody(event)

    const name = body.name?.trim() || null
    const email = body.email?.trim() || null
    const phone = body.phone?.trim() || null
    const oldPassword = body.oldPassword || null
    const newPassword = body.newPassword || null

    if (!email) {
        throw createError({ statusCode: 400, statusMessage: 'E-posta adresi zorunludur.' })
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: userAuth.userId }
    })

    if (!currentUser) {
        throw createError({ statusCode: 404, statusMessage: 'Kullanıcı bulunamadı.' })
    }

    const updates: any = { email }
    if (phone !== null) updates.phone = phone

    // 14-day name change restriction
    if (name && name !== currentUser.name) {
        if (currentUser.nameUpdatedAt) {
            const fourteenDays = 14 * 24 * 60 * 60 * 1000
            const timeSinceUpdate = Date.now() - currentUser.nameUpdatedAt.getTime()
            if (timeSinceUpdate < fourteenDays) {
                const daysLeft = Math.ceil((fourteenDays - timeSinceUpdate) / (24 * 60 * 60 * 1000))
                throw createError({
                    statusCode: 400,
                    statusMessage: `İsminizi 14 günde bir değiştirebilirsiniz. Tekrar değiştirebilmek için ${daysLeft} gün beklemelisiniz.`
                })
            }
        }
        updates.name = name
        updates.nameUpdatedAt = new Date()
    }

    // Password change logic
    if (newPassword) {
        if (!oldPassword) {
            throw createError({ statusCode: 400, statusMessage: 'Parolanızı değiştirmek için mevcut parolanızı girmelisiniz.' })
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, currentUser.password)
        if (!isPasswordValid) {
            throw createError({ statusCode: 401, statusMessage: 'Mevcut parolanız yanlış.' })
        }

        if (newPassword.length < 6) {
            throw createError({ statusCode: 400, statusMessage: 'Yeni parolanız en az 6 karakter olmalıdır.' })
        }

        updates.password = await bcrypt.hash(newPassword, 10)
    }

    try {
        await prisma.user.update({
            where: { id: currentUser.id },
            data: updates
        })
        return { success: true, message: 'Ayarlar başarıyla güncellendi.' }
    } catch (e: any) {
        if (e.code === 'P2002') {
            throw createError({ statusCode: 400, statusMessage: 'Bu e-posta adresi zaten kullanımda.' })
        }
        throw createError({ statusCode: 500, statusMessage: 'Ayarlar güncellenirken bir hata oluştu.' })
    }
})
