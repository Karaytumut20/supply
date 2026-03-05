<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const { data: user } = await useFetch('/api/auth/me', { key: 'auth-user', headers: useRequestHeaders(['cookie']) as HeadersInit })

if (!user.value || user.value.role !== 'ADMIN') {
  await navigateTo('/')
}

const isMobileMenuOpen = ref(false)
const route = useRoute()

const pageTitle = computed(() => {
  if (route.path === '/admin') return 'Platform Analytics'
  if (route.path === '/admin/projects') return 'Products Management'
  if (route.path === '/admin/categories') return 'Categories'
  if (route.path === '/admin/users') return 'Users & Creators'
  return 'Admin Dashboard'
})
</script>

<template>
  <div class="h-screen bg-[#f5f5f7] flex flex-col md:flex-row font-sans text-zinc-900 overflow-hidden">
    <!-- Overlay for mobile menu -->
    <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"></div>

    <!-- Sidebar -->
    <aside :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'" class="fixed md:static top-0 left-0 w-64 bg-white border-r border-zinc-200 flex flex-col h-full z-50 shadow-2xl md:shadow-sm transition-transform duration-300 ease-in-out">
      <div class="h-16 border-b border-zinc-200 flex items-center justify-between px-6 font-black tracking-tight text-xl shrink-0">
        <NuxtLink to="/" class="hover:opacity-80 transition-opacity" title="Return to Homepage">
          <span>inspo<span class="text-indigo-600">.admin</span></span>
        </NuxtLink>
        <button @click="isMobileMenuOpen = false" class="md:hidden p-2 -mr-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <nav class="p-4 flex flex-col gap-2 mt-2 overflow-y-auto">
        <NuxtLink to="/admin" @click="isMobileMenuOpen = false" :class="route.path === '/admin' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-3 md:py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> Platform Analytics
        </NuxtLink>
        <NuxtLink to="/admin/projects" @click="isMobileMenuOpen = false" :class="route.path === '/admin/projects' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-3 md:py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/></svg> Products Management
        </NuxtLink>
        <NuxtLink to="/admin/categories" @click="isMobileMenuOpen = false" :class="route.path === '/admin/categories' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-3 md:py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg> Categories
        </NuxtLink>
        <NuxtLink to="/admin/users" @click="isMobileMenuOpen = false" :class="route.path === '/admin/users' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-3 md:py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Users & Creators
        </NuxtLink>
        <NuxtLink to="/admin/notifications" @click="isMobileMenuOpen = false" :class="route.path === '/admin/notifications' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-3 md:py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> Notifications
        </NuxtLink>
        <NuxtLink to="/admin/requests" @click="isMobileMenuOpen = false" :class="route.path === '/admin/requests' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-3 md:py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2 10 22"/><path d="m8 6-6 6 6 6"/><path d="m16 18 6-6-6-6"/></svg> Topluluk İstekleri
        </NuxtLink>
        <NuxtLink to="/admin/tickets" @click="isMobileMenuOpen = false" :class="route.path === '/admin/tickets' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-3 md:py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Tickets
        </NuxtLink>
      </nav>
      <div class="mt-auto p-4 border-t border-zinc-200 shrink-0">
        <NuxtLink to="/" class="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black p-2 rounded-xl transition-colors hover:bg-zinc-100">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Exit Admin
        </NuxtLink>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Header -->
      <header class="bg-white border-b border-zinc-200 h-16 flex items-center px-4 md:px-8 justify-between shrink-0 top-0 z-30">
        <div class="flex items-center gap-3">
          <button @click="isMobileMenuOpen = true" class="md:hidden p-2.5 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors active:scale-95">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <h2 class="font-bold text-lg capitalize text-black tracking-tight">{{ pageTitle }}</h2>
        </div>
        <div id="admin-header-actions" class="flex items-center gap-3">
           <NuxtLink to="/" class="md:hidden p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-full transition-colors flex items-center justify-center" aria-label="Return to Homepage">
             <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
           </NuxtLink>
        </div>
      </header>

      <!-- Main Content -->
      <div class="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar relative">
        <slot />
      </div>
    </main>
  </div>
</template>
