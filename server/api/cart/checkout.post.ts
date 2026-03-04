import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const cookies = parseCookies(event)
    const token = cookies.auth_token
    if (!token) return createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key')

        // Kullanıcının sepetini ve içindeki ürünleri getir
        const cart = await prisma.cart.findUnique({
            where: { userId: decoded.userId },
            include: { items: true }
        })

        if (!cart || cart.items.length === 0) {
            return createError({ statusCode: 400, statusMessage: 'Sepetiniz boş' })
        }

        // Sepetteki tüm öğeleri satın alma kaydına (Purchase) dönüştür
        for (const item of cart.items) {
            const existingPurchase = await prisma.purchase.findUnique({
                where: { userId_projectId: { userId: decoded.userId, projectId: item.projectId } }
            })

            if (!existingPurchase) {
                await prisma.purchase.create({
                    data: {
                        userId: decoded.userId,
                        projectId: item.projectId,
                        pricePaid: item.price,
                        licenseType: item.licenseType
                    }
                })
            }
        }

        // Satın alım başarılıysa tüm sepeti temizle
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

        return { success: true, message: 'Ödeme başarılı, ürünler hesabınıza eklendi.' }
    } catch (err) {
        return createError({ statusCode: 500, statusMessage: 'Ödeme sırasında sistemsel bir hata oluştu.' })
    }
})
