import { requireAuth } from '../../utils/jwt'
import { v4 as uuidv4 } from 'uuid'
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    if (user.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Erişim Reddedildi: Sadece Adminler Girebilir' })

    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Dosya bulunamadı.' })
    }

    try {
        const uploadDir = path.join(process.cwd(), 'server', 'storage', 'projects')
        const publicDir = path.join(process.cwd(), 'public', 'uploads', 'gallery')

        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

        let fileUrl = null
        const imageUrls = []

        for (const field of formData) {
            if (field.name === 'file' && field.filename) {
                const ext = path.extname(field.filename).toLowerCase()
                if (ext !== '.zip') {
                    throw createError({ statusCode: 400, statusMessage: 'Kaynak dosyası sadece .zip formatında olmalıdır.' })
                }
                const uniqueFilename = `${uuidv4()}${ext}`
                const filePath = path.join(uploadDir, uniqueFilename)
                fs.writeFileSync(filePath, field.data)
                fileUrl = uniqueFilename
            } else if (field.name === 'images' && field.filename) {
                const ext = path.extname(field.filename).toLowerCase()
                const uniqueFilename = `${uuidv4()}${ext}`
                const filePath = path.join(publicDir, uniqueFilename)
                fs.writeFileSync(filePath, field.data)
                imageUrls.push(`/uploads/gallery/${uniqueFilename}`)
            }
        }

        if (!fileUrl && imageUrls.length === 0) {
            throw createError({ statusCode: 400, statusMessage: 'Yüklenecek dosya veya görsel bulunamadı.' })
        }

        return {
            success: true,
            url: fileUrl, // Main asset file
            images: imageUrls // Array of public gallery images
        }

    } catch (error: any) {
        console.error('File upload error:', error)
        throw createError({ statusCode: 500, statusMessage: error.message || 'Dosya yüklenirken sunucu hatası oluştu.' })
    }
})
