<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])
const close = () => emit('close')

watch(() => props.isOpen, (val) => {
  if (typeof document !== 'undefined') document.body.style.overflow = val ? 'hidden' : ''
})

onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">

        <div class="absolute inset-0 bg-black/60 backdrop-blur-md" @click="close"></div>

        <Transition enter-active-class="transition duration-400 ease-out delay-75" enter-from-class="opacity-0 translate-y-8 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0 scale-100" leave-to-class="opacity-0 translate-y-8 scale-95">
          <div v-if="isOpen" class="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl p-10 md:p-14 border border-zinc-200/50">

            <button @click="close" class="absolute top-6 right-6 z-20 p-2.5 bg-zinc-100 hover:bg-zinc-200 text-black rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div class="flex gap-1.5 mb-8 reveal-text">
              <div class="w-[18px] h-[18px] rounded-full bg-[#3b82f6]"></div>
              <div class="w-[18px] h-[18px] bg-[#ef4444]" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
              <div class="w-[18px] h-[18px] bg-[#eab308]"></div>
            </div>

            <h2 class="text-4xl font-bold tracking-tight text-black mb-6 reveal-text delay-50">About Inspo</h2>

            <div class="text-lg text-zinc-600 space-y-4 font-light leading-relaxed">
              <p class="reveal-text delay-100">Welcome to our inspiration library. This project is a curated space for the best web animations, layouts, and components.</p>
              <p class="reveal-text delay-150">We believe in the power of good design. Subtle animations, proper timing, and interactions that just feel right are what make a website stand out.</p>
              <p class="reveal-text delay-200">Our goal is to help you build faster by providing production-ready, beautifully crafted UI components.</p>
            </div>

            <div class="mt-10 flex gap-4 reveal-text delay-250">
              <button @click="close" class="bg-black text-white px-8 py-3.5 rounded-xl font-medium hover:bg-zinc-800 transition-colors focus:ring-4 focus:ring-zinc-300">Start Browsing</button>
              <NuxtLink to="/sign-in" class="bg-zinc-100 text-black px-8 py-3.5 rounded-xl font-medium hover:bg-zinc-200 transition-colors focus:ring-4 focus:ring-zinc-300" @click="close">Sign In</NuxtLink>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
