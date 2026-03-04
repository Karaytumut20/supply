<script setup lang="ts">
const props = defineProps({
  title: String,
  description: String,
  category: String,
  price: Number
})
</script>

<template>
  <div class="w-full h-full bg-[#0a0a0a] text-white flex flex-col justify-center p-20 relative font-sans overflow-hidden">
    <!-- Background Gradients -->
    <div class="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/30 rounded-full blur-[150px] pointer-events-none"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/30 rounded-full blur-[150px] pointer-events-none"></div>
    
    <!-- Grid Pattern -->
    <div class="absolute inset-0 opacity-[0.05]" style="background-image: linear-gradient(#fff 2px, transparent 2px), linear-gradient(90deg, #fff 2px, transparent 2px); background-size: 80px 80px;"></div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-start w-full">
      <div class="flex items-center gap-6 mb-10">
        <div class="text-4xl font-black tracking-tight bg-white text-black px-8 py-3 rounded-2xl">Inspo.</div>
        <div class="text-3xl font-bold text-zinc-400 uppercase tracking-widest">{{ category || 'Premium Asset' }}</div>
      </div>
      
      <h1 class="text-[90px] font-extrabold leading-tight tracking-tighter mb-8 w-[900px] text-white break-words">
        {{ title }}
      </h1>
      
      <p class="text-[34px] text-zinc-300 w-[900px] leading-snug font-medium line-clamp-2">
        {{ description }}
      </p>
    </div>
  </div>
</template>
