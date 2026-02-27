import fs from 'fs'
import path from 'path'

// 1. SORUNLU DOSYAYI SİLİYORUZ
const problemFile = path.join(process.cwd(), 'server/api/auth/[...].ts')
try {
  if (fs.existsSync(problemFile)) {
    fs.unlinkSync(problemFile)
  }
} catch (err) {}

// 2. NUXT CONFIG'DEN NUXT-AUTH'U TAMAMEN SİLİYORUZ
const nuxtConfigContent = [
  'export default defineNuxtConfig({',
  "  compatibilityDate: '2025-07-15',",
  '  devtools: { enabled: false },',
  "  css: ['~/assets/css/main.css'],",
  '  postcss: {',
  '    plugins: { tailwindcss: {}, autoprefixer: {} },',
  '  },',
  '  modules: [',
  "    '@nuxtjs/seo',",
  "    '@pinia/nuxt'",
  '  ],',
  '  site: {',
  "    url: 'http://localhost:3000',",
  "    name: 'Inspo Clone'",
  '  },',
  "  app: { pageTransition: { name: 'page', mode: 'out-in' } }",
  '})'
].join('\n')
fs.writeFileSync(path.join(process.cwd(), 'nuxt.config.ts'), nuxtConfigContent, 'utf8')

// 3. KENDİ TERTEMİZ LOGİN API'MİZ
const loginApi = [
  "import { PrismaClient } from '@prisma/client'",
  "import bcrypt from 'bcryptjs'",
  'const prisma = new PrismaClient()',
  'export default defineEventHandler(async (event) => {',
  '  const body = await readBody(event)',
  '  const { email, password } = body',
  "  if(!email || !password) throw createError({ statusCode: 400, statusMessage: 'Zorunlu alanlar eksik' })",
  '  const user = await prisma.user.findUnique({ where: { email } })',
  "  if(!user) throw createError({ statusCode: 401, statusMessage: 'Kullanici bulunamadi' })",
  '  const isValid = await bcrypt.compare(password, user.password)',
  "  if(!isValid) throw createError({ statusCode: 401, statusMessage: 'Hatali sifre' })",
  '  // Sorunsuz, sonsuz dongusuz basit cerez atamasi',
  "  setCookie(event, 'auth_token', user.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })",
  '  return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }',
  '})'
].join('\n')

// 4. KENDİ KAYIT OLMA (REGISTER) API'MİZ
const registerApi = [
  "import { PrismaClient } from '@prisma/client'",
  "import bcrypt from 'bcryptjs'",
  'const prisma = new PrismaClient()',
  'export default defineEventHandler(async (event) => {',
  '  const body = await readBody(event)',
  '  const { email, password, name } = body',
  "  if(!email || !password) throw createError({ statusCode: 400, statusMessage: 'Zorunlu alanlar eksik' })",
  '  const existing = await prisma.user.findUnique({ where: { email } })',
  "  if(existing) throw createError({ statusCode: 400, statusMessage: 'Bu email zaten kayitli' })",
  '  const hashedPassword = await bcrypt.hash(password, 10)',
  '  const user = await prisma.user.create({',
  "    data: { email, password: hashedPassword, name: name || email.split('@')[0], role: 'USER' }",
  '  })',
  "  setCookie(event, 'auth_token', user.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })",
  '  return { success: true, user: { id: user.id, name: user.name, email: user.email } }',
  '})'
].join('\n')

// 5. KULLANICIYI GETİREN API (ME)
const meApi = [
  "import { PrismaClient } from '@prisma/client'",
  'const prisma = new PrismaClient()',
  'export default defineEventHandler(async (event) => {',
  "  const userId = getCookie(event, 'auth_token')",
  '  if(!userId) return null;',
  '  const user = await prisma.user.findUnique({ where: { id: userId } })',
  '  if(!user) return null;',
  '  return { id: user.id, name: user.name, email: user.email, role: user.role }',
  '})'
].join('\n')

// 6. CIKIS YAPMA API'Sİ
const logoutApi = [
  'export default defineEventHandler((event) => {',
  "  deleteCookie(event, 'auth_token', { path: '/' })",
  '  return { success: true }',
  '})'
].join('\n')

// Dosyaları sunucuya yaz
const apiDir = path.join(process.cwd(), 'server/api/auth')
if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true })

fs.writeFileSync(path.join(apiDir, 'login.post.ts'), loginApi, 'utf8')
fs.writeFileSync(path.join(apiDir, 'register.post.ts'), registerApi, 'utf8')
fs.writeFileSync(path.join(apiDir, 'me.get.ts'), meApi, 'utf8')
fs.writeFileSync(path.join(apiDir, 'logout.post.ts'), logoutApi, 'utf8')

