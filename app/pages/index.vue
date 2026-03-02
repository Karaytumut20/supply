<script setup lang="ts">
import { ref, computed } from 'vue'
useSeoMeta({ title: 'Home' })
const activeTag = ref('All')
const { data: dbProjects, pending } = await useFetch('/api/projects')
const { data: dbCategories } = await useFetch('/api/categories')

// STOCK VE DINAMIK TAGLERIN BIRLESTIRILMESI
const tags = computed(() => {
  const stockTags = ['All', 'Hero', 'Navigation', 'Page Transition']
  const fetchedTags = dbCategories.value ? dbCategories.value.map((c: any) => c.name) : []
  return Array.from(new Set([...stockTags, ...fetchedTags]))
})

const items = computed(() => {
  if (!dbProjects.value) return []
  return dbProjects.value.map((p: any) => ({
    ...p,
    video: p.videoUrl,
    categories: p.categories ? p.categories.split(',').map((c: string) => c.trim()) : [],
    tags: p.tags ? p.tags.split(',').map((t: string) => t.trim()) : []
  }))
})

const filteredItems = computed(() => {
  if (activeTag.value === 'All') return items.value
  return items.value.filter((item: any) => item.categories.some((cat: string) => cat.toLowerCase() === activeTag.value.toLowerCase() || cat.toLowerCase().includes(activeTag.value.toLowerCase())))
})

const selectedItem = ref(null)
const isModalOpen = ref(false)
const openModal = (item: any) => {
  selectedItem.value = item
  isModalOpen.value = true
}

// Stats computed solely for UI
const stats = computed(() => {
  const proCount = items.value.filter(i => i.isPremium).length
  const freeCount = items.value.filter(i => !i.isPremium).length
  return { total: items.value.length, proCount, freeCount }
})
</script>

<template>
  <div class="bg-[#fafafa] min-h-screen">
    
    <!-- Hero Section -->
    <section class="bg-black text-white pt-40 pb-28 px-5 md:px-8 w-full relative overflow-hidden flex flex-col items-center text-center">
      <!-- Background Elements -->
      <div class="absolute inset-0 z-0">
          <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
          <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-600/20 rounded-full blur-[100px]"></div>
          <div class="absolute inset-0 opacity-[0.05]" style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 30px 30px;"></div>
      </div>
      
      <div class="w-full max-w-5xl relative z-10 flex flex-col items-center">
        <div class="flex gap-2 mb-10 reveal-text">
          <div class="w-6 h-6 rounded-full bg-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
          <div class="w-6 h-6 bg-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.6)]" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
          <div class="w-6 h-6 bg-[#eab308] shadow-[0_0_20px_rgba(234,179,8,0.6)]"></div>
        </div>
        
        <h1 class="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] font-bold tracking-tight mb-6 leading-[1.05] reveal-text delay-50">
          The curated library<br/><span class="text-zinc-500 font-light italic">of modern web design.</span>
        </h1>
        
        <p class="text-zinc-400 text-lg sm:text-xl mb-12 max-w-2xl font-light tracking-wide reveal-text delay-100">
          Elevate your projects with our collection of production-ready components, animations, and layouts. Built for developers who care about the details.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-center reveal-text delay-150">
          <button class="bg-white hover:bg-zinc-200 text-black px-8 py-4 rounded-full text-[15px] font-bold transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95">
            Explore PRO Access
          </button>
          <div class="bg-white/10 backdrop-blur-md border border-white/10 text-zinc-300 px-6 py-4 rounded-full text-xs font-mono tracking-widest uppercase flex items-center gap-3 shadow-lg">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> {{ stats.total }} Components</span>
            <span class="w-px h-4 bg-white/20"></span>
            <span class="text-amber-400 font-bold">{{ stats.proCount }} Premium</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Navigation/Filters Bar -->
    <section class="bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 px-5 md:px-8 py-5 sticky top-0 z-40 transition-all shadow-sm">
      <div class="w-full max-w-[1600px] mx-auto flex items-center gap-8 overflow-x-auto no-scrollbar relative">
        <span class="text-[11px] font-mono text-zinc-400 tracking-[0.2em] whitespace-nowrap uppercase font-bold sticky left-0 bg-white/80 backdrop-blur-xl pr-4 py-1 z-10 hidden sm:block">Filtered By</span>
        <div class="flex gap-3">
          <button v-for="tag in tags" :key="tag" @click="activeTag = tag" :class="['px-5 py-2.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all duration-300 whitespace-nowrap', activeTag === tag ? 'bg-black text-white shadow-md transform scale-105' : 'bg-transparent border border-zinc-200 hover:border-black hover:bg-zinc-50 text-zinc-600 hover:text-black']">
             {{ tag }}
          </button>
        </div>
      </div>
    </section>

    <!-- Content Grid -->
    <section class="max-w-[1600px] mx-auto px-5 md:px-8 py-12 md:py-20 min-h-screen">
      
      <div v-if="pending" class="w-full text-center py-32 flex flex-col items-center justify-center space-y-4">
         <div class="w-10 h-10 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
         <span class="text-zinc-500 font-medium font-mono text-sm tracking-widest uppercase animate-pulse">Loading library...</span>
      </div>
      
      <TransitionGroup v-else name="list" tag="div" class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 relative">
        <ProductCard v-for="(item, index) in filteredItems" :key="item.id" :item="item" @open="openModal" :style="{ transitionDelay: `${index * 50}ms` }" class="reveal-text" />
      </TransitionGroup>
      
      <div v-if="!pending && filteredItems.length === 0" class="w-full text-center py-32 flex flex-col items-center justify-center space-y-4">
        <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <h3 class="text-xl font-bold text-zinc-900">No components found</h3>
        <p class="text-zinc-500 max-w-sm mx-auto">We couldn't find any components matching the "{{ activeTag }}" category. Try selecting another tag.</p>
        <button @click="activeTag = 'All'" class="mt-4 bg-black text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-zinc-800 transition-colors">View All Comments</button>
      </div>
    </section>
    
    <ProductModal :isOpen="isModalOpen" :item="selectedItem" @close="isModalOpen = false" />
  </div>
</template>