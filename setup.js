import fs from 'fs'
import path from 'path'

console.log('🎨 Inspo.page Birebir Tasarım Güncellemesi Başlıyor...\n')

const files = {
  // 1. GLOBAL CSS (Sadeleştirilmiş, beyaz/siyah tema)
  'app/assets/css/main.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-white text-black antialiased selection:bg-blue-500 selection:text-white;
}

/* Scrollbar Gizleme / Özelleştirme */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}`,

  // 2. LAYOUT (Absolute Header - Siyah arka plan üzerine binen menü)
  'app/layouts/default.vue': `<template>
  <div class="min-h-screen bg-white font-sans">
    <header class="absolute top-0 w-full z-50 px-6 py-5 flex items-center justify-end pointer-events-none">
      <div class="flex items-center gap-3 pointer-events-auto text-[13px] font-medium">
        <NuxtLink to="/ticket" class="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-zinc-300 transition-colors px-3 py-1.5 rounded-full flex items-center gap-2">
          Feedback <span class="opacity-50 font-mono text-[10px] border border-zinc-600 rounded-full w-3.5 h-3.5 flex items-center justify-center">?</span>
        </NuxtLink>
        <NuxtLink to="/about" class="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-zinc-300 transition-colors px-3 py-1.5 rounded-full flex items-center gap-2">
          About <span class="text-[9px] bg-zinc-600 text-white px-1.5 py-0.5 rounded uppercase tracking-widest">New</span>
        </NuxtLink>
        <NuxtLink to="/sign-in" class="bg-white hover:bg-zinc-200 text-black transition-colors px-4 py-1.5 rounded-full">
          Sign in
        </NuxtLink>
      </div>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>`,

  // 3. ANA SAYFA (Hero, Popüler Taglar ve Grid Birebir Aynı)
  'app/pages/index.vue': `<script setup lang="ts">
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
</template>`,

  // 4. KART BİLEŞENİ (Görseldeki gibi açık gri dış kutu, sadece resim ve tag. Fiyat/İsim üzerine gelince çıkacak)
  'app/components/Product/Card.vue': `<script setup lang="ts">
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
</template>`,

  // 5. MODAL (Detayların incelenebileceği premium ekran)
  'app/components/Product/Modal.vue': `<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

const props = defineProps<{ isOpen: boolean, item: any }>()
const emit = defineEmits(['close'])
const close = () => emit('close')

watch(() => props.isOpen, (val) => {
  if (typeof document !== 'undefined') document.body.style.overflow = val ? 'hidden' : ''
})

onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">

        <div class="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" @click="close"></div>

        <Transition enter-active-class="transition duration-400 ease-out delay-75" enter-from-class="opacity-0 translate-y-8 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0 scale-100" leave-to-class="opacity-0 translate-y-8 scale-95">
          <div v-if="isOpen" class="relative w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]">

            <button @click="close" class="absolute top-6 right-6 z-20 p-3 bg-black/5 hover:bg-black/10 text-black rounded-full transition-colors backdrop-blur-md">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div class="w-full md:w-2/3 bg-[#f4f4f5] p-6 md:p-8 flex items-center justify-center">
               <div class="w-full h-full rounded-[1.5rem] overflow-hidden shadow-sm border border-zinc-200">
                 <img :src="item?.image" class="w-full h-full object-cover" />
               </div>
            </div>

            <div class="w-full md:w-1/3 p-8 md:p-12 flex flex-col bg-white">
               <div class="flex gap-2 mb-6">
                 <span v-for="tag in item?.tags" :key="tag" class="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase">
                   {{ tag }}
                 </span>
               </div>

               <h2 class="text-4xl font-medium tracking-tight text-black mb-4">{{ item?.title }}</h2>
               <div class="text-2xl font-light text-zinc-500 mb-8">{{ item?.price }}</div>

               <p class="text-zinc-600 leading-relaxed mb-8 text-sm">
                 Detailed inspection of the component. This minimalist and perfectly crafted design mimics the premium quality found on inspo.page, ready for your next big project. Includes seamless animations and responsive layouts.
               </p>

               <div class="mt-auto flex flex-col gap-4">
                 <button class="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10">Purchase Source Code</button>
                 <div class="flex gap-4">
                   <button class="flex-1 bg-zinc-100 text-black py-4 rounded-xl font-medium hover:bg-zinc-200 transition-colors">Live Demo</button>
                   <button class="flex-1 border border-zinc-200 text-black py-4 rounded-xl font-medium hover:bg-zinc-50 transition-colors">Save</button>
                 </div>
               </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>`
}

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filepath)
  // Dosyanın klasörü yoksa oluştur (güvenlik için)
  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  // Dosyayı yaz
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8')
  console.log(`✅ Güncellendi: ${filepath}`)
}

console.log('\n🔥 Başarıyla tamamlandı! Tasarım birebir inspo.page görünümüne güncellendi.')
console.log('Görmek için projeyi tekrar başlatın: \x1b[36mnpm run dev\x1b[0m')
