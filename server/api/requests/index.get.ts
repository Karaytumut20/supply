import { PrismaClient } from '@prisma/client'
import { getDecodedUser } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // Optional auth to see if current user voted
    let user: any = null
    try { user = getDecodedUser(event) } catch (e) { }

    const requests = await prisma.templateRequest.findMany({
        orderBy: [
            { status: 'asc' }, // Because APPROVED/PENDING comes before PUBLISHED in string compare?
            // Actually, we want to order by vote count, which Prisma doesn't natively do easily unless we query votes or add a cached 'voteCount' column.
            { createdAt: 'desc' }
        ],
        include: {
            user: { select: { name: true, plan: true } },
            votes: { select: { userId: true } }
        }
    })

    // Map votes to a count, and determine if current user has voted
    const mapped = requests.map((req: any) => {
        const hasVoted = user ? req.votes.some((v: any) => v.userId === user.userId) : false

        return {
            id: req.id,
            title: req.title,
            description: req.description,
            status: req.status,
            createdAt: req.createdAt,
            user: req.user,
            voteCount: req.votes.length,
            hasVoted
        }
    })

    // Sort by vote count descending
    mapped.sort((a: any, b: any) => {
        if (a.status === 'PUBLISHED' && b.status !== 'PUBLISHED') return 1
        if (a.status !== 'PUBLISHED' && b.status === 'PUBLISHED') return -1
        return b.voteCount - a.voteCount
    })

    return mapped
})
