import { requireAuth } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  // NOTE: Gerçek uygulamada burada "stripe.checkout.sessions.create" kullanılır.
  // Müşteriye döndürülecek geçici başarı adresi:
  const mockCheckoutUrl = `/api/projects/purchase?mock=true&projectId=${body.projectId}`

  return {
    success: true,
    checkoutUrl: mockCheckoutUrl,
    message: "Stripe entegrasyonu için hazırdır."
  }
})