<script setup lang="ts">
import { ref, computed } from 'vue'
useSeoMeta({ title: 'Admin Dashboard' })
const isUploadModalOpen = ref(false)
const isSubmitting = ref(false)
const searchQuery = ref('')

const { data: dbProjects, refresh } = await useFetch('/api/admin/projects')

const newProject = ref({ title: '', description: '', videoUrl: '', sourceUrl: '', price: 0, categories: '', tags: '', techStack: '', rating: 5.0, reviewCount: 12, status: 'Active' })

const filteredProjects = computed(() => {
  if(!dbProjects.value) return []
  return dbProjects.value.filter((proj: any) => proj.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const handleUpload = async () => {
  if(!newProject.value.title || !newProject.value.videoUrl) return
  isSubmitting.value = true
  try {
    await $fetch('/api/admin/projects', { method: 'POST', body: newProject.value })
    await refresh()
    newProject.value = { title: '', description: '', videoUrl: '', sourceUrl: '', price: 0, categories: '', tags: '', techStack: '', rating: 5.0, reviewCount: 12, status: 'Active' }
    isUploadModalOpen.value = false
  } catch (error) { alert('Hata oluştu!') } finally { isSubmitting.value = false }
}
</script>

<template>
  <div class="h-screen bg-[#fafafa] flex flex-col md:flex-row overflow-hidden font-sans text-zinc-900">
    <aside class="w-64 bg-white border-r border-zinc-200 flex flex-col h-full z-50">
      <div class="h-16 border-b border-zinc-200 flex items-center px-6 font-bold text-lg">inspo.admin</div>
      <nav class="p-4"><NuxtLink to="/" class="text-sm font-medium hover:text-black text-zinc-500">Exit Admin</NuxtLink></nav>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <header class="bg-white border-b border-zinc-200 h-16 flex items-center px-8"><input v-model="searchQuery" type="text" placeholder="Search..." class="bg-zinc-100 rounded-full px-4 py-2 text-sm outline-none" /></header>
      <div class="p-8 overflow-y-auto flex-1">
        <div class="flex justify-between items-end mb-8">
          <h2 class="text-3xl font-bold">Projects</h2>
          <button @click="isUploadModalOpen = true" class="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium">Add Product</button>
        </div>
        <div class="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <table class="w-full text-left text-sm">
            <thead class="bg-zinc-50 border-b border-zinc-200 text-zinc-500"><tr><th class="px-6 py-4">Title</th><th class="px-6 py-4">Rating</th><th class="px-6 py-4">Price</th><th class="px-6 py-4">Sales</th></tr></thead>
            <tbody class="divide-y divide-zinc-100">
              <tr v-for="proj in filteredProjects" :key="proj.id">
                <td class="px-6 py-4 font-medium">{{ proj.title }}</td>
                <td class="px-6 py-4">⭐ {{ proj.rating }} ({{ proj.reviewCount }})</td>
                <td class="px-6 py-4 text-emerald-600 font-semibold">${{ proj.price }}</td>
                <td class="px-6 py-4 font-mono">{{ proj.downloads }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <div v-if="isUploadModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" @click="isUploadModalOpen = false"></div>
      <div class="relative w-full max-w-2xl bg-white rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">Add Product</h2>
        <form @submit.prevent="handleUpload" class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
             <div><label class="text-sm font-medium">Title</label><input v-model="newProject.title" type="text" required class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3" /></div>
             <div><label class="text-sm font-medium">Tech Stack</label><input v-model="newProject.techStack" type="text" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3" /></div>
          </div>
          <div><label class="text-sm font-medium">Description</label><textarea v-model="newProject.description" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3"></textarea></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="text-sm font-medium">Video URL</label><input v-model="newProject.videoUrl" type="text" required class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3" /></div>
            <div><label class="text-sm font-medium">Source ZIP URL</label><input v-model="newProject.sourceUrl" type="text" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3" /></div>
          </div>
          <div class="grid grid-cols-4 gap-4">
            <div><label class="text-sm font-medium">Price ($)</label><input v-model="newProject.price" type="number" step="0.01" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3" /></div>
            <div><label class="text-sm font-medium">Rating</label><input v-model="newProject.rating" type="number" step="0.1" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3" /></div>
            <div><label class="text-sm font-medium">Reviews</label><input v-model="newProject.reviewCount" type="number" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3" /></div>
            <div><label class="text-sm font-medium">Categories</label><input v-model="newProject.categories" type="text" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3" /></div>
          </div>
          <button type="submit" :disabled="isSubmitting" class="bg-black text-white py-3.5 rounded-xl font-medium mt-2">Publish</button>
        </form>
      </div>
    </div>
  </div>
</template>