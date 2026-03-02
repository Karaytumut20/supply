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

      <div class="flex items-center gap-4 sm:gap-6 text-[14px] font-medium">
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

          <div class="relative flex items-center justify-center">
            <button @click="toggleNotifs" class="relative w-10 h-10 rounded-full bg-white border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-600 hover:text-black transition-all shadow-sm focus:outline-none group">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:scale-110">
                 <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                 <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span v-if="notifData?.unreadCount > 0" class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full border-2 border-white shadow-sm text-[9px] font-black flex items-center justify-center">{{ notifData.unreadCount > 9 ? '9+' : notifData.unreadCount }}</span>
            </button>

            <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-2">
              <div v-if="isNotifMenuOpen" class="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-zinc-100/80 z-[60] overflow-hidden flex flex-col origin-top-right">
                <div class="px-4 py-3 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="text-zinc-500"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    <span class="font-bold text-black text-sm">Notifications</span>
                    <span v-if="notifData?.unreadCount > 0" class="bg-red-100 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">{{ notifData.unreadCount }} new</span>
                  </div>
                </div>
                <div class="max-h-[320px] overflow-y-auto p-2 flex flex-col gap-1">
                  <div v-if="!notifData?.notifications?.length" class="py-10 text-center">
                    <div class="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="text-zinc-400"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </div>
                    <p class="text-sm font-semibold text-zinc-700">All caught up!</p>
                    <p class="text-xs text-zinc-400 mt-0.5">No new notifications.</p>
                  </div>
                  <div v-for="notif in notifData?.notifications" :key="notif.id" :class="!notif.isRead ? 'bg-indigo-50/60' : ''" class="p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group">
                    <div class="flex items-start gap-2.5">
                      <span class="w-2 h-2 rounded-full mt-1.5 shrink-0 transition-colors" :class="notif.isRead ? 'bg-zinc-200' : 'bg-indigo-500'"></span>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-sm text-black leading-tight">{{ notif.title }}</h4>
                        <p class="text-xs text-zinc-500 mt-0.5 leading-relaxed">{{ notif.message }}</p>
                        <p class="text-[10px] text-zinc-400 mt-1 font-medium">{{ new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <div class="relative flex items-center justify-center">
            <button @click="toggleUserMenu" class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center shadow-md border-2 border-white ring-2 ring-transparent hover:ring-indigo-100 hover:scale-105 active:scale-95 transition-all">
              {{ user.name?.charAt(0).toUpperCase() || 'U' }}
            </button>

            <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-2">
              <div v-if="isUserMenuOpen" class="absolute right-0 top-full mt-3 w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-zinc-100/80 z-[60] overflow-hidden flex flex-col origin-top-right">
                <div class="px-5 py-4 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/80 to-white">
                  <p class="text-sm font-bold text-black truncate">{{ user.name }}</p>
                  <p class="text-xs text-zinc-400 truncate">{{ user.email }}</p>
                </div>
                <div class="p-2 flex flex-col gap-0.5">
                  <NuxtLink to="/dashboard" @click="isUserMenuOpen = false" class="px-3 py-2.5 text-sm text-zinc-700 hover:text-black hover:bg-zinc-100/80 rounded-xl transition-colors flex items-center gap-2.5 font-medium">
                    <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                    My Dashboard
                  </NuxtLink>
                  <NuxtLink to="/dashboard?tab=purchases" @click="isUserMenuOpen = false" class="px-3 py-2.5 text-sm text-zinc-700 hover:text-black hover:bg-zinc-100/80 rounded-xl transition-colors flex items-center gap-2.5 font-medium">
                    <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    My Downloads
                  </NuxtLink>
                </div>
                <div class="p-2 border-t border-zinc-100">
                  <button @click="handleLogout" class="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all flex items-center gap-2.5 font-bold">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </Transition>
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