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

    const fileData = formData.find(field => field.name === 'file')
    if (!fileData || !fileData.data || !fileData.filename) {
        throw createError({ statusCode: 400, statusMessage: 'Geçersiz dosya formatı.' })
    }

    try {
        const ext = path.extname(fileData.filename)
        const uniqueFilename = `${uuidv4()}${ext}`

        // Save locally to public directory so it can be downloaded directly
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        const filePath = path.join(uploadDir, uniqueFilename)
        fs.writeFileSync(filePath, fileData.data)

        // Return the relative URL which can be accessed openly if needed or stored in DB
        return {
            success: true,
            url: `/uploads/projects/${uniqueFilename}`
        }

    } catch (error) {
        console.error('File upload error:', error)
        throw createError({ statusCode: 500, statusMessage: 'Dosya yüklenirken sunucu hatası oluştu.' })
    }
})
