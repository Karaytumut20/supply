<script setup lang="ts">
import { ref, computed } from 'vue'

useSeoMeta({ title: 'Home' })

const tags = ['All', 'Hero', 'Navigation', 'Preloader', 'Page Transition', 'Section Transition', 'Card', 'Footer', 'Button', 'Team']
const activeTag = ref('All')

// VERİTABANINDAN PROJELERİ ÇEK (Gerçek API Bağlantısı)
const { data: dbProjects, pending } = await useFetch('/api/projects')

// Gelen veriyi frontend'in beklediği formata dönüştür
const items = computed(() => {
  if (!dbProjects.value) return []
  return dbProjects.value.map((p: any) => ({
    ...p,
    video: p.videoUrl, // Card componenti 'video' propu bekliyor
    categories: p.categories ? p.categories.split(',').map((c: string) => c.trim()) : [],
    tags: p.tags ? p.tags.split(',').map((t: string) => t.trim()) : []
  }))
})

// Kategoriye göre filtrele
const filteredItems = computed(() => {
  if (activeTag.value === 'All') return items.value
  return items.value.filter((item: any) => item.categories.some((cat: string) => cat.toLowerCase().includes(activeTag.value.toLowerCase())))
})

const selectedItem = ref(null)
const isModalOpen = ref(false)

const openModal = (item: any) => {
  selectedItem.value = item
  isModalOpen.value = true
}
</script>

<template>
  <div>
    <section class="bg-[#0a0a0a] text-white pt-32 pb-20 px-5 md:px-6 w-full">
      <div class="w-full flex flex-col items-start">
        <div class="flex gap-1.5 mb-8">
          <div class="w-[22px] h-[22px] rounded-full bg-[#3b82f6]"></div>
          <div class="w-[22px] h-[22px] bg-[#ef4444]" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
          <div class="w-[22px] h-[22px] bg-[#eab308]"></div>
        </div>
        <h1 class="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-medium tracking-tight mb-4 max-w-3xl leading-[1.05]">
          The website inspo library —<br/>curated at the component level
        </h1>
        <p class="text-zinc-400 text-lg mb-10 tracking-wide">
          Organized for fast inspiration, updated weekly.
        </p>
        <div class="flex gap-4 items-center">
          <button class="bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-full text-sm font-semibold transition-colors">
            + Sub
          </button>
          <div class="bg-[#1f1f1f] border border-zinc-800 text-zinc-300 px-4 py-2.5 rounded-full text-[11px] font-mono tracking-widest uppercase flex items-center gap-1.5">
            <span class="text-white font-bold">{{ items.length }}</span> Projects
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white/90 backdrop-blur-md border-b border-zinc-200 px-5 md:px-6 py-4 sticky top-0 z-40">
      <div class="w-full flex items-center gap-8 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing">
        <span class="text-[10px] font-mono text-zinc-400 tracking-[0.15em] whitespace-nowrap uppercase">Popular Tags</span>
        <div class="flex gap-2.5">
          <button
            v-for="tag in tags"
            :key="tag"
            @click="activeTag = tag"
            :class="[
              'px-4 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase transition-colors whitespace-nowrap',
              activeTag === tag ? 'bg-black text-white shadow-md' : 'bg-[#f4f4f5] hover:bg-[#e4e4e7] text-zinc-700'
            ]"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </section>

    <section class="bg-white px-5 md:px-6 py-8 min-h-screen overflow-hidden">

      <div v-if="pending" class="w-full text-center py-24 text-zinc-400 font-medium animate-pulse">
        Loading projects from database...
      </div>

      <TransitionGroup v-else name="list" tag="div" class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 relative">
        <ProductCard v-for="item in filteredItems" :key="item.id" :item="item" @open="openModal" />
      </TransitionGroup>

      <div v-if="!pending && filteredItems.length === 0" class="w-full text-center py-24 text-zinc-400 font-medium">
        Bu kategoride henüz video bulunmuyor. Admin panelinden ekleyebilirsiniz.
      </div>
    </section>

    <ProductModal :isOpen="isModalOpen" :item="selectedItem" @close="isModalOpen = false" />
  </div>
</template>
