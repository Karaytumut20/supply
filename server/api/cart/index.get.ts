import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const cookies = parseCookies(event)
    const token = cookies.auth_token

    if (!token) return createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key')

        let cart = await prisma.cart.findUnique({
            where: { userId: decoded.userId },
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
                data: { userId: decoded.userId },
                include: { items: { include: { project: { select: { id: true, title: true, videoUrl: true, price: true, isPremium: true } } } } }
            })
        }

        return cart
    } catch (err) {
        return createError({ statusCode: 401, statusMessage: 'Invalid Token' })
    }
})
