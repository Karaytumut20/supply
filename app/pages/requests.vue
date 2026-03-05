<script setup lang="ts">
import { ref, computed } from 'vue'

useSeoMeta({ title: 'Topluluk İstekleri - Supply', description: 'Yeni şablonlar, bileşenler veya efektler için istekte bulunun veya mevcut isteklere oy verin.' })

const headers = useRequestHeaders(['cookie']) as HeadersInit

// API'den Data Çekme
const { data: user } = await useFetch('/api/auth/me', { key: 'auth-user', headers })
const { data: requests, refresh, pending } = await useFetch<any[]>('/api/requests')

const isSubmitting = ref(false)
const newRequestForm = ref({ title: '', description: '' })
const showNewRequestModal = ref(false)

const submitRequest = async () => {
  if (!user.value) {
    alert('İstek oluşturmak için giriş yapmalısınız.')
    return
  }
  if (!newRequestForm.value.title || !newRequestForm.value.description) {
    alert('Başlık ve açıklama zorunludur.')
    return
  }
  
  isSubmitting.value = true
  try {
    await $fetch('/api/requests', {
      method: 'POST',
      body: newRequestForm.value
    })
    newRequestForm.value = { title: '', description: '' }
    showNewRequestModal.value = false
    await refresh()
  } catch (err: any) {
    alert(err.data?.statusMessage || 'Hata oluştu')
  } finally {
    isSubmitting.value = false
  }
}

const toggleVote = async (id: string, currentlyVoted: boolean) => {
  if (!user.value) {
    alert('Oy vermek için giriş yapmalısınız.')
    return
  }

  // Optimistic UI Update
  const req = requests.value?.find(r => r.id === id)
  if (req) {
     req.hasVoted = !currentlyVoted
     req.voteCount += currentlyVoted ? -1 : 1
  }

  try {
    const res: any = await $fetch(`/api/requests/${id}/vote`, { method: 'POST' })
    if (!res.success) {
      // Revert optimistic update
      if (req) {
         req.hasVoted = currentlyVoted
         req.voteCount += currentlyVoted ? 1 : -1
      }
    } else {
        await refresh()
    }
  } catch(e) {
      if (req) {
         req.hasVoted = currentlyVoted
         req.voteCount += currentlyVoted ? 1 : -1
      }
      alert('Oy işlemi başarısız.')
  }
}

const getStatusBadge = (status: string) => {
    switch(status) {
        case 'PENDING': return { text: 'Oylamada', classes: 'bg-amber-100 text-amber-800' }
        case 'APPROVED': return { text: 'Geliştiriliyor', classes: 'bg-indigo-100 text-indigo-800' }
        case 'PUBLISHED': return { text: 'Yayınlandı', classes: 'bg-emerald-100 text-emerald-800' }
        case 'REJECTED': return { text: 'Reddedildi', classes: 'bg-red-100 text-red-800' }
        default: return { text: status, classes: 'bg-zinc-100 text-zinc-800' }
    }
}
</script>

