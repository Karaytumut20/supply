import { PrismaClient } from '@prisma/client'
import { sendPasswordResetEmail } from '../../utils/email'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

export default defineEventHandler(async (event) => {
    const { email } = await readBody(event)
    if (!email) throw createError({ statusCode: 400, statusMessage: 'Email gerekli.' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        // Güvenlik: Kullanıcı bulunamasa bile always return success to prevent email enumeration
        return { success: true, message: 'Eğer e-posta sistemde kayıtlıysa sıfırlama bağlantısı gönderildi.' }
    }

    const resetToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' })

    await sendPasswordResetEmail(user.email, resetToken)

    return { success: true, message: 'Sıfırlama bağlantısı e-posta adresinize gönderildi.' }
})
