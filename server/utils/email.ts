import { Resend } from 'resend'

// Resend initialization
// Note: If no API key is provided, the calls will fail gracefully in the catch block.
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key')
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export const sendPurchaseEmail = async (userEmail: string, items: any[]) => {
    try {
        const itemNames = items.map(i => i.project?.title || 'Dijital Varlık').join(', ')

        await resend.emails.send({
            from: fromEmail,
            to: userEmail,
            subject: 'Siparişiniz Onaylandı - İndirme Bağlantılarınız (Inspo)',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #000;">Teşekkürler! 🎉</h1>
                    <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">Siparişiniz başarıyla onaylandı ve dijital ürünleriniz hesabınıza tanımlandı.</p>
                    <div style="background-color: #f4f4f5; padding: 20px; border-radius: 12px; margin: 24px 0;">
                        <h3 style="margin-top: 0; color: #000;">Satın Aldığınız Ürünler:</h3>
                        <p style="margin-bottom: 0; font-weight: bold; color: #18181b;">${itemNames}</p>
                    </div>
                    <p style="color: #3f3f46; font-size: 16px;">Ürünlerinizi hemen indirmek için kontrol panelinize gidebilirsiniz.</p>
                    <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard?tab=purchases" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 16px;">Kontrol Paneline Git</a>
                </div>
            `
        })
    } catch (error) {
        console.error('Failed to send purchase email:', error)
    }
}

export const sendPasswordResetEmail = async (userEmail: string, resetToken: string) => {
    try {
        const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

        await resend.emails.send({
            from: fromEmail,
            to: userEmail,
            subject: 'Şifre Sıfırlama Talebi (Inspo)',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #000;">Şifre Sıfırlama</h1>
                    <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">Hesabınız için bir şifre sıfırlama talebinde bulundunuz. Şifrenizi yenilemek için aşağıdaki butona tıklayın:</p>
                    <a href="${resetLink}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin: 24px 0;">Şifremi Sıfırla</a>
                    <p style="color: #71717a; font-size: 14px;">Bu bağlantı 1 saat boyunca geçerlidir. Eğer bu talebi siz yapmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz.</p>
                </div>
            `
        })
    } catch (error) {
        console.error('Failed to send password reset email:', error)
    }
}
