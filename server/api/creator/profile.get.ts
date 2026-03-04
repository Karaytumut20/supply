import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Tek satıcılı mağaza mantığı: Sadece ADMIN rolündeki ilk/ana kullanıcıyı getir
  const storeOwner = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
      createdAt: true,
    }
  })

  // Tüm aktif projeler bu mağazaya aittir
  const createdWorks = await prisma.project.findMany({
    where: { status: 'Active' },
    orderBy: { downloads: 'desc' }
  })

  if (!storeOwner) {
    return { name: 'Inspo Dashboard', bio: 'Premium UI assets store', createdWorks }
  }

  return { ...storeOwner, createdWorks }
})