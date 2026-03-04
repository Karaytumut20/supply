import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

export default defineEventHandler(async (event) => {
    const { token, newPassword } = await readBody(event)

    if (!token || !newPassword) {
        throw createError({ statusCode: 400, statusMessage: 'Token ve yeni şifre gerekli.' })
    }

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET)
        const userId = decoded.userId

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        return { success: true, message: 'Şifreniz başarıyla güncellendi.' }
    } catch (err) {
        throw createError({ statusCode: 400, statusMessage: 'Geçersiz veya süresi dolmuş bağlantı.' })
    }
})
