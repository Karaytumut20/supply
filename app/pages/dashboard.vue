<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

useSeoMeta({ title: 'My Dashboard - Premium Access' })

const { data: user, pending: userPending } = await useFetch('/api/auth/me')
if (!userPending.value && !user.value) { if (typeof window !== 'undefined') window.location.href = '/sign-in' }

const { data: dashboardData, pending: dashPending } = await useFetch('/api/user/dashboard')

const route = useRoute()
const router = useRouter()

const activeTab = ref(route.query.tab ? String(route.query.tab) : 'overview') 

watch(() => route.query.tab, (newTab) => {
  if (newTab) activeTab.value = String(newTab)
})

const setTab = (tab: string) => {
  activeTab.value = tab
  router.push({ query: { ...route.query, tab } })
}

const isProcessing = ref(false)

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/'
}

const upgradeToPro = async () => {
  isProcessing.value = true
  try {
    await $fetch('/api/user/subscribe', { method: 'POST' })
    alert('Congratulations! You are now a PRO member.')
    window.location.reload()
  } catch(e) { alert('An error occurred.') }
  finally { isProcessing.value = false }
}

const showCode = (code: string) => {
  alert('SOURCE CODE:\n\n' + (code || 'Code not available.'))
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const tabs = computed(() => {
  const baseTabs = [
    { id: 'overview', label: 'Overview', icon: '<path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" />' },
    { id: 'purchases', label: 'Purchases', icon: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>' },
    { id: 'saved', label: 'Saved Items', icon: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>' },
    { id: 'settings', label: 'Settings & Security', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
    { id: 'support', label: 'Support', icon: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>' },
  ]
  if (user.value?.role === 'ADMIN') {
    baseTabs.unshift({ id: 'admin', label: 'Admin Panel', icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' })
  }
  return baseTabs
})

// E-commerce logic
const activeCategoryFilter = ref('All')
const purchaseCategories = computed(() => {
  if (!dashboardData.value?.purchasedProjects) return ['All']
  const catSet = new Set(['All'])
  dashboardData.value.purchasedProjects.forEach((p: any) => {
    if (p.productType) catSet.add(p.productType)
  })
  return Array.from(catSet)
})

const filteredPurchases = computed(() => {
  if (activeCategoryFilter.value === 'All') return dashboardData.value?.purchasedProjects
  return dashboardData.value?.purchasedProjects?.filter((p: any) => p.productType === activeCategoryFilter.value)
})

// Mock password update
const passwordForm = ref({ current: '', new: '', confirm: '' })
const updatePassword = () => { alert('In a real app, this would securely update your password.') }
</script>

<template>
  <div v-if="user" class="min-h-screen bg-[#fafafa] font-sans selection:bg-indigo-500 selection:text-white pt-24 pb-12 px-5 md:px-8 flex flex-col items-center">
    
    <!-- Background Accents -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div class="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-[100px]"></div>
        <div class="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-[100px]"></div>
    </div>

    <div class="w-full max-w-[1400px] flex flex-col lg:flex-row gap-8 relative z-10">
      
      <!-- Sidebar Navigation -->
      <aside class="w-full lg:w-[280px] shrink-0 flex flex-col h-full gap-6">
        
        <!-- User Profile Widget -->
        <div class="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] text-center relative overflow-hidden group">
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 opacity-80"></div>
          
          <div class="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4 tracking-tighter shadow-xl transform group-hover:scale-105 transition-transform duration-500 relative">
             {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
             <div v-if="user.plan === 'PRO'" class="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white shadow-sm ring-1 ring-amber-400/50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
             </div>
          </div>
          
          <h2 class="text-xl font-bold text-black tracking-tight mb-1">{{ user.name || 'User' }}</h2>
          <p class="text-xs text-zinc-500 mb-4">{{ user.email }}</p>

          <div class="flex flex-col gap-2 relative z-10">
            <NuxtLink to="/" class="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black text-[13px] font-bold rounded-xl transition-colors">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Return Home
            </NuxtLink>
            <button @click="handleLogout" class="w-full flex items-center justify-center gap-2 py-2.5 text-zinc-500 hover:text-red-500 hover:bg-red-50 text-[13px] font-bold rounded-xl transition-colors">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Logout
            </button>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="bg-white/70 backdrop-blur-xl border border-white p-4 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
          <ul class="space-y-1">
            <li v-for="tab in tabs" :key="tab.id">
              <button @click="setTab(tab.id)" :class="activeTab === tab.id ? 'bg-black text-white shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100/80'" class="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-[14px] font-medium transition-all duration-300 group">
                <svg :class="activeTab === tab.id ? 'text-white' : 'text-zinc-400 group-hover:text-black'" class="transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" v-html="tab.icon"></svg>
                {{ tab.label }}
              </button>
            </li>
          </ul>
        </nav>

        <!-- Pro Upsell Mini -->
        <div v-if="user.plan === 'FREE'" class="bg-gradient-to-br from-zinc-900 to-black p-6 rounded-[2rem] shadow-xl text-left relative overflow-hidden group cursor-pointer" @click="upgradeToPro">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMC41Ij48L3BhdGg+Cjwvc3ZnPg==')] mix-blend-overlay opacity-30"></div>
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/40 transition-colors duration-500"></div>
          <div class="relative z-10">
            <h3 class="text-white text-lg font-bold mb-2 flex items-center gap-2">Get PRO Access <svg class="text-amber-400" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></h3>
            <p class="text-zinc-400 text-xs leading-relaxed mb-4">Unlock premium components, animations, and source codes instantly.</p>
            <button class="w-full bg-amber-400 text-black text-[13px] font-bold py-2.5 rounded-lg transform group-hover:-translate-y-1 transition-transform shadow-lg">Upgrade Now</button>
          </div>
        </div>

      </aside>

      <!-- Main Content Area -->
      <main class="flex-grow min-w-0">
        
        <div v-if="dashPending" class="w-full h-64 bg-white/50 backdrop-blur-xl border border-white rounded-[2rem] flex flex-col items-center justify-center">
            <div class="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin mb-4"></div>
            <span class="text-sm font-bold tracking-widest uppercase text-zinc-400 animate-pulse font-mono">Loading Data</span>
        </div>
        
        <div v-else class="space-y-6">

          <!-- Bento Grid: OVERVIEW -->
          <div v-if="activeTab === 'overview'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 class="text-3xl font-bold tracking-tight text-black mb-6">Welcome back, {{ user.name?.split(' ')[0] || 'User' }}</h1>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <!-- Stats Card 1 -->
              <div class="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                <div class="flex items-center justify-between mb-4">
                   <h3 class="text-sm font-semibold text-zinc-500">Total Saved</h3>
                   <div class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-black group-hover:scale-110 transition-transform"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg></div>
                </div>
                <div class="text-4xl font-bold tracking-tighter text-black">{{ dashboardData?.savedProjects?.length || 0 }}</div>
                <button @click="setTab('saved')" class="mt-4 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">View collection <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
              </div>

              <!-- Stats Card 2 -->
              <div class="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                <div class="flex items-center justify-between mb-4">
                   <h3 class="text-sm font-semibold text-zinc-500">Purchased Items</h3>
                   <div class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-black group-hover:scale-110 transition-transform"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div>
                </div>
                <div class="text-4xl font-bold tracking-tighter text-black">{{ dashboardData?.purchasedProjects?.length || 0 }}</div>
                <button @click="setTab('purchases')" class="mt-4 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">View downloads <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
              </div>

              <!-- Pro Status Card -->
              <div :class="user.plan === 'PRO' ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-black' : 'bg-gradient-to-br from-zinc-800 to-black text-white'" class="p-6 rounded-[2rem] shadow-xl relative overflow-hidden group flex flex-col justify-between">
                <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMC41Ij48L3BhdGg+Cjwvc3ZnPg==')] mix-blend-overlay opacity-30"></div>
                <div class="relative z-10">
                  <h3 class="text-sm font-semibold mb-1 opacity-80 uppercase tracking-widest font-mono">Current Plan</h3>
                  <div class="text-3xl font-black tracking-tight mb-2 flex items-center gap-2">
                    {{ user.plan }}
                    <svg v-if="user.plan === 'PRO'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                </div>
                <div class="relative z-10 w-full">
                  <p v-if="user.plan === 'PRO'" class="text-sm font-medium opacity-90">Lifetime premium access active.</p>
                  <button v-else @click="upgradeToPro" class="w-full bg-white text-black py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-100 transition-colors">Upgrade to PRO</button>
                </div>
              </div>
            </div>
            
            <!-- Recent Activity / Showcase -->
            <div class="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
              <h3 class="text-lg font-bold text-black mb-6">Recently Saved</h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div v-if="!dashboardData?.savedProjects?.length" class="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
                    <p class="text-zinc-500 font-medium text-sm">No saved items yet.</p>
                 </div>
                 <div v-for="proj in dashboardData?.savedProjects?.slice(0, 3)" :key="proj.id" class="group relative bg-zinc-100 rounded-[1.5rem] overflow-hidden aspect-[4/3]">
                    <video :src="proj.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none filter brightness-95 group-hover:brightness-100"></video>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                       <h4 class="text-white font-bold leading-tight">{{ proj.title }}</h4>
                       <p class="text-xs text-zinc-300 mt-1">{{ proj.categories }}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <!-- Bento Grid: PURCHASES -->
          <div v-else-if="activeTab === 'purchases'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 class="text-2xl font-bold tracking-tight text-black">My E-Commerce Library</h2>
                  <p class="text-zinc-500 text-sm mt-1">Access your purchased digital assets here.</p>
                </div>
                <!-- E-Commerce Filters -->
                <div class="flex gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-200/50 shadow-sm self-start">
                   <button v-for="cat in purchaseCategories" :key="cat" @click="activeCategoryFilter = cat" :class="activeCategoryFilter === cat ? 'bg-black text-white shadow-md' : 'text-zinc-600 hover:text-black hover:bg-white'" class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all capitalize">
                     {{ cat.toLowerCase() }}
                   </button>
                </div>
             </div>

             <div v-if="user.plan === 'PRO'" class="p-6 bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 rounded-[2rem] flex items-start gap-4 shadow-sm relative overflow-hidden">
                <div class="absolute -right-10 -top-10 text-amber-500/10"><svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                <div class="w-12 h-12 rounded-full bg-amber-400 text-amber-900 flex items-center justify-center shrink-0 shadow-md relative z-10">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div class="relative z-10 pt-1">
                   <h3 class="text-amber-900 font-bold text-lg mb-1 tracking-tight">PRO Access Active</h3>
                   <p class="text-amber-700/80 text-sm leading-relaxed max-w-2xl">You have unrestricted access to all premium components! Access full source codes directly from the main library.</p>
                </div>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Empty State -->
                <div v-if="!filteredPurchases?.length" class="col-span-full py-20 text-center bg-white border border-zinc-200 rounded-[2rem] border-dashed">
                  <div class="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-zinc-300" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg></div>
                  <h3 class="text-xl font-bold text-black mb-1">No digital downloads yet</h3>
                  <p class="text-zinc-500 text-sm mb-6">Components or templates you purchase will be securely available here.</p>
                  <NuxtLink to="/" class="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-800 transition-colors">Start Browsing</NuxtLink>
                </div>

                <!-- Purchase Cards -->
                <div v-for="proj in filteredPurchases" :key="proj.id" class="bg-white p-4 rounded-[2rem] border border-zinc-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col group relative overflow-hidden">
                  <div class="w-full aspect-[4/3] rounded-xl bg-zinc-100 overflow-hidden relative mb-4 border border-zinc-100/50">
                    <video :src="proj.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"></video>
                    <!-- Type Badge -->
                    <div class="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white shadow-sm flex items-center gap-1.5">
                       <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {{ proj.productType || 'Asset' }}
                    </div>
                  </div>
                  <div class="flex-grow flex flex-col justify-between px-2">
                    <div class="mb-5">
                      <h3 class="font-bold text-black leading-tight text-[17px] mb-1.5">{{ proj.title }}</h3>
                      <div class="flex flex-wrap gap-1">
                         <span v-for="cat in (typeof proj.categories === 'string' ? proj.categories.split(',') : proj.categories)" :key="cat" class="text-zinc-500 text-[11px] font-medium bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/80">
                            {{ cat.trim() }}
                         </span>
                      </div>
                    </div>
                    <button @click="showCode(proj.sourceCode)" class="w-full py-3.5 bg-zinc-50 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 border border-zinc-200 text-black text-[13px] font-bold rounded-[1rem] transition-all flex items-center justify-center gap-2 group/btn shadow-[0_4px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(79,70,229,0.2)]">
                      <svg class="group-hover/btn:animate-pulse" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Asset
                    </button>
                  </div>
                </div>
             </div>
          </div>
          
          <!-- Bento Grid: ADMIN PANEL -->
          <div v-else-if="activeTab === 'admin' && user.role === 'ADMIN'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-3xl font-bold tracking-tight text-black">Admin HQ</h2>
                  <p class="text-zinc-500 text-sm mt-1">Manage users, view stats, and handle platform operations.</p>
                </div>
             </div>
             
             <!-- Admin Stats Grid -->
             <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Total Users -->
                <div class="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                   <div class="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                   <h3 class="text-indigo-200 text-sm font-semibold tracking-wide uppercase mb-2 relative z-10">Total Users</h3>
                   <div class="text-4xl font-black mb-1 relative z-10">{{ dashboardData?.admin?.totalUsers || '0' }}</div>
                   <p class="text-xs text-indigo-300 relative z-10">Registered accounts</p>
                </div>
                
                <!-- PRO Members -->
                <div class="bg-amber-400 text-amber-950 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                   <div class="absolute -right-6 -top-6 w-32 h-32 bg-white/30 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                   <h3 class="text-amber-900/70 text-sm font-semibold tracking-wide uppercase mb-2 relative z-10">PRO Subscribers</h3>
                   <div class="text-4xl font-black mb-1 relative z-10">{{ dashboardData?.admin?.proUsers || '0' }}</div>
                   <p class="text-xs text-amber-800 relative z-10">Lifetime premium accesses</p>
                </div>
                
                <!-- Total Sales -->
                <div class="bg-black text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                   <div class="absolute -right-6 -top-6 w-32 h-32 bg-zinc-800 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                   <h3 class="text-zinc-500 text-sm font-semibold tracking-wide uppercase mb-2 relative z-10">Total Sales</h3>
                   <div class="text-4xl font-black mb-1 relative z-10 text-emerald-400">${{ dashboardData?.admin?.totalSales || '0' }}</div>
                   <p class="text-xs text-zinc-400 relative z-10">Lifetime revenue generated</p>
                </div>
             </div>
             
             <!-- Coming Soon Modules -->
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div class="bg-white border border-zinc-200/80 p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center h-[300px]">
                   <div class="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-zinc-400" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div>
                   <h3 class="text-lg font-bold text-black mb-2">Product Management</h3>
                   <p class="text-zinc-500 text-sm max-w-xs">Upload new digital effects, edit existing prices, and manage component library.</p>
                   <span class="mt-4 bg-zinc-100 text-zinc-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md">Coming Soon</span>
                </div>
                
                <div class="bg-white border border-zinc-200/80 p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center h-[300px]">
                   <div class="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-zinc-400" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                   <h3 class="text-lg font-bold text-black mb-2">User Directory</h3>
                   <p class="text-zinc-500 text-sm max-w-xs">View all registered users, manage bans, and handle premium access overrides.</p>
                   <span class="mt-4 bg-zinc-100 text-zinc-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md">Coming Soon</span>
                </div>
             </div>
          </div>

          <!-- Bento Grid: SAVED -->
          <div v-else-if="activeTab === 'saved'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold tracking-tight text-black">Saved Inspirations</h2>
             </div>

             <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                <div v-if="!dashboardData?.savedProjects?.length" class="col-span-full py-20 text-center bg-white/80 border border-white rounded-[2rem]">
                  <h3 class="text-xl font-bold text-black mb-1">Your moodboard is empty</h3>
                  <p class="text-zinc-500 text-sm">Save your favorite designs here to access them fast.</p>
                </div>

                <div v-for="proj in dashboardData?.savedProjects" :key="proj.id" class="group relative bg-white border border-zinc-200 rounded-[1.5rem] overflow-hidden aspect-[4/5] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] cursor-pointer">
                  <div class="absolute inset-0 p-2">
                    <div class="w-full h-full rounded-2xl overflow-hidden relative">
                      <video :src="proj.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover transition-transform duration-700 pointer-events-none group-hover:scale-110"></video>
                      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                        <div class="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <h4 class="text-white font-bold leading-tight line-clamp-2 text-sm">{{ proj.title }}</h4>
                          <button class="mt-3 text-[10px] uppercase tracking-widest bg-white text-black px-3 py-1.5 rounded-lg font-bold shadow-sm">View Item</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          <!-- Bento Grid: SETTINGS -->
          <div v-else-if="activeTab === 'settings'" class="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto lg:mx-0 w-full">
            <h2 class="text-2xl font-bold tracking-tight text-black mb-6">Security & Settings</h2>
            
            <div class="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
              <h3 class="text-lg font-bold text-black mb-1">Update Password</h3>
              <p class="text-zinc-500 text-sm mb-8">Ensure your account is using a long, random password to stay secure.</p>
              
              <form @submit.prevent="updatePassword" class="space-y-5">
                <div class="space-y-1.5">
                  <label class="text-sm font-semibold text-zinc-700">Current Password</label>
                  <input type="password" v-model="passwordForm.current" class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm" placeholder="••••••••" required>
                </div>
                
                <div class="space-y-1.5">
                  <label class="text-sm font-semibold text-zinc-700">New Password</label>
                  <input type="password" v-model="passwordForm.new" class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm" placeholder="••••••••" required minlength="8">
                </div>
                
                <div class="space-y-1.5">
                  <label class="text-sm font-semibold text-zinc-700">Confirm New Password</label>
                  <input type="password" v-model="passwordForm.confirm" class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm" placeholder="••••••••" required>
                </div>
                
                <button type="submit" class="w-full md:w-auto px-8 py-3.5 bg-black text-white font-bold rounded-xl text-sm shadow-xl hover:bg-zinc-800 hover:-translate-y-0.5 transition-all focus:ring-4 focus:ring-zinc-200">Save Password</button>
              </form>
            </div>
            
            <div class="mt-6 bg-red-50 border border-red-100 p-8 rounded-[2rem]">
              <h3 class="text-lg font-bold text-red-700 mb-1">Danger Zone</h3>
              <p class="text-red-600/80 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
              <button class="px-6 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-sm shadow-sm hover:bg-red-600 hover:text-white transition-colors">Delete Account</button>
            </div>
          </div>
          
          <!-- Bento Grid: SUPPORT -->
          <div v-else-if="activeTab === 'support'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold tracking-tight text-black">Support Tickets</h2>
                <NuxtLink to="/ticket" class="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-800 transition-colors flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> New Ticket
                </NuxtLink>
             </div>

             <div class="bg-white/80 backdrop-blur-xl border border-white p-2 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
                <div v-if="!dashboardData?.tickets?.length" class="py-20 text-center">
                  <div class="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></div>
                  <h3 class="text-lg font-bold text-black">No support requests</h3>
                  <p class="text-zinc-500 text-sm mt-1">We are here if you need help! Create a ticket any time.</p>
                </div>
                
                <div v-else class="divide-y divide-zinc-100">
                  <div v-for="ticket in dashboardData.tickets" :key="ticket.id" class="p-6 hover:bg-zinc-50/50 transition-colors first:rounded-t-[1.5rem] last:rounded-b-[1.5rem] group cursor-pointer">
                    <div class="flex justify-between items-start mb-2">
                      <div class="flex items-center gap-3">
                        <span :class="ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'" class="px-3 py-1 border rounded-full text-[10px] font-bold tracking-wider uppercase">
                          {{ ticket.status }}
                        </span>
                        <span class="text-xs font-mono text-zinc-400 font-medium">#{{ ticket.id.substring(0,8) }}</span>
                      </div>
                      <span class="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">{{ formatDate(ticket.createdAt) }}</span>
                    </div>
                    <h3 class="font-bold text-black text-lg mb-1 group-hover:text-indigo-600 transition-colors">{{ ticket.subject }}</h3>
                    <p class="text-sm text-zinc-500 line-clamp-1 border-t border-zinc-100 pt-3">{{ ticket.message }}</p>
                  </div>
                </div>
             </div>
          </div>

        </div>
      </main>
      
    </div>
  </div>
</template>