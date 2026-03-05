import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineNitroPlugin((nitroApp) => {
    // Production'da saatte bir kontrol etmesi için cron/interval kurulumu
    // Test için 10 dakikada bir (1000 * 60 * 10 ms) ayarlanıyor gibi düşünebiliriz. Ortalama 1 saat iyidir.
    const intervalTime = 1000 * 60 * 60; // 1 Saat

    console.log(`[Plugin] Subscription Cron Job başlatıldı. Her ${intervalTime / 60000} dakikada bir kontrol edilecek.`)

    setInterval(async () => {
        try {
            const now = new Date()
            // Süresi dolmuş ve HALA PRO VEYA ULTIMATE OLAN kullanıcıları FREE'ye düşür.
            const expiredUsers = await prisma.user.updateMany({
                where: {
                    subscriptionEndsAt: {
                        lt: now
                    },
                    plan: {
                        not: 'FREE'
                    }
                },
                data: {
                    plan: 'FREE',
                    isPro: false,
                    subscriptionEndsAt: null, // süresi bittiği için temizle
                    planSource: 'EXPIRED'
                }
            })

            if (expiredUsers.count > 0) {
                console.log(`[Cron] Toplam ${expiredUsers.count} kullanıcının abonelik süresi bittiği için FREE pakete düşürüldü.`)
            }
        } catch (e) {
            console.error('[Cron Error] Abonelik iptal işleminde hata oluştu:', e)
        }
    }, intervalTime)
})
