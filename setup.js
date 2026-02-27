import fs from 'fs'
import path from 'path'

console.log('🚀 Full-Stack Dönüşümü Başlıyor: Prisma, Auth, Dashboard, API ve Fazlası...\n')

const files = {
  // 1. PRISMA SCHEMA
  'prisma/schema.prisma': `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String?
  email     String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  tickets   Ticket[]
}

model Project {
  id         String   @id @default(uuid())
  title      String
  videoUrl   String
  categories String
  tags       String?
  status     String   @default("Active")
  createdAt  DateTime @default(now())
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
  status    String   @default("OPEN") // OPEN, CLOSED
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

enum Role {
  USER
  ADMIN
}
  `,

  // 2. ENV DOSYASI
  '.env': `
DATABASE_URL="postgresql://postgres:password@localhost:5432/inspo_clone?schema=public"
AUTH_SECRET="cok-gizli-super-guvenli-anahtar-12345"
  `,

  // 3. NUXT CONFIG GÜNCELLEMESİ
  'nuxt.config.ts': `
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    '@nuxtjs/seo',
    '@sidebase/nuxt-auth',
    '@pinia/nuxt'
  ],
  auth: {
    globalAppMiddleware: false,
    provider: {
      type: 'authjs'
    }
  },
  site: {
    url: 'http://localhost:3000',
    name: 'Inspo Clone',
    description: 'A visual replication of inspo.page',
    defaultLocale: 'en'
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
  `,

  // 4. AUTH API (NextAuth)
  'server/api/auth/[...].ts': `
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default defineEventHandler((event) => {
  // Uyarı: Gerçek bir projede NuxtAuth yapılandırması Nuxt handler'ı ile sarılır.
  // Bu temel bir NextAuth config simülasyonudur.
})
  `,

  // 5. YENİ TICKET (DESTEK & SSS) SAYFASI
  'app/pages/ticket.vue': `<script setup lang="ts">
import { ref } from 'vue'
useSeoMeta({ title: 'Support & FAQ' })

const faqs = [
  { q: 'What is Inspo Clone?', a: 'It is a curated library of website inspirations and components.' },
  { q: 'How can I submit a component?', a: 'You can submit your own component via the Submit link in the footer.' },
  { q: 'Is the source code free?', a: 'Some components are free, while premium ones require a purchase.' },
  { q: 'How do I contact support?', a: 'Use the form on the right side to create a support ticket.' }
]

const activeFaq = ref<number | null>(0)

const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

const form = ref({ subject: '', message: '' })
const isSubmitting = ref(false)

const submitTicket = async () => {
  isSubmitting.value = true
  // Burada API çağrısı yapılacak: await $fetch('/api/tickets', { method: 'POST', body: form.value })
  setTimeout(() => {
    isSubmitting.value = false
    alert('Ticket submitted successfully!')
    form.value = { subject: '', message: '' }
  }, 1000)
}
</script>

<template>
  <div class="max-w-[1200px] mx-auto py-24 px-6">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Help & Support</h1>
      <p class="text-zinc-500 text-lg">Find answers to common questions or reach out to us directly.</p>
    </div>

    <div class="flex flex-col lg:flex-row gap-12 lg:gap-24">

      <div class="w-full lg:w-1/2">
        <h2 class="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        <div class="flex flex-col gap-4">
          <div v-for="(faq, i) in faqs" :key="i" class="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50/50">
            <button @click="toggleFaq(i)" class="w-full px-6 py-5 flex justify-between items-center text-left font-medium text-black hover:bg-zinc-100 transition-colors">
              {{ faq.q }}
              <svg :class="{'rotate-180': activeFaq === i}" class="w-5 h-5 transition-transform text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div v-show="activeFaq === i" class="px-6 pb-5 text-zinc-600 leading-relaxed text-sm">
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-1/2">
        <h2 class="text-2xl font-semibold mb-6">Submit a Ticket</h2>
        <form @submit.prevent="submitTicket" class="bg-white p-8 rounded-[2rem] border border-zinc-200 flex flex-col gap-5 shadow-xl shadow-zinc-200/50">
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-2">Subject</label>
            <input v-model="form.subject" type="text" required placeholder="e.g. Account Issue" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-4 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-2">Message</label>
            <textarea v-model="form.message" required rows="5" placeholder="How can we help you?" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-4 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"></textarea>
          </div>
          <button type="submit" :disabled="isSubmitting" class="w-full bg-black text-white py-4 mt-2 rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-70">
            {{ isSubmitting ? 'Sending...' : 'Send Message' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>`,

  // 6. GÜNCEL SIGN-IN
  'app/pages/sign-in.vue': `<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

useSeoMeta({ title: 'Sign In' })
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  // Mock login for now -> Gerçek projede: await signIn('credentials', { email: email.value, password: password.value, callbackUrl: '/dashboard' })
  setTimeout(() => {
    isLoading.value = false
    router.push('/dashboard')
  }, 1000)
}
</script>

<template>
  <div class="min-h-screen flex bg-white">
    <div class="hidden lg:flex w-1/2 bg-[#0a0a0a] relative p-12 flex-col justify-between overflow-hidden">
      <div class="absolute inset-0 opacity-40 mix-blend-overlay overflow-hidden">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" class="w-full h-full object-cover animate-slow-pan" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
      <div class="relative z-10 flex gap-1.5 reveal-text">
        <div class="w-[20px] h-[20px] rounded-full bg-[#3b82f6]"></div>
        <div class="w-[20px] h-[20px] bg-[#ef4444]" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
        <div class="w-[20px] h-[20px] bg-[#eab308]"></div>
      </div>
      <div class="relative z-10">
        <h2 class="text-4xl lg:text-5xl font-medium text-white mb-6 tracking-tight leading-tight reveal-text delay-100">Start saving<br/>your inspiration.</h2>
        <p class="text-zinc-400 text-lg max-w-md font-light reveal-text delay-150">Join the community of creators. Collect your favorite web animations in one place.</p>
      </div>
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
      <NuxtLink to="/" class="absolute top-8 left-8 text-zinc-500 hover:text-black transition-colors flex items-center gap-2 text-sm font-medium">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Home
      </NuxtLink>

      <div class="w-full max-w-sm reveal-text delay-50">
        <h1 class="text-3xl font-bold tracking-tight text-black mb-2">Welcome back</h1>
        <p class="text-zinc-500 text-sm mb-8">Enter your details below to access your account.</p>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Email address</label>
            <input v-model="email" type="email" required placeholder="hello@example.com" class="w-full bg-[#f4f4f5] border border-transparent focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 rounded-xl px-4 py-3.5 text-black outline-none transition-all duration-200" />
          </div>
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-sm font-medium text-zinc-700">Password</label>
              <a href="#" class="text-xs text-zinc-500 hover:text-black transition-colors">Forgot password?</a>
            </div>
            <input v-model="password" type="password" required placeholder="••••••••" class="w-full bg-[#f4f4f5] border border-transparent focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 rounded-xl px-4 py-3.5 text-black outline-none transition-all duration-200" />
          </div>

          <button :disabled="isLoading" class="w-full bg-black text-white py-3.5 rounded-xl font-medium mt-2 hover:bg-zinc-800 transition-colors focus:ring-4 focus:ring-zinc-300 disabled:opacity-70 flex justify-center items-center h-[52px]">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>`,

  // 7. KULLANICI PANELİ (DASHBOARD)
  'app/pages/dashboard.vue': `<script setup lang="ts">
useSeoMeta({ title: 'My Dashboard' })

const savedProjects = [
  { id: 1, title: 'Estrela Transitions', categories: 'Page Transition', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop' },
  { id: 2, title: 'Nexus Store', categories: 'Navigation', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop' }
]

const myTickets = [
  { id: 'TCK-001', subject: 'Account Upgrade', status: 'OPEN', date: 'Oct 24, 2025' },
  { id: 'TCK-002', subject: 'Bug Report in Hero component', status: 'CLOSED', date: 'Oct 20, 2025' }
]
</script>

<template>
  <div class="min-h-screen bg-[#fafafa] pt-24 pb-12 px-6">
    <div class="max-w-[1200px] mx-auto">

      <div class="flex justify-between items-end mb-10 border-b border-zinc-200 pb-6">
        <div>
          <h1 class="text-3xl font-bold text-black tracking-tight">Dashboard</h1>
          <p class="text-zinc-500 mt-1">Welcome back, John Doe. Manage your saved items and tickets here.</p>
        </div>
        <NuxtLink to="/" class="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-sm font-medium transition-colors">
          Log Out
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">

        <div class="lg:col-span-2">
          <h2 class="text-xl font-semibold mb-6">Saved Inspirations</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-for="proj in savedProjects" :key="proj.id" class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-4 group cursor-pointer">
              <div class="w-full aspect-video rounded-xl bg-zinc-100 overflow-hidden relative">
                 <img :src="proj.img" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div>
                <h3 class="font-medium text-black">{{ proj.title }}</h3>
                <p class="text-sm text-zinc-500">{{ proj.categories }}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold">My Tickets</h2>
            <NuxtLink to="/ticket" class="text-sm text-blue-600 hover:underline">New Ticket</NuxtLink>
          </div>
          <div class="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div v-for="ticket in myTickets" :key="ticket.id" class="p-5 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors cursor-pointer">
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-mono text-zinc-400">{{ ticket.id }}</span>
                <span :class="ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500'" class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                  {{ ticket.status }}
                </span>
              </div>
              <h3 class="font-medium text-black text-sm mb-1">{{ ticket.subject }}</h3>
              <p class="text-xs text-zinc-500">{{ ticket.date }}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>`
}

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filepath)
  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8')
  console.log(`✅ Oluşturuldu/Güncellendi: ${filepath}`)
}

console.log('\n🎉 İşlem Tamamlandı!')
console.log('Şimdi lütfen terminalde şu komutları sırasıyla çalıştır:')
console.log(
  '1. npm install @prisma/client @sidebase/nuxt-auth next-auth bcryptjs pinia @pinia/nuxt'
)
console.log('2. npm install -D prisma @types/bcryptjs')
console.log('3. npx prisma db push  (PostgreSQL veritabanını tablolarla senkronize etmek için)')
console.log('4. npx prisma generate')
console.log('5. npm run dev')
