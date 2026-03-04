import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const logPrefix = '[Stripe Webhook]:'
    const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_mock'
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    const stripe = new Stripe(stripeSecret, { apiVersion: '2022-11-15' as any })

    const payload = await readRawBody(event)
    const sig = getHeader(event, 'stripe-signature')

    if (!payload || !sig) {
        throw createError({ statusCode: 400, statusMessage: 'Missing payload or signature' })
    }

    let stripeEvent

    try {
        if (stripeWebhookSecret) {
            stripeEvent = stripe.webhooks.constructEvent(payload, sig, stripeWebhookSecret)
        } else {
            // Opsiyonel: Local test için güvenlik bypass (SADECE DEV ORTAMINDA)
            stripeEvent = JSON.parse(payload)
        }
    } catch (err: any) {
        console.error(`${logPrefix} Error validating webhook signature:`, err.message)
        throw createError({ statusCode: 400, statusMessage: `Webhook Error: ${err.message}` })
    }

    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object as Stripe.Checkout.Session

        const userId = session.client_reference_id
        const cartId = session.metadata?.cartId

        if (!userId || !cartId) {
            console.error(`${logPrefix} Missing metadata (userId or cartId)`)
            return { received: true, error: 'missing_metadata' }
        }

        try {
            // 1. Sepet içeriklerini bul
            const cart = await prisma.cart.findUnique({
                where: { id: cartId },
                include: { items: { include: { project: true } } }
            })

            if (!cart || cart.items.length === 0) {
                return { received: true, message: 'Cart already empty or missing' }
            }

            // 2. Satın alma kayıtlarını (Purchase) oluştur
            for (const item of cart.items) {
                const existingPurchase = await prisma.purchase.findUnique({
                    where: { userId_projectId: { userId, projectId: item.projectId } }
                })

                if (!existingPurchase) {
                    await prisma.purchase.create({
                        data: {
                            userId,
                            projectId: item.projectId,
                            pricePaid: item.price,
                            licenseType: item.licenseType
                        }
                    })
                }
            }

            // 3. Sepeti temizle
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

            console.log(`${logPrefix} Successfully processed order for user ${userId}`)

            // 4. Müşteriye E-posta Gönder (Resend)
            try {
                const user = await prisma.user.findUnique({ where: { id: userId } })
                if (user && user.email) {
                    const { sendPurchaseEmail } = await import('../../utils/email')
                    await sendPurchaseEmail(user.email, cart.items)
                    console.log(`${logPrefix} Sent purchase email to ${user.email}`)
                }
            } catch (emailError) {
                console.error(`${logPrefix} Email delivery failed:`, emailError)
            }

        } catch (dbError) {
            console.error(`${logPrefix} Database error processing session:`, dbError)
            throw createError({ statusCode: 500, statusMessage: 'Database error' })
        }
    }

    // Başarı yanıtı dön
    return { received: true }
})
