<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Notifications - Admin' })

const { data: dbUsers } = await useFetch('/api/admin/users')

const notificationForm = ref({
  type: 'ALL',
  targetUserId: '',
  title: '',
  message: '',
  link: ''
})

const isSubmitting = ref(false)

const sendNotification = async () => {
  if (notificationForm.value.type === 'SPECIFIC' && !notificationForm.value.targetUserId) {
    alert('Lütfen hedeflenen kullanıcıyı seçin.')
    return
  }

  isSubmitting.value = true
  try {
    const res: any = await $fetch('/api/admin/notifications', {
      method: 'POST',
      body: notificationForm.value
    })
    alert(`Başarılı! Bildirim ${res.count} kişiye gönderildi.`)
    notificationForm.value = { type: 'ALL', targetUserId: '', title: '', message: '', link: '' }
  } catch(e: any) {
    alert(e.data?.statusMessage || 'Bildirim gönderilemedi.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="animate-in fade-in max-w-4xl">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-black flex items-center gap-3">
        <svg class="w-7 h-7 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        Sistem Bildirimleri
      </h2>
      <p class="text-zinc-500 mt-2">Kullanıcılara doğrudan platform içi bildirim gönderin.</p>
    </div>

    <div class="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
       <form @submit.prevent="sendNotification" class="flex flex-col gap-6">
          
          <div class="p-5 bg-zinc-50 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row gap-5">
             <div class="flex-1">
               <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Kime Gönderilecek?</label>
               <select v-model="notificationForm.type" class="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors font-bold text-black">
                 <option value="ALL">📢 Tüm Kullanıcılara (Herkese Açık)</option>
                 <option value="SPECIFIC">🎯 Belirli Bir Kullanıcıya</option>
               </select>
             </div>
             <div v-if="notificationForm.type === 'SPECIFIC'" class="flex-1 animate-in fade-in zoom-in-95 duration-200">
               <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Kullanıcı Seçin</label>
               <select v-model="notificationForm.targetUserId" required class="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors font-medium">
                 <option value="" disabled>Kullanıcı Arayın...</option>
                 <option v-for="u in dbUsers" :key="u.id" :value="u.id">{{ u.email }} ({{ u.name }})</option>
               </select>
             </div>
          </div>

          <div>
            <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Bildirim Başlığı</label>
            <input v-model="notificationForm.title" type="text" required placeholder="Örn: %50 İndirim Fırsatı!" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors" />
          </div>

          <div>
            <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Mesaj İçeriği</label>
            <textarea v-model="notificationForm.message" required rows="4" placeholder="Kullanıcılara iletilmek istenen duyuru metnini girin..." class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors resize-none"></textarea>
          </div>

          <div>
            <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block flex items-center justify-between">
              <span>Yönlendirme Linki (Opsiyonel)</span>
              <span class="normal-case text-zinc-400 font-normal">Tıklandığında gideceği sayfa</span>
            </label>
            <input v-model="notificationForm.link" type="text" placeholder="/market veya https://..." class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors" />
             <p class="text-[10px] text-zinc-400 mt-1.5">Eğer site içi bir linkse sadece /ornek şeklinde girmeniz tavsiye edilir.</p>
          </div>

          <button type="submit" :disabled="isSubmitting" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold mt-2 shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> 
            {{ isSubmitting ? 'Gönderiliyor...' : 'Bildirimi Gönder' }}
          </button>
       </form>
    </div>
  </div>
</template>
