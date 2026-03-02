<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ item: any }>()
const emit = defineEmits(['open'])
const categoriesString = computed(() => { return props.item.categories ? (Array.isArray(props.item.categories) ? props.item.categories.join(', ') : props.item.categories) : '' })
</script>
<template>
  <div class="group flex flex-col cursor-pointer" @click="emit('open', item)">
    <div class="relative w-full aspect-[4/4.2] bg-[#f4f4f5] rounded-3xl flex items-center justify-center p-6 sm:p-10 overflow-hidden transition-all duration-500 group-hover:bg-[#ebebec]">
      <div v-if="item.isPremium" class="absolute top-5 right-5 z-20">
        <span class="bg-amber-400/90 backdrop-blur-sm text-amber-950 px-3 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-[0_4px_12px_rgba(251,191,36,0.3)]">PRO</span>
      </div>
      <div v-else class="absolute top-5 right-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span class="bg-white/90 backdrop-blur-sm text-zinc-800 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase shadow-sm">Free</span>
      </div>
      <div class="w-full relative rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-black transform transition-all duration-700 group-hover:scale-[1.04] group-hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] origin-bottom">
         <video :src="item.video" autoplay loop muted playsinline class="w-full aspect-video object-cover pointer-events-none"></video>
      </div>
    </div>
    <div class="flex justify-between items-start px-2 mt-4">
      <div class="flex flex-col pr-4">
        <h3 class="text-[17px] font-semibold text-zinc-900 leading-tight group-hover:text-indigo-600 transition-colors duration-300">
          {{ item.title }}
        </h3>
        <p class="text-[14px] text-zinc-500 mt-1 font-medium">{{ categoriesString }}</p>
      </div>
      <div class="flex gap-2 shrink-0">
        <div v-if="item.isPremium" class="h-[42px] flex items-center justify-center text-sm font-black text-black mr-1">${{ item.price }}</div>
        <button class="w-[42px] h-[42px] flex items-center justify-center bg-white border border-zinc-200 hover:border-black hover:bg-black rounded-[14px] text-zinc-600 hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md" @click.stop="">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>