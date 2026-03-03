<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Products Management - Admin' })

const { data: dbProjects, refresh: refreshProjects } = await useFetch('/api/admin/projects')
const { data: dbCategories } = await useFetch('/api/admin/categories')

const isUploadModalOpen = ref(false)
const isSubmitting = ref(false)
const searchQuery = ref('')
const newProject = ref({ title: '', description: '', videoUrl: '', sourceUrl: '', demoUrl: '', dependencies: '', price: 0, categories: '', tags: '', techStack: '', rating: 5.0, reviewCount: 0, status: 'Active', isPremium: false, sourceCodeReact: '', sourceCodeVue: '', sourceCodeHtml: '', fileUrl: '' })
const selectedFile = ref<File | null>(null)

const filteredProjects = computed(() => {
  if(!dbProjects.value) return []
  return dbProjects.value.filter((proj: any) => proj.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const handleUpload = async () => {
  isSubmitting.value = true
  try {
    // 1. Dosya Yükleme (varsa)
    if (selectedFile.value) {
      const formData = new FormData()
      formData.append('file', selectedFile.value)

      const uploadRes: any = await $fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      
      if (uploadRes?.url) {
        newProject.value.fileUrl = uploadRes.url
      }
    }

    // 2. Projeyi Veritabanına Ekleme
    await $fetch('/api/admin/projects', { method: 'POST', body: newProject.value })
    await refreshProjects()
    isUploadModalOpen.value = false
    newProject.value = { title: '', description: '', videoUrl: '', sourceUrl: '', demoUrl: '', dependencies: '', price: 0, categories: '', tags: '', techStack: '', rating: 5.0, reviewCount: 0, status: 'Active', isPremium: false, sourceCodeReact: '', sourceCodeVue: '', sourceCodeHtml: '', fileUrl: '' }
    selectedFile.value = null
  } catch (error: any) { 
    alert('Hata oluştu: ' + (error?.data?.statusMessage || error.message)) 
  } finally { 
    isSubmitting.value = false 
  }
}
</script>

<template>
  <div class="animate-in fade-in">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <input v-model="searchQuery" type="text" placeholder="Search product..." class="bg-zinc-100 focus:bg-zinc-200 transition-colors rounded-full px-5 py-2.5 text-sm outline-none w-full sm:w-64 border border-transparent focus:border-zinc-300" />
      <button @click="isUploadModalOpen = true" class="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Upload Product</button>
    </div>
    
    <div class="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-x-auto">
      <table class="w-full text-left text-sm whitespace-nowrap">
        <thead class="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-widest text-xs">
          <tr><th class="px-6 py-4 font-semibold">Title</th><th class="px-6 py-4 font-semibold">Tech</th><th class="px-6 py-4 font-semibold">Price</th><th class="px-6 py-4 font-semibold">Sales</th></tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="proj in filteredProjects" :key="proj.id" class="hover:bg-zinc-50 cursor-pointer transition-colors">
            <td class="px-6 py-4 font-bold text-black">{{ proj.title }}</td>
            <td class="px-6 py-4 text-xs font-mono text-zinc-500">{{ proj.techStack }}</td>
            <td class="px-6 py-4 text-emerald-600 font-black">${{ proj.price }}</td>
            <td class="px-6 py-4 font-mono">{{ proj.downloads }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredProjects.length === 0" class="py-12 text-center text-zinc-500 text-sm">
        No products found.
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isUploadModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isUploadModalOpen = false"></div>
        <div class="relative w-full max-w-lg bg-white rounded-[2rem] p-7 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col">

          <button @click="isUploadModalOpen = false" type="button" class="absolute top-6 right-6 p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-black rounded-full transition-colors focus:outline-none z-10 active:scale-95">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          <h2 class="text-2xl font-bold mb-6 text-black tracking-tight pr-10">Upload Product</h2>

          <form @submit.prevent="handleUpload" class="flex flex-col gap-3.5 relative z-0">
            <div class="grid grid-cols-2 gap-3.5">
               <div><label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Title</label><input v-model="newProject.title" type="text" required class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors" /></div>
               <div><label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Tech Stack</label><input v-model="newProject.techStack" type="text" placeholder="React, Vue..." class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors" /></div>
            </div>

            <div><label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Description</label><textarea v-model="newProject.description" rows="2" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors resize-none"></textarea></div>

            <div class="grid grid-cols-2 gap-3.5">
              <div><label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Video URL</label><input v-model="newProject.videoUrl" type="text" required class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors" /></div>
              <div><label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Demo URL</label><input v-model="newProject.demoUrl" type="url" placeholder="https://..." class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors" /></div>
              <div><label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Dependencies</label><input v-model="newProject.dependencies" type="text" placeholder="npm i..." class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors" /></div>
              <div><label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Source URL</label><input v-model="newProject.sourceUrl" type="text" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors" /></div>
            </div>

            <div class="grid grid-cols-3 gap-3.5 items-end">
              <div><label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Price ($)</label><input v-model="newProject.price" type="number" step="0.01" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors" /></div>
              <div class="col-span-2"><label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Categories</label><select v-model="newProject.categories" required class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-colors"><option value="" disabled>Select Category...</option><option v-for="cat in dbCategories" :key="cat.id" :value="cat.name">{{ cat.name }}</option></select></div>
            </div>

            <div class="flex items-center justify-between bg-zinc-50 border border-zinc-200 px-4 py-3.5 rounded-xl mt-1">
              <div>
                <span class="text-sm font-bold text-black block leading-none">Premium Item</span>
                <span class="text-[10px] text-zinc-500 font-medium mt-1.5 block">Require PRO or Purchase</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="newProject.isPremium" class="sr-only peer">
                <div class="w-10 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            <div class="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2.5 mt-1 cursor-pointer hover:bg-zinc-100 transition-colors">
               <h4 class="font-bold text-black border-b border-zinc-200 pb-2 text-xs tracking-tight flex items-center justify-between"><span>Upload File</span> <span class="text-zinc-400 font-normal">Optional</span></h4>
               <div>
                  <input type="file" @change="handleFileSelect" accept=".zip,.rar,.tar,.js,.ts,.vue,.jsx,.tsx" class="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-200 file:text-black hover:file:bg-zinc-300 transition-all cursor-pointer outline-none" />
                  <p class="text-[10px] text-zinc-400 mt-2">Support: ZIP, RAR, JS, VUE, etc. Uploaded files will be available for download.</p>
               </div>
            </div>

            <div class="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2.5 mt-1">
              <h4 class="font-bold text-black border-b border-zinc-200 pb-2 text-xs tracking-tight">Source Codes</h4>
              <div><label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">React</label><textarea v-model="newProject.sourceCodeReact" rows="1" class="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 font-mono text-[11px] outline-none focus:border-black transition-colors custom-scrollbar resize-none"></textarea></div>
              <div><label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Vue</label><textarea v-model="newProject.sourceCodeVue" rows="1" class="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 font-mono text-[11px] outline-none focus:border-black transition-colors custom-scrollbar resize-none"></textarea></div>
              <div><label class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">HTML</label><textarea v-model="newProject.sourceCodeHtml" rows="1" class="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 font-mono text-[11px] outline-none focus:border-black transition-colors custom-scrollbar resize-none"></textarea></div>
            </div>

            <button type="submit" :disabled="isSubmitting" class="w-full bg-black text-white h-[52px] rounded-xl font-bold mt-2 hover:bg-zinc-800 transition-colors shadow-lg active:scale-[0.98] text-sm">{{ isSubmitting ? 'Uploading...' : 'Publish Product' }}</button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
