import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const cookies = parseCookies(event)
    const token = cookies.auth_token
    if (!token) return createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key')
        const body = await readBody(event)
        const { itemId } = body // CartItem UUID

        if (!itemId) return createError({ statusCode: 400, statusMessage: 'Cart Item ID required' })

        const cart = await prisma.cart.findUnique({ where: { userId: decoded.userId } })
        if (!cart) return createError({ statusCode: 404, statusMessage: 'Cart not found' })

        await prisma.cartItem.deleteMany({
            where: { id: itemId, cartId: cart.id }
        })

        return { success: true, message: 'Ürün sepetten çıkarıldı' }
    } catch (err) {
        return createError({ statusCode: 500, statusMessage: 'Sepetten çıkarırken hata oluştu' })
    }
})
