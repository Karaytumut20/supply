<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Categories Management - Admin' })

const { data: dbCategories, refresh: refreshCategories } = await useFetch('/api/admin/categories')

const newCategoryName = ref('');
const isSubmitting = ref(false)

const addCategory = async () => { 
  if(!newCategoryName.value.trim()) return; 
  isSubmitting.value = true
  try { 
    await $fetch('/api/admin/categories', { method: 'POST', body: { name: newCategoryName.value.trim() } }); 
    newCategoryName.value = ''; 
    await refreshCategories(); 
  } catch(e) { 
    alert('Hata: Kategori eklenemedi veya zaten var!'); 
  } finally {
    isSubmitting.value = false
  }
};

const deleteCategory = async (id: string, name: string) => { 
  if(confirm(`"${name}" kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) { 
    try {
      await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' }); 
      await refreshCategories(); 
    } catch (e) {
      alert('Hata: Kategori silinemedi.')
    }
  } 
}

const editCategory = async (cat: any) => {
  const newName = prompt('Kategori için yeni bir isim girin:', cat.name)
  if (newName && newName.trim() !== '' && newName.trim() !== cat.name) {
    try {
      await $fetch(`/api/admin/categories/${cat.id}`, { method: 'PUT', body: { name: newName.trim() } })
      await refreshCategories()
    } catch(e) {
      alert('Hata: Kategori güncellenemedi.')
    }
  }
}
</script>

<template>
  <div class="animate-in fade-in">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 class="text-xl font-bold text-black">Kategori Yönetimi</h2>
        <p class="text-sm text-zinc-500 mt-1">Platformdaki tüm ürün kategorilerini buradan yönetebilirsiniz.</p>
      </div>
    </div>
    
    <div class="mb-8 bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
      <h3 class="text-sm font-bold text-black mb-3">Yeni Kategori Ekle</h3>
      <form @submit.prevent="addCategory" class="flex gap-3">
        <input v-model="newCategoryName" type="text" placeholder="Örn: Frontend, 3D Models, Templates..." required class="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none focus:border-black transition-colors text-sm" />
        <button type="submit" :disabled="isSubmitting" class="bg-black hover:bg-zinc-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-70 whitespace-nowrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> 
          {{ isSubmitting ? 'Ekleniyor...' : 'Ekle' }}
        </button>
      </form>
    </div>

    <div class="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-x-auto">
      <table class="w-full text-left text-sm whitespace-nowrap">
        <thead class="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-widest">
          <tr>
            <th class="px-6 py-4 font-semibold w-16">ID</th>
            <th class="px-6 py-4 font-semibold">Kategori Adı</th>
            <th class="px-6 py-4 font-semibold">Oluşturulma Tarihi</th>
            <th class="px-6 py-4 font-semibold text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="(cat, index) in dbCategories" :key="cat.id" class="hover:bg-zinc-50 transition-colors">
            <td class="px-6 py-4 text-xs font-mono text-zinc-500">{{ index + 1 }}</td>
            <td class="px-6 py-4 font-bold text-black">{{ cat.name }}</td>
            <td class="px-6 py-4 text-xs text-zinc-500 font-mono">{{ new Date(cat.createdAt).toLocaleDateString() }}</td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end gap-1.5">
                <button @click="editCategory(cat)" class="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Düzenle">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button @click="deleteCategory(cat.id, cat.name)" class="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Sil">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!dbCategories || dbCategories.length === 0" class="py-12 text-center text-zinc-500 text-sm">
        Henüz hiç kategori eklenmemiş. Yukarıdan yeni bir kategori ekleyebilirsiniz.
      </div>
    </div>
  </div>
</template>
