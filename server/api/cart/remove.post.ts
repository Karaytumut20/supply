import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuth(event)
        const body = await readBody(event)
        const { itemId } = body // CartItem UUID

        if (!itemId) return createError({ statusCode: 400, statusMessage: 'Cart Item ID required' })

        const cart = await prisma.cart.findUnique({ where: { userId: user.userId } })
        if (!cart) return createError({ statusCode: 404, statusMessage: 'Cart not found' })

        await prisma.cartItem.deleteMany({
            where: { id: itemId, cartId: cart.id }
        })

        return { success: true, message: 'Ürün sepetten çıkarıldı' }
    } catch (err) {
        return createError({ statusCode: 500, statusMessage: 'Sepetten çıkarırken hata oluştu' })
    }
})
