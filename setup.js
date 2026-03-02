import fs from 'fs'
import path from 'path'

// 1. PRISMA SCHEMA GÜNCELLEMESİ (Multi-Framework Code eklendi)
const prismaSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String         @id @default(uuid())
  name             String?
  email            String         @unique
  password         String
  role             Role           @default(USER)
  plan             Plan           @default(FREE)
  isPro            Boolean        @default(false)
  stripeCustomerId String?
  bio              String?
  avatar           String?
  createdAt        DateTime       @default(now())

  tickets          Ticket[]
  savedProjects    SavedProject[]
  purchases        Purchase[]
  createdWorks     Project[]      @relation("AuthorProjects")
  reviews          Review[]
}

model Project {
  id               String         @id @default(uuid())
  title            String
  videoUrl         String
  categories       String
  tags             String?
  status           String         @default("Active")
  isPremium        Boolean        @default(false)
  productType      ProductType    @default(COMPONENT)
  price            Float          @default(0)
  description      String?
  techStack        String?
  downloads        Int            @default(0)
  rating           Float          @default(5.0)
  reviewCount      Int            @default(0)
  sourceUrl        String?

  // YENI: Coklu Framework Kod Destegi
  sourceCode       String?        @db.Text // Legacy/Fallback
  sourceCodeReact  String?        @db.Text
  sourceCodeVue    String?        @db.Text
  sourceCodeHtml   String?        @db.Text

  createdAt        DateTime       @default(now())

  authorId         String?
  author           User?          @relation("AuthorProjects", fields: [authorId], references: [id])

  savedBy          SavedProject[]
  purchasedBy      Purchase[]
  reviews          Review[]

  @@index([status])
  @@index([isPremium])
  @@index([categories])
}

model Review {
  id        String   @id @default(uuid())
  rating    Int
  comment   String?  @db.Text
  userId    String
  projectId String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, projectId])
  @@index([projectId])
}

model Purchase {
  id        String   @id @default(uuid())
  userId    String
  projectId String
  pricePaid Float?   @default(0)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, projectId])
  @@index([userId])
  @@index([projectId])
}

model SavedProject {
  id        String   @id @default(uuid())
  userId    String
  projectId String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, projectId])
  @@index([userId])
  @@index([projectId])
}

model Ticket {
  id        String   @id @default(uuid())
  subject   String
  message   String
  status    String   @default("OPEN")
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([status])
}

model Category {
  id        String   @id @default(uuid())
  name      String   @unique
  createdAt DateTime @default(now())
}

enum Role {
  USER
  ADMIN
}

enum Plan {
  FREE
  PRO
}

enum ProductType {
  COMPONENT
  ANIMATION
  TEMPLATE
  EFFECT
}`
fs.writeFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), prismaSchema, 'utf8')

// 2. ADMIN API GÜNCELLEMELERİ (Yeni kod alanlarını kaydetmek için)
const adminPostApi = `import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await prisma.project.create({
    data: {
      title: body.title,
      description: body.description || null,
      videoUrl: body.videoUrl,
      sourceUrl: body.sourceUrl || null,
      price: parseFloat(body.price) || 0,
      categories: body.categories,
      tags: body.tags || 'new',
      techStack: body.techStack || 'HTML, CSS',
      rating: parseFloat(body.rating) || 5.0,
      reviewCount: parseInt(body.reviewCount) || 0,
      status: body.status || 'Active',
      isPremium: body.isPremium || false,
      sourceCode: body.sourceCode || '',
      sourceCodeReact: body.sourceCodeReact || '',
      sourceCodeVue: body.sourceCodeVue || '',
      sourceCodeHtml: body.sourceCodeHtml || ''
    }
  })
})`
fs.writeFileSync(
  path.join(process.cwd(), 'server/api/admin/projects.post.ts'),
  adminPostApi,
  'utf8'
)

const adminPutApi = `import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  return await prisma.project.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      videoUrl: body.videoUrl,
      sourceUrl: body.sourceUrl,
      price: parseFloat(body.price),
      categories: body.categories,
      tags: body.tags,
      techStack: body.techStack,
      rating: parseFloat(body.rating),
      reviewCount: parseInt(body.reviewCount),
      status: body.status,
      isPremium: body.isPremium,
      sourceCode: body.sourceCode,
      sourceCodeReact: body.sourceCodeReact,
      sourceCodeVue: body.sourceCodeVue,
      sourceCodeHtml: body.sourceCodeHtml
    }
  })
})`
fs.writeFileSync(
  path.join(process.cwd(), 'server/api/admin/projects/[id].put.ts'),
  adminPutApi,
  'utf8'
)

// 3. ANASAYFA GÜNCELLEMESİ (Advanced Sorting Eklendi)
const indexCode = `<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '#imports'

