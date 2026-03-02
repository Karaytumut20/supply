<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const creatorId = route.params.id

const { data: creator, pending, error } = await useFetch(`/api/creator/profile?id=${creatorId}`)

useSeoMeta({
  title: computed(() => creator.value ? `${creator.value.name} - Creator Profile` : 'Creator Profile')
})

const selectedItem = ref(null)
const isModalOpen = ref(false)
const openModal = (item: any) => { selectedItem.value = item; isModalOpen.value = true }
</script>

<template>
  <div class="min-h-screen bg-[#fafafa]">
    <div v-if="pending" class="pt-40 flex justify-center"><div class="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>

    <div v-else-if="error || !creator" class="pt-40 text-center text-zinc-500">
      <h2 class="text-2xl font-bold text-black mb-2">Creator not found</h2>
      <p>This profile doesn't exist or has been removed.</p>
    </div>

    <div v-else>
      <div class="w-full h-[250px] bg-gradient-to-r from-zinc-800 to-black relative">
         <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div class="max-w-[1200px] mx-auto px-6 relative -mt-16 mb-16 flex flex-col md:flex-row items-center md:items-end gap-6">
        <div class="w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center text-4xl font-bold bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-600">
          <img v-if="creator.avatar" :src="creator.avatar" class="w-full h-full object-cover" />
          <span v-else>{{ creator.name?.charAt(0) }}</span>
        </div>
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-3xl font-bold text-black">{{ creator.name }}</h1>
          <p class="text-zinc-500 mt-1 max-w-lg">{{ creator.bio || 'Digital creator crafting premium web components.' }}</p>
        </div>
        <div class="flex gap-4">
          <div class="bg-white px-5 py-3 rounded-2xl shadow-sm border border-zinc-100 text-center">
            <p class="text-xl font-extrabold text-black">{{ creator.createdWorks?.length || 0 }}</p>
            <p class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Components</p>
          </div>
          <div class="bg-white px-5 py-3 rounded-2xl shadow-sm border border-zinc-100 text-center">
            <p class="text-xl font-extrabold text-emerald-600">{{ creator.createdWorks?.reduce((acc, curr) => acc + curr.downloads, 0) || 0 }}</p>
            <p class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Total Sales</p>
          </div>
        </div>
      </div>

      <div class="max-w-[1600px] mx-auto px-6 pb-24">
        <h3 class="text-xl font-bold text-black mb-8 border-b border-zinc-200 pb-4">Works by {{ creator.name }}</h3>

        <div v-if="creator.createdWorks?.length === 0" class="py-20 text-center text-zinc-500 border border-dashed border-zinc-300 rounded-[2rem]">
          This creator hasn't published any items yet.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <ProductCard v-for="item in creator.createdWorks" :key="item.id" :item="item" @open="openModal" />
        </div>
      </div>

      <ProductModal :isOpen="isModalOpen" :item="selectedItem" @close="isModalOpen = false" />
    </div>
  </div>
</template>