<template>
  <div class="min-h-screen bg-[#fafafa] font-sans pb-24 pt-32 px-5 sm:px-8">
    <div class="max-w-[1000px] mx-auto">
      
      <!-- HEADER -->
      <div class="text-center mb-12 sm:mb-16">
        <div class="inline-flex items-center justify-center p-3 sm:p-4 bg-indigo-50 rounded-[1.5rem] sm:rounded-[2rem] text-indigo-600 mb-6 shadow-inner ring-1 ring-indigo-100/50">
           <svg class="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-black mb-6 leading-[1.1]">Topluluk İstekleri</h1>
        <p class="text-zinc-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">Bir sonraki premium şablon veya animasyon ne olsun? Fikirlerinizi paylaşın veya en çok beğendiğiniz isteklere oy verin. En çok oy alanlar geliştirilecektir.</p>
        
        <div class="mt-10">
           <button @click="showNewRequestModal = true" class="bg-black hover:bg-zinc-800 text-white px-8 py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2 mx-auto">
             <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
             Yeni İstek Oluştur
           </button>
        </div>
      </div>

      <!-- MAIN LIST -->
      <div v-if="pending" class="w-full h-64 flex items-center justify-center">
        <div class="w-10 h-10 border-4 border-zinc-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>

      <div v-else-if="!requests || requests.length === 0" class="bg-white border-2 border-dashed border-zinc-200 rounded-[2rem] py-24 text-center">
         <svg class="w-16 h-16 text-zinc-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
         <h3 class="text-xl font-bold text-black mb-2">Henüz istek yok</h3>
         <p class="text-zinc-500 max-w-sm mx-auto">İlk isteği siz oluşturun ve topluluğun oylamasını sağlayın.</p>
      </div>

      <div v-else class="space-y-4 sm:space-y-6">
        <div v-for="req in requests" :key="req.id" class="bg-white rounded-[2rem] p-5 sm:p-6 border border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
           
           <!-- Vote Box -->
           <div class="shrink-0 flex sm:flex-col items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-2 w-full sm:w-20 justify-center">
              <button @click="toggleVote(req.id, req.hasVoted)" :disabled="req.status === 'PUBLISHED' || req.status === 'REJECTED'" :class="[req.hasVoted ? 'text-indigo-600' : 'text-zinc-400 hover:text-black', req.status === 'PUBLISHED' || req.status === 'REJECTED' ? 'opacity-50 cursor-not-allowed' : 'active:scale-90 transition-transform']" class="p-2 disabled:hover:text-zinc-400">
                 <svg class="w-6 h-6 sm:w-7 sm:h-7" :fill="req.hasVoted ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              </button>
              <span :class="req.hasVoted ? 'text-indigo-600 font-black' : 'text-black font-bold'" class="text-lg sm:text-xl font-mono px-2 sm:px-0">{{ req.voteCount }}</span>
           </div>

           <!-- Content -->
           <div class="flex-1 min-w-0">
             <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h3 class="text-lg sm:text-xl font-bold text-black group-hover:text-indigo-600 transition-colors truncate">{{ req.title }}</h3>
                <span :class="getStatusBadge(req.status).classes" class="inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border border-current shadow-sm self-start sm:self-auto shrink-0">
                  {{ getStatusBadge(req.status).text }}
                </span>
             </div>
             <p class="text-zinc-600 text-sm leading-relaxed mb-4">{{ req.description }}</p>
             
             <div class="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <div class="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 text-zinc-600 shrink-0">
                   {{ req.user?.name ? req.user.name[0].toUpperCase() : 'U' }}
                </div>
                <span>{{ req.user?.name || 'Topluluk Üyesi' }}</span>
                <span class="text-zinc-300">•</span>
                <span>{{ new Date(req.createdAt).toLocaleDateString() }}</span>
             </div>
           </div>
        </div>
      </div>

    </div>

    <!-- New Request Modal -->
    <Teleport to="body">
      <div v-if="showNewRequestModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
        <div class="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" @click="showNewRequestModal = false"></div>
        <div class="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center p-6 sm:p-8 border-b border-zinc-100">
             <h2 class="text-2xl font-black text-black tracking-tight">Yeni İstek Başlat</h2>
             <button @click="showNewRequestModal = false" class="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors text-zinc-500">
               <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
             </button>
          </div>
          <div class="p-6 sm:p-8 space-y-6">
             <div>
                <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Başlık</label>
                <input v-model="newRequestForm.title" type="text" placeholder="Örn: GSAP ile Akıcı Sayfa Geçişi" class="w-full bg-zinc-50 border border-zinc-200 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all shadow-inner" />
             </div>
             <div>
                <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Açıklama & Detaylar</label>
                <textarea v-model="newRequestForm.description" rows="5" placeholder="Nasıl bir şey hayal ediyorsunuz? Örnek referanslar verebilirsiniz..." class="w-full bg-zinc-50 border border-zinc-200 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all shadow-inner resize-none"></textarea>
             </div>
             
             <button @click="submitRequest" :disabled="isSubmitting || !newRequestForm.title || !newRequestForm.description" class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 disabled:opacity-75 text-white py-4 rounded-xl font-bold shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-2 active:scale-95">
                <svg v-if="isSubmitting" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 1-9 9"/></svg>
                <span v-else>İsteği Gönder & İlk Oyu Ver</span>
             </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
