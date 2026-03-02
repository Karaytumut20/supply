<script setup lang="ts">
import { ref } from 'vue'
const isAboutOpen = ref(false)
const isPricingOpen = ref(false)
const { data: user } = await useFetch('/api/auth/me')
</script>
<template>
  <div class="min-h-screen bg-[#fafafa] font-sans flex flex-col selection:bg-black selection:text-white">
    <header class="absolute top-0 w-full z-50 px-5 md:px-8 py-6 flex items-center justify-end pointer-events-none">
      <div class="flex items-center gap-3 pointer-events-auto text-[13px] font-medium">
        
        <button v-if="!user || user.plan !== 'PRO'" @click="isPricingOpen = true" class="relative overflow-hidden group bg-black text-white hover:text-white transition-all px-5 py-2 rounded-full flex items-center gap-2 border border-zinc-900 shadow-xl shadow-black/20 transform hover:scale-105 mr-2">
          <span class="relative z-10 font-semibold tracking-wide flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400 group-hover:rotate-12 transition-transform duration-300"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Get PRO
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
        </button>

        <NuxtLink to="/ticket" class="bg-white/80 backdrop-blur-md hover:bg-white text-zinc-600 hover:text-black transition-all px-4 py-2 rounded-full flex items-center gap-2 border border-zinc-200/50 shadow-sm">
          Feedback <span class="opacity-40 font-mono text-[10px] border border-zinc-400 rounded-full w-3.5 h-3.5 flex items-center justify-center">?</span>
        </NuxtLink>
        <button @click="isAboutOpen = true" class="bg-white/80 backdrop-blur-md hover:bg-white text-zinc-600 hover:text-black transition-all px-4 py-2 rounded-full flex items-center gap-2 border border-zinc-200/50 shadow-sm mr-1">
          About <span class="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">New</span>
        </button>
        
        <UiUserDropdown v-if="user" :user="user" />
        <NuxtLink v-else to="/sign-in" class="bg-black hover:bg-zinc-800 text-white transition-all px-6 py-2 rounded-full shadow-lg hover:shadow-xl font-semibold">Sign in</NuxtLink>
      </div>
    </header>
    <main class="flex-grow"><slot /></main>
    <UiAboutModal :isOpen="isAboutOpen" :user="user" @close="isAboutOpen = false" />
    <UiPricingModal :isOpen="isPricingOpen" :user="user" @close="isPricingOpen = false" />
  </div>
</template>