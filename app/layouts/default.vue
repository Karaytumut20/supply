<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '#imports'

const isAboutOpen = ref(false)
const isUserMenuOpen = ref(false)
const isNotifMenuOpen = ref(false)

const { data: user } = await useFetch('/api/auth/me')
const { data: notifData, refresh: refreshNotifs } = await useFetch(user.value ? '/api/notifications' : '')
const { addToast } = useToast()

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  addToast('Signed out successfully.', 'info')
  setTimeout(() => { window.location.href = '/' }, 500)
}

const markAsRead = async () => {
  if (notifData.value?.unreadCount && notifData.value.unreadCount > 0) {
    await $fetch('/api/notifications/read', { method: 'POST' })
    await refreshNotifs()
  }
}

const toggleNotifs = () => {
  isNotifMenuOpen.value = !isNotifMenuOpen.value
  if (isNotifMenuOpen.value) {
    isUserMenuOpen.value = false
    markAsRead()
  }
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
  if (isUserMenuOpen.value) isNotifMenuOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-white font-sans flex flex-col">

    <header class="fixed top-0 w-full z-50 px-5 md:px-8 py-4 flex items-center justify-between transition-all backdrop-blur-xl bg-white/70 border-b border-zinc-200/50">
      <div class="flex items-center">
        <NuxtLink to="/" class="font-bold text-xl tracking-tight flex items-center gap-2 group">
          <div class="flex gap-1 transform transition-transform group-hover:scale-110">
            <div class="w-3.5 h-3.5 rounded-full bg-blue-500"></div>
            <div class="w-3.5 h-3.5 bg-red-500" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
            <div class="w-3.5 h-3.5 bg-yellow-500"></div>
          </div>
          inspo<span class="text-zinc-400">.</span>
        </NuxtLink>
      </div>

      <div class="flex items-center gap-3 sm:gap-5 text-[14px] font-medium">
        <NuxtLink to="/ticket" class="hidden sm:flex text-zinc-500 hover:text-black transition-colors">Support</NuxtLink>
        <button @click="isAboutOpen = true" class="hidden sm:flex text-zinc-500 hover:text-black transition-colors">About</button>

        <div class="w-px h-5 bg-zinc-200 hidden sm:block mx-1"></div>

        <template v-if="user">
          <NuxtLink v-if="!user.isPro" to="/pricing" class="relative group hidden sm:flex items-center justify-center">
             <div class="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
             <span class="relative bg-white text-black px-4 py-1.5 rounded-full border border-zinc-200 text-sm font-bold flex items-center gap-1">
               <svg class="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z"></path></svg>
               Get Pro
             </span>
          </NuxtLink>

          <div class="relative">
            <button @click="toggleNotifs" class="relative w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors focus:outline-none">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span v-if="notifData?.unreadCount > 0" class="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div v-if="isNotifMenuOpen" class="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-zinc-100 z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
              <div class="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                <span class="font-bold text-black text-sm">Notifications</span>
              </div>
              <div class="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1">
                <div v-if="!notifData?.notifications?.length" class="p-4 text-center text-sm text-zinc-500">
                  No new notifications.
                </div>
                <div v-for="notif in notifData?.notifications" :key="notif.id" :class="notif.isRead ? 'opacity-70' : 'bg-indigo-50/50'" class="p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-2 h-2 rounded-full" :class="notif.isRead ? 'bg-transparent' : 'bg-indigo-500'"></span>
                    <h4 class="font-bold text-sm text-black">{{ notif.title }}</h4>
                  </div>
                  <p class="text-xs text-zinc-600 pl-4">{{ notif.message }}</p>
                  <p class="text-[10px] text-zinc-400 pl-4 mt-1">{{ new Date(notif.createdAt).toLocaleDateString() }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="relative">
            <button @click="toggleUserMenu" class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center shadow-md border-2 border-white ring-2 ring-transparent hover:ring-indigo-100 transition-all">
              {{ user.name?.charAt(0).toUpperCase() || 'U' }}
            </button>

            <div v-if="isUserMenuOpen" class="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-zinc-100 z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
              <div class="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
                <p class="text-sm font-bold text-black truncate">{{ user.name }}</p>
                <p class="text-xs text-zinc-500 truncate">{{ user.email }}</p>
                <div v-if="user.isPro" class="mt-2 inline-block bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Pro Member</div>
              </div>
              <div class="p-2 flex flex-col gap-1">
                <NuxtLink to="/dashboard" @click="isUserMenuOpen = false" class="px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                  My Library
                </NuxtLink>
                <NuxtLink v-if="user.role === 'ADMIN'" to="/admin" @click="isUserMenuOpen = false" class="px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Admin Panel
                </NuxtLink>
              </div>
              <div class="p-2 border-t border-zinc-100">
                <button @click="handleLogout" class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </template>

        <NuxtLink v-else to="/sign-in" class="bg-black hover:bg-zinc-800 text-white transition-colors px-6 py-2.5 rounded-full shadow-lg shadow-black/10">
          Sign In
        </NuxtLink>
      </div>
    </header>

    <div v-if="isUserMenuOpen || isNotifMenuOpen" @click="isUserMenuOpen=false; isNotifMenuOpen=false" class="fixed inset-0 z-40"></div>

    <main class="flex-grow pt-[72px] relative z-10"><slot /></main>

    <UiAboutModal :isOpen="isAboutOpen" @close="isAboutOpen = false" />
    <UiToast />
  </div>
</template>