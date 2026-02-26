<script setup lang="ts">
import { ref, computed } from 'vue'

useSeoMeta({ title: 'Admin Dashboard' })

// UI Durumları
const isSidebarOpen = ref(false)
const isUploadModalOpen = ref(false)
const searchQuery = ref('')
const activeTab = ref('All')

// Yeni Proje Form Durumu
const newProject = ref({
  title: '',
  videoUrl: '',
  categories: '',
  status: 'Active'
})

// İstatistikler
const stats = [
  { label: 'Total Revenue', value: '$12,450', trend: '+14%' },
  { label: 'Active Users', value: '1,284', trend: '+5%' },
  { label: 'Total Projects', value: '42', trend: '+2' }
]

// Dinamik Proje Listesi
const projects = ref([
  { id: 1, title: 'Estrela Transitions', date: 'Oct 24, 2025', sales: 124, status: 'Active' },
  { id: 2, title: 'Sunday Nav', date: 'Oct 20, 2025', sales: 89, status: 'Active' },
  { id: 3, title: 'Nexus UI Kit', date: 'Oct 15, 2025', sales: 210, status: 'Paused' },
  { id: 4, title: 'Verve Agency', date: 'Oct 10, 2025', sales: 34, status: 'Active' }
])

// Arama ve Sekme Filtreleme Mantığı
const filteredProjects = computed(() => {
  return projects.value.filter(proj => {
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesTab = activeTab.value === 'All' || proj.status === activeTab.value
    return matchesSearch && matchesTab
  })
})

// Yeni Proje Ekleme Fonksiyonu
const handleUpload = () => {
  if(!newProject.value.title) return

  projects.value.unshift({
    id: Date.now(),
    title: newProject.value.title,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    sales: 0,
    status: newProject.value.status
  })

  // Formu sıfırla ve modalı kapat
  newProject.value = { title: '', videoUrl: '', categories: '', status: 'Active' }
  isUploadModalOpen.value = false
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
        <button @click="isSidebarOpen = false" class="md:hidden text-zinc-500 hover:text-black">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <nav class="p-4 flex flex-col gap-1 flex-grow">
        <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-3 mt-2">Menu</div>
        <a href="#" class="bg-zinc-100 text-black px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          Dashboard
        </a>
        <a href="#" class="text-zinc-500 hover:bg-zinc-50 hover:text-black px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          Projects
        </a>
        <a href="#" class="text-zinc-500 hover:bg-zinc-50 hover:text-black px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Users
        </a>
        <a href="#" class="text-zinc-500 hover:bg-zinc-50 hover:text-black px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </a>
      </nav>

      <div class="p-4 border-t border-zinc-200">
        <NuxtLink to="/" class="text-zinc-500 hover:text-black text-sm flex items-center gap-3 px-3 py-2 transition-colors font-medium">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Exit Admin
        </NuxtLink>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <header class="bg-white border-b border-zinc-200 h-16 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10">
        <div class="flex items-center gap-4 w-full max-w-md">
          <button @click="isSidebarOpen = true" class="md:hidden text-zinc-500 hover:text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          <div class="relative w-full hidden sm:block">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="searchQuery" type="text" placeholder="Search projects..." class="w-full bg-zinc-100 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow" />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button class="text-zinc-400 hover:text-black transition-colors relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
          </button>
          <div class="w-8 h-8 bg-zinc-800 rounded-full border-2 border-white shadow-sm overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
          </div>
        </div>
      </header>

      <div class="p-4 sm:p-8 overflow-y-auto flex-1">

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 reveal-text">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-black">Dashboard</h2>
            <p class="text-zinc-500 mt-1">Manage your platform, users, and content.</p>
          </div>
          <button @click="isUploadModalOpen = true" class="bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-black/10 active:scale-95 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Project
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div v-for="(stat, index) in stats" :key="stat.label" :class="`reveal-text delay-${(index+1)*50}`" class="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
            <h3 class="text-zinc-500 text-sm font-medium mb-3">{{ stat.label }}</h3>
            <div class="flex items-end justify-between">
              <span class="text-3xl font-bold text-black tracking-tight">{{ stat.value }}</span>
              <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{{ stat.trend }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden reveal-text delay-200 flex flex-col">

          <div class="px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/50 flex items-center gap-6">
            <button @click="activeTab = 'All'" :class="activeTab === 'All' ? 'text-black font-semibold border-black' : 'text-zinc-500 font-medium border-transparent'" class="pb-4 -mb-4 border-b-2 hover:text-black transition-colors">All Projects</button>
            <button @click="activeTab = 'Active'" :class="activeTab === 'Active' ? 'text-black font-semibold border-black' : 'text-zinc-500 font-medium border-transparent'" class="pb-4 -mb-4 border-b-2 hover:text-black transition-colors">Active</button>
            <button @click="activeTab = 'Paused'" :class="activeTab === 'Paused' ? 'text-black font-semibold border-black' : 'text-zinc-500 font-medium border-transparent'" class="pb-4 -mb-4 border-b-2 hover:text-black transition-colors">Paused</button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="text-zinc-500 border-b border-zinc-200 bg-white">
                <tr>
                  <th class="px-6 py-4 font-medium">Project Title</th>
                  <th class="px-6 py-4 font-medium">Date Added</th>
                  <th class="px-6 py-4 font-medium">Bookmarks</th>
                  <th class="px-6 py-4 font-medium">Status</th>
                  <th class="px-6 py-4 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-for="proj in filteredProjects" :key="proj.id" class="hover:bg-zinc-50/80 transition-colors group">
                  <td class="px-6 py-4 font-medium text-black">{{ proj.title }}</td>
                  <td class="px-6 py-4 text-zinc-500">{{ proj.date }}</td>
                  <td class="px-6 py-4 text-zinc-600 font-medium">{{ proj.sales }}</td>
                  <td class="px-6 py-4">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border" :class="proj.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'">
                      {{ proj.status }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button class="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-black transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredProjects.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center text-zinc-500">No projects found.</td>
                </tr>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>

              <h2 class="text-2xl font-bold text-black mb-1">New Project</h2>
              <p class="text-sm text-zinc-500 mb-6">Add a new component to the inspiration library.</p>

              <form @submit.prevent="handleUpload" class="flex flex-col gap-4">
                <div>
                  <label class="block text-sm font-medium text-zinc-700 mb-1.5">Project Title</label>
                  <input v-model="newProject.title" type="text" required placeholder="e.g. Minimalist Navbar" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-zinc-700 mb-1.5">Video URL</label>
                  <input v-model="newProject.videoUrl" type="url" placeholder="https://..." class="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1.5">Tags (Comma separated)</label>
                    <input v-model="newProject.categories" type="text" placeholder="Hero, Navigation" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1.5">Status</label>
                    <select v-model="newProject.status" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl px-4 py-3 text-sm outline-none transition-all appearance-none cursor-pointer">
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                    </select>
                  </div>
                </div>

                <button type="submit" class="w-full bg-black text-white py-3.5 rounded-xl font-medium mt-4 hover:bg-zinc-800 transition-colors">
                  Upload Project
                </button>
              </form>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>
