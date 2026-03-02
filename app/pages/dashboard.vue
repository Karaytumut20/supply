<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '#imports'

useSeoMeta({ title: 'My Dashboard' })
const { addToast } = useToast()
const { data: user } = await useFetch('/api/auth/me')
const { data: dashboardData, pending } = await useFetch('/api/user/dashboard')
const activeTab = ref('Purchases')

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  addToast('Başarıyla çıkış yapıldı.', 'info')
  setTimeout(() => { window.location.href = '/' }, 500)
}
</script>

<template>
  <div v-if="user" class="min-h-screen bg-[#fafafa] pt-24 pb-12 px-6">
    <div class="max-w-[1200px] mx-auto">

      <div class="flex flex-col md:flex-row md:justify-between md:items-end mb-10 border-b border-zinc-200 pb-8 gap-6">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-black tracking-tight mb-2">My Library</h1>
          <p class="text-zinc-500 text-lg">Welcome back, <span class="text-black font-medium">{{ user.name }}</span>.</p>
          <NuxtLink v-if="user.role === 'ADMIN'" to="/admin" class="mt-4 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Admin Panel
          </NuxtLink>
        </div>
        <button @click="handleLogout" class="px-6 py-3 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-xl text-sm font-medium transition-all text-black shadow-sm flex items-center justify-center gap-2">
          Log Out
        </button>
      </div>

      <div class="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
        <button @click="activeTab = 'Purchases'" :class="activeTab === 'Purchases' ? 'bg-black text-white shadow-md' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'" class="px-6 py-2.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap">My Purchases ({{ dashboardData?.purchases?.length || 0 }})</button>
        <button @click="activeTab = 'Saved'" :class="activeTab === 'Saved' ? 'bg-black text-white shadow-md' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'" class="px-6 py-2.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap">Bookmarks ({{ dashboardData?.savedProjects?.length || 0 }})</button>
        <button @click="activeTab = 'Tickets'" :class="activeTab === 'Tickets' ? 'bg-black text-white shadow-md' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'" class="px-6 py-2.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap">Support Tickets</button>
      </div>

      <div v-if="pending" class="w-full py-20 flex justify-center">
        <div class="animate-pulse flex flex-col items-center gap-4">
          <div class="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <span class="text-zinc-400 font-medium">Loading your library...</span>
        </div>
      </div>

      <div v-else>
        <div v-if="activeTab === 'Purchases'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           <div v-if="dashboardData?.purchases?.length === 0" class="col-span-full py-20 bg-white rounded-[2rem] border border-dashed border-zinc-300 text-center flex flex-col items-center justify-center">
              <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4"><svg class="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>
              <h3 class="text-lg font-semibold text-black mb-1">No purchases yet</h3>
              <p class="text-zinc-500 mb-6">Start exploring our premium components.</p>
              <NuxtLink to="/" class="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors">Browse Components</NuxtLink>
           </div>

           <div v-for="item in dashboardData.purchases" :key="item.id" class="bg-white p-5 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div class="w-full aspect-video rounded-2xl overflow-hidden bg-zinc-100 mb-5 relative">
                <video :src="item.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></video>
              </div>
              <h3 class="font-bold text-lg text-black">{{ item.title }}</h3>
              <p class="text-sm text-zinc-500 mt-1 mb-6">Purchased on {{ new Date(item.purchaseDate).toLocaleDateString() }}</p>
              <div class="mt-auto">
                <a :href="item.sourceUrl || '#'" target="_blank" class="flex items-center justify-center gap-2 w-full bg-emerald-50 text-emerald-700 py-3.5 rounded-xl font-semibold hover:bg-emerald-100 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download Assets
                </a>
              </div>
           </div>
        </div>

        <div v-if="activeTab === 'Saved'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           <div v-if="dashboardData?.savedProjects?.length === 0" class="col-span-full py-20 bg-white rounded-[2rem] border border-dashed border-zinc-300 text-center flex flex-col items-center justify-center">
              <p class="text-zinc-500">You haven't saved any inspiration yet.</p>
           </div>
           <div v-for="proj in dashboardData.savedProjects" :key="proj.id" class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm group">
              <video :src="proj.videoUrl" autoplay loop muted playsinline class="w-full aspect-video rounded-xl object-cover bg-black mb-4 group-hover:opacity-90 transition-opacity"></video>
              <h3 class="font-medium text-black">{{ proj.title }}</h3>
           </div>
        </div>

        <div v-if="activeTab === 'Tickets'" class="max-w-3xl mx-auto">
           <div v-if="dashboardData?.tickets?.length === 0" class="py-20 bg-white rounded-[2rem] border border-dashed border-zinc-300 text-center flex flex-col items-center justify-center">
              <p class="text-zinc-500 mb-4">You have no active support tickets.</p>
              <NuxtLink to="/ticket" class="text-blue-600 font-medium hover:underline">Create a new ticket</NuxtLink>
           </div>
           <div v-else class="flex flex-col gap-4">
             <div v-for="ticket in dashboardData.tickets" :key="ticket.id" class="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
                <div class="flex justify-between items-start mb-3">
                  <span class="text-sm font-medium bg-zinc-100 px-3 py-1 rounded-full text-zinc-600">{{ ticket.status }}</span>
                  <span class="text-xs text-zinc-400">{{ new Date(ticket.createdAt).toLocaleDateString() }}</span>
                </div>
                <h3 class="text-lg font-bold text-black mb-2">{{ ticket.subject }}</h3>
                <p class="text-zinc-600 text-sm">{{ ticket.message }}</p>
             </div>
           </div>
        </div>

      </div>

    </div>
  </div>
</template>