<script setup lang="ts">
import { ref, computed } from 'vue'

// ANA SAYFA NAVBAR'INI DEVRE DISI BIRAKIR
definePageMeta({ layout: false })
useSeoMeta({ title: 'Admin Dashboard' })

const { data: user } = await useFetch('/api/auth/me')
// Eger admin degilse ana sayfaya yonlendir
if (user.value?.role !== 'ADMIN') { if(typeof window !== 'undefined') window.location.href = '/' }

const isSidebarOpen = ref(false)
const isUploadModalOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const searchQuery = ref('')
const activeTab = ref('All')
const activeView = ref('Projects')
const newCategoryName = ref('')
const isAddingCategory = ref(false)

const { data: dbProjects, pending: projPending, refresh: refreshProjects } = await useFetch('/api/admin/projects')
const { data: dbCategories, refresh: refreshCategories } = await useFetch('/api/admin/categories')
const { data: dbUsers, refresh: refreshUsers } = await useFetch('/api/admin/users')

const form = ref({ id: '', title: '', videoUrl: '', categories: '', tags: '', status: 'Active', isPremium: false, price: 0, sourceCode: '' })
const formatDate = (dateString: string) => { return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/'
}

// PROJE FILTRELERI VE ISTATISTIKLER
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
  { label: 'Premium Items', value: dbProjects.value?.filter((p:any) => p.isPremium).length || 0, trend: 'Paid' },
  { label: 'Free Items', value: dbProjects.value?.filter((p:any) => !p.isPremium).length || 0, trend: 'Free' }
])

// PROJE ISLEMLERI
const openAddModal = () => {
  form.value = { id: '', title: '', videoUrl: '', categories: '', tags: '', status: 'Active', isPremium: false, price: 0, sourceCode: '' }
  isEditing.value = false
  isUploadModalOpen.value = true
}
const openEditModal = (proj: any) => {
  form.value = { ...proj }
  isEditing.value = true
  isUploadModalOpen.value = true
}
const handleSaveProject = async () => {
  if(!form.value.title || !form.value.videoUrl || !form.value.categories) return;
  isSubmitting.value = true
  try {
    if (isEditing.value) {
      await $fetch(`/api/admin/projects/${form.value.id}`, { method: 'PUT', body: form.value })
    } else {
      await $fetch('/api/admin/projects', { method: 'POST', body: form.value })
    }
    await refreshProjects()
    isUploadModalOpen.value = false
  } catch (error) { alert('Hata olustu!') }
  finally { isSubmitting.value = false }
}
const handleDeleteProject = async (id: string) => {
  if(!confirm('Bu projeyi tamamen silmek istediginize emin misiniz?')) return;
  try {
    await $fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    await refreshProjects()
  } catch(e) { alert('Silinemedi') }
}

// KATEGORI ISLEMLERI
const handleAddCategory = async () => {
  if (!newCategoryName.value) return;
  isAddingCategory.value = true;
  try {
    await $fetch('/api/admin/categories', { method: 'POST', body: { name: newCategoryName.value } })
    newCategoryName.value = ''; await refreshCategories();
  } catch(e) { alert('Hata: Kategori eklenemedi veya zaten var.') }
  finally { isAddingCategory.value = false; }
}
const handleDeleteCategory = async (id: string) => {
  if(!confirm('Bu kategoriyi silmek istediginize emin misiniz?')) return;
  try {
    await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    await refreshCategories();
  } catch(e) { alert('Silinemedi.') }
}

// KULLANICI ISLEMLERI
const changeUserRole = async (id: string, role: string, plan: string) => {
  await $fetch(`/api/admin/users/${id}`, { method: 'PUT', body: { role, plan } })
  await refreshUsers()
}
</script>

