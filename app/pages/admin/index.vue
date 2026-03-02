<script setup lang="ts">
import { ref, computed } from 'vue'

useSeoMeta({ title: 'Admin Dashboard' })
const activeAdminTab = ref('analytics') // 'analytics', 'projects', 'users'

const { data: dbProjects, refresh: refreshProjects } = await useFetch('/api/admin/projects')
const { data: dbUsers } = await useFetch('/api/admin/users')
const { data: dbStats } = await useFetch('/api/admin/stats')

const isUploadModalOpen = ref(false)
const isSubmitting = ref(false)
const searchQuery = ref('')

const newProject = ref({ title: '', description: '', videoUrl: '', sourceUrl: '', price: 0, categories: '', tags: '', techStack: '', rating: 5.0, reviewCount: 0, status: 'Active', isPremium: false, sourceCodeReact: '', sourceCodeVue: '', sourceCodeHtml: '' })

const filteredProjects = computed(() => {
  if(!dbProjects.value) return []
  return dbProjects.value.filter((proj: any) => proj.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const handleUpload = async () => {
  isSubmitting.value = true
  try {
    await $fetch('/api/admin/projects', { method: 'POST', body: newProject.value })
    await refreshProjects()
    isUploadModalOpen.value = false
  } catch (error) { alert('Hata oluştu!') } finally { isSubmitting.value = false }
}
</script>

<template>
  <div class="h-screen bg-[#f5f5f7] flex flex-col md:flex-row overflow-hidden font-sans text-zinc-900">

    <aside class="w-64 bg-white border-r border-zinc-200 flex flex-col h-full z-50 shadow-sm">
      <div class="h-16 border-b border-zinc-200 flex items-center px-6 font-black tracking-tight text-xl">inspo<span class="text-indigo-600">.admin</span></div>
      <nav class="p-4 flex flex-col gap-2 mt-4">
        <button @click="activeAdminTab = 'analytics'" :class="activeAdminTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> Platform Analytics</button>
        <button @click="activeAdminTab = 'projects'" :class="activeAdminTab === 'projects' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/></svg> Products Management</button>
        <button @click="activeAdminTab = 'users'" :class="activeAdminTab === 'users' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Users & Creators</button>
      </nav>
      <div class="mt-auto p-4 border-t border-zinc-200">
        <NuxtLink to="/" class="flex items-center gap-2 text-sm font-medium hover:text-black text-zinc-500"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Exit Admin</NuxtLink>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <header class="bg-white border-b border-zinc-200 h-16 flex items-center px-8 justify-between">
        <h2 class="font-bold text-lg capitalize">{{ activeAdminTab }}</h2>
        <input v-if="activeAdminTab === 'projects'" v-model="searchQuery" type="text" placeholder="Search..." class="bg-zinc-100 rounded-full px-4 py-2 text-sm outline-none" />
      </header>

      <div class="p-8 overflow-y-auto flex-1">

        <div v-if="activeAdminTab === 'analytics'" class="space-y-6 animate-in fade-in">
           <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
               <p class="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Platform Revenue</p>
               <h3 class="text-4xl font-black text-emerald-600">${{ dbStats?.totalRevenue?.toFixed(2) || '0.00' }}</h3>
             </div>
             <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
               <p class="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Users</p>
               <h3 class="text-4xl font-black text-black">{{ dbStats?.usersCount || 0 }}</h3>
             </div>
             <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
               <p class="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Pro Subscribers</p>
               <h3 class="text-4xl font-black text-indigo-600">{{ dbStats?.proUsersCount || 0 }}</h3>
             </div>
             <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
               <p class="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Products</p>
               <h3 class="text-4xl font-black text-black">{{ dbStats?.projectsCount || 0 }}</h3>
             </div>
           </div>
        </div>

        <div v-if="activeAdminTab === 'users'" class="animate-in fade-in">
          <div class="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-widest">
                <tr><th class="px-6 py-4">User</th><th class="px-6 py-4">Role</th><th class="px-6 py-4">Plan</th><th class="px-6 py-4">Joined</th></tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-for="u in dbUsers" :key="u.id" class="hover:bg-zinc-50">
                  <td class="px-6 py-4">
                    <p class="font-bold text-black">{{ u.name || 'Anonymous' }}</p>
                    <p class="text-xs text-zinc-500">{{ u.email }}</p>
                  </td>
                  <td class="px-6 py-4"><span :class="u.role==='ADMIN'?'bg-red-100 text-red-700':'bg-zinc-100 text-zinc-600'" class="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider">{{ u.role }}</span></td>
                  <td class="px-6 py-4"><span :class="u.isPro?'bg-indigo-100 text-indigo-700':'bg-zinc-100 text-zinc-600'" class="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider">{{ u.isPro ? 'PRO' : 'FREE' }}</span></td>
                  <td class="px-6 py-4 text-zinc-500 font-mono text-xs">{{ new Date(u.createdAt).toLocaleDateString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeAdminTab === 'projects'" class="animate-in fade-in">
          <div class="flex justify-end mb-6">
            <button @click="isUploadModalOpen = true" class="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Upload Product</button>
          </div>
          <div class="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <table class="w-full text-left text-sm">
              <thead class="bg-zinc-50 border-b border-zinc-200 text-zinc-500"><tr><th class="px-6 py-4">Title</th><th class="px-6 py-4">Tech</th><th class="px-6 py-4">Price</th><th class="px-6 py-4">Sales</th></tr></thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-for="proj in filteredProjects" :key="proj.id" class="hover:bg-zinc-50 cursor-pointer">
                  <td class="px-6 py-4 font-bold text-black">{{ proj.title }}</td>
                  <td class="px-6 py-4 text-xs font-mono text-zinc-500">{{ proj.techStack }}</td>
                  <td class="px-6 py-4 text-emerald-600 font-black">${{ proj.price }}</td>
                  <td class="px-6 py-4 font-mono">{{ proj.downloads }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <div v-if="isUploadModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isUploadModalOpen = false"></div>
      <div class="relative w-full max-w-3xl bg-white rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6">Add New Digital Asset</h2>
        <form @submit.prevent="handleUpload" class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
             <div><label class="text-sm font-bold text-zinc-700 mb-1">Title</label><input v-model="newProject.title" type="text" required class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black" /></div>
             <div><label class="text-sm font-bold text-zinc-700 mb-1">Tech Stack</label><input v-model="newProject.techStack" type="text" placeholder="React, Vue, Tailwind" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black" /></div>
          </div>
          <div><label class="text-sm font-bold text-zinc-700 mb-1">Description</label><textarea v-model="newProject.description" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black"></textarea></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="text-sm font-bold text-zinc-700 mb-1">Video URL</label><input v-model="newProject.videoUrl" type="text" required class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black" /></div>
            <div><label class="text-sm font-bold text-zinc-700 mb-1">Source ZIP URL</label><input v-model="newProject.sourceUrl" type="text" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black" /></div>
          </div>
          <div class="grid grid-cols-4 gap-4">
            <div><label class="text-sm font-bold text-zinc-700 mb-1">Price ($)</label><input v-model="newProject.price" type="number" step="0.01" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black" /></div>
            <div><label class="text-sm font-bold text-zinc-700 mb-1">Categories</label><input v-model="newProject.categories" type="text" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black" /></div>
            <div class="col-span-2 flex items-center gap-4 mt-6">
              <label class="flex items-center gap-2 font-bold text-zinc-700 cursor-pointer">
                <input type="checkbox" v-model="newProject.isPremium" class="w-5 h-5 accent-indigo-600 rounded" />
                Mark as Premium
              </label>
            </div>
          </div>

          <div class="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4">
            <h4 class="font-bold text-black border-b border-zinc-200 pb-2">Multi-Framework Code</h4>
            <div><label class="text-xs font-bold text-zinc-500 uppercase tracking-widest">React</label><textarea v-model="newProject.sourceCodeReact" rows="3" class="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 font-mono text-sm outline-none focus:border-black"></textarea></div>
            <div><label class="text-xs font-bold text-zinc-500 uppercase tracking-widest">Vue</label><textarea v-model="newProject.sourceCodeVue" rows="3" class="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 font-mono text-sm outline-none focus:border-black"></textarea></div>
            <div><label class="text-xs font-bold text-zinc-500 uppercase tracking-widest">HTML</label><textarea v-model="newProject.sourceCodeHtml" rows="3" class="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 font-mono text-sm outline-none focus:border-black"></textarea></div>
          </div>

          <button type="submit" :disabled="isSubmitting" class="w-full bg-black text-white py-4 rounded-xl font-bold mt-2 hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10">{{ isSubmitting ? 'Uploading...' : 'Publish Product' }}</button>
        </form>
      </div>
    </div>
  </div>
</template>