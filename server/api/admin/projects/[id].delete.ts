import { requireAuth } from '../../../utils/jwt'
import { PrismaClient } from '@prisma/client'
import { deleteS3Object } from '../../../utils/s3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Erişim Reddedildi: Sadece Adminler Girebilir' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID gerekli' })

  try {
    const project = await prisma.project.findUnique({ where: { id } })
    if (!project) throw createError({ statusCode: 404, statusMessage: 'Proje bulunamadı' })

    // Delete main file from S3 if it exists and is not an old local path
    if (project.fileUrl && !project.fileUrl.startsWith('/uploads/')) {
      let fileKey = project.fileUrl
      // Ensure correct prefix if needed, though upload.post.ts saves as "projects/..."
      await deleteS3Object(fileKey).catch(e => console.error("Failed to delete main S3 file:", e))
    }

    // Delete gallery images from S3
    const projectImages = (project as any).images // cast to bypass cached older type
    if (projectImages && projectImages.length > 0) {
      for (const imgUrl of projectImages) {
        // S3 Object keys in gallery are typically like "gallery/uuid.jpg"
        // The DB stores the full URL. We need to extract the key.
        try {
          const urlObj = new URL(imgUrl)
          // e.g., urlObj.pathname might be "/gallery/uuid.jpg"
          const key = urlObj.pathname.substring(1) // remove leading slash
          if (key) await deleteS3Object(key)
        } catch (err) {
          console.error("Failed to parse or delete S3 image url:", imgUrl, err)
        }
      }
    }

    await prisma.project.delete({ where: { id } })
    return { success: true, message: 'Proje ve dosyaları başarıyla silindi.' }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message || 'Silme işlemi başarısız' })
  }
})