// 7. GÜNCEL SIGN-IN SAYFASI (Doğrudan kendi API'lerimizi kullanıyor)
const signInContent = [
  '<script setup lang="ts">',
  "import { ref } from 'vue'",
  'const isLoginMode = ref(true)',
  "const name = ref('')",
  "const email = ref('')",
  "const password = ref('')",
  'const isLoading = ref(false)',
  "const errorMessage = ref('')",
  "const toggleMode = () => { isLoginMode.value = !isLoginMode.value; errorMessage.value = ''; }",
  'const handleSubmit = async () => {',
  '  isLoading.value = true;',
  "  errorMessage.value = '';",
  '  try {',
  "    const endpoint = isLoginMode.value ? '/api/auth/login' : '/api/auth/register';",
  '    await $fetch(endpoint, {',
  "      method: 'POST',",
  '      body: { name: name.value, email: email.value, password: password.value }',
  '    });',
  "    window.location.href = '/dashboard'; // Tertemiz tam sayfa yonlendirmesi",
  '  } catch (err: any) {',
  "    errorMessage.value = err.data?.statusMessage || 'Bir hata olustu.';",
  '  } finally {',
  '    isLoading.value = false;',
  '  }',
  '}',
  '</script>',
  '<template>',
  '  <div class="min-h-screen flex bg-white">',
  '    <div class="hidden lg:flex w-1/2 bg-[#0a0a0a] relative p-12 flex-col justify-between overflow-hidden">',
  '      <div class="absolute inset-0 opacity-40 mix-blend-overlay overflow-hidden">',
  '        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" class="w-full h-full object-cover animate-slow-pan" />',
  '      </div>',
  '      <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>',
  '      <div class="relative z-10 flex gap-1.5 reveal-text">',
  '        <div class="w-[20px] h-[20px] rounded-full bg-[#3b82f6]"></div>',
  '        <div class="w-[20px] h-[20px] bg-[#ef4444]" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>',
  '        <div class="w-[20px] h-[20px] bg-[#eab308]"></div>',
  '      </div>',
  '      <div class="relative z-10">',
  '        <h2 class="text-4xl lg:text-5xl font-medium text-white mb-6 tracking-tight leading-tight reveal-text delay-100">Start saving<br/>your inspiration.</h2>',
  '        <p class="text-zinc-400 text-lg max-w-md font-light reveal-text delay-150">Join the community of creators. Collect your favorite web animations in one place.</p>',
  '      </div>',
  '    </div>',
  '    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">',
  '      <NuxtLink to="/" class="absolute top-8 left-8 text-zinc-500 hover:text-black transition-colors flex items-center gap-2 text-sm font-medium">',
  '        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg>',
  '        Back to Home',
  '      </NuxtLink>',
  '      <div class="w-full max-w-sm reveal-text delay-50">',
  "        <h1 class=\"text-3xl font-bold tracking-tight text-black mb-2\">{{ isLoginMode ? 'Welcome back' : 'Create an account' }}</h1>",
  "        <p class=\"text-zinc-500 text-sm mb-8\">{{ isLoginMode ? 'Enter your details below to access your account.' : 'Fill in the details to join the community.' }}</p>",
  '        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{{ errorMessage }}</div>',
  '        <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">',
  '          <div v-if="!isLoginMode">',
  '            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Full Name</label>',
  '            <input v-model="name" type="text" required placeholder="John Doe" class="w-full bg-[#f4f4f5] border border-transparent focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 rounded-xl px-4 py-3.5 text-black outline-none transition-all duration-200" />',
  '          </div>',
  '          <div>',
  '            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Email address</label>',
  '            <input v-model="email" type="email" required placeholder="hello@example.com" class="w-full bg-[#f4f4f5] border border-transparent focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 rounded-xl px-4 py-3.5 text-black outline-none transition-all duration-200" />',
  '          </div>',
  '          <div>',
  '            <div class="flex justify-between items-center mb-1.5">',
  '              <label class="block text-sm font-medium text-zinc-700">Password</label>',
  '              <a v-if="isLoginMode" href="#" class="text-xs text-zinc-500 hover:text-black transition-colors">Forgot password?</a>',
  '            </div>',
  '            <input v-model="password" type="password" required placeholder="••••••••" class="w-full bg-[#f4f4f5] border border-transparent focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 rounded-xl px-4 py-3.5 text-black outline-none transition-all duration-200" />',
  '          </div>',
  '          <button :disabled="isLoading" class="w-full bg-black text-white py-3.5 rounded-xl font-medium mt-2 hover:bg-zinc-800 transition-colors focus:ring-4 focus:ring-zinc-300 disabled:opacity-70 flex justify-center items-center h-[52px]">',
  "            {{ isLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Sign Up') }}",
  '          </button>',
  '        </form>',
  '        <div class="mt-6 text-center text-sm">',
  "          <span class=\"text-zinc-500\">{{ isLoginMode ? 'Dont have an account?' : 'Already have an account?' }}</span>",
  '          <button @click="toggleMode" type="button" class="text-black font-medium hover:underline ml-1 focus:outline-none">',
  "            {{ isLoginMode ? 'Sign up' : 'Sign in' }}",
  '          </button>',
  '        </div>',
  '      </div>',
  '    </div>',
  '  </div>',
  '</template>'
].join('\n')
fs.writeFileSync(path.join(process.cwd(), 'app/pages/sign-in.vue'), signInContent, 'utf8')

