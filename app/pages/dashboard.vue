<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '#imports'

useSeoMeta({ title: 'My Dashboard - Supply' })
const { addToast } = useToast()

const headers = useRequestHeaders(['cookie']) as HeadersInit
const { data: user, pending: userPending, refresh: refreshUser } = await useFetch('/api/auth/me', { key: 'auth-user', headers })

if (!userPending.value && !user.value) {
  if (typeof window !== 'undefined') window.location.href = '/sign-in'
}

const { data: dashboardData, pending: dashPending } = useLazyFetch(user.value ? '/api/user/dashboard' : '')
const { data: billingData } = useLazyFetch(user.value ? '/api/user/billing' : '')
const { data: creatorStats } = useLazyFetch(user.value ? '/api/creator/stats' : '')

const route = useRoute()
const router = useRouter()
const activeTab = ref(route.query.tab ? String(route.query.tab) : 'overview')
const downloadsViewMode = ref('grid')

watch(() => route.query.tab, (newTab) => { if (newTab) activeTab.value = String(newTab) })

const setTab = (tab: string) => {
  if (tab === 'admin') {
    router.push('/admin')
    return
  }
  activeTab.value = tab
  router.push({ query: { ...route.query, tab } })
}

// Settings form
const settingsForm = ref({ name: user.value?.name || '', email: user.value?.email || '' })
const isSavingSettings = ref(false)
const saveSettings = async () => {
  isSavingSettings.value = true
  try {
    await $fetch('/api/user/settings', { method: 'PATCH', body: settingsForm.value })
    await refreshUser()
    addToast('Settings saved successfully.', 'success')
  } catch (e: any) {
    addToast(e.data?.statusMessage || 'Failed to save settings.', 'error')
  } finally {
    isSavingSettings.value = false
  }
}