<template>
  <div class="h-screen bg-[#fafafa] flex overflow-hidden font-sans text-zinc-900">
    
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"></div>
    
    <aside :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full']" class="w-64 bg-white border-r border-zinc-200 flex flex-col fixed md:relative h-full z-50 transition-transform duration-300 md:translate-x-0">
      <div class="h-16 border-b border-zinc-200 flex justify-between items-center px-6">
        
        <NuxtLink to="/" class="flex gap-1.5 items-center hover:opacity-80 transition-opacity">
          <div class="w-4 h-4 rounded-full bg-[#3b82f6]"></div><div class="w-4 h-4 bg-[#ef4444]" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div><div class="w-4 h-4 bg-[#eab308]"></div>
          <span class="font-bold text-lg ml-2 tracking-tight">inspo<span class="text-zinc-500">.admin</span></span>
        </NuxtLink>
        <button @click="isSidebarOpen = false" class="md:hidden text-zinc-500 hover:text-black"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
      </div>
      <nav class="p-4 flex flex-col gap-2 flex-grow">
        <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-3 mt-2">Menu</div>
        <button @click="activeView = 'Projects'; isSidebarOpen = false" :class="activeView === 'Projects' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'" class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg> Projects
        </button>
        <button @click="activeView = 'Categories'; isSidebarOpen = false" :class="activeView === 'Categories' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'" class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Categories
        </button>
        <button @click="activeView = 'Users'; isSidebarOpen = false" :class="activeView === 'Users' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'" class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Users
        </button>
      </nav>
    </aside>
    <main class="flex-1 flex flex-col h-full overflow-hidden">
      
      <header class="bg-white border-b border-zinc-200 h-16 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10">
        <div class="flex items-center gap-4 w-full max-w-md">
          <button @click="isSidebarOpen = true" class="md:hidden text-zinc-500 hover:text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div class="relative w-full hidden sm:block" v-if="activeView === 'Projects'">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="searchQuery" type="text" placeholder="Search components..." class="w-full bg-zinc-100 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200" />
          </div>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="text-sm font-medium text-zinc-500 hover:text-black transition-colors hidden sm:block">View Live Site</NuxtLink>
          <div class="w-px h-4 bg-zinc-200 hidden sm:block"></div>
          <div class="flex items-center gap-3">
            <div class="flex flex-col text-right hidden sm:flex">
              <span class="text-sm font-bold text-zinc-800 leading-none">{{ user?.name || 'Admin' }}</span>
              <span class="text-[10px] font-semibold text-red-500 tracking-wider">SUPERADMIN</span>
            </div>
            <div class="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shadow-sm">
              {{ user?.name ? user.name.charAt(0).toUpperCase() : 'A' }}
            </div>
            <button @click="handleLogout" title="Logout" class="ml-2 text-zinc-400 hover:text-red-500 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </header>
      <div class="p-4 sm:p-8 overflow-y-auto flex-1">
        
        <div v-if="activeView === 'Projects'">
          <div class="mb-8">
            <h2 class="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Component Store</h2>
            <p class="text-zinc-500 font-medium">Manage your UI components, track sales, and adjust pricing.</p>
          </div>
          
          <!-- SaaS Metrics Overview -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            <div class="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col justify-between relative overflow-hidden group">
              <div class="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div class="flex items-center justify-between mb-4 relative z-10">
                 <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                 </div>
                 <span class="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12l5 5L20 7"/></svg> $+12.5%</span>
              </div>
              <div class="relative z-10">
                <h3 class="text-zinc-500 text-sm font-semibold mb-1">Total Revenue</h3>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-black text-black tracking-tight">$4,250</span>
                  <span class="text-zinc-400 text-xs font-medium">.00</span>
                </div>
              </div>
            </div>
            
            <div v-for="stat in stats" :key="stat.label" class="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:border-zinc-300 transition-colors">
              <div class="flex items-center justify-between mb-4">
                 <div class="w-10 h-10 rounded-full bg-zinc-50 text-zinc-600 flex items-center justify-center">
                   <svg v-if="stat.label.includes('Total')" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                   <svg v-else-if="stat.label.includes('Premium')" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                   <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                 </div>
                 <span class="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">{{ stat.trend }}</span>
              </div>
              <div>
                <h3 class="text-zinc-500 text-sm font-semibold mb-1">{{ stat.label }}</h3>
                <span class="text-3xl font-black text-black tracking-tight">{{ projPending ? '...' : stat.value }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between items-center mb-4">
             <h3 class="text-lg font-bold text-zinc-900">Inventory Management</h3>
             <button @click="openAddModal" class="bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] flex items-center gap-2">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Component
             </button>
          </div>

          <div class="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
            <div class="px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/50 flex items-center gap-6">
              <button @click="activeTab = 'All'" :class="activeTab === 'All' ? 'text-indigo-600 font-bold border-indigo-600' : 'text-zinc-500 font-medium border-transparent'" class="pb-4 -mb-4 border-b-2 hover:text-black transition-colors text-sm">All Items</button>
              <button @click="activeTab = 'Active'" :class="activeTab === 'Active' ? 'text-indigo-600 font-bold border-indigo-600' : 'text-zinc-500 font-medium border-transparent'" class="pb-4 -mb-4 border-b-2 hover:text-black transition-colors text-sm">Active Plugins</button>
              <button @click="activeTab = 'Paused'" :class="activeTab === 'Paused' ? 'text-indigo-600 font-bold border-indigo-600' : 'text-zinc-500 font-medium border-transparent'" class="pb-4 -mb-4 border-b-2 hover:text-black transition-colors text-sm">Archived</button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="text-zinc-400 border-b border-zinc-100 bg-white text-[11px] uppercase tracking-wider"><tr><th class="px-6 py-4 font-semibold">Project Title</th><th class="px-6 py-4 font-semibold">Category Tags</th><th class="px-6 py-4 font-semibold">Access Level</th><th class="px-6 py-4 font-semibold">Price</th><th class="px-6 py-4 font-semibold text-right">Settings</th></tr></thead>
                <tbody class="divide-y divide-zinc-100/80">
                  <tr v-if="projPending"><td colspan="5" class="px-6 py-16 text-center text-zinc-400 font-medium animate-pulse flex items-center justify-center gap-2"><div class="w-4 h-4 border-2 border-zinc-300 border-t-black rounded-full animate-spin"></div>Loading store inventory...</td></tr>
                  <template v-else>
                    <tr v-for="proj in filteredProjects" :key="proj.id" class="hover:bg-zinc-50/50 transition-colors group cursor-default">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                           <div class="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0 relative">
                             <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                           </div>
                           <span class="font-bold text-zinc-900">{{ proj.title }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-zinc-500 font-medium">
                         <div class="flex flex-wrap gap-1">
                            <span v-for="cat in proj.categories.split(',')" :key="cat" class="px-2 py-0.5 rounded border border-zinc-200 bg-white text-[11px] shadow-sm">{{ cat.trim() }}</span>
                         </div>
                      </td>
                      <td class="px-6 py-4">
                         <span v-if="proj.isPremium" class="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm">Premium</span>
                         <span v-else class="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm">Free</span>
                      </td>
                      <td class="px-6 py-4 font-black text-zinc-900"><span v-if="proj.price > 0">${{ proj.price }}<span class="text-xs text-zinc-400 font-medium ml-0.5">.00</span></span><span v-else class="text-zinc-400">0.00</span></td>
                      <td class="px-6 py-4 text-right flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                         <button @click="openEditModal(proj)" class="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 hover:text-black text-xs font-bold transition-all shadow-sm">Configure</button>
                         <button @click="handleDeleteProject(proj.id)" class="px-4 py-2 bg-red-50 border border-red-100 text-red-600 rounded-lg hover:bg-red-500 hover:text-white text-xs font-bold transition-all shadow-sm">Delete</button>
                      </td>
                     </tr>
                    <tr v-if="filteredProjects.length === 0"><td colspan="5" class="px-6 py-16 text-center text-zinc-500 font-medium">No components found matching your criteria.</td></tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div v-else-if="activeView === 'Categories'">
          <div class="mb-8">
            <h2 class="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Tag Taxonomy</h2>
            <p class="text-zinc-500 font-medium">Manage how components are categorized globally.</p>
          </div>
          <div class="bg-white border border-zinc-200/80 rounded-2xl shadow-sm p-6 mb-8 max-w-xl">
            <h3 class="text-sm border-b border-zinc-100 pb-3 font-bold text-zinc-900 mb-4 uppercase tracking-widest">Create New Tag</h3>
            <form @submit.prevent="handleAddCategory" class="flex gap-3">
              <input v-model="newCategoryName" type="text" required placeholder="e.g. Navigation, Auth, Dashboard" class="flex-1 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 text-sm outline-none transition-all font-medium" />
              <button type="submit" :disabled="isAddingCategory" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 min-w-[100px]">Create Tag</button>
            </form>
          </div>
          <div class="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden max-w-xl">
            <table class="w-full text-left text-sm">
              <thead class="text-zinc-400 border-b border-zinc-100 bg-zinc-50/50 text-[11px] uppercase tracking-wider"><tr><th class="px-6 py-4 font-semibold">Category Tag</th><th class="px-6 py-4 font-semibold w-24 text-right">Configure</th></tr></thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-for="cat in dbCategories" :key="cat.id" class="hover:bg-zinc-50/80 transition-colors group">
                  <td class="px-6 py-4 font-bold text-zinc-800 flex items-center gap-2">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-300"><path d="M7 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"/></svg>
                     {{ cat.name }}
                  </td>
                  <td class="px-6 py-4 text-right">
                     <button @click="handleDeleteCategory(cat.id)" class="text-zinc-400 hover:text-red-500 p-2 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                     </button>
                  </td>
                </tr>
                <tr v-if="!dbCategories || dbCategories.length === 0"><td colspan="2" class="px-6 py-12 text-center text-zinc-500 font-medium">No custom categories found.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div v-if="activeView === 'Users'">
           <div class="mb-8">
             <h2 class="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Customer Base</h2>
             <p class="text-zinc-500 font-medium">Manage platform access, users, and subscriptions.</p>
           </div>
           <div class="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
             <table class="w-full text-left text-sm whitespace-nowrap">
               <thead class="text-zinc-400 border-b border-zinc-100 bg-zinc-50/50 text-[11px] uppercase tracking-wider"><tr><th class="px-6 py-4 font-semibold">Account Email</th><th class="px-6 py-4 font-semibold">System Role</th><th class="px-6 py-4 font-semibold">Subscription Tier</th><th class="px-6 py-4 font-semibold text-right">Access Controls</th></tr></thead>
               <tbody class="divide-y divide-zinc-100">
                 <tr v-for="u in dbUsers" :key="u.id" class="hover:bg-zinc-50/80 transition-colors">
                   <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-600 border border-white shadow-sm ring-1 ring-zinc-100">{{ u.email.charAt(0).toUpperCase() }}</div>
                        <span class="font-bold text-zinc-900">{{ u.email }}</span>
                      </div>
                   </td>
                   <td class="px-6 py-4">
                      <span v-if="u.role === 'ADMIN'" class="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-sm">SysAdmin</span>
                      <span v-else class="bg-zinc-100 text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm">Member</span>
                   </td>
                   <td class="px-6 py-4">
                      <span v-if="u.plan === 'PRO'" class="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm">Pro Sub</span>
                      <span v-else class="bg-zinc-100 text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm">Free Trial</span>
                   </td>
                   <td class="px-6 py-4 flex flex-wrap justify-end gap-2 text-right">
                     <button v-if="u.role === 'USER'" @click="changeUserRole(u.id, 'ADMIN', u.plan)" class="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm">Make Admin</button>
                     <button v-if="u.role === 'ADMIN'" @click="changeUserRole(u.id, 'USER', u.plan)" class="bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-600 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm">Revoke Admin</button>
                     <div class="w-px h-6 bg-zinc-200 mx-1 self-center"></div>
                     <button v-if="u.plan === 'FREE'" @click="changeUserRole(u.id, u.role, 'PRO')" class="bg-amber-400 hover:bg-amber-500 text-amber-950 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition">Upgrade to PRO</button>
                     <button v-if="u.plan === 'PRO'" @click="changeUserRole(u.id, u.role, 'FREE')" class="bg-white border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm">Cancel PRO</button>
                   </td>
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
            <div v-if="isUploadModalOpen" class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border border-zinc-200 overflow-y-auto max-h-[90vh]">
              <button @click="isUploadModalOpen = false" class="absolute top-6 right-6 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-600 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <h2 class="text-2xl font-bold text-black mb-1">{{ isEditing ? 'Edit Component' : 'Add New Component' }}</h2>
              <form @submit.prevent="handleSaveProject" class="flex flex-col gap-4 mt-6">
                <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">Title</label><input v-model="form.title" type="text" required class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm outline-none" /></div>
                <div class="grid grid-cols-2 gap-4">
                  <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">Video URL (.mp4)</label><input v-model="form.videoUrl" type="url" required class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm outline-none" /></div>
                  <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1.5">Category</label>
                    <select v-model="form.categories" required class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm outline-none appearance-none cursor-pointer">
                      <option value="" disabled selected>Select Category</option>
                      <option v-for="cat in dbCategories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-zinc-700 mb-1.5">Type</label>
                    <div class="flex items-center h-[46px] px-4 bg-zinc-50 border border-zinc-200 rounded-xl gap-2">
                       <input type="checkbox" v-model="form.isPremium" class="w-4 h-4 cursor-pointer" id="premium_check" />
                       <label for="premium_check" class="text-sm font-medium cursor-pointer">Is Premium?</label>
                    </div>
                  </div>
                  <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">Price ($)</label><input v-model="form.price" type="number" min="0" :disabled="!form.isPremium" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm outline-none disabled:opacity-50" /></div>
                  <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">Status</label><select v-model="form.status" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm outline-none appearance-none cursor-pointer"><option value="Active">Active</option><option value="Paused">Paused</option></select></div>
                </div>
                <div><label class="block text-sm font-medium text-zinc-700 mb-1.5">Source Code (HTML/CSS/JS/VUE)</label><textarea v-model="form.sourceCode" rows="6" class="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl px-4 py-3 text-sm font-mono outline-none resize-none" placeholder="Paste your code here..."></textarea></div>
                <button type="submit" :disabled="isSubmitting" class="w-full bg-black text-white py-3.5 rounded-xl font-medium mt-2 hover:bg-zinc-800 disabled:opacity-50">
                  {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Component' : 'Save Component') }}
                </button>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>