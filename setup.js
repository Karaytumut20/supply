import fs from 'fs'
import path from 'path'

console.log(
  '📐 Yan boşluklar kaldırılıyor, Inspo.page tam ekran (Full-Width) Grid sistemine geçiliyor...\n'
)

const files = {
  // Sadece ANA SAYFA güncellenecek (Container sınırları kaldırıldı, tam ekran yapıldı)
  'app/pages/index.vue': `<script setup lang="ts">
import { ref, computed } from 'vue'

const tags = ['All', 'Hero', 'Navigation', 'Preloader', 'Page Transition', 'Section Transition', 'Card', 'Footer', 'Button', 'Team']
const activeTag = ref('All')

const LOCAL_VIDEO = '/videos/sample.mp4'

const items = [
  { id: 1, title: 'Estrela', categories: ['Page Transition'], video: LOCAL_VIDEO, tags: ['new'] },
  { id: 2, title: 'Sunday', categories: ['Simple, Text'], video: LOCAL_VIDEO, tags: ['new'] },
  { id: 3, title: 'Estrela', categories: ['List, Social Proof'], video: LOCAL_VIDEO, tags: ['new'] },
  { id: 4, title: 'Nexus Store', categories: ['Navigation', 'Button'], video: LOCAL_VIDEO, tags: [] },
  { id: 5, title: 'Zenith SaaS', categories: ['Preloader', 'Hero'], video: LOCAL_VIDEO, tags: ['new'] },
  { id: 6, title: 'Block Web3', categories: ['Card', 'Section Transition'], video: LOCAL_VIDEO, tags: [] }
]

const filteredItems = computed(() => {
  if (activeTag.value === 'All') return items
  return items.filter(item => item.categories.some(cat => cat.includes(activeTag.value)))
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
            <span class="text-white font-bold">73</span> Joined Today
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
      <TransitionGroup
        name="list"
        tag="div"
        class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 relative"
      >
        <ProductCard v-for="item in filteredItems" :key="item.id" :item="item" @open="openModal" />
      </TransitionGroup>

      <div v-if="filteredItems.length === 0" class="w-full text-center py-24 text-zinc-400 font-medium">
        Bu kategoride henüz video bulunmuyor.
      </div>
    </section>

    <ProductModal :isOpen="isModalOpen" :item="selectedItem" @close="isModalOpen = false" />
  </div>
</template>`
}

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filepath)
  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8')
  console.log(`✅ Güncellendi: ${filepath}`)
}

console.log(
  '\n🔥 Başarılı! Yanlardaki dev boşluklar kaldırıldı, tasarım tam genişlikte (full-width) çalışıyor.'
)
console.log('Projeyi başlatmak için: \x1b[36mnpm run dev\x1b[0m')
