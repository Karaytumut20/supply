<script setup lang="ts">
import { ref, computed } from 'vue'

useSeoMeta({ title: 'Admin Dashboard' })

const { data: user } = await useFetch('/api/auth/me')

// Eğer kullanıcı yoksa veya rolü ADMIN değilse anasayfaya fırlat
if (!user.value || user.value.role !== 'ADMIN') {
  await navigateTo('/')
}

const activeAdminTab = ref('analytics') // 'analytics', 'projects', 'users'

const { data: dbProjects, refresh: refreshProjects } = await useFetch('/api/admin/projects')
const { data: dbUsers, refresh: refreshUsers } = await useFetch('/api/admin/users')
const { data: dbCategories, refresh: refreshCategories } = await useFetch('/api/admin/categories')
const { data: dbStats } = await useFetch('/api/admin/stats')

const isUploadModalOpen = ref(false)
const isMobileMenuOpen = ref(false)
const isSubmitting = ref(false)
const searchQuery = ref('')

const newProject = ref({ title: '', description: '', videoUrl: '', sourceUrl: '', demoUrl: '', dependencies: '', price: 0, categories: '', tags: '', techStack: '', rating: 5.0, reviewCount: 0, status: 'Active', isPremium: false, sourceCodeReact: '', sourceCodeVue: '', sourceCodeHtml: '' })

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

