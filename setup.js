import fs from 'fs'
import path from 'path'

console.log('🚀 Gelişmiş Kategori Yönetimi Sistemi Kuruluyor...\n')

// 1. BACKEND: Kategori Düzenleme (PUT) API'sini Oluştur
const catApiDir = path.join(process.cwd(), 'server', 'api', 'admin', 'categories')
if (!fs.existsSync(catApiDir)) {
  fs.mkdirSync(catApiDir, { recursive: true })
}

const putApiCode = `import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const admin = await requireAuth(event)
  if (admin.role !== 'ADMIN') throw createError({ statusCode: 403 })

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id || !body.name) return createError({ statusCode: 400, statusMessage: 'Eksik bilgi' })

  try {
    return await prisma.category.update({
      where: { id },
      data: { name: body.name }
    })
  } catch (e) {
    return createError({ statusCode: 400, statusMessage: 'Güncelleme başarısız' })
  }
})`
fs.writeFileSync(path.join(catApiDir, '[id].put.ts'), putApiCode, 'utf8')
console.log('✅ Backend: Kategori düzenleme API endpointi başarıyla oluşturuldu.')

// 2. FRONTEND: Admin Paneli Arayüzünü Güncelle
const adminVuePath = path.join(process.cwd(), 'app', 'pages', 'admin', 'index.vue')
if (fs.existsSync(adminVuePath)) {
  let code = fs.readFileSync(adminVuePath, 'utf8')

  // A. JavaScript / Mantık Kısmını Ekleme (Ekle, Sil, Düzenle)
  if (!code.includes('const addCategory = async')) {
    const scriptInjection = `
// --- KATEGORİ YÖNETİMİ ---
const { data: dbCategories, refresh: refreshCategories } = await useFetch('/api/admin/categories')
const newCategoryName = ref('')

const addCategory = async () => {
  if(!newCategoryName.value.trim()) return;
  try {
    await $fetch('/api/admin/categories', { method: 'POST', body: { name: newCategoryName.value.trim() } })
    newCategoryName.value = ''
    await refreshCategories()
  } catch(e) {
    alert('Hata: Bu kategori zaten mevcut olabilir.')
  }
}

const deleteCategory = async (id: string) => {
  if(confirm('Kategoriyi kalıcı olarak silmek istediğinize emin misiniz?')) {
    await $fetch(\`/api/admin/categories/\${id}\`, { method: 'DELETE' })
    await refreshCategories()
  }
}

const editCategory = async (cat: any) => {
  const newName = prompt('Kategori için yeni bir isim girin:', cat.name)
  if (newName && newName.trim() !== '' && newName !== cat.name) {
    try {
      await $fetch(\`/api/admin/categories/\${cat.id}\`, { method: 'PUT', body: { name: newName.trim() } })
      await refreshCategories()
    } catch(e) {
      alert('Hata: Kategori güncellenemedi.')
    }
  }
}
`
    code = code.replace('</script>', scriptInjection + '\n</script>')
  }

  // B. Sol Menü (Sidebar) Butonunu Ekleme
  if (!code.includes("activeAdminTab = 'categories'")) {
    const sidebarCategoryBtn = `<button @click="activeAdminTab = 'categories'; if(typeof isMobileMenuOpen !== 'undefined') isMobileMenuOpen = false" :class="activeAdminTab === 'categories' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50 font-medium'" class="px-4 py-3 md:py-2.5 rounded-xl text-sm text-left transition-colors flex items-center gap-3"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg> Categories</button>\n        `
    code = code.replace(
      /<button @click="activeAdminTab = 'users'/g,
      sidebarCategoryBtn + `<button @click="activeAdminTab = 'users'`
    )
  }

  // C. Kategoriler Sayfası Tasarımını (Input + Tablo) Ekleme
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
              <input v-model="newCategoryName" type="text" placeholder="Yeni Kategori Adı (örn: UI Components, 3D, Hero...)" class="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 sm:py-2.5 text-sm outline-none focus:border-black transition-colors" required />
              <button type="submit" class="bg-black text-white px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-800 transition-all active:scale-95 shrink-0">
                Kategori Ekle
              </button>
            </form>
          </div>

          <div class="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-widest">
                <tr><th class="px-6 py-4 font-semibold">Kategori Adı</th><th class="px-6 py-4 font-semibold text-right">İşlemler</th></tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-for="cat in dbCategories" :key="cat.id" class="hover:bg-zinc-50/80 transition-colors">
                  <td class="px-6 py-4 font-bold text-black">{{ cat.name }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button @click="editCategory(cat)" class="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Düzenle">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </button>
                      <button @click="deleteCategory(cat.id)" class="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Sil">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!dbCategories || dbCategories.length === 0">
                  <td colspan="2" class="px-6 py-8 text-center text-zinc-500">Henüz kategori eklenmemiş. Yukarıdaki alandan ilk kategorinizi ekleyin.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>\n\n`

    code = code.replace(
      /<div v-if="activeAdminTab === 'users'"/g,
      categoryTemplate + `        <div v-if="activeAdminTab === 'users'"`
    )
  }

  // D. Upload Modalında Kategori Inputunu Select Kutusuna Çevirme
  const inputRegex = /<input v-model="newProject\.categories"[^>]*>/g
  const selectBox = `<select v-model="newProject.categories" required class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-colors custom-scrollbar">
                <option value="" disabled selected>Kategori Seçin...</option>
                <option v-for="cat in dbCategories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
              </select>`

  if (inputRegex.test(code)) {
    code = code.replace(inputRegex, selectBox)
  }

  fs.writeFileSync(adminVuePath, code, 'utf8')
  console.log(
    '✅ Frontend: Admin paneline Kategoriler (Ekle/Düzenle/Sil) sayfası başarıyla entegre edildi.'
  )
} else {
  console.log('❌ Admin sayfası bulunamadı.')
}

console.log(
  '\n🎉 KURULUM BİTTİ! Lütfen sayfayı yenile. Soldaki menüde Categories sekmesini göreceksin!'
)
