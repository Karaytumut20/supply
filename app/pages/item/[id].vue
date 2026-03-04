<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

// Ürün detaylarını çek
const { data: item, pending, error } = await useFetch(`/api/projects/${projectId}`)

// SEO Meta Tagları (Google ve Sosyal Medya Paylaşımları İçin)
useSeoMeta({
  title: computed(() => item.value ? `${item.value.title} - Inspo` : 'Loading...'),
  description: computed(() => item.value?.description || 'Premium UI component for web developers.'),
  ogTitle: computed(() => item.value ? `${item.value.title} - Inspo` : ''),
  ogDescription: computed(() => item.value?.description),
  twitterCard: 'summary_large_image',
})

// Akıllı Geri Dönüş Fonksiyonu
const goBack = () => {
  // Eğer kullanıcı Dashboard'dan geldiyse veya site içi gezindiyse geriye at
  // Eğer linke direkt tıklayıp geldiyse (history yoksa) anasayfaya at
  if (typeof window !== 'undefined' && window.history.length > 2) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#fafafa] pt-24 pb-12 px-5 md:px-8">
    <div v-if="pending" class="flex justify-center py-32">
      <div class="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error || !item" class="text-center py-32 text-zinc-500">
      <h2 class="text-2xl font-bold text-black mb-2">Item Not Found</h2>
      <p>The component you are looking for does not exist or has been removed.</p>
      <NuxtLink to="/" class="mt-6 inline-block bg-black text-white px-6 py-3 rounded-xl font-medium">Return Home</NuxtLink>
    </div>

    <div v-else class="max-w-[1400px] mx-auto relative">
       <button @click="goBack" class="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black transition-colors mb-6 cursor-pointer">
         <Icon name="lucide:arrow-left" class="w-4 h-4" /> Geri Dön
       </button>

       <div class="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-zinc-200">
         <ProductModal :isOpen="true" :item="item" @close="goBack" />
       </div>
    </div>
  </div>
</template>