// --- USER MANAGEMENT ---
const isUserModalOpen = ref(false)
const editingUser = ref<any>(null)
const userForm = ref({ name: '', email: '', password: '', role: 'USER', plan: 'FREE', isBanned: false, planSource: 'UNKNOWN' })
const isSubmittingUser = ref(false)
const newCategoryName = ref('');
const addCategory = async () => { if(!newCategoryName.value) return; try { await $fetch('/api/admin/categories', { method: 'POST', body: { name: newCategoryName.value } }); newCategoryName.value = ''; await refreshCategories(); } catch(e) { alert('Hata veya kategori zaten var!'); } };
const deleteCategory = async (id: string) => { if(confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) { await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' }); await refreshCategories(); } }

const openUserModal = (u: any = null) => {
  if (u) {
    editingUser.value = u
    userForm.value = { name: u.name||'', email: u.email, password: '', role: u.role, plan: u.plan, isBanned: !!u.isBanned, planSource: u.planSource || 'UNKNOWN' }
  } else {
    editingUser.value = null
    userForm.value = { name: '', email: '', password: '', role: 'USER', plan: 'FREE', isBanned: false, planSource: 'UNKNOWN' }
  }
  isUserModalOpen.value = true
}

const saveUser = async () => {
  isSubmittingUser.value = true
  try {
    if (editingUser.value) {
      await $fetch(`/api/admin/users/${editingUser.value.id}`, { method: 'PUT', body: userForm.value })
    } else {
      await $fetch('/api/admin/users', { method: 'POST', body: userForm.value })
    }
    await refreshUsers()
    isUserModalOpen.value = false
  } catch (e: any) { alert(e.data?.statusMessage || 'İşlem başarısız') }
  finally { isSubmittingUser.value = false }
}

const deleteUser = async (id: string) => {
  if (!confirm('Kullanıcı sistemden kalıcı olarak SİLİNECEK. Devam edilsin mi?')) return
  try { await $fetch(`/api/admin/users/${id}`, { method: 'DELETE' }); await refreshUsers() }
  catch (e) { alert('Silme işlemi başarısız.') }
}

const toggleBanUser = async (u: any) => {
  try { await $fetch(`/api/admin/users/${u.id}`, { method: 'PUT', body: { ...u, isBanned: !u.isBanned } }); await refreshUsers() }
  catch (e) { alert('Ban işlemi başarısız.') }
}

</script>

<template>
  <div class="h-screen bg-[#f5f5f7] flex flex-col md:flex-row overflow-x-auto font-sans text-zinc-900">

    <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"></div>

    <aside :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'" class="fixed md:static top-0 left-0 w-64 bg-white border-r border-zinc-200 flex flex-col h-full z-50 shadow-2xl md:shadow-sm transition-transform duration-300 ease-in-out">
      <div class="h-16 border-b border-zinc-200 flex items-center justify-between px-6 font-black tracking-tight text-xl shrink-0">
        <span>inspo<span class="text-indigo-600">.admin</span></span>
        <button @click="isMobileMenuOpen = false" class="md:hidden p-2 -mr-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <nav class="p-4 flex flex-col gap-2 mt-2 overflow-y-auto">
        <button @click="activeAdminTab = 'analytics'; isMobileMenuOpen = false" :class="activeAdminTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-3 md:py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> Platform Analytics</button>
        <button @click="activeAdminTab = 'projects'; isMobileMenuOpen = false" :class="activeAdminTab === 'projects' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-3 md:py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/></svg> Products Management</button>
        <button @click="activeAdminTab = 'categories'; isMobileMenuOpen = false" :class="activeAdminTab === 'categories' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-3 md:py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg> Categories</button>
        <button @click="activeAdminTab = 'users'; isMobileMenuOpen = false" :class="activeAdminTab === 'users' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-3 md:py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Users & Creators</button>
      </nav>
      <div class="mt-auto p-4 border-t border-zinc-200 shrink-0">
        <NuxtLink to="/" class="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black p-2 rounded-xl transition-colors hover:bg-zinc-100"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Exit Admin</NuxtLink>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-x-auto">
      <header class="bg-white border-b border-zinc-200 h-16 flex items-center px-4 md:px-8 justify-between shrink-0 sticky top-0 z-30">
        <div class="flex items-center gap-3">
          <button @click="isMobileMenuOpen = true" class="md:hidden p-2.5 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors active:scale-95">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <h2 class="font-bold text-lg capitalize text-black tracking-tight">{{ activeAdminTab }}</h2>
        </div>
        <input v-if="activeAdminTab === 'projects'" v-model="searchQuery" type="text" placeholder="Search..." class="bg-zinc-100 focus:bg-zinc-200 transition-colors rounded-full px-4 py-2.5 text-sm outline-none w-36 sm:w-64 border border-transparent focus:border-zinc-300" />
      </header>

      <div class="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">

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
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-xl font-bold text-black">Kullanıcı Yönetimi</h2>
              <p class="text-sm text-zinc-500 mt-1">Platformdaki tüm kullanıcıları ve satıcıları yönetin.</p>
            </div>
            <button @click="openUserModal()" class="bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> Kullanıcı Ekle</button>
          </div>
          <div class="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-widest">
                <tr><th class="px-6 py-4 font-semibold">Kullanıcı</th><th class="px-6 py-4 font-semibold">Rol & Plan</th><th class="px-6 py-4 font-semibold">Kayıt / Durum</th><th class="px-6 py-4 font-semibold text-right">İşlemler</th></tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-for="u in dbUsers" :key="u.id" class="hover:bg-zinc-50/80 transition-colors" :class="u.isBanned ? 'bg-red-50/40 opacity-75' : ''">
                  <td class="px-6 py-4">
                    <p class="font-bold text-black flex items-center gap-2">{{ u.name || 'İsimsiz' }}</p>
                    <p class="text-xs text-zinc-500 mt-0.5">{{ u.email }}</p>
                  </td>
                  <td class="px-6 py-4 flex gap-2 items-center h-full pt-6">
                    <span :class="u.role==='ADMIN'?'bg-indigo-100 text-indigo-700':'bg-zinc-100 text-zinc-600'" class="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider">{{ u.role }}</span>
                    <span :class="u.isPro?'bg-amber-100 text-amber-700':'bg-zinc-100 text-zinc-600'" class="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider">{{ u.plan }}</span>
                    <span v-if="u.isPro && u.planSource === 'STRIPE'" class="px-2 py-1 rounded-md text-[9px] font-bold tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200" title="Ödeme yaparak aldı">💵 SATIN ALDI</span>
                    <span v-if="u.isPro && u.planSource === 'ADMIN'" class="px-2 py-1 rounded-md text-[9px] font-bold tracking-wider bg-purple-100 text-purple-700 border border-purple-200" title="Admin tarafından yetki verildi">👑 ADMİN VERDİ</span>
                  </td>
                  <td class="px-6 py-4">
                    <p class="text-xs text-zinc-500 font-mono mb-1.5">{{ new Date(u.createdAt).toLocaleDateString() }}</p>
                    <span v-if="u.isBanned" class="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded">BANLANDI</span>
                    <span v-else class="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded">AKTİF</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-1.5">
                      <button @click="openUserModal(u)" class="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Düzenle"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                      <button @click="toggleBanUser(u)" class="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors" :title="u.isBanned ? 'Yasağı Kaldır' : 'Hesabı Askıya Al'"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></button>
                      <button @click="deleteUser(u.id)" class="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Kalıcı Olarak Sil"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="activeAdminTab === 'projects'" class="animate-in fade-in">
          <div class="flex justify-end mb-6">
            <button @click="isUploadModalOpen = true" class="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Upload Product</button>
          </div>
          <div class="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-x-auto">
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
            <div class="col-span-2"><label class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Categories</label><select v-model="newProject.categories" required class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-colors"><option value="" disabled>Kategori Seçin...</option><option v-for="cat in dbCategories" :key="cat.id" :value="cat.name">{{ cat.name }}</option></select></div>
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

    <Teleport to="body">
    <div v-if="isUserModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isUserModalOpen = false"></div>
      <div class="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <h2 class="text-2xl font-bold mb-6 text-black">{{ editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle' }}</h2>
        <form @submit.prevent="saveUser" class="flex flex-col gap-4">
          <div><label class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Ad Soyad</label><input v-model="userForm.name" type="text" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors" /></div>
          <div><label class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">E-posta</label><input v-model="userForm.email" type="email" required class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors" /></div>
          <div><label class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Şifre <span class="text-zinc-400 normal-case ml-1">{{ editingUser ? '(Değişmeyecekse boş bırakın)' : '*' }}</span></label><input v-model="userForm.password" type="password" :required="!editingUser" placeholder="••••••••" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors" /></div>

          <div class="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Hesap Rolü</label>
              <select v-model="userForm.role" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black font-medium text-sm">
                <option value="USER">Standart (USER)</option>
                <option value="ADMIN">Yönetici (ADMIN)</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Abonelik</label>
              <select v-model="userForm.plan" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black font-medium text-sm">
                <option value="FREE">Ücretsiz (FREE)</option>
                <option value="PRO">Premium (PRO)</option>
              </select>
            </div>
            <div v-if="userForm.plan === 'PRO'" class="col-span-2 animate-in fade-in slide-in-from-top-2">
              <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Pro Yetki Kaynağı</label>
              <select v-model="userForm.planSource" class="w-full bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 font-bold text-sm transition-colors">
                <option value="ADMIN">👑 Admin Verdi</option>
                <option value="STRIPE">💵 Satın Aldı (Stripe)</option>
                <option value="UNKNOWN">❓ Bilinmeyen Kaynak</option>
              </select>
            </div>
          </div>

          <label class="flex items-center gap-3 mt-4 p-4 rounded-xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors group">
            <input type="checkbox" v-model="userForm.isBanned" class="w-5 h-5 accent-red-600 rounded" />
            <div>
              <span class="block font-bold text-zinc-900 group-hover:text-red-600 transition-colors">Hesabı Banla (Yasakla)</span>
              <span class="block text-xs text-zinc-500 mt-0.5">Kullanıcının sisteme girişini engeller.</span>
            </div>
          </label>

          <button type="submit" :disabled="isSubmittingUser" class="w-full bg-black text-white py-4 rounded-xl font-bold mt-4 hover:bg-zinc-800 transition-colors shadow-lg disabled:opacity-70">{{ isSubmittingUser ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}</button>
        </form>
      </div>
    </div>
    </Teleport>
  </div>
</template>