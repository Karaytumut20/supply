<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '#imports'
import { navigateTo } from '#app'

useSeoMeta({ title: 'My Dashboard - Premium Access' })
const { addToast } = useToast()

const { data: user, pending: userPending } = await useFetch('/api/auth/me')

if (!userPending.value && !user.value) {
  if (typeof window !== 'undefined') window.location.href = '/sign-in'
}

const { data: dashboardData, pending: dashPending } = await useFetch(user.value ? '/api/user/dashboard' : '')
const { data: billingData } = await useFetch(user.value ? '/api/user/billing' : '')
const { data: creatorStats } = await useFetch(user.value ? '/api/creator/stats' : '')

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

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const generateMockInvoice = (id: string) => {
  addToast('Fatura PDF olarak indiriliyor...', 'info')
  setTimeout(() => addToast('Fatura başarıyla indirildi.', 'success'), 1500)
}

const tabs = computed(() => {
  const baseTabs = [
    { id: 'overview', label: 'Overview', icon: '<path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" />' },
    { id: 'purchases', label: 'My Downloads', icon: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>' },
    { id: 'saved', label: 'Saved Items', icon: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>' },
    { id: 'billing', label: 'Billing & Invoices', icon: '<rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/>' },
    { id: 'creator', label: 'Creator Hub', icon: '<path d="M12 20v-6M6 20V10M18 20V4"/>' },
    { id: 'settings', label: 'Settings', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
  ]
  if (user.value?.role === 'ADMIN') {
    baseTabs.unshift({ id: 'admin', label: 'Admin Panel', icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' })
  }
  return baseTabs
})
</script>

<template>
  <div v-if="user" class="min-h-screen bg-[#fafafa] font-sans selection:bg-indigo-500 selection:text-white pt-24 pb-12 px-5 md:px-8 flex flex-col items-center">

    <div class="w-full max-w-[1400px] flex flex-col lg:flex-row gap-8 relative z-10">

      <aside class="w-full lg:w-[280px] shrink-0 flex flex-col h-full gap-6">

        <div class="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] text-center relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 opacity-80"></div>
          <div class="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4 tracking-tighter shadow-xl">
             {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
          </div>
          <h2 class="text-xl font-bold text-black tracking-tight mb-1">{{ user.name || 'User' }}</h2>
          <p class="text-xs text-zinc-500 mb-4">{{ user.email }}</p>
        </div>

        <nav class="bg-white/70 backdrop-blur-xl border border-white p-4 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          <ul class="space-y-1">
            <li v-for="tab in tabs" :key="tab.id">
              <button @click="setTab(tab.id)" :class="activeTab === tab.id ? 'bg-black text-white shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100/80'" class="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-[14px] font-medium transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" v-html="tab.icon"></svg>
                {{ tab.label }}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main class="flex-grow min-w-0">

        <div v-if="dashPending" class="w-full h-64 flex flex-col items-center justify-center">
            <div class="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin mb-4"></div>
        </div>

        <div v-else class="space-y-6">

          <div v-if="activeTab === 'overview'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 class="text-3xl font-bold tracking-tight text-black mb-6">Welcome back, {{ user.name?.split(' ')[0] || 'User' }}</h1>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-200">
                <h3 class="text-sm font-semibold text-zinc-500 mb-4">Total Saved</h3>
                <div class="text-4xl font-bold text-black">{{ dashboardData?.savedProjects?.length || 0 }}</div>
              </div>
              <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-200">
                <h3 class="text-sm font-semibold text-zinc-500 mb-4">Purchased Items</h3>
                <div class="text-4xl font-bold text-black">{{ dashboardData?.purchasedProjects?.length || 0 }}</div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'billing'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-2xl font-bold tracking-tight text-black">Billing & Invoices</h2>
                  <p class="text-zinc-500 text-sm mt-1">Download receipts for your past purchases.</p>
                </div>
             </div>

             <div class="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm">
                <table class="w-full text-left text-sm whitespace-nowrap">
                  <thead class="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 text-[11px] uppercase tracking-widest">
                    <tr>
                      <th class="px-6 py-5 font-semibold">Date</th>
                      <th class="px-6 py-5 font-semibold">Item Details</th>
                      <th class="px-6 py-5 font-semibold">License</th>
                      <th class="px-6 py-5 font-semibold">Amount</th>
                      <th class="px-6 py-5 font-semibold text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-100">
                    <tr v-if="!billingData?.length">
                      <td colspan="5" class="px-6 py-12 text-center text-zinc-500 font-medium">No purchase history found.</td>
                    </tr>
                    <tr v-for="bill in billingData" :key="bill.id" class="hover:bg-zinc-50/50 transition-colors">
                      <td class="px-6 py-4 font-mono text-zinc-500">{{ formatDate(bill.createdAt) }}</td>
                      <td class="px-6 py-4">
                        <p class="font-bold text-zinc-900">{{ bill.project?.title || 'Unknown Item' }}</p>
                        <p class="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">{{ bill.project?.productType }}</p>
                      </td>
                      <td class="px-6 py-4">
                         <span :class="bill.licenseType === 'COMMERCIAL' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'" class="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border shadow-sm">
                           {{ bill.licenseType }}
                         </span>
                      </td>
                      <td class="px-6 py-4 font-black text-black">${{ bill.pricePaid?.toFixed(2) }}</td>
                      <td class="px-6 py-4 text-right">
                        <button @click="generateMockInvoice(bill.id)" class="text-indigo-600 hover:text-indigo-800 font-semibold text-xs flex items-center justify-end gap-1.5 ml-auto">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PDF
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </div>

          <div v-else-if="activeTab === 'creator'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-2xl font-bold tracking-tight text-black">Creator Hub</h2>
                  <p class="text-zinc-500 text-sm mt-1">Track your earnings and manage your digital products.</p>
                </div>
                <button class="bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-colors flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Submit Product
                </button>
             </div>

             <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
               <div class="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                 <div class="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                 <h3 class="text-indigo-200 text-sm font-bold tracking-widest uppercase mb-2 relative z-10">Total Revenue</h3>
                 <div class="text-4xl font-black mb-1 relative z-10">${{ creatorStats?.totalRevenue?.toFixed(2) || '0.00' }}</div>
               </div>

               <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-200 relative overflow-hidden">
                 <h3 class="text-zinc-400 text-sm font-bold tracking-widest uppercase mb-2">Total Sales</h3>
                 <div class="text-4xl font-black text-black mb-1">{{ creatorStats?.totalSales || 0 }}</div>
               </div>

               <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-200 relative overflow-hidden">
                 <h3 class="text-zinc-400 text-sm font-bold tracking-widest uppercase mb-2">Active Items</h3>
                 <div class="text-4xl font-black text-black mb-1">{{ creatorStats?.projects?.length || 0 }}</div>
               </div>
             </div>

             <h3 class="text-lg font-bold text-black mb-4">Your Products</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-if="!creatorStats?.projects?.length" class="col-span-full py-16 text-center bg-white border border-zinc-200 rounded-[2rem] border-dashed">
                  <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
                  <h3 class="text-lg font-bold text-black mb-1">Start selling your work</h3>
                  <p class="text-zinc-500 text-sm mb-6">Upload your first component or animation to start earning.</p>
                </div>

                <div v-for="proj in creatorStats?.projects" :key="proj.id" class="bg-white p-4 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col group">
                  <video :src="proj.videoUrl" autoplay loop muted playsinline class="w-full aspect-video rounded-2xl bg-zinc-100 object-cover mb-4"></video>
                  <div class="flex justify-between items-start px-1">
                    <div>
                      <h3 class="font-bold text-black leading-tight">{{ proj.title }}</h3>
                      <p class="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-1">{{ proj.downloads }} Sales</p>
                    </div>
                    <span class="text-sm font-black">${{ proj.price }}</span>
                  </div>
                </div>
             </div>
          </div>

          <div v-else-if="activeTab === 'purchases' || activeTab === 'saved' || activeTab === 'settings' || activeTab === 'support'">
            <p class="text-zinc-500 py-10 text-center">Bu sekme içeriği yükleniyor...</p>
          </div>

        </div>
      </main>

    </div>
  </div>
</template>