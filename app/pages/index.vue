<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '#imports'

useSeoMeta({ title: 'Supply — Premium Web Animations, GSAP & Three.js Components' })

const categories = [
  { label: 'GSAP Animations', icon: '✦', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
  { label: 'Three.js Scenes', icon: '◈', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { label: 'Page Transitions', icon: '⟡', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { label: 'Scroll Effects', icon: '↕', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
  { label: 'UI Components', icon: '◻', color: 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200' },
  { label: 'Hero Sections', icon: '★', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { label: 'Navigation', icon: '≡', color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' },
  { label: 'Cards & Grids', icon: '▦', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
]

const techBadges = ['GSAP', 'Three.js', 'Canvas API', 'CSS Animations', 'Lottie', 'Vue', 'React', 'WebGL', 'Framer Motion']

const tags = ['All', 'Hero', 'Navigation', 'Page Transition', 'Card', 'Interaction']
const activeTag = ref('All')
const searchQuery = ref('')
const priceFilter = ref('all')
const sortBy = ref('newest')
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
  let result = [...items.value]
  if (activeTag.value !== 'All') result = result.filter((item: any) => item.categories.some((cat: string) => cat.toLowerCase().includes(activeTag.value.toLowerCase())))
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((item: any) => item.title.toLowerCase().includes(q) || item.techStack.toLowerCase().includes(q))
  }
  if (priceFilter.value === 'free') result = result.filter((item: any) => !item.price || item.price <= 0)
  else if (priceFilter.value === 'premium') result = result.filter((item: any) => item.price > 0)
  if (sortBy.value === 'newest') result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  else if (sortBy.value === 'popular') result.sort((a, b) => b.downloads - a.downloads)
  else if (sortBy.value === 'top_rated') result.sort((a, b) => b.rating - a.rating)
  return result
})

const selectedItem = ref(null)
const isModalOpen = ref(false)

const openModal = (item: any) => { selectedItem.value = item; isModalOpen.value = true }
const subscribe = () => {
  if (email.value) {
    addToast('Welcome! You\'ll be notified of new drops.', 'success')
    email.value = ''
  }
}
</script>

<template>
  <div class="bg-[#fafafa] min-h-screen">

    <!-- ──────────── HERO ──────────── -->
    <section class="bg-black text-white pt-40 pb-24 px-5 md:px-8 w-full relative overflow-hidden flex flex-col items-center text-center">
      <!-- Ambient blobs -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <div class="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px]"></div>
        <div class="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[120px]"></div>
        <div class="absolute top-[30%] right-[30%] w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-[100px]"></div>
      </div>
      <!-- Grid overlay -->
      <div class="absolute inset-0 z-0 opacity-[0.025]" style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 60px 60px;"></div>

      <div class="w-full max-w-5xl relative z-10 flex flex-col items-center">
        <!-- Eyebrow badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-400 tracking-widest uppercase mb-8">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          Premium Digital Assets for Developers
        </div>

        <h1 class="text-[2.8rem] sm:text-[3.8rem] md:text-[5rem] lg:text-[5.5rem] font-bold tracking-tight mb-6 leading-[1.05]">
          Buy & ship stunning<br/><span class="text-zinc-500 font-light italic">web animations.</span>
        </h1>
        <p class="text-zinc-400 text-lg sm:text-xl mb-10 max-w-2xl font-light tracking-wide">
          Production-ready GSAP, Three.js, CSS effects and complete UI components. Copy, paste, ship.
        </p>

        <!-- Search + filter -->
        <div class="w-full max-w-2xl flex flex-col sm:flex-row gap-3 items-center">
          <div class="relative w-full">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input v-model="searchQuery" type="text" placeholder="Search GSAP, Three.js, Hero, Card..." class="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-zinc-600 outline-none transition-colors backdrop-blur-md text-sm" />
          </div>
          <div class="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 gap-1 shrink-0 backdrop-blur-md">
            <button @click="priceFilter = 'all'" :class="priceFilter === 'all' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all">All</button>
            <button @click="priceFilter = 'free'" :class="priceFilter === 'free' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-white'" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all">Free</button>
            <button @click="priceFilter = 'premium'" :class="priceFilter === 'premium' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white'" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all">Pro</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────── TECH MARQUEE STRIP ──────────── -->
    <div class="bg-black border-t border-white/5 py-4 overflow-hidden">
      <div class="flex gap-6 animate-marquee whitespace-nowrap">
        <span v-for="(badge, i) in [...techBadges, ...techBadges, ...techBadges]" :key="i" class="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 px-4 py-1.5 rounded-full border border-white/10 shrink-0">
          <span class="w-1 h-1 rounded-full bg-zinc-600"></span>{{ badge }}
        </span>
      </div>
    </div>

    <!-- ──────────── CATEGORY STRIP ──────────── -->
    <section class="bg-white border-b border-zinc-200/60 px-5 md:px-8 py-6">
      <div class="max-w-[1600px] mx-auto">
        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.25em] mb-4">Browse by Category</p>
        <div class="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          <button
            v-for="cat in categories"
            :key="cat.label"
            @click="searchQuery = cat.label.split(' ')[0]"
            :class="cat.color"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0"
          >
            <span>{{ cat.icon }}</span> {{ cat.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- ──────────── FILTERS BAR ──────────── -->
    <section class="bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 px-5 md:px-8 py-4 sticky top-[72px] z-40 transition-all shadow-sm">
      <div class="w-full max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        <div class="flex items-center gap-6 overflow-x-auto no-scrollbar w-full md:w-auto">
          <span class="text-[11px] font-mono text-zinc-400 tracking-[0.2em] whitespace-nowrap uppercase font-bold hidden sm:block">Filter</span>
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
               <option value="newest">✦ Newest</option>
               <option value="popular">↑ Most Popular</option>
               <option value="top_rated">★ Top Rated</option>
             </select>
             <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          <span class="text-xs text-zinc-400 font-mono hidden sm:block">{{ filteredItems.length }} assets</span>
        </div>

      </div>
    </section>

    <!-- ──────────── PRODUCTS GRID ──────────── -->
    <section class="max-w-[1600px] mx-auto px-5 md:px-8 py-12 md:py-20 min-h-[60vh]">
      <div v-if="pending" class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        <ProductSkeleton v-for="i in 8" :key="i" />
      </div>
      <TransitionGroup v-else name="list" tag="div" class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 relative">
        <ProductCard v-for="(item) in filteredItems" :key="item.id" :item="item" @open="openModal" />
      </TransitionGroup>
      <div v-if="!pending && filteredItems.length === 0" class="py-32 text-center">
        <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <h3 class="text-xl font-bold text-zinc-900 mb-2">Nothing found</h3>
        <p class="text-zinc-500">Try adjusting your filters or search query.</p>
      </div>
    </section>

    <!-- ──────────── HOW IT WORKS ──────────── -->
    <section class="bg-white border-t border-zinc-200/60 px-5 md:px-8 py-20">
      <div class="max-w-5xl mx-auto text-center">
        <p class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-3">Process</p>
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-black mb-16">Ship faster. Look better.</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div class="flex flex-col gap-4">
            <div class="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-xl font-black">1</div>
            <h3 class="text-lg font-bold text-black">Browse & Preview</h3>
            <p class="text-zinc-500 text-sm leading-relaxed">Watch the animation in action right in the catalogue. Filter by framework, effect type or price.</p>
          </div>
          <div class="flex flex-col gap-4">
            <div class="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl font-black">2</div>
            <h3 class="text-lg font-bold text-black">Purchase Once</h3>
            <p class="text-zinc-500 text-sm leading-relaxed">One-time payment. Get React, Vue, and plain HTML source code instantly. Lifetime access, no subscriptions.</p>
          </div>
          <div class="flex flex-col gap-4">
            <div class="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl font-black">3</div>
            <h3 class="text-lg font-bold text-black">Copy, Paste, Ship</h3>
            <p class="text-zinc-500 text-sm leading-relaxed">Drop the code into your project. Zero configuration needed. Impress your clients in minutes.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────── STATS STRIP ──────────── -->
    <section class="bg-zinc-950 text-white px-5 md:px-8 py-14">
      <div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div class="text-4xl font-black mb-1">{{ items.length || '100' }}+</div>
          <div class="text-zinc-500 text-sm font-medium">Premium Assets</div>
        </div>
        <div>
          <div class="text-4xl font-black mb-1">3</div>
          <div class="text-zinc-500 text-sm font-medium">Frameworks</div>
        </div>
        <div>
          <div class="text-4xl font-black mb-1">∞</div>
          <div class="text-zinc-500 text-sm font-medium">Lifetime Access</div>
        </div>
        <div>
          <div class="text-4xl font-black mb-1">0</div>
          <div class="text-zinc-500 text-sm font-medium">Config Needed</div>
        </div>
      </div>
    </section>

    <!-- ──────────── NEWSLETTER CTA ──────────── -->
    <section class="bg-black text-white px-5 md:px-8 py-24 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 left-1/3 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-[100px]"></div>
      </div>
      <div class="max-w-2xl mx-auto text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-400 tracking-widest uppercase mb-6">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          New drops weekly
        </div>
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight mb-4">Get notified of new animations</h2>
        <p class="text-zinc-400 mb-10 text-lg font-light">We ship new GSAP effects, Three.js scenes, and complete UI components every week.</p>
        <div class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input v-model="email" type="email" placeholder="you@example.com" class="flex-1 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 outline-none transition-colors text-sm" />
          <button @click="subscribe" class="bg-white hover:bg-zinc-100 text-black px-6 py-4 rounded-2xl font-bold text-sm transition-all shrink-0 shadow-xl hover:scale-[1.02] active:scale-[0.98]">
            Notify Me
          </button>
        </div>
        <p class="text-zinc-600 text-xs mt-4">Zero spam. Unsubscribe anytime.</p>
      </div>
    </section>

    <ProductModal :isOpen="isModalOpen" :item="selectedItem" @close="isModalOpen = false" />
  </div>
</template>

<style scoped>
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.33%); }
}
.animate-marquee {
  animation: marquee 20s linear infinite;
}
</style>