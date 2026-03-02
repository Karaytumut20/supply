<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ user: any }>()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = (e: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('click', closeDropdown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', closeDropdown)
  }
})

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/'
}
</script>

<template>
  <div class="relative pointer-events-auto" ref="dropdownRef">
    <button @click.stop="toggleDropdown" class="flex gap-2 items-center focus:outline-none focus:ring-2 focus:ring-black rounded-full transition-transform hover:scale-105 active:scale-95">
      <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm sm:text-base border-2 border-white shadow-md relative overflow-hidden group">
        <span class="group-hover:opacity-0 transition-opacity duration-300">{{ user?.name ? user.name.charAt(0).toUpperCase() : 'U' }}</span>
        <div class="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>
    </button>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-3 pointer-events-none"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-3 pointer-events-none"
    >
      <div v-if="isOpen" class="absolute right-0 top-full mt-4 w-72 bg-white/95 backdrop-blur-2xl rounded-[1.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.2)] border border-white/50 overflow-hidden z-[100] transform origin-top-right ring-1 ring-black/5">
        
        <!-- Header -->
        <div class="p-5 border-b border-zinc-100/80 bg-gradient-to-b from-zinc-50/50 to-white flex flex-col items-center text-center relative overflow-hidden">
          <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 opacity-50"></div>
          <div class="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-[0_0_20px_rgba(0,0,0,0.1)] relative">
             {{ user?.name ? user.name.charAt(0).toUpperCase() : 'U' }}
             <div v-if="user?.plan === 'PRO'" class="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white shadow-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
             </div>
          </div>
          <h3 class="text-lg font-bold text-zinc-900 tracking-tight leading-none mb-1">{{ user?.name || 'User' }}</h3>
          <p class="text-sm text-zinc-500 mb-2 truncate max-w-[200px]">{{ user?.email }}</p>
        </div>

        <!-- Menu Items -->
        <div class="p-3 space-y-1">
          <NuxtLink v-if="user?.role === 'ADMIN'" to="/admin" class="group flex items-center justify-between w-full px-4 py-3 text-[14px] text-zinc-700 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-xl transition-all duration-300 font-semibold mb-2">
             <div class="flex items-center gap-3">
               <svg class="text-zinc-400 group-hover:text-indigo-500 transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
               Admin Dashboard
             </div>
             <svg class="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </NuxtLink>
          
          <NuxtLink to="/dashboard" class="group flex items-center justify-between w-full px-4 py-2.5 text-[14px] text-zinc-700 hover:text-black hover:bg-zinc-100/80 rounded-xl transition-all font-medium">
             <div class="flex items-center gap-3">
               <svg class="text-zinc-400 group-hover:text-black transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
               Overview & Profile
             </div>
          </NuxtLink>
          
          <NuxtLink to="/dashboard?tab=purchases" class="group flex items-center justify-between w-full px-4 py-2.5 text-[14px] text-zinc-700 hover:text-black hover:bg-zinc-100/80 rounded-xl transition-all font-medium">
             <div class="flex items-center gap-3">
               <svg class="text-zinc-400 group-hover:text-black transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
               My Purchases
             </div>
             <span class="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{{ user?.purchases?.length || 0 }}</span>
          </NuxtLink>
          
          <NuxtLink to="/dashboard?tab=saved" class="group flex items-center justify-between w-full px-4 py-2.5 text-[14px] text-zinc-700 hover:text-black hover:bg-zinc-100/80 rounded-xl transition-all font-medium">
             <div class="flex items-center gap-3">
               <svg class="text-zinc-400 group-hover:text-black transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
               Saved Inspirations
             </div>
          </NuxtLink>
          
          <NuxtLink to="/dashboard?tab=settings" class="group flex items-center justify-between w-full px-4 py-2.5 text-[14px] text-zinc-700 hover:text-black hover:bg-zinc-100/80 rounded-xl transition-all font-medium">
             <div class="flex items-center gap-3">
               <svg class="text-zinc-400 group-hover:text-black transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
               Settings & Security
             </div>
          </NuxtLink>
        </div>

        <!-- Footer -->
        <div class="p-3 border-t border-zinc-100/80 bg-zinc-50/50">
          <button @click="handleLogout" class="group flex items-center justify-center gap-2 w-full px-4 py-3 text-[14px] text-red-600 hover:text-white hover:bg-red-500 rounded-xl transition-all font-bold">
            <svg class="transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>

      </div>
    </Transition>
  </div>
</template>
