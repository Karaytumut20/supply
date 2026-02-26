<script setup lang="ts">
import { ref } from 'vue'

const isAboutOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-white font-sans flex flex-col">
    <header class="absolute top-0 w-full z-50 px-5 md:px-6 py-5 flex items-center justify-end pointer-events-none">
      <div class="flex items-center gap-3 pointer-events-auto text-[13px] font-medium">
        <NuxtLink to="/ticket" class="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-zinc-300 transition-colors px-3 py-1.5 rounded-full flex items-center gap-2">
          Feedback <span class="opacity-50 font-mono text-[10px] border border-zinc-600 rounded-full w-3.5 h-3.5 flex items-center justify-center">?</span>
        </NuxtLink>
        <button @click="isAboutOpen = true" class="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-zinc-300 transition-colors px-3 py-1.5 rounded-full flex items-center gap-2">
          About <span class="text-[9px] bg-zinc-600 text-white px-1.5 py-0.5 rounded uppercase tracking-widest">New</span>
        </button>
        <NuxtLink to="/sign-in" class="bg-white hover:bg-zinc-200 text-black transition-colors px-4 py-1.5 rounded-full shadow-sm">
          Sign in
        </NuxtLink>
      </div>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <UiAboutModal :isOpen="isAboutOpen" @close="isAboutOpen = false" />
  </div>
</template>
