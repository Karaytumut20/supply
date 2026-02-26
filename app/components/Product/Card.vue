<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  item: any
}>()

const emit = defineEmits(['open'])

const categoriesString = computed(() => {
  return props.item.categories ? props.item.categories.join(', ') : ''
})
</script>

<template>
  <div class="group flex flex-col cursor-pointer" @click="emit('open', item)">

    <div
      class="relative w-full aspect-[4/4.2] bg-[#f4f4f5] rounded-[32px] flex items-center justify-center p-6 sm:p-10 overflow-hidden transition-colors duration-300 group-hover:bg-[#ebebec]"
    >

      <div v-if="item.tags?.includes('new')" class="absolute top-5 left-5 sm:top-6 sm:left-6 z-20">
        <span class="bg-[#e4e4e5] text-zinc-700 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase">
          New
        </span>
      </div>

      <div class="w-full relative rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-black transform transition-transform duration-500 group-hover:scale-[1.02]">
         <video
            autoplay
            loop
            muted
            playsinline
            class="w-full aspect-video object-cover pointer-events-none"
         >
            <source :src="item.video" type="video/mp4" />
         </video>
      </div>

    </div>

    <div class="flex justify-between items-start px-2 mt-4">

      <div class="flex flex-col">
        <h3 class="text-[17px] font-medium text-zinc-900 leading-tight">{{ item.title }}</h3>
        <p class="text-[14px] text-zinc-500 mt-1 font-normal">{{ categoriesString }}</p>
      </div>

      <div class="flex gap-2">
        <button class="w-[42px] h-[42px] flex items-center justify-center bg-[#f4f4f5] hover:bg-[#e4e4e7] rounded-[12px] text-zinc-600 transition-colors" @click.stop="">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </button>
        <button class="w-[42px] h-[42px] flex items-center justify-center bg-[#f4f4f5] hover:bg-[#e4e4e7] rounded-[12px] text-zinc-600 transition-colors" @click.stop="">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
        </button>
      </div>

    </div>
  </div>
</template>
