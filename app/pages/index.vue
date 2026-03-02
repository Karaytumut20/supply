<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '#imports'

useSeoMeta({ title: 'Inspo - Premium Web Animations & UI Components' })

const tags = ['All', 'Hero', 'Navigation', 'Page Transition', 'Card', 'Interaction']
const activeTag = ref('All')
const searchQuery = ref('')
const priceFilter = ref('all')
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

const filteredItems = computed(() => {
  let result = items.value
  if (activeTag.value !== 'All') result = result.filter((item: any) => item.categories.some((cat: string) => cat.toLowerCase().includes(activeTag.value.toLowerCase())))
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((item: any) => item.title.toLowerCase().includes(q) || item.techStack.toLowerCase().includes(q))
  }
  if (priceFilter.value === 'free') result = result.filter((item: any) => !item.price || item.price <= 0)
  else if (priceFilter.value === 'premium') result = result.filter((item: any) => item.price > 0)
  return result
})

const selectedItem = ref(null)
const isModalOpen = ref(false)

const openModal = (item: any) => { selectedItem.value = item; isModalOpen.value = true }

const subscribe = () => {
  if(email.value) {
    addToast('Aramıza hoş geldin! Güncellemeleri mailine göndereceğiz.', 'success')
    email.value = ''
  }
}
</script>

<template>
  <div>
    <section class="bg-[#0a0a0a] text-white pt-24 pb-32 px-5 md:px-8 w-full flex flex-col items-center text-center relative overflow-hidden">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none"></div>

      <div class="w-full max-w-4xl relative z-10 flex flex-col items-center">
        <div class="mb-8 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-medium text-indigo-300">
          <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          New components added weekly
        </div>

        <h1 class="text-[3rem] md:text-[5rem] lg:text-[6rem] font-bold tracking-tighter mb-6 leading-[1.05]">
          Ship websites that<br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">feel alive.</span>
        </h1>
        <p class="text-zinc-400 text-lg md:text-xl mb-12 tracking-wide max-w-2xl">
          Premium, production-ready web animations and UI components built with React, Vue, Tailwind, and GSAP.
        </p>

        <div class="w-full max-w-2xl flex flex-col sm:flex-row gap-4 items-center">
          <div class="relative w-full">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input v-model="searchQuery" type="text" placeholder="Search components or tech stack (e.g. React)..." class="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-2xl pl-12 pr-4 py-4 text-white outline-none transition-colors backdrop-blur-md" />
          </div>
          <div class="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 gap-1 shrink-0 backdrop-blur-md">
            <button @click="priceFilter = 'all'" :class="priceFilter === 'all' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all">All</button>
            <button @click="priceFilter = 'free'" :class="priceFilter === 'free' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-white'" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all">Free</button>
            <button @click="priceFilter = 'premium'" :class="priceFilter === 'premium' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white'" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all">Premium</button>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white border-b border-zinc-200 py-8 overflow-hidden flex flex-col items-center">
      <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Built with industry standard tools</p>
      <div class="flex gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        <span class="text-xl font-bold">React</span>
        <span class="text-xl font-bold">Vue.js</span>
        <span class="text-xl font-bold">TailwindCSS</span>
        <span class="text-xl font-bold">Framer Motion</span>
        <span class="text-xl font-bold">GSAP</span>
      </div>
    </section>

    <section class="bg-white/90 backdrop-blur-xl border-b border-zinc-200 px-5 md:px-8 py-4 sticky top-[72px] z-40 shadow-sm">
      <div class="w-full max-w-[1600px] mx-auto flex items-center gap-6 overflow-x-auto no-scrollbar">
        <span class="text-[11px] font-semibold text-zinc-400 tracking-[0.15em] whitespace-nowrap uppercase hidden md:block">Categories</span>
        <div class="flex gap-2.5">
          <button v-for="tag in tags" :key="tag" @click="activeTag = tag" :class="['px-5 py-2 rounded-full text-[12px] font-bold tracking-wide transition-all whitespace-nowrap', activeTag === tag ? 'bg-indigo-600 text-white shadow-md' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600']">{{ tag }}</button>
        </div>
      </div>
    </section>

    <section class="bg-[#fcfcfc] px-5 md:px-8 py-16 min-h-[60vh]">
      <div class="max-w-[1600px] mx-auto w-full">
        <div v-if="pending" class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <ProductSkeleton v-for="i in 8" :key="i" />
        </div>
        <TransitionGroup v-else name="list" tag="div" class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 relative">
          <ProductCard v-for="item in filteredItems" :key="item.id" :item="item" @open="openModal" />
        </TransitionGroup>
        <div v-if="!pending && filteredItems.length === 0" class="w-full py-32 flex flex-col items-center justify-center text-center">
          <div class="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4"><svg class="w-10 h-10 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div>
          <h3 class="text-xl font-bold text-black mb-2">No components found</h3>
          <p class="text-zinc-500">We couldn't find anything matching your criteria.</p>
        </div>
      </div>
    </section>

    <section class="bg-black text-white py-24 px-6 text-center">
      <div class="max-w-2xl mx-auto flex flex-col items-center">
        <div class="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl mb-8 transform rotate-12"></div>
        <h2 class="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Never miss an update</h2>
        <p class="text-zinc-400 text-lg mb-10">Get the latest premium components and freebies delivered straight to your inbox. No spam, ever.</p>
        <form @submit.prevent="subscribe" class="flex w-full max-w-md bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-sm">
          <input v-model="email" type="email" required placeholder="hello@yourdomain.com" class="flex-1 bg-transparent border-none text-white px-4 outline-none placeholder:text-zinc-600" />
          <button type="submit" class="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors">Subscribe</button>
        </form>
      </div>
    </section>

    <ProductModal :isOpen="isModalOpen" :item="selectedItem" @close="isModalOpen = false" />
  </div>
</template>