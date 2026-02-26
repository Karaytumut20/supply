<script setup lang="ts">
defineProps<{
  item: any
}>()
const emit = defineEmits(['open'])
</script>

<template>
  <div class="bg-[#f4f4f5] rounded-[1.5rem] p-4 relative group h-[400px] flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1" @click="emit('open', item)">

    <div class="absolute top-8 left-8 z-20">
      <span v-for="tag in item.tags" :key="tag" class="bg-zinc-200/80 backdrop-blur text-zinc-600 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase shadow-sm">
        {{ tag }}
      </span>
    </div>

    <div class="w-full h-full rounded-xl overflow-hidden relative border border-zinc-200/50 bg-[#0a0a0a]">
      <img :src="item.image" class="w-full h-full object-cover opacity-95 group-hover:opacity-40 transition-opacity duration-500" />

      <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="flex gap-3">
          <button class="bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:scale-105 transition-transform" @click.stop="emit('open', item)">Inspect</button>
          <button class="bg-zinc-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:scale-105 transition-transform" @click.stop="">Demo</button>
        </div>
        <button class="bg-black/50 backdrop-blur-md text-white px-6 py-2 rounded-full text-xs font-medium hover:bg-black/70 transition-colors" @click.stop="">Save</button>
      </div>

      <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
         <div class="flex justify-between items-end">
            <h3 class="text-white font-medium text-lg">{{ item.title }}</h3>
            <span class="text-white/90 font-mono text-sm bg-white/20 px-2 py-1 rounded">{{ item.price }}</span>
         </div>
      </div>
    </div>
  </div>
</template>
