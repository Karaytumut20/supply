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
            include: { items: { include: { project: true } } }
        })

        if (!cart || cart.items.length === 0) {
            return createError({ statusCode: 400, statusMessage: 'Sepetiniz boş' })
        }

        // Stripe entegrasyonu (Ortam değişkeninden anahtarı al)
        const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock'
        const stripe = new (await import('stripe')).default(stripeKey, { apiVersion: '2025-02-24.acacia' as any })

        // Sepetteki ürünleri Stripe formatına (line_items) dönüştür
        const line_items = cart.items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `${item.project.title} (${item.licenseType} LİSANS)`,
                    description: item.project.description || '',
                    images: item.project.videoUrl ? [item.project.videoUrl] : [] // Opsiyonel, sadece tam URL ise işe yarar
                },
                unit_amount: Math.round(item.price * 100), // Cent cinsinden
            },
            quantity: 1
        }))

        // Checkout Session oluştur (Başarılı ödemeyi webhook dinleyecek)
        const appUrl = process.env.APP_URL || 'http://localhost:3000'
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            customer_email: decoded.email,
            client_reference_id: decoded.userId, // Webhook'ta userId'ye ulaşmak için
            metadata: {
                cartId: cart.id
            },
            success_url: `${appUrl}/dashboard?tab=purchases&payment=success`,
            cancel_url: `${appUrl}/checkout?payment=cancelled`,
        })

        // Webhook tetiklendiğinde işlemler tamamlanacak
        // Şimdilik sadece URL döndürüyoruz, frontend bu URL'ye yönlendirecek
        return { success: true, url: session.url }
    } catch (err: any) {
        console.error('Checkout error:', err)
        return createError({ statusCode: 500, statusMessage: 'Ödeme oturumu oluşturulurken bir hata oluştu: ' + err.message })
    }
})
