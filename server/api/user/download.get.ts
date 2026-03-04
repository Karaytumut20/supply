import { requireAuth } from '../../utils/jwt'
import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'

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
    } else if (user.plan === 'PRO') {
        isAuthorized = true
    } else {
        // Check if user purchased this specific item
        const purchase = await prisma.purchase.findUnique({
            where: {
                userId_projectId: {
                    userId: user.id,
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

    // 4. Resolve File Path
    // Handle both old formats (/uploads/projects/file.zip) and new format (file.zip)
    let filename = project.fileUrl
    if (filename.startsWith('/uploads/projects/')) {
        filename = filename.replace('/uploads/projects/', '')
    }

    const filePath = path.join(process.cwd(), 'server', 'storage', 'projects', filename)

    if (!fs.existsSync(filePath)) {
        // Fallback for files that might still be in public (before migration)
        const oldFilePath = path.join(process.cwd(), 'public', 'uploads', 'projects', filename)
        if (!fs.existsSync(oldFilePath)) {
            throw createError({ statusCode: 404, statusMessage: 'Fiziksel dosya sunucuda bulunamadı.' })
        }

        // Serve from old path if it hasn't been migrated yet
        const stat = fs.statSync(oldFilePath)
        setResponseHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
        setResponseHeader(event, 'Content-Type', 'application/octet-stream')
        setResponseHeader(event, 'Content-Length', stat.size)
        return sendStream(event, fs.createReadStream(oldFilePath))
    }

    // 5. Stream the File
    const stat = fs.statSync(filePath)
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
    setResponseHeader(event, 'Content-Type', 'application/octet-stream')
    setResponseHeader(event, 'Content-Length', stat.size)

    return sendStream(event, fs.createReadStream(filePath))
})
