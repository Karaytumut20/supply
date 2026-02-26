<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

const props = defineProps<{ isOpen: boolean, item: any }>()
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
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">

        <div class="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" @click="close"></div>

        <Transition enter-active-class="transition duration-400 ease-out delay-75" enter-from-class="opacity-0 translate-y-8 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0 scale-100" leave-to-class="opacity-0 translate-y-8 scale-95">
          <div v-if="isOpen" class="relative w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]">

            <button @click="close" class="absolute top-6 right-6 z-20 p-3 bg-black/5 hover:bg-black/10 text-black rounded-full transition-colors backdrop-blur-md">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div class="w-full md:w-2/3 bg-[#f4f4f5] p-6 md:p-8 flex items-center justify-center">
               <div class="w-full h-full rounded-[1.5rem] overflow-hidden shadow-sm border border-zinc-200">
                 <img :src="item?.image" class="w-full h-full object-cover" />
               </div>
            </div>

            <div class="w-full md:w-1/3 p-8 md:p-12 flex flex-col bg-white">
               <div class="flex gap-2 mb-6">
                 <span v-for="tag in item?.tags" :key="tag" class="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase">
                   {{ tag }}
                 </span>
               </div>

               <h2 class="text-4xl font-medium tracking-tight text-black mb-4">{{ item?.title }}</h2>
               <div class="text-2xl font-light text-zinc-500 mb-8">{{ item?.price }}</div>

               <p class="text-zinc-600 leading-relaxed mb-8 text-sm">
                 Detailed inspection of the component. This minimalist and perfectly crafted design mimics the premium quality found on inspo.page, ready for your next big project. Includes seamless animations and responsive layouts.
               </p>

               <div class="mt-auto flex flex-col gap-4">
                 <button class="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10">Purchase Source Code</button>
                 <div class="flex gap-4">
                   <button class="flex-1 bg-zinc-100 text-black py-4 rounded-xl font-medium hover:bg-zinc-200 transition-colors">Live Demo</button>
                   <button class="flex-1 border border-zinc-200 text-black py-4 rounded-xl font-medium hover:bg-zinc-50 transition-colors">Save</button>
                 </div>
               </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
