import { requireAuth } from '../../utils/jwt'
import { PrismaClient } from '@prisma/client'
import { generatePresignedUrl } from '../../utils/s3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // 1. Get User
    const user = await requireAuth(event)
    const query = getQuery(event)
    const projectId = query.projectId as string

    if (!projectId) {
        throw createError({ statusCode: 400, statusMessage: 'Project ID Gerekli.' })
    }

    // 2. Get Project
    const project = await prisma.project.findUnique({
        where: { id: projectId }
    })

    if (!project || !project.fileUrl) {
        throw createError({ statusCode: 404, statusMessage: 'Dosya bulunamadı.' })
    }

    // 3. Authorization Check
    let isAuthorized = false
    if (user.role === 'ADMIN') {
        isAuthorized = true
    } else if (project.isPremium === false && project.price === 0) {
        isAuthorized = true // Free item
    } else if (user.plan === 'PRO' || user.plan === 'ULTIMATE') {
        isAuthorized = true
    } else {
        // Check if user purchased this specific item
        const purchase = await prisma.purchase.findUnique({
            where: {
                userId_projectId: {
                    userId: user.userId,
                    projectId: project.id
                }
            }
        })
        if (purchase) {
            isAuthorized = true
        }
    }

    if (!isAuthorized) {
        throw createError({ statusCode: 403, statusMessage: 'Bu dosyayı indirmek için satın almanız vaya PRO üye olmanız gerekmektedir.' })
    }

    // 4. Resolve File Key and generate signed URL
    let fileKey = project.fileUrl
    if (fileKey.startsWith('/uploads/projects/')) {
        fileKey = fileKey.replace('/uploads/projects/', 'projects/')
    }

    try {
        // Create professional friendly filename: "My-Premium-Effect.zip"
        const cleanTitle = project.title.replace(/[^a-zA-Z0-9]/g, '-')
        const fileExt = fileKey.split('.').pop() || 'zip'
        const downloadName = `${cleanTitle}.${fileExt}`

        // 15 minutes = 900 seconds
        const signedUrl = await generatePresignedUrl(fileKey, 900, downloadName)
        return sendRedirect(event, signedUrl, 302)
    } catch (err) {
        console.error('Presigned URL error:', err)
        throw createError({ statusCode: 500, statusMessage: 'Istenilen dosya icin guvenli indirme linki uretilemedi.' })
    }
})