const isCanceling = ref(false)
const cancelSubscription = async () => {
  if (!confirm('Are you sure you want to cancel your PRO subscription? You will lose access to premium features immediately. This cannot be undone.')) return
  
  isCanceling.value = true
  try {
    const res: any = await $fetch('/api/user/cancel-plan', { method: 'POST' })
    await refreshUser()
    addToast(res.message || 'Subscription cancelled.', 'success')
  } catch (e: any) {
    addToast(e.data?.statusMessage || 'Failed to cancel subscription.', 'error')
  } finally {
    isCanceling.value = false
  }
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const generateMockInvoice = () => {
  addToast('Generating PDF invoice...', 'info')
  setTimeout(() => addToast('Invoice downloaded successfully.', 'success'), 1500)
}

const tabs = computed(() => {
  const baseTabs = [
    { id: 'overview', label: 'Genel Bakış', icon: 'lucide:layout-dashboard' },
    { id: 'purchases', label: 'Sahip Olduklarım', icon: 'lucide:folder-heart' },
    { id: 'saved', label: 'Favoriler', icon: 'lucide:bookmark' },
    { id: 'billing', label: 'Faturalandırma', icon: 'lucide:credit-card' },
    { id: 'creator', label: 'Satıcı Paneli', icon: 'lucide:store' },
    { id: 'settings', label: 'Ayarlar', icon: 'lucide:settings' },
  ]
  if (user.value?.role === 'ADMIN') {
    baseTabs.unshift({ id: 'admin', label: 'Yönetici Paneli', icon: 'lucide:shield-check' })
  }
  return baseTabs
})
</script>

<template>
  <div v-if="user" class="min-h-screen bg-[#f6f6f7] font-sans pt-24 pb-16 px-5 md:px-8 flex flex-col items-center">
    <div class="w-full max-w-[1400px] flex flex-col lg:flex-row gap-8 relative z-10">

      <!-- ──────────── SIDEBAR ──────────── -->
      <aside class="w-full lg:w-[280px] shrink-0 flex flex-col gap-5">

        <!-- Profile card -->
        <div class="bg-white border border-zinc-200/80 p-6 rounded-[2rem] shadow-sm text-center relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400"></div>
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
            {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
          </div>
          <h2 class="text-xl font-bold text-black tracking-tight mb-0.5">{{ user.name || 'User' }}</h2>
          <p class="text-xs text-zinc-400 mb-4">{{ user.email }}</p>
          <!-- Plan badge -->
          <span :class="user.plan === 'PRO' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border">
            <svg v-if="user.plan === 'PRO'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            {{ user.plan === 'PRO' ? 'Pro Member' : 'Free Plan' }}
          </span>
        </div>

        <!-- Nav -->
        <nav class="bg-white border border-zinc-200/80 p-3 rounded-[2rem] shadow-sm">
          <ul class="space-y-1">
            <li v-for="tab in tabs" :key="tab.id">
              <button @click="setTab(tab.id)" :class="activeTab === tab.id ? 'bg-black text-white shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100/80'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200">
                <Icon :name="tab.icon" class="w-[18px] h-[18px]" />
                {{ tab.label }}
              </button>
            </li>
          </ul>
        </nav>

        <!-- Quick stats mini card -->
        <div class="bg-white border border-zinc-200/80 p-5 rounded-[2rem] shadow-sm grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-2xl font-black text-black">{{ dashboardData?.purchasedProjects?.length || 0 }}</div>
            <div class="text-[11px] text-zinc-400 font-semibold mt-0.5">Downloads</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-black text-black">{{ dashboardData?.savedProjects?.length || 0 }}</div>
            <div class="text-[11px] text-zinc-400 font-semibold mt-0.5">Saved</div>
          </div>
        </div>
      </aside>

      <!-- ──────────── MAIN CONTENT ──────────── -->
      <main class="flex-grow min-w-0">
        <div v-if="dashPending" class="w-full h-64 flex items-center justify-center">
          <div class="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
        </div>

        <div v-else class="space-y-6">

          <!-- ── OVERVIEW ── -->
          <div v-if="activeTab === 'overview'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 class="text-3xl font-bold tracking-tight text-black">Welcome back, {{ user.name?.split(' ')[0] || 'there' }} 👋</h1>

            <!-- Stat cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div class="bg-white border border-zinc-200/80 p-6 rounded-[2rem] shadow-sm">
                <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Saved Items</h3>
                <div class="text-4xl font-black text-black">{{ dashboardData?.savedProjects?.length || 0 }}</div>
                <p class="text-xs text-zinc-400 mt-1">Components bookmarked</p>
              </div>
              <div class="bg-white border border-zinc-200/80 p-6 rounded-[2rem] shadow-sm">
                <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Downloads</h3>
                <div class="text-4xl font-black text-black">{{ dashboardData?.purchasedProjects?.length || 0 }}</div>
                <p class="text-xs text-zinc-400 mt-1">Assets purchased</p>
              </div>
              <div class="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <h3 class="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-3 relative z-10">Plan</h3>
                <div class="text-2xl font-black relative z-10">{{ user.plan === 'PRO' ? 'Pro' : 'Free' }}</div>
                <NuxtLink v-if="user.plan !== 'PRO'" to="/pricing" class="text-xs text-indigo-200 hover:text-white mt-1 block font-semibold underline relative z-10">Upgrade to Pro →</NuxtLink>
              </div>
            </div>

            <!-- Recent purchases preview -->
            <div v-if="dashboardData?.purchasedProjects?.length" class="bg-white border border-zinc-200/80 rounded-[2rem] shadow-sm overflow-hidden">
              <div class="px-6 py-5 border-b border-zinc-100 flex justify-between items-center">
                <h2 class="font-bold text-black">Son İndirilenler</h2>
                <button @click="setTab('purchases')" class="text-xs font-bold text-indigo-600 hover:text-indigo-800">Tümünü gör →</button>
              </div>
              <div class="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div v-for="purchase in dashboardData.purchasedProjects.slice(0, 4)" :key="purchase.id" class="group relative rounded-2xl overflow-hidden bg-zinc-100 aspect-video">
                  <video :src="purchase.project?.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover"></video>
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p class="text-white text-xs font-bold leading-tight truncate">{{ purchase.project?.title }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── MY DOWNLOADS ── -->
          <div v-else-if="activeTab === 'purchases'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold tracking-tight text-black">Sahip Olduklarım</h2>
                <p class="text-zinc-400 text-sm mt-0.5">Satın aldığınız tüm varlıklar ve erişilebilir kaynak kodlar burada listelenmektedir.</p>
              </div>
              <div class="flex items-center gap-3">
                 <div class="bg-zinc-100 p-1 rounded-xl flex items-center shadow-inner">
                   <button @click="downloadsViewMode = 'grid'" :class="downloadsViewMode === 'grid' ? 'bg-white shadow-sm text-black' : 'text-zinc-400 hover:text-zinc-600'" class="p-2 rounded-lg transition-all" title="Kutu Görünümü">
                     <Icon name="lucide:layout-grid" class="w-[18px] h-[18px]" />
                   </button>
                   <button @click="downloadsViewMode = 'list'" :class="downloadsViewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-zinc-400 hover:text-zinc-600'" class="p-2 rounded-lg transition-all" title="Liste Görünümü">
                     <Icon name="lucide:list" class="w-[18px] h-[18px]" />
                   </button>
                 </div>
                 <span class="bg-zinc-100 text-zinc-600 text-xs font-black px-3 py-1.5 rounded-full hidden sm:block">{{ dashboardData?.purchasedProjects?.length || 0 }} items</span>
              </div>
            </div>

            <div v-if="!dashboardData?.purchasedProjects?.length" class="bg-white border-2 border-dashed border-zinc-200 rounded-[2rem] py-20 text-center">
              <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </div>
              <h3 class="text-lg font-bold text-black mb-1">Henüz bir ürüne sahip değilsiniz.</h3>
              <p class="text-zinc-400 text-sm mb-6">Kütüphaneyi keşfedin ve ilk profesyonel varlığınızı satın alın.</p>
              <NuxtLink to="/" class="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors">Varlıkları Keşfet</NuxtLink>
            </div>

            <div v-else-if="downloadsViewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-in fade-in">
              <NuxtLink :to="`/item/${purchase.project?.id || purchase.projectId}`" v-for="purchase in dashboardData.purchasedProjects" :key="purchase.id" class="bg-white border border-zinc-200/80 rounded-[2rem] shadow-sm hover:shadow-lg hover:border-zinc-300 overflow-hidden group flex flex-col transition-all cursor-pointer">
                <div class="relative aspect-video bg-zinc-900 overflow-hidden">
                  <video :src="purchase.project?.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></video>
                  <div class="absolute top-3 left-3">
                    <span :class="purchase.licenseType === 'COMMERCIAL' ? 'bg-indigo-600 text-white' : 'bg-white/90 text-black'" class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                      {{ purchase.licenseType }}
                    </span>
                  </div>
                </div>
                <div class="p-5 flex flex-col gap-4 flex-1">
                  <div>
                    <h3 class="font-bold text-black leading-tight text-base group-hover:text-indigo-600 transition-colors">{{ purchase.project?.title || 'Asset' }}</h3>
                    <p class="text-xs text-zinc-400 mt-0.5">Purchased {{ formatDate(purchase.createdAt) }}</p>
                  </div>
                  <div class="mt-auto flex gap-2">
                    <div class="flex-1 bg-black hover:bg-zinc-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors text-center flex items-center justify-center gap-1.5">
                      <Icon name="lucide:code" class="w-3.5 h-3.5" />
                      Kaynak Kodu
                    </div>
                    <a v-if="purchase.project?.fileUrl" :href="'/api/user/download?projectId=' + (purchase.project?.id || purchase.projectId)" class="px-3 py-2.5 rounded-xl border border-zinc-200 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 transition-colors" title="Dosyayı İndir">
                      <Icon name="lucide:folder-down" class="w-3.5 h-3.5" />
                    </a>
                    <button @click.prevent="generateMockInvoice" class="px-3 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-black transition-colors" title="Faturayı İndir">
                      <Icon name="lucide:download" class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <!-- List View -->
            <div v-else class="flex flex-col gap-3 animate-in fade-in">
              <NuxtLink :to="`/item/${purchase.project?.id || purchase.projectId}`" v-for="purchase in dashboardData.purchasedProjects" :key="purchase.id" class="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-zinc-300 group flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-all cursor-pointer">
                 <div class="w-full sm:w-48 aspect-video bg-zinc-900 rounded-xl overflow-hidden shrink-0 relative">
                   <video :src="purchase.project?.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></video>
                 </div>
                 <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1.5">
                      <h3 class="font-bold text-black text-lg truncate group-hover:text-indigo-600 transition-colors">{{ purchase.project?.title || 'Asset' }}</h3>
                      <span :class="purchase.licenseType === 'COMMERCIAL' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'" class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border hidden sm:inline-flex">{{ purchase.licenseType }}</span>
                    </div>
                    <p class="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-2">{{ purchase.project?.description || 'Premium front-end component.' }}</p>
                    <p class="text-[11px] text-zinc-400 font-mono">Purchased on {{ formatDate(purchase.createdAt) }}</p>
                 </div>
                 <div class="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                    <div class="flex-1 sm:flex-none bg-black hover:bg-zinc-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors text-center flex items-center justify-center gap-1.5">
                      <Icon name="lucide:code" class="w-3.5 h-3.5" /> Kaynağı Aç
                    </div>
                    <div class="flex gap-2 w-full">
                       <a v-if="purchase.project?.fileUrl" :href="'/api/user/download?projectId=' + (purchase.project?.id || purchase.projectId)" class="flex-1 px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold" title="Dosyayı İndir">
                         Dosya <Icon name="lucide:folder-down" class="w-3.5 h-3.5" />
                       </a>
                       <button @click.prevent="generateMockInvoice" class="flex-1 px-3 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-black transition-colors flex items-center justify-center gap-1.5 text-xs font-bold" title="Faturayı İndir">
                          Fatura <Icon name="lucide:download" class="w-3.5 h-3.5" />
                       </button>
                    </div>
                 </div>
              </NuxtLink>
            </div>
          </div>

          <!-- ── SAVED ITEMS ── -->
          <div v-else-if="activeTab === 'saved'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 class="text-2xl font-bold tracking-tight text-black">Saved Items</h2>
              <p class="text-zinc-400 text-sm mt-0.5">Your bookmarked animations and components.</p>
            </div>

            <div v-if="!dashboardData?.savedProjects?.length" class="bg-white border-2 border-dashed border-zinc-200 rounded-[2rem] py-20 text-center">
              <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              </div>
              <h3 class="text-lg font-bold text-black mb-1">Nothing saved yet</h3>
              <p class="text-zinc-400 text-sm mb-6">Click the heart icon on any card to save it here.</p>
              <NuxtLink to="/" class="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors">Browse Assets</NuxtLink>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              <div v-for="saved in dashboardData.savedProjects" :key="saved.id" class="bg-white border border-zinc-200/80 rounded-[2rem] shadow-sm overflow-hidden group flex flex-col">
                <div class="relative aspect-video bg-zinc-900 overflow-hidden">
                  <video :src="saved.project?.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></video>
                  <div v-if="saved.project?.price > 0" class="absolute top-3 right-3">
                    <span class="bg-black/80 text-white px-2 py-1 rounded-full text-[10px] font-black backdrop-blur-sm">${{ saved.project.price }}</span>
                  </div>
                  <div v-else class="absolute top-3 right-3">
                    <span class="bg-emerald-500/90 text-white px-2 py-1 rounded-full text-[10px] font-black backdrop-blur-sm">Free</span>
                  </div>
                </div>
                <div class="p-4 flex items-center justify-between gap-3 flex-1">
                  <div class="min-w-0">
                    <h3 class="font-bold text-black text-sm truncate">{{ saved.project?.title }}</h3>
                    <p class="text-[11px] text-zinc-400 truncate mt-0.5">{{ saved.project?.categories }}</p>
                  </div>
                  <NuxtLink :to="`/item/${saved.project?.id || saved.projectId}`" class="shrink-0 bg-black hover:bg-zinc-800 text-white text-[11px] font-bold py-2 px-3.5 rounded-xl transition-colors whitespace-nowrap">
                    View →
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- ── BILLING ── -->
          <div v-else-if="activeTab === 'billing'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 class="text-2xl font-bold tracking-tight text-black">Billing & Invoices</h2>
              <p class="text-zinc-400 text-sm mt-0.5">Download receipts for your past purchases.</p>
            </div>
            <div class="bg-white border border-zinc-200/80 rounded-[2rem] overflow-hidden shadow-sm">
              <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 text-[11px] uppercase tracking-widest">
                  <tr>
                    <th class="px-6 py-5 font-semibold">Date</th>
                    <th class="px-6 py-5 font-semibold">Item</th>
                    <th class="px-6 py-5 font-semibold">License</th>
                    <th class="px-6 py-5 font-semibold">Amount</th>
                    <th class="px-6 py-5 font-semibold text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100">
                  <tr v-if="!billingData?.length">
                    <td colspan="5" class="px-6 py-12 text-center text-zinc-400 font-medium">No purchase history found.</td>
                  </tr>
                  <tr v-for="bill in billingData" :key="bill.id" class="hover:bg-zinc-50/50 transition-colors">
                    <td class="px-6 py-4 font-mono text-zinc-400 text-xs">{{ formatDate(bill.createdAt) }}</td>
                    <td class="px-6 py-4">
                      <p class="font-bold text-zinc-900">{{ bill.project?.title || 'Unknown' }}</p>
                      <p class="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">{{ bill.project?.productType }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <span :class="bill.licenseType === 'COMMERCIAL' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'" class="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border">{{ bill.licenseType }}</span>
                    </td>
                    <td class="px-6 py-4 font-black text-black">${{ bill.pricePaid?.toFixed(2) }}</td>
                    <td class="px-6 py-4 text-right">
                      <button @click="generateMockInvoice" class="text-indigo-600 hover:text-indigo-800 font-semibold text-xs flex items-center justify-end gap-1.5 ml-auto">
                        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> PDF
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ── CREATOR HUB ── -->
          <div v-else-if="activeTab === 'creator'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold tracking-tight text-black">Creator Hub</h2>
                <p class="text-zinc-400 text-sm mt-0.5">Track earnings and manage your digital products.</p>
              </div>
              <button class="bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Submit Product
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div class="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                <div class="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full"></div>
                <h3 class="text-indigo-200 text-xs font-bold tracking-widest uppercase mb-2 relative z-10">Total Revenue</h3>
                <div class="text-4xl font-black relative z-10">${{ creatorStats?.totalRevenue?.toFixed(2) || '0.00' }}</div>
              </div>
              <div class="bg-white border border-zinc-200/80 p-6 rounded-[2rem] shadow-sm">
                <h3 class="text-zinc-400 text-xs font-bold tracking-widest uppercase mb-2">Total Sales</h3>
                <div class="text-4xl font-black text-black">{{ creatorStats?.totalSales || 0 }}</div>
              </div>
              <div class="bg-white border border-zinc-200/80 p-6 rounded-[2rem] shadow-sm">
                <h3 class="text-zinc-400 text-xs font-bold tracking-widest uppercase mb-2">Active Items</h3>
                <div class="text-4xl font-black text-black">{{ creatorStats?.projects?.length || 0 }}</div>
              </div>
            </div>
            <h3 class="text-lg font-bold text-black">Your Products</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div v-if="!creatorStats?.projects?.length" class="col-span-full py-16 text-center bg-white border-2 border-dashed border-zinc-200 rounded-[2rem]">
                <h3 class="text-lg font-bold text-black mb-1">Start selling your work</h3>
                <p class="text-zinc-400 text-sm">Upload your first animation to start earning.</p>
              </div>
              <div v-for="proj in creatorStats?.projects" :key="proj.id" class="bg-white border border-zinc-200/80 p-4 rounded-[2rem] shadow-sm flex flex-col">
                <video :src="proj.videoUrl" autoplay loop muted playsinline class="w-full aspect-video rounded-2xl bg-zinc-100 object-cover mb-4"></video>
                <div class="flex justify-between items-start px-1">
                  <div>
                    <h3 class="font-bold text-black">{{ proj.title }}</h3>
                    <p class="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-1">{{ proj.downloads }} Sales</p>
                  </div>
                  <span class="text-sm font-black">${{ proj.price }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ── SETTINGS ── -->
          <div v-else-if="activeTab === 'settings'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 class="text-2xl font-bold tracking-tight text-black">Settings</h2>
              <p class="text-zinc-400 text-sm mt-0.5">Manage your account information.</p>
            </div>

            <!-- Profile settings -->
            <div class="bg-white border border-zinc-200/80 rounded-[2rem] shadow-sm overflow-hidden">
              <div class="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
                <h3 class="font-bold text-black">Profile Information</h3>
                <p class="text-xs text-zinc-400 mt-0.5">Update your public display name and email.</p>
              </div>
              <div class="p-6 space-y-5">
                <div>
                  <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Display Name</label>
                  <input v-model="settingsForm.name" type="text" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors" placeholder="Your name" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input v-model="settingsForm.email" type="email" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors" placeholder="you@example.com" />
                </div>
                <button @click="saveSettings" :disabled="isSavingSettings" class="bg-black hover:bg-zinc-800 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                  <svg v-if="isSavingSettings" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 1-9 9"/></svg>
                  {{ isSavingSettings ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>

            <!-- Password section -->
            <div class="bg-white border border-zinc-200/80 rounded-[2rem] shadow-sm overflow-hidden">
              <div class="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
                <h3 class="font-bold text-black">Password</h3>
                <p class="text-xs text-zinc-400 mt-0.5">Use a strong, unique password.</p>
              </div>
              <div class="p-6 space-y-4">
                <div>
                  <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">New Password</label>
                  <input type="password" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors" placeholder="••••••••" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Confirm Password</label>
                  <input type="password" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors" placeholder="••••••••" />
                </div>
                <button class="bg-zinc-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">Update Password</button>
              </div>
            </div>

            <!-- Danger zone -->
            <div class="bg-white border border-red-100 rounded-[2rem] shadow-sm overflow-hidden">
              <div class="px-6 py-5 border-b border-red-100 bg-red-50/30">
                <h3 class="font-bold text-red-700">Danger Zone</h3>
              </div>
              <div class="p-6 flex flex-col gap-4">
                
                <div v-if="user.plan === 'PRO'" class="flex items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                  <div>
                    <p class="font-semibold text-sm text-zinc-800">Cancel PRO Subscription</p>
                    <p class="text-xs text-zinc-400 mt-0.5">Downgrade to the Free plan. You will lose access to premium features immediately.</p>
                  </div>
                  <button @click="cancelSubscription" :disabled="isCanceling" class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-black rounded-xl text-sm font-bold transition-colors shrink-0 disabled:opacity-50">
                    {{ isCanceling ? 'Canceling...' : 'Cancel Subscription' }}
                  </button>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <div>
                    <p class="font-semibold text-sm text-zinc-800">Delete account</p>
                    <p class="text-xs text-zinc-400 mt-0.5">This will permanently delete your account and all data.</p>
                  </div>
                  <button class="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors shrink-0">Delete Account</button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  </div>
</template>