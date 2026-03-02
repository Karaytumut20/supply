import fs from 'fs'
import path from 'path'

const createDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

createDir(path.join(process.cwd(), 'app/pages/creator'))
createDir(path.join(process.cwd(), 'server/api/user'))
createDir(path.join(process.cwd(), 'server/api/creator'))

// 1. PRISMA SCHEMA GÜNCELLEMESİ (Author ve Bio eklendi)
const prismaSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(uuid())
  name          String?
  email         String         @unique
  password      String
  role          Role           @default(USER)
  isPro         Boolean        @default(false)
  bio           String?        // YENI: Satıcı biyografisi
  avatar        String?        // YENI: Profil resmi URL'si
  createdAt     DateTime       @default(now())

  tickets       Ticket[]
  savedProjects SavedProject[]
  purchases     Purchase[]
  createdWorks  Project[]      @relation("AuthorProjects") // YENI: Satıcının ürettiği projeler
}

model Project {
  id          String         @id @default(uuid())
  title       String
  description String?
  videoUrl    String
  sourceUrl   String?
  price       Float          @default(0)
  categories  String
  tags        String?
  techStack   String?
  downloads   Int            @default(0)
  rating      Float          @default(5.0)
  reviewCount Int            @default(0)
  status      String         @default("Active")
  createdAt   DateTime       @default(now())

  authorId    String?        // YENI: Ürünü oluşturan kişi
  author      User?          @relation("AuthorProjects", fields: [authorId], references: [id])

  savedBy     SavedProject[]
  purchases   Purchase[]
}

model Purchase {
  id        String   @id @default(uuid())
  userId    String
  projectId String
  pricePaid Float
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, projectId])
}

model SavedProject {
  id        String   @id @default(uuid())
  userId    String
  projectId String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([userId, projectId])
}

model FAQ {
  id       String @id @default(uuid())
  question String
  answer   String
}

model Ticket {
  id        String   @id @default(uuid())
  subject   String
  message   String
  status    String   @default("OPEN")
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

enum Role {
  USER
  ADMIN
}`

fs.writeFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), prismaSchema, 'utf8')

// 2. KULLANICIYI "PRO" YAPMA API'Sİ (Mock Upgrade)
const upgradeApi = `import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_token')
  if(!userId) throw createError({ statusCode: 401, statusMessage: 'Lütfen giriş yapın.' })

  // Mock Ödeme İşlemi (Burada gerçekte Stripe Webhook veya Iyzico onayı olur)
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isPro: true }
  })

  return { success: true, message: 'Hoş geldin! Artık Pro üyesin.' }
})`
fs.writeFileSync(path.join(process.cwd(), 'server/api/user/upgrade.post.ts'), upgradeApi, 'utf8')

// 3. SATICI (CREATOR) BİLGİSİNİ GETİRME API'Sİ
const creatorApi = `import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const creatorId = query.id as string

  if(!creatorId) throw createError({ statusCode: 400, statusMessage: 'Creator ID gerekli' })

  const creator = await prisma.user.findUnique({
    where: { id: creatorId },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
      createdAt: true,
      createdWorks: {
        where: { status: 'Active' },
        orderBy: { downloads: 'desc' }
      }
    }
  })

  if(!creator) throw createError({ statusCode: 404, statusMessage: 'Satıcı bulunamadı' })

  return creator
})`
fs.writeFileSync(path.join(process.cwd(), 'server/api/creator/profile.get.ts'), creatorApi, 'utf8')

// 4. MUHTEŞEM PRICING (FİYATLANDIRMA) SAYFASI
const pricingCode = `<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '#imports'

useSeoMeta({ title: 'Pricing - Get Pro Access' })

const { data: user, refresh: refreshUser } = await useFetch('/api/auth/me')
const { addToast } = useToast()
const isUpgrading = ref(false)
const isYearly = ref(true)

const upgradeToPro = async () => {
  if(!user.value) {
    addToast('Lütfen önce giriş yapın.', 'error')
    window.location.href = '/sign-in'
    return
  }
  if(user.value.isPro) {
    addToast('Zaten Pro üyesisiniz!', 'info')
    return
  }

  isUpgrading.value = true
  try {
    const res = await $fetch('/api/user/upgrade', { method: 'POST' })
    addToast(res.message, 'success')
    await refreshUser()
    setTimeout(() => window.location.href = '/dashboard', 1500)
  } catch(e) {
    addToast('Yükseltme başarısız oldu.', 'error')
  } finally {
    isUpgrading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-6 relative overflow-hidden">
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black to-transparent pointer-events-none"></div>

    <div class="max-w-[1200px] mx-auto relative z-10 flex flex-col items-center">

      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Level up your <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">workflow.</span>
        </h1>
        <p class="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
          Choose the right plan for you. Get lifetime access to premium components or subscribe to unlock everything instantly.
        </p>
      </div>

      <div class="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-full mb-16 backdrop-blur-md">
        <button @click="isYearly = false" :class="!isYearly ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'" class="px-6 py-2 rounded-full text-sm font-bold transition-all">Monthly</button>
        <button @click="isYearly = true" :class="isYearly ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'" class="px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2">
          Yearly <span class="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:block">Save 20%</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">

        <div class="bg-white/5 border border-white/10 rounded-[2rem] p-10 flex flex-col backdrop-blur-md">
          <h3 class="text-2xl font-bold mb-2">Pay per component</h3>
          <p class="text-zinc-400 text-sm mb-8">Perfect for single projects and freelancers.</p>
          <div class="flex items-baseline gap-2 mb-8">
            <span class="text-5xl font-extrabold">Free</span>
            <span class="text-zinc-500">to join</span>
          </div>
          <ul class="space-y-4 mb-10 flex-1">
            <li class="flex items-center gap-3 text-zinc-300"><svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Browse all components</li>
            <li class="flex items-center gap-3 text-zinc-300"><svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Download free assets</li>
            <li class="flex items-center gap-3 text-zinc-300"><svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Pay individually for premium items</li>
            <li class="flex items-center gap-3 text-zinc-500"><svg class="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> No full library access</li>
          </ul>
          <NuxtLink to="/" class="w-full text-center bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold transition-all">Start Browsing</NuxtLink>
        </div>

        <div class="relative bg-gradient-to-b from-indigo-500/20 to-purple-500/5 border border-indigo-500/30 rounded-[2rem] p-10 flex flex-col shadow-2xl shadow-indigo-500/10 transform md:-translate-y-4 backdrop-blur-md">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg">Most Popular</div>
          <h3 class="text-2xl font-bold mb-2 text-white">All-Access Pro</h3>
          <p class="text-indigo-200/70 text-sm mb-8">For agencies and serious developers.</p>
          <div class="flex items-baseline gap-2 mb-8">
            <span class="text-5xl font-extrabold text-white">\${{ isYearly ? '19' : '29' }}</span>
            <span class="text-indigo-300/60">/ month</span>
          </div>
          <ul class="space-y-4 mb-10 flex-1">
            <li class="flex items-center gap-3 text-indigo-50"><svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <strong class="text-white">Unlock all</strong> premium components</li>
            <li class="flex items-center gap-3 text-indigo-50"><svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Unlimited commercial projects</li>
            <li class="flex items-center gap-3 text-indigo-50"><svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> React, Vue & HTML source code</li>
            <li class="flex items-center gap-3 text-indigo-50"><svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Priority email support</li>
          </ul>

          <button v-if="user?.isPro" disabled class="w-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 py-4 rounded-xl font-bold cursor-not-allowed">Active Plan</button>
          <button v-else @click="upgradeToPro" :disabled="isUpgrading" class="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70">
            {{ isUpgrading ? 'Processing...' : 'Upgrade to Pro' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>`
fs.writeFileSync(path.join(process.cwd(), 'app/pages/pricing.vue'), pricingCode, 'utf8')

// 5. SATICI (CREATOR) PROFİL SAYFASI
const creatorCode = `<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const creatorId = route.params.id

const { data: creator, pending, error } = await useFetch(\`/api/creator/profile?id=\${creatorId}\`)

useSeoMeta({
  title: computed(() => creator.value ? \`\${creator.value.name} - Creator Profile\` : 'Creator Profile')
})

const selectedItem = ref(null)
const isModalOpen = ref(false)
const openModal = (item: any) => { selectedItem.value = item; isModalOpen.value = true }
</script>

<template>
  <div class="min-h-screen bg-[#fafafa]">
    <div v-if="pending" class="pt-40 flex justify-center"><div class="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>

    <div v-else-if="error || !creator" class="pt-40 text-center text-zinc-500">
      <h2 class="text-2xl font-bold text-black mb-2">Creator not found</h2>
      <p>This profile doesn't exist or has been removed.</p>
    </div>

    <div v-else>
      <div class="w-full h-[250px] bg-gradient-to-r from-zinc-800 to-black relative">
         <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div class="max-w-[1200px] mx-auto px-6 relative -mt-16 mb-16 flex flex-col md:flex-row items-center md:items-end gap-6">
        <div class="w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center text-4xl font-bold bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-600">
          <img v-if="creator.avatar" :src="creator.avatar" class="w-full h-full object-cover" />
          <span v-else>{{ creator.name?.charAt(0) }}</span>
        </div>
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-3xl font-bold text-black">{{ creator.name }}</h1>
          <p class="text-zinc-500 mt-1 max-w-lg">{{ creator.bio || 'Digital creator crafting premium web components.' }}</p>
        </div>
        <div class="flex gap-4">
          <div class="bg-white px-5 py-3 rounded-2xl shadow-sm border border-zinc-100 text-center">
            <p class="text-xl font-extrabold text-black">{{ creator.createdWorks?.length || 0 }}</p>
            <p class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Components</p>
          </div>
          <div class="bg-white px-5 py-3 rounded-2xl shadow-sm border border-zinc-100 text-center">
            <p class="text-xl font-extrabold text-emerald-600">{{ creator.createdWorks?.reduce((acc, curr) => acc + curr.downloads, 0) || 0 }}</p>
            <p class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Total Sales</p>
          </div>
        </div>
      </div>

      <div class="max-w-[1600px] mx-auto px-6 pb-24">
        <h3 class="text-xl font-bold text-black mb-8 border-b border-zinc-200 pb-4">Works by {{ creator.name }}</h3>

        <div v-if="creator.createdWorks?.length === 0" class="py-20 text-center text-zinc-500 border border-dashed border-zinc-300 rounded-[2rem]">
          This creator hasn't published any items yet.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <ProductCard v-for="item in creator.createdWorks" :key="item.id" :item="item" @open="openModal" />
        </div>
      </div>

      <ProductModal :isOpen="isModalOpen" :item="selectedItem" @close="isModalOpen = false" />
    </div>
  </div>
</template>`
fs.writeFileSync(path.join(process.cwd(), 'app/pages/creator/[id].vue'), creatorCode, 'utf8')

console.log(
  '✅ Aşama 6: Pro Pricing Sayfası, Mock Upgrade API ve Creator Portfolyo Sistemi başarıyla eklendi!'
)
console.log(
  '⚠️ VERİTABANINA YENİ İLİŞKİLER EKLENDİ! Lütfen "npx prisma db push" komutunu çalıştırınız.'
)
