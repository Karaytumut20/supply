import fs from 'fs'
import path from 'path'

console.log('🚀 Admin paneli Kategoriler sekmesi düzeltiliyor...\n')

const adminVuePath = path.join(process.cwd(), 'app', 'pages', 'admin', 'index.vue')

if (!fs.existsSync(adminVuePath)) {
  console.error(
    '❌ Hata: app/pages/admin/index.vue dosyası bulunamadı. Komutu projenin ana dizininde çalıştırdığınıza emin olun.'
  )
  process.exit(1)
}

let code = fs.readFileSync(adminVuePath, 'utf8')

// 1. editCategory fonksiyonunu ekleme (Eğer yoksa)
if (!code.includes('const editCategory =')) {
  const editCategoryCode = `
const editCategory = async (cat: any) => {
  const newName = prompt('Kategori için yeni bir isim girin:', cat.name)
  if (newName && newName.trim() !== '' && newName !== cat.name) {
    try {
      await $fetch(\`/api/admin/categories/\${cat.id}\`, { method: 'PUT', body: { name: newName.trim() } })
      await refreshCategories()
    } catch(e) {
      alert('Hata: Kategori güncellenemedi. İsim zaten kullanılıyor olabilir.')
    }
  }
}
`
  // openUserModal fonksiyonunun hemen üstüne ekliyoruz
  code = code.replace('const openUserModal =', editCategoryCode + '\nconst openUserModal =')
  console.log('✅ Kategori düzenleme (editCategory) fonksiyonu eklendi.')
} else {
  console.log('ℹ️ Kategori düzenleme (editCategory) fonksiyonu zaten var, atlanıyor.')
}

// 2. Kategori Template (HTML) arayüzünü ekleme (Eğer yoksa)
if (!code.includes("activeAdminTab === 'categories'")) {
  const categoryTemplate = `
        <div v-if="activeAdminTab === 'categories'" class="animate-in fade-in">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-xl font-bold text-black">Kategori Yönetimi</h2>
              <p class="text-sm text-zinc-500 mt-1">Platformdaki filtreleme etiketlerini ekleyin, düzenleyin veya silin.</p>
            </div>
          </div>

          <div class="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 sm:p-6 mb-6">
            <form @submit.prevent="addCategory" class="flex flex-col sm:flex-row gap-3">
              <input
                v-model="newCategoryName"
                type="text"
                placeholder="Yeni Kategori Adı (örn: UI Components, 3D, Hero...)"
                class="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 sm:py-2.5 text-sm outline-none focus:border-black transition-colors"
                required
              />
              <button type="submit" class="bg-black text-white px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-800 transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Kategori Ekle
              </button>
            </form>
          </div>

          <div class="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-widest">
                <tr>
                  <th class="px-6 py-4 font-semibold">Kategori Adı</th>
                  <th class="px-6 py-4 font-semibold">Oluşturulma</th>
                  <th class="px-6 py-4 font-semibold text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-if="!dbCategories || dbCategories.length === 0">
                  <td colspan="3" class="px-6 py-8 text-center text-zinc-500">Henüz kategori eklenmemiş. Yukarıdaki alandan ilk kategorinizi ekleyin.</td>
                </tr>
                <tr v-for="cat in dbCategories" :key="cat.id" class="hover:bg-zinc-50/80 transition-colors">
                  <td class="px-6 py-4 font-bold text-black">{{ cat.name }}</td>
                  <td class="px-6 py-4 text-xs font-mono text-zinc-500">{{ new Date(cat.createdAt).toLocaleDateString() }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button @click="editCategory(cat)" type="button" class="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Düzenle">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </button>
                      <button @click="deleteCategory(cat.id)" type="button" class="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Sil">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
`
  // Kullanıcılar (users) tablosunun hemen üstüne inject ediyoruz.
  code = code.replace(
    '<div v-if="activeAdminTab === \'users\'"',
    categoryTemplate + '\n        <div v-if="activeAdminTab === \'users\'"'
  )
  console.log('✅ Kategoriler HTML arayüzü (Form & Tablo) eklendi.')
} else {
  console.log('ℹ️ Kategoriler HTML arayüzü zaten var, atlanıyor.')
}

fs.writeFileSync(adminVuePath, code, 'utf8')
console.log('\n🎉 İŞLEM TAMAMLANDI! Sayfayı yenileyin, "Categories" sekmesi artık dolu olacak.')
