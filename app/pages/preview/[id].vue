<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, computed } from 'vue'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

// Ürün detaylarını çek
const { data: item, pending, error } = await useFetch(`/api/projects/${projectId}`)

// Cihaz Görünümleri
const viewMode = ref<'desktop' | 'tablet' | 'mobile'>('desktop')

const iframeClass = computed(() => {
  switch (viewMode.value) {
    case 'mobile':
      return 'w-[375px] h-[812px] rounded-3xl border-8 border-zinc-800 shadow-2xl transition-all duration-500 mx-auto'
    case 'tablet':
      return 'w-[768px] h-[1024px] rounded-3xl border-8 border-zinc-800 shadow-2xl transition-all duration-500 mx-auto'
    default:
      return 'w-full h-full border-none transition-all duration-500'
  }
})

// Iframe wrapper class for centering
const wrapperClass = computed(() => {
   if (viewMode.value !== 'desktop') {
      return 'p-12 flex items-center justify-center bg-zinc-100 min-h-[calc(100vh-64px)]'
   }
   return 'w-full h-[calc(100vh-64px)]'
})

// Akıllı Geri Dönüş Fonksiyonu
const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 2) {
    router.back()
  } else {
    router.push('/')
  }
}

useSeoMeta({
  title: computed(() => item.value ? `${item.value.title} - Live Preview | Inspo` : 'Loading Preview...'),
})
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-white overflow-hidden">
    <!-- Navbar (Preview Bar) -->
    <header class="h-16 shrink-0 border-b border-zinc-200 bg-white flex items-center justify-between px-4 md:px-6 relative z-10">
      
      <!-- Left: Brand & Title -->
      <div class="flex items-center gap-4">
        <button @click="goBack" class="p-2 -ml-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition-colors flex items-center justify-center" aria-label="Geri Dön">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
        <NuxtLink to="/" class="font-black text-xl tracking-tighter hidden md:block">
          Inspo.
        </NuxtLink>
        <div class="h-6 w-px bg-zinc-200 hidden md:block"></div>
        <span v-if="item" class="font-semibold text-zinc-800 text-sm truncate max-w-[200px] md:max-w-xs">{{ item.title }}</span>
        <div v-else class="w-32 h-4 bg-zinc-200 rounded animate-pulse"></div>
      </div>

      <!-- Center: Device Toggles -->
      <div class="hidden md:flex items-center bg-zinc-100 p-1 rounded-full border border-zinc-200">
        <button 
          @click="viewMode = 'desktop'"
          :class="['px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2', viewMode === 'desktop' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black']"
        >
          <Icon name="lucide:monitor" class="w-4 h-4" />
          <span class="hidden lg:inline">Desktop</span>
        </button>
        <button 
          @click="viewMode = 'tablet'"
          :class="['px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2', viewMode === 'tablet' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black']"
        >
          <Icon name="lucide:tablet" class="w-4 h-4" />
          <span class="hidden lg:inline">Tablet</span>
        </button>
        <button 
          @click="viewMode = 'mobile'"
          :class="['px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2', viewMode === 'mobile' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black']"
        >
          <Icon name="lucide:smartphone" class="w-4 h-4" />
          <span class="hidden lg:inline">Mobile</span>
        </button>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-3">
        <a v-if="item?.demoUrl" :href="item.demoUrl" target="_blank" rel="noopener noreferrer" class="hidden md:flex items-center justify-center gap-1.5 text-zinc-500 hover:text-black px-3 py-2 text-sm font-bold transition-colors">
          <Icon name="lucide:external-link" class="w-4 h-4" /> Yanda Aç
        </a>
        <NuxtLink :to="`/item/${projectId}`" class="bg-black hover:bg-zinc-800 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors active:scale-95 flex items-center gap-2">
          Satın Al
        </NuxtLink>
      </div>
    </header>

    <!-- Content: Iframe Sandbox -->
    <main class="flex-1 bg-zinc-100 overflow-auto flex shadow-inner relative">
      <div v-if="pending" class="absolute inset-0 flex items-center justify-center bg-white z-20">
         <div class="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="error || !item?.demoUrl" class="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
         <Icon name="lucide:monitor-off" class="w-16 h-16 text-zinc-300 mb-4" />
         <h2 class="text-xl font-bold text-black mb-2">Önizleme Bulunamadı</h2>
         <p class="text-zinc-500 max-w-sm text-center">Bu proje için geçerli bir canlı önizleme bağlantısı (Demo URL) bulunmamaktadır.</p>
         <button @click="goBack" class="mt-6 font-bold text-black underline underline-offset-4 decoration-2 decoration-zinc-300 hover:decoration-black transition-colors">Geri Dön</button>
      </div>

      <div v-else :class="wrapperClass">
         <iframe 
           :src="item.demoUrl" 
           :class="iframeClass"
           frameborder="0" 
           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
           allowfullscreen>
         </iframe>
      </div>
    </main>
  </div>
</template>