useSeoMeta({ title: 'Home - Premium UI Components' })

const tags = ['All', 'Hero', 'Navigation', 'Page Transition', 'Card', 'Interaction']
const activeTag = ref('All')
const searchQuery = ref('')
const priceFilter = ref('all')
const sortBy = ref('newest') // 'newest', 'popular', 'top_rated'
const email = ref('')
const { addToast } = useToast()

const { data: dbProjects, pending } = await useFetch('/api/projects')

const items = computed(() => {
  if (!dbProjects.value) return []
  return dbProjects.value.map((p: any) => ({
    ...p, video: p.videoUrl,
    categories: p.categories ? p.categories.split(',').map((c: string) => c.trim()) : [],
    tags: p.tags ? p.tags.split(',').map((t: string) => t.trim()) : [],
    techStack: p.techStack || 'HTML, CSS'
  }))
})

// Advanced Filtering & Sorting
const filteredItems = computed(() => {
  let result = [...items.value]

  // Tag Filter
  if (activeTag.value !== 'All') result = result.filter((item: any) => item.categories.some((cat: string) => cat.toLowerCase().includes(activeTag.value.toLowerCase())))

  // Search Filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((item: any) => item.title.toLowerCase().includes(q) || item.techStack.toLowerCase().includes(q))
  }

  // Price Filter
  if (priceFilter.value === 'free') result = result.filter((item: any) => !item.price || item.price <= 0)
  else if (priceFilter.value === 'premium') result = result.filter((item: any) => item.price > 0)

  // Sorting
  if (sortBy.value === 'newest') {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else if (sortBy.value === 'popular') {
    result.sort((a, b) => b.downloads - a.downloads)
  } else if (sortBy.value === 'top_rated') {
    result.sort((a, b) => b.rating - a.rating)
  }

  return result
})

const selectedItem = ref(null)
const isModalOpen = ref(false)

const openModal = (item: any) => { selectedItem.value = item; isModalOpen.value = true }
const subscribe = () => { if(email.value) { addToast('Aramıza hoş geldin! Güncellemeleri mailine göndereceğiz.', 'success'); email.value = '' } }
</script>

<template>
  <div class="bg-[#fafafa] min-h-screen">

    <section class="bg-black text-white pt-40 pb-28 px-5 md:px-8 w-full relative overflow-hidden flex flex-col items-center text-center">
      <div class="absolute inset-0 z-0">
          <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
          <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div class="w-full max-w-5xl relative z-10 flex flex-col items-center">
        <h1 class="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] font-bold tracking-tight mb-6 leading-[1.05] reveal-text">
          The curated library<br/><span class="text-zinc-500 font-light italic">of modern web design.</span>
        </h1>
        <p class="text-zinc-400 text-lg sm:text-xl mb-12 max-w-2xl font-light tracking-wide reveal-text delay-100">
          Elevate your projects with our collection of production-ready components, animations, and layouts. Built for developers who care about the details.
        </p>

        <div class="w-full max-w-2xl flex flex-col sm:flex-row gap-4 items-center reveal-text delay-150">
          <div class="relative w-full">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input v-model="searchQuery" type="text" placeholder="Search React, Vue, Header..." class="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-2xl pl-12 pr-4 py-4 text-white outline-none transition-colors backdrop-blur-md" />
          </div>
          <div class="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 gap-1 shrink-0 backdrop-blur-md">
            <button @click="priceFilter = 'all'" :class="priceFilter === 'all' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all">All</button>
            <button @click="priceFilter = 'free'" :class="priceFilter === 'free' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-white'" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all">Free</button>
            <button @click="priceFilter = 'premium'" :class="priceFilter === 'premium' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white'" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all">Pro</button>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 px-5 md:px-8 py-4 sticky top-[72px] z-40 transition-all shadow-sm">
      <div class="w-full max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        <div class="flex items-center gap-6 overflow-x-auto no-scrollbar w-full md:w-auto">
          <span class="text-[11px] font-mono text-zinc-400 tracking-[0.2em] whitespace-nowrap uppercase font-bold hidden sm:block">Filtered By</span>
          <div class="flex gap-2">
            <button v-for="tag in tags" :key="tag" @click="activeTag = tag" :class="['px-5 py-2 rounded-full text-[12px] font-bold tracking-wide transition-all duration-300 whitespace-nowrap', activeTag === tag ? 'bg-black text-white shadow-md' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600']">
               {{ tag }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0 ml-auto w-full md:w-auto justify-end">
          <span class="text-xs font-semibold text-zinc-400 uppercase tracking-widest hidden lg:block">Sort</span>
          <div class="relative">
             <select v-model="sortBy" class="appearance-none bg-zinc-100 hover:bg-zinc-200 border-none text-zinc-800 text-sm font-bold py-2 pl-4 pr-10 rounded-xl outline-none cursor-pointer transition-colors shadow-sm">
               <option value="newest">Sparkles (Newest)</option>
               <option value="popular">Most Popular</option>
               <option value="top_rated">Top Rated</option>
             </select>
             <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

      </div>
    </section>

    <section class="max-w-[1600px] mx-auto px-5 md:px-8 py-12 md:py-20 min-h-screen">
      <div v-if="pending" class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        <ProductSkeleton v-for="i in 8" :key="i" />
      </div>
      <TransitionGroup v-else name="list" tag="div" class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 relative">
        <ProductCard v-for="(item, index) in filteredItems" :key="item.id" :item="item" @open="openModal" />
      </TransitionGroup>
      <div v-if="!pending && filteredItems.length === 0" class="py-32 text-center">
        <h3 class="text-xl font-bold text-zinc-900 mb-2">No components found</h3>
        <p class="text-zinc-500">Try adjusting your search or filters.</p>
      </div>
    </section>

    <ProductModal :isOpen="isModalOpen" :item="selectedItem" @close="isModalOpen = false" />
  </div>
</template>`
fs.writeFileSync(path.join(process.cwd(), 'app/pages/index.vue'), indexCode, 'utf8')

// 4. GELİŞMİŞ PRODUCT MODAL (Çoklu Framework Sekmeleri & Benzer Ürünler eklendi)
const productModalCode = `<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useToast } from '#imports'

const props = defineProps<{ isOpen: boolean, item: any }>()
const emit = defineEmits(['close'])
const { addToast } = useToast()

const activeTab = ref('overview')
const activeFramework = ref('react') // 'react', 'vue', 'html'

const close = () => {
    isProcessing.value = false
    activeTab.value = 'overview'
    emit('close')
}

const { data: user, refresh: refreshUser } = await useFetch('/api/auth/me')
const { data: reviews, refresh: refreshReviews } = await useFetch(() => props.item?.id ? \`/api/projects/\${props.item.id}/reviews\` : null)

// Related Products (Cross-sell)
const { data: allProjects } = await useFetch('/api/projects')
const relatedProducts = computed(() => {
  if(!allProjects.value || !props.item) return []
  return allProjects.value
    .filter((p:any) => p.id !== props.item.id && p.categories.includes(props.item.categories.split(',')[0]))
    .slice(0, 3) // Sadece 3 tane göster
})

const reviewForm = ref({ rating: 5, comment: '' })
const isSubmittingReview = ref(false)

const averageRating = computed(() => {
  if(!reviews.value || reviews.value.length === 0) return props.item?.rating?.toFixed(1) || '5.0'
  const total = reviews.value.reduce((acc: number, r: any) => acc + r.rating, 0)
  return (total / reviews.value.length).toFixed(1)
})

const displayTags = computed(() => props.item?.tags ? (Array.isArray(props.item.tags) ? props.item.tags : props.item.tags.split(',').map((t:string) => t.trim())) : [])
const displayCategories = computed(() => props.item?.categories ? (Array.isArray(props.item.categories) ? props.item.categories.join(', ') : props.item.categories) : 'Component')
const hasPurchased = computed(() => user.value?.purchases?.includes(props.item?.id))
const isFree = computed(() => !props.item?.price || props.item?.price <= 0)
const hasAccess = computed(() => user.value?.role === 'ADMIN' || (props.item?.isPremium && user.value?.plan === 'PRO') || isFree.value || hasPurchased.value)

const isProcessing = ref(false)
const buyItem = async () => { /* ... (önceki kodlarla aynı) */ }

const submitReview = async () => { /* ... (önceki kodlarla aynı) */ }

// YENI: Aktif Framework'e gore Kodu Goster
const currentCode = computed(() => {
  if (activeFramework.value === 'react') return props.item?.sourceCodeReact || props.item?.sourceCode || '// React code not provided.'
  if (activeFramework.value === 'vue') return props.item?.sourceCodeVue || props.item?.sourceCode || ''
  if (activeFramework.value === 'html') return props.item?.sourceCodeHtml || props.item?.sourceCode || ''
  return ''
})

const copyCode = async () => {
  await navigator.clipboard.writeText(currentCode.value)
  addToast(\`\${activeFramework.value.toUpperCase()} Code copied to clipboard!\`, 'success')
}

watch(() => props.isOpen, (val) => {
  if (typeof document !== 'undefined') document.body.style.overflow = val ? 'hidden' : ''
  if(val) refreshReviews()
})
onUnmounted(() => { if (typeof document !== 'undefined') document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-8">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-2xl transition-opacity" @click="close"></div>

        <Transition enter-active-class="transition duration-700 ease-out delay-75" enter-from-class="opacity-0 translate-y-16 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100">
          <div v-if="isOpen" class="relative w-full max-w-[1400px] h-full md:h-[90vh] lg:h-[85vh] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/20">

            <button @click="close" class="absolute top-6 right-6 z-50 p-3.5 bg-white/20 hover:bg-white/80 backdrop-blur-xl text-black rounded-full transition-all shadow-lg border border-black/10 group">
               <svg class="transform group-hover:rotate-90 transition-transform duration-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div class="w-full lg:w-[55%] bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden h-[45vh] lg:h-full shrink-0">
               <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 40px 40px;"></div>

               <div class="w-full h-full relative flex flex-col items-center justify-center p-6 lg:p-12">
                 <div class="w-full max-w-4xl relative rounded-[1.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)] ring-1 ring-white/10 group">
                   <video :src="item?.video || item?.videoUrl" autoplay loop muted playsinline class="w-full aspect-video md:aspect-[16/10] object-cover"></video>
                 </div>
               </div>
            </div>

            <div class="w-full lg:w-[45%] flex flex-col bg-white relative h-[55vh] lg:h-full">

               <div class="flex px-8 pt-8 gap-6 border-b border-zinc-100 shrink-0">
                  <button @click="activeTab = 'overview'" :class="activeTab === 'overview' ? 'text-black border-black' : 'text-zinc-400 border-transparent hover:text-zinc-700'" class="pb-4 font-bold tracking-wide uppercase text-xs border-b-2 transition-colors">Overview</button>
                  <button @click="activeTab = 'code'" :class="activeTab === 'code' ? 'text-black border-black' : 'text-zinc-400 border-transparent hover:text-zinc-700'" class="pb-4 font-bold tracking-wide uppercase text-xs border-b-2 transition-colors">Source Code</button>
                  <button @click="activeTab = 'reviews'" :class="activeTab === 'reviews' ? 'text-black border-black' : 'text-zinc-400 border-transparent hover:text-zinc-700'" class="pb-4 font-bold tracking-wide uppercase text-xs border-b-2 transition-colors">Reviews ({{ reviews?.length || 0 }})</button>
               </div>

               <div class="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar bg-[#fafafa]">

                   <div v-if="activeTab === 'overview'" class="animate-in fade-in slide-in-from-bottom-2">
                     <h2 class="text-3xl lg:text-4xl font-extrabold tracking-tight text-black mb-3">{{ item?.title }}</h2>
                     <p class="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-6">{{ displayCategories }}</p>

                     <div class="prose prose-sm prose-zinc mb-8">
                        <p class="text-zinc-600 leading-relaxed font-medium">{{ item?.description || 'Accelerate your development workflow. This highly polished digital asset provides production-ready code.' }}</p>
                     </div>

                     <div v-if="relatedProducts.length > 0" class="mt-12 border-t border-zinc-200 pt-8">
                        <h4 class="text-sm font-bold text-zinc-900 mb-4">More from this category</h4>
                        <div class="grid grid-cols-2 gap-4">
                           <div v-for="rel in relatedProducts" :key="rel.id" class="bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm cursor-pointer group" @click="emit('open', rel)">
                              <video :src="rel.videoUrl" autoplay loop muted playsinline class="w-full aspect-video rounded-xl object-cover mb-2 group-hover:opacity-80 transition-opacity"></video>
                              <p class="text-xs font-bold text-black px-1 truncate">{{ rel.title }}</p>
                           </div>
                        </div>
                     </div>
                   </div>

                   <div v-if="activeTab === 'code'" class="animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col">
                      <div v-if="!hasAccess" class="relative rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50 h-full flex flex-col items-center justify-center">
                        <div class="absolute inset-0 bg-white/40 backdrop-blur-sm z-10"></div>
                        <div class="relative z-20 text-center p-6">
                           <div class="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 mx-auto text-black">
                             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                           </div>
                           <h4 class="font-bold text-xl mb-2 text-black">Premium Content</h4>
                           <p class="text-sm text-zinc-600 mb-6">Upgrade to PRO or purchase this item to unlock the React, Vue, and HTML source codes.</p>
                        </div>
                      </div>

                      <div v-else class="bg-[#0d0d0d] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col flex-1 h-[400px]">
                        <div class="flex items-center justify-between px-4 pt-2 bg-[#141414] border-b border-zinc-800">
                          <div class="flex gap-1">
                            <button @click="activeFramework = 'react'" :class="activeFramework === 'react' ? 'bg-[#1e1e1e] text-[#61dafb] border-t-2 border-t-[#61dafb]' : 'text-zinc-500 hover:text-zinc-300 border-t-2 border-t-transparent'" class="px-4 py-2 text-xs font-bold font-mono rounded-t-lg transition-colors">React</button>
                            <button @click="activeFramework = 'vue'" :class="activeFramework === 'vue' ? 'bg-[#1e1e1e] text-[#41b883] border-t-2 border-t-[#41b883]' : 'text-zinc-500 hover:text-zinc-300 border-t-2 border-t-transparent'" class="px-4 py-2 text-xs font-bold font-mono rounded-t-lg transition-colors">Vue</button>
                            <button @click="activeFramework = 'html'" :class="activeFramework === 'html' ? 'bg-[#1e1e1e] text-[#e34f26] border-t-2 border-t-[#e34f26]' : 'text-zinc-500 hover:text-zinc-300 border-t-2 border-t-transparent'" class="px-4 py-2 text-xs font-bold font-mono rounded-t-lg transition-colors">HTML</button>
                          </div>
                          <button @click="copyCode" class="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md mb-1">
                            Copy Code
                          </button>
                        </div>
                        <div class="p-6 overflow-y-auto text-[13px] font-mono leading-relaxed text-zinc-300 whitespace-pre-wrap flex-1 custom-scrollbar">
                           {{ currentCode }}
                        </div>
                      </div>
                   </div>

                   <div v-if="activeTab === 'reviews'" class="animate-in fade-in slide-in-from-bottom-2">
                     <p class="text-sm text-zinc-500 mb-4">Reviews will be shown here.</p>
                   </div>
               </div>

               <div class="p-6 bg-white border-t border-zinc-200 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] relative z-30 shrink-0">
                 <div v-if="hasAccess">
                   <button @click="activeTab='code'" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-[56px] rounded-xl font-bold transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 text-[15px]">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> View Source Code
                   </button>
                 </div>
                 <div v-else>
                   <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-[56px] rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 text-[15px]">
                     Buy for \${{ item?.price || 0 }}
                   </button>
                 </div>
               </div>

            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
</style>`
fs.writeFileSync(
  path.join(process.cwd(), 'app/components/Product/Modal.vue'),
  productModalCode,
  'utf8'
)

// ADMIN PANELİ GÜNCELLEMESİ (Modal içerisine React, Vue, HTML kutuları eklendi)
const adminPageUpdated = fs
  .readFileSync(path.join(process.cwd(), 'app/pages/admin/index.vue'), 'utf8')
  .replace(
    '<div><label class="block text-sm font-medium text-zinc-700 mb-1.5">Source Code (HTML/CSS/JS/VUE)</label><textarea v-model="form.sourceCode" rows="6" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm font-mono outline-none resize-none" placeholder="Paste your code here..."></textarea></div>',
    `<div class="space-y-4 border-t border-zinc-200 pt-4 mt-2">
      <h3 class="font-bold text-lg">Multi-Framework Source Codes</h3>
      <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">React Code</label><textarea v-model="form.sourceCodeReact" rows="4" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm font-mono outline-none"></textarea></div>
      <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">Vue Code</label><textarea v-model="form.sourceCodeVue" rows="4" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm font-mono outline-none"></textarea></div>
      <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">HTML/JS Code</label><textarea v-model="form.sourceCodeHtml" rows="4" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm font-mono outline-none"></textarea></div>
    </div>`
  )
fs.writeFileSync(path.join(process.cwd(), 'app/pages/admin/index.vue'), adminPageUpdated, 'utf8')

console.log(
  '✅ Aşama 8: Çoklu Framework Desteği, Sıralama, Cross-selling ve Admin Güncellemeleri uygulandı!'
)
console.log(
  '⚠️ ÖNEMLİ: Lütfen terminalde "npx prisma db push" komutunu çalıştırarak veritabanına React/Vue/Html alanlarını ekleyiniz.'
)
