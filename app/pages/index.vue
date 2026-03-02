<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '#imports'

useSeoMeta({ title: 'Home - Premium UI Components' })

const tags = ['All', 'Hero', 'Navigation', 'Page Transition', 'Card', 'Interaction']
const activeTag = ref('All')
const searchQuery = ref('')
const priceFilter = ref('all')
const sortBy = ref('newest') // 'newest', 'popular', 'top_rated'
const email = ref('')
const { addToast } = useToast()

const { data: dbProjects, pending } = await useFetch('/api/projects')

const items = computed(() => {
  if (!dbProjects.value) return []
  return dbProjects.value.map((p: any) => ({
    ...p, video: p.videoUrl,
    categories: p.categories ? p.categories.split(',').map((c: string) => c.trim()) : [],
    tags: p.tags ? p.tags.split(',').map((t: string) => t.trim()) : [],
    techStack: p.techStack || 'HTML, CSS'
  }))
})

// Advanced Filtering & Sorting
const filteredItems = computed(() => {
  let result = [...items.value]

  // Tag Filter
  if (activeTag.value !== 'All') result = result.filter((item: any) => item.categories.some((cat: string) => cat.toLowerCase().includes(activeTag.value.toLowerCase())))

  // Search Filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((item: any) => item.title.toLowerCase().includes(q) || item.techStack.toLowerCase().includes(q))
  }

  // Price Filter
  if (priceFilter.value === 'free') result = result.filter((item: any) => !item.price || item.price <= 0)
  else if (priceFilter.value === 'premium') result = result.filter((item: any) => item.price > 0)

  // Sorting
  if (sortBy.value === 'newest') {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else if (sortBy.value === 'popular') {
    result.sort((a, b) => b.downloads - a.downloads)
  } else if (sortBy.value === 'top_rated') {
    result.sort((a, b) => b.rating - a.rating)
  }

  return result
})

const selectedItem = ref(null)
const isModalOpen = ref(false)

const openModal = (item: any) => { selectedItem.value = item; isModalOpen.value = true }
const subscribe = () => { if(email.value) { addToast('Aramıza hoş geldin! Güncellemeleri mailine göndereceğiz.', 'success'); email.value = '' } }
</script>

<template>
  <div class="bg-[#fafafa] min-h-screen">

    <section class="bg-black text-white pt-40 pb-28 px-5 md:px-8 w-full relative overflow-hidden flex flex-col items-center text-center">
      <div class="absolute inset-0 z-0">
          <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
          <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div class="w-full max-w-5xl relative z-10 flex flex-col items-center">
        <h1 class="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] font-bold tracking-tight mb-6 leading-[1.05] reveal-text">
          The curated library<br/><span class="text-zinc-500 font-light italic">of modern web design.</span>
        </h1>
        <p class="text-zinc-400 text-lg sm:text-xl mb-12 max-w-2xl font-light tracking-wide reveal-text delay-100">
          Elevate your projects with our collection of production-ready components, animations, and layouts. Built for developers who care about the details.
        </p>

        <div class="w-full max-w-2xl flex flex-col sm:flex-row gap-4 items-center reveal-text delay-150">
          <div class="relative w-full">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input v-model="searchQuery" type="text" placeholder="Search React, Vue, Header..." class="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-2xl pl-12 pr-4 py-4 text-white outline-none transition-colors backdrop-blur-md" />
          </div>
          <div class="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 gap-1 shrink-0 backdrop-blur-md">
            <button @click="priceFilter = 'all'" :class="priceFilter === 'all' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all">All</button>
            <button @click="priceFilter = 'free'" :class="priceFilter === 'free' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-white'" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all">Free</button>
            <button @click="priceFilter = 'premium'" :class="priceFilter === 'premium' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white'" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all">Pro</button>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 px-5 md:px-8 py-4 sticky top-[72px] z-40 transition-all shadow-sm">
      <div class="w-full max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        <div class="flex items-center gap-6 overflow-x-auto no-scrollbar w-full md:w-auto">
          <span class="text-[11px] font-mono text-zinc-400 tracking-[0.2em] whitespace-nowrap uppercase font-bold hidden sm:block">Filtered By</span>
          <div class="flex gap-2">
            <button v-for="tag in tags" :key="tag" @click="activeTag = tag" :class="['px-5 py-2 rounded-full text-[12px] font-bold tracking-wide transition-all duration-300 whitespace-nowrap', activeTag === tag ? 'bg-black text-white shadow-md' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600']">
               {{ tag }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0 ml-auto w-full md:w-auto justify-end">
          <span class="text-xs font-semibold text-zinc-400 uppercase tracking-widest hidden lg:block">Sort</span>
          <div class="relative">
             <select v-model="sortBy" class="appearance-none bg-zinc-100 hover:bg-zinc-200 border-none text-zinc-800 text-sm font-bold py-2 pl-4 pr-10 rounded-xl outline-none cursor-pointer transition-colors shadow-sm">
               <option value="newest">Sparkles (Newest)</option>
               <option value="popular">Most Popular</option>
               <option value="top_rated">Top Rated</option>
             </select>
             <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

      </div>
    </section>

    <section class="max-w-[1600px] mx-auto px-5 md:px-8 py-12 md:py-20 min-h-screen">
      <div v-if="pending" class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        <ProductSkeleton v-for="i in 8" :key="i" />
      </div>
      <TransitionGroup v-else name="list" tag="div" class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 relative">
        <ProductCard v-for="(item, index) in filteredItems" :key="item.id" :item="item" @open="openModal" />
      </TransitionGroup>
      <div v-if="!pending && filteredItems.length === 0" class="py-32 text-center">
        <h3 class="text-xl font-bold text-zinc-900 mb-2">No components found</h3>
        <p class="text-zinc-500">Try adjusting your search or filters.</p>
      </div>
    </section>

    <ProductModal :isOpen="isModalOpen" :item="selectedItem" @close="isModalOpen = false" />
  </div>
</template>