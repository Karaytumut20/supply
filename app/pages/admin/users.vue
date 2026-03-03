<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Users & Creators - Admin' })

const { data: dbUsers, refresh: refreshUsers } = await useFetch('/api/admin/users')

const isUserModalOpen = ref(false)
const editingUser = ref<any>(null)
const userForm = ref({ name: '', email: '', password: '', role: 'USER', plan: 'FREE', isBanned: false, planSource: 'UNKNOWN' })
const isSubmittingUser = ref(false)

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
  <div class="animate-in fade-in">
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
              <span :class="u.plan==='PRO'?'bg-amber-100 text-amber-700':'bg-zinc-100 text-zinc-600'" class="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider">{{ u.plan }}</span>
              <span v-if="u.plan==='PRO' && u.planSource === 'STRIPE'" class="px-2 py-1 rounded-md text-[9px] font-bold tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200" title="Ödeme yaparak aldı">💵 SATIN ALDI</span>
              <span v-if="u.plan==='PRO' && u.planSource === 'ADMIN'" class="px-2 py-1 rounded-md text-[9px] font-bold tracking-wider bg-purple-100 text-purple-700 border border-purple-200" title="Admin tarafından yetki verildi">👑 ADMİN VERDİ</span>
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
      <div v-if="!dbUsers || dbUsers.length === 0" class="py-12 text-center text-zinc-500 text-sm">
        Kullanıcı bulunamadı.
      </div>
    </div>

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
