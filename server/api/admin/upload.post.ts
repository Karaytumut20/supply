import { requireAuth } from '../../utils/jwt'
import { v4 as uuidv4 } from 'uuid'
import path from 'node:path'
import { uploadToS3, getS3Bucket } from '../../utils/s3'

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    if (user.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Erişim Reddedildi: Sadece Adminler Girebilir' })

    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Dosya bulunamadı.' })
    }

    try {
        let fileUrl = null
        const imageUrls = []

        for (const field of formData) {
            if (field.name === 'file' && field.filename) {
                const ext = path.extname(field.filename).toLowerCase()
                if (ext !== '.zip') {
                    throw createError({ statusCode: 400, statusMessage: 'Kaynak dosyası sadece .zip formatında olmalıdır.' })
                }
                const uniqueFilename = `projects/${uuidv4()}${ext}`
                await uploadToS3(uniqueFilename, field.data, field.type || 'application/zip')
                fileUrl = uniqueFilename
            } else if (field.name === 'images' && field.filename) {
                const ext = path.extname(field.filename).toLowerCase()
                const uniqueFilename = `gallery/${uuidv4()}${ext}`
                await uploadToS3(uniqueFilename, field.data, field.type || 'image/jpeg')

                const publicUrl = process.env.S3_PUBLIC_URL
                    ? `${process.env.S3_PUBLIC_URL}/${uniqueFilename}`
                    : `https://${getS3Bucket()}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${uniqueFilename}`

                imageUrls.push(publicUrl)
            }
        }

        if (!fileUrl && imageUrls.length === 0) {
            throw createError({ statusCode: 400, statusMessage: 'Yüklenecek dosya veya görsel bulunamadı.' })
        }

        return {
            success: true,
            url: fileUrl, // S3 object key for main asset
            images: imageUrls // Array of public S3 URLs
        }
    } catch (error: any) {
        console.error('File upload error:', error)
        throw createError({ statusCode: 500, statusMessage: error.message || 'Dosya yüklenirken sunucu hatası oluştu.' })
    }
})
