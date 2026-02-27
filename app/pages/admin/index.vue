<script setup lang="ts">
import { ref, computed } from 'vue'

useSeoMeta({ title: 'Admin Dashboard' })

const isSidebarOpen = ref(false)
const isUploadModalOpen = ref(false)
const isSubmitting = ref(false)
const searchQuery = ref('')
const activeTab = ref('All')

// VERİTABANINDAN PROJELERİ ÇEK (Gerçek API Bağlantısı)
const { data: dbProjects, pending, refresh } = await useFetch('/api/admin/projects')

const newProject = ref({ title: '', videoUrl: '', categories: '', tags: '', status: 'Active' })

// Tarih Formatlayıcı
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const filteredProjects = computed(() => {
  if(!dbProjects.value) return []
  return dbProjects.value.filter((proj: any) => {
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesTab = activeTab.value === 'All' || proj.status === activeTab.value
    return matchesSearch && matchesTab
  })
})

const stats = computed(() => [
  { label: 'Total Projects', value: dbProjects.value?.length || 0, trend: 'All Time' },
  { label: 'Active Projects', value: dbProjects.value?.filter((p:any) => p.status === 'Active').length || 0, trend: 'Live' },
  { label: 'Paused Projects', value: dbProjects.value?.filter((p:any) => p.status === 'Paused').length || 0, trend: 'Hidden' }
])

// VERİTABANINA YENİ PROJE EKLE
const handleUpload = async () => {
  if(!newProject.value.title || !newProject.value.videoUrl) return
  isSubmitting.value = true

  try {
    await $fetch('/api/admin/projects', {
      method: 'POST',
      body: newProject.value
    })

    await refresh() // Listeyi veritabanından anında yenile

    // Formu sıfırla
    newProject.value = { title: '', videoUrl: '', categories: '', tags: '', status: 'Active' }
    isUploadModalOpen.value = false
  } catch (error) {
    alert('Proje eklenirken bir hata oluştu!')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="h-screen bg-[#fafafa] flex overflow-hidden font-sans text-zinc-900">

    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"></div>

    <aside :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full']" class="w-64 bg-white border-r border-zinc-200 flex flex-col fixed md:relative h-full z-50 transition-transform duration-300 md:translate-x-0">
      <div class="h-16 border-b border-zinc-200 flex justify-between items-center px-6">
        <div class="flex gap-1.5 items-center">
          <div class="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
          <div class="w-4 h-4 bg-[#ef4444]" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
          <div class="w-4 h-4 bg-[#eab308]"></div>
          <span class="font-bold text-lg ml-2 tracking-tight">inspo<span class="text-zinc-500">.admin</span></span>
        </div>
      </div>

      <nav class="p-4 flex flex-col gap-1 flex-grow">
        <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-3 mt-2">Menu</div>
        <a href="#" class="bg-zinc-100 text-black px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          Projects Database
        </a>
      </nav>

      <div class="p-4 border-t border-zinc-200">
        <NuxtLink to="/" class="text-zinc-500 hover:text-black text-sm flex items-center gap-3 px-3 py-2 transition-colors font-medium">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Exit Admin
        </NuxtLink>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <header class="bg-white border-b border-zinc-200 h-16 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10">
        <div class="flex items-center gap-4 w-full max-w-md">
          <button @click="isSidebarOpen = true" class="md:hidden text-zinc-500 hover:text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div class="relative w-full hidden sm:block">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="searchQuery" type="text" placeholder="Search in database..." class="w-full bg-zinc-100 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200" />
          </div>
        </div>
      </header>

      <div class="p-4 sm:p-8 overflow-y-auto flex-1">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-black">Projects Database</h2>
            <p class="text-zinc-500 mt-1">Manage content live from PostgreSQL.</p>
          </div>
          <button @click="isUploadModalOpen = true" class="bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New to DB
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
            <h3 class="text-zinc-500 text-sm font-medium mb-3">{{ stat.label }}</h3>
            <div class="flex items-end justify-between">
              <span class="text-3xl font-bold text-black tracking-tight">{{ pending ? '...' : stat.value }}</span>
              <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{{ stat.trend }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/50 flex items-center gap-6">
            <button @click="activeTab = 'All'" :class="activeTab === 'All' ? 'text-black font-semibold border-black' : 'text-zinc-500 font-medium border-transparent'" class="pb-4 -mb-4 border-b-2 hover:text-black transition-colors">All</button>
            <button @click="activeTab = 'Active'" :class="activeTab === 'Active' ? 'text-black font-semibold border-black' : 'text-zinc-500 font-medium border-transparent'" class="pb-4 -mb-4 border-b-2 hover:text-black transition-colors">Active</button>
            <button @click="activeTab = 'Paused'" :class="activeTab === 'Paused' ? 'text-black font-semibold border-black' : 'text-zinc-500 font-medium border-transparent'" class="pb-4 -mb-4 border-b-2 hover:text-black transition-colors">Paused</button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="text-zinc-500 border-b border-zinc-200 bg-white">
                <tr>
                  <th class="px-6 py-4 font-medium">Project Title</th>
                  <th class="px-6 py-4 font-medium">Categories</th>
                  <th class="px-6 py-4 font-medium">Date Added</th>
                  <th class="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-if="pending">
                   <td colspan="4" class="px-6 py-12 text-center text-zinc-500 animate-pulse">Fetching from database...</td>
                </tr>
                <template v-else>
                  <tr v-for="proj in filteredProjects" :key="proj.id" class="hover:bg-zinc-50/80 transition-colors">
                    <td class="px-6 py-4 font-medium text-black">{{ proj.title }}</td>
                    <td class="px-6 py-4 text-zinc-500">{{ proj.categories }}</td>
                    <td class="px-6 py-4 text-zinc-500">{{ formatDate(proj.createdAt) }}</td>
                    <td class="px-6 py-4">
                      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border" :class="proj.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'">
                        {{ proj.status }}
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredProjects.length === 0">
                    <td colspan="4" class="px-6 py-12 text-center text-zinc-500">No projects found in Database.</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="isUploadModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" @click="isUploadModalOpen = false"></div>

          <Transition enter-active-class="transition duration-300 ease-out delay-75" enter-from-class="opacity-0 translate-y-8 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0 scale-100" leave-to-class="opacity-0 translate-y-8 scale-95">
            <div v-if="isUploadModalOpen" class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 border border-zinc-200">
              <button @click="isUploadModalOpen = false" class="absolute top-6 right-6 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-600 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>

              <h2 class="text-2xl font-bold text-black mb-1">Push to Database</h2>
              <form @submit.prevent="handleUpload" class="flex flex-col gap-4 mt-6">
                <div>
                  <label class="block text-sm font-medium text-zinc-700 mb-1.5">Title</label>
                  <input v-model="newProject.title" type="text" required class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-zinc-700 mb-1.5">Video URL (.mp4)</label>
                  <input v-model="newProject.videoUrl" type="url" required placeholder="/videos/sample.mp4 veya https://..." class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1.5">Categories</label>
                    <input v-model="newProject.categories" type="text" placeholder="Hero, Button" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm outline-none" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1.5">Status</label>
                    <select v-model="newProject.status" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm outline-none">
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                    </select>
                  </div>
                </div>
                <button type="submit" :disabled="isSubmitting" class="w-full bg-black text-white py-3.5 rounded-xl font-medium mt-4 hover:bg-zinc-800 disabled:opacity-50">
                  {{ isSubmitting ? 'Saving to DB...' : 'Save Project' }}
                </button>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