// 8. GÜNCEL DASHBOARD SAYFASI
const dashboardContent = [
  '<script setup lang="ts">',
  "const { data: user, pending } = await useFetch('/api/auth/me')",
  '// Eger kullanici yoksa ana sayfaya at',
  'if (!pending.value && !user.value) {',
  "  if (typeof window !== 'undefined') window.location.href = '/sign-in'",
  '}',
  'const handleLogout = async () => {',
  "  await $fetch('/api/auth/logout', { method: 'POST' })",
  "  window.location.href = '/'",
  '}',
  '</script>',
  '<template>',
  '  <div v-if="user" class="min-h-screen bg-[#fafafa] pt-24 pb-12 px-6">',
  '    <div class="max-w-[1200px] mx-auto">',
  '      <div class="flex justify-between items-end mb-10 border-b border-zinc-200 pb-6">',
  '        <div>',
  '          <h1 class="text-3xl font-bold text-black tracking-tight">Dashboard</h1>',
  '          <p class="text-zinc-500 mt-1">Welcome back, {{ user.name }}. Manage your items here.</p>',
  '          <div v-if="user.role === \'ADMIN\'" class="mt-4">',
  '            <NuxtLink to="/admin" class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border border-indigo-100 hover:bg-indigo-100 transition-colors">',
  '              Go to Admin Panel ->',
  '            </NuxtLink>',
  '          </div>',
  '        </div>',
  '        <button @click="handleLogout" class="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-300 rounded-xl text-sm font-medium transition-colors text-black">',
  '          Log Out',
  '        </button>',
  '      </div>',
  '      <div class="text-zinc-500">Biletleriniz ve Favorileriniz buraya gelecek (Asama 3)...</div>',
  '    </div>',
  '  </div>',
  '</template>'
].join('\n')
fs.writeFileSync(path.join(process.cwd(), 'app/pages/dashboard.vue'), dashboardContent, 'utf8')

// 9. HEADER GUNCELLEMESI
const headerContent = [
  '<script setup lang="ts">',
  "import { ref } from 'vue'",
  'const isAboutOpen = ref(false)',
  "const { data: user } = await useFetch('/api/auth/me')",
  '</script>',
  '<template>',
  '  <div class="min-h-screen bg-white font-sans flex flex-col">',
  '    <header class="absolute top-0 w-full z-50 px-5 md:px-6 py-5 flex items-center justify-end pointer-events-none">',
  '      <div class="flex items-center gap-3 pointer-events-auto text-[13px] font-medium">',
  '        <NuxtLink to="/ticket" class="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-zinc-300 transition-colors px-3 py-1.5 rounded-full flex items-center gap-2">',
  '          Feedback <span class="opacity-50 font-mono text-[10px] border border-zinc-600 rounded-full w-3.5 h-3.5 flex items-center justify-center">?</span>',
  '        </NuxtLink>',
  '        <button @click="isAboutOpen = true" class="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-zinc-300 transition-colors px-3 py-1.5 rounded-full flex items-center gap-2">',
  '          About <span class="text-[9px] bg-zinc-600 text-white px-1.5 py-0.5 rounded uppercase tracking-widest">New</span>',
  '        </button>',
  '        <NuxtLink v-if="user" to="/dashboard" class="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors px-4 py-1.5 rounded-full shadow-sm">Dashboard</NuxtLink>',
  '        <NuxtLink v-else to="/sign-in" class="bg-white hover:bg-zinc-200 text-black transition-colors px-4 py-1.5 rounded-full shadow-sm border border-zinc-200">Sign in</NuxtLink>',
  '      </div>',
  '    </header>',
  '    <main class="flex-grow"><slot /></main>',
  '    <UiAboutModal :isOpen="isAboutOpen" @close="isAboutOpen = false" />',
  '  </div>',
  '</template>'
].join('\n')
fs.writeFileSync(path.join(process.cwd(), 'app/layouts/default.vue'), headerContent, 'utf8')

console.log('✅ Nuxt-Auth modulu basariyla SOKULUP ATILDI.')
console.log('✅ %100 Temiz, cok kararli, Cerez (Cookie) tabanli Kendi Auth Sistemimiz kuruldu!')
