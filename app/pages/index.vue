<script setup lang="ts">
import { ref } from 'vue'

const tags = ['Hero', 'Navigation', 'Preloader', 'Page Transition', 'Section Transition', 'Card', 'Footer', 'Button', 'Team']

const items = [
  { id: 1, title: 'Nova Dashboard', price: '$49', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop', tags: ['new'] },
  { id: 2, title: 'Aura Portfolio', price: '$29', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop', tags: ['new'] },
  { id: 3, title: 'Nexus Store', price: '$99', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop', tags: ['new'] },
  { id: 4, title: 'Verve Agency', price: '$59', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop', tags: ['hot'] },
  { id: 5, title: 'Zenith SaaS', price: '$79', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop', tags: ['offer'] },
  { id: 6, title: 'Block Web3', price: '$89', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop', tags: ['new'] }
]

const selectedItem = ref(null)
const isModalOpen = ref(false)

const openModal = (item: any) => {
  selectedItem.value = item
  isModalOpen.value = true
}
</script>

<template>
  <div>
    <section class="bg-[#0a0a0a] text-white pt-36 pb-24 px-6 md:px-12 w-full">
      <div class="max-w-[1600px] mx-auto flex flex-col items-start">

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
            <span class="text-white font-bold">73</span> Joined Today
          </div>
        </div>

      </div>
    </section>

    <section class="bg-white border-b border-zinc-200 px-6 md:px-12 py-5 sticky top-0 z-40">
      <div class="max-w-[1600px] mx-auto flex items-center gap-8 overflow-x-auto no-scrollbar">
        <span class="text-[10px] font-mono text-zinc-400 tracking-[0.15em] whitespace-nowrap uppercase">Popular Tags</span>
        <div class="flex gap-2.5">
          <button v-for="tag in tags" :key="tag" class="bg-[#f4f4f5] hover:bg-[#e4e4e7] text-zinc-700 px-4 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase transition-colors whitespace-nowrap">
            {{ tag }}
          </button>
        </div>
      </div>
    </section>

    <section class="bg-white px-6 md:px-12 py-10 min-h-screen">
      <div class="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProductCard v-for="item in items" :key="item.id" :item="item" @open="openModal" />
      </div>
    </section>

    <ProductModal :isOpen="isModalOpen" :item="selectedItem" @close="isModalOpen = false" />
  </div>
</template>
