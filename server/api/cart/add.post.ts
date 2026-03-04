import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuth(event)
        const body = await readBody(event)
        const { projectId, licenseType } = body

        if (!projectId) return createError({ statusCode: 400, statusMessage: 'Project ID required' })

        const project = await prisma.project.findUnique({ where: { id: projectId } })
        if (!project) return createError({ statusCode: 404, statusMessage: 'Project not found' })

        const price = licenseType === 'COMMERCIAL' ? (project.price * 3) : project.price

        // Zaten satın alınmış mı kontrol et (Sahiplik engeli)
        const existingPurchase = await prisma.purchase.findUnique({
            where: { userId_projectId: { userId: user.userId, projectId } }
        })

        if (existingPurchase) return createError({ statusCode: 400, statusMessage: 'Zaten bu ürüne sahipsiniz.' })

        // Kullanıcının sepetini bul veya oluştur
        let cart = await prisma.cart.findUnique({ where: { userId: user.userId } })
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId: user.userId } })
        }

        // Sepete ürünü ekle (Zaten varsa üzerine yazar/upsert)
        await prisma.cartItem.upsert({
            where: {
                cartId_projectId: { cartId: cart.id, projectId: projectId }
            },
            update: {
                licenseType: licenseType || 'STANDARD',
                price: price
            },
            create: {
                cartId: cart.id,
                projectId: projectId,
                licenseType: licenseType || 'STANDARD',
                price: price
            }
        })

        return { success: true, message: 'Ürün sepete eklendi' }
    } catch (err: any) {
        return createError({ statusCode: 500, statusMessage: err.message })
    }
})
