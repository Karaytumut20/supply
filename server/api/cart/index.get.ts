import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuth(event)

        let cart = await prisma.cart.findUnique({
            where: { userId: user.userId },
            include: {
                items: {
                    include: {
                        project: {
                            select: { id: true, title: true, videoUrl: true, price: true, isPremium: true }
                        }
                    }
                }
            }
        })

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: user.userId },
                include: { items: { include: { project: { select: { id: true, title: true, videoUrl: true, price: true, isPremium: true } } } } }
            })
        }

        return cart
    } catch (err) {
        return createError({ statusCode: 401, statusMessage: 'Invalid Token' })
    }
})
