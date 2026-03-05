<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Template Requests - Admin' })

const { data: requests, refresh, pending } = await useFetch<any[]>('/api/admin/template-requests')

const isProcessing = ref(false)

const updateStatus = async (id: string, newStatus: string) => {
    isProcessing.value = true
    try {
        await $fetch(`/api/admin/template-requests/${id}`, {
            method: 'PATCH',
            body: { status: newStatus }
        })
        await refresh()
    } catch (err: any) {
        alert(err.data?.message || 'Güncelleme hatası')
    } finally {
        isProcessing.value = false
    }
}

const getStatusColor = (status: string) => {
    switch(status) {
        case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200'
        case 'APPROVED': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
        case 'PUBLISHED': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
        case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
        default: return 'bg-zinc-100 text-zinc-700 border-zinc-200'
    }
}
</script>

<template>
  <div class="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-black flex items-center gap-3">
          <svg class="w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2 10 22"/><path d="m8 6-6 6 6 6"/><path d="m16 18 6-6-6-6"/></svg>
          Şablon & Efekt İstekleri
        </h1>
        <p class="text-zinc-500 font-medium text-sm mt-1">Kullanıcıların oyladığı ve istediği yeni ürün taleplerini inceleyin.</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
      <div v-if="pending" class="p-12 text-center text-zinc-400">Yükleniyor...</div>
      
      <div v-else-if="!requests || requests.length === 0" class="p-16 text-center">
        <svg class="w-16 h-16 text-zinc-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        <h3 class="text-lg font-bold text-black mb-1">Talep Bulunamadı</h3>
        <p class="text-zinc-500 text-sm">Henüz bir ürün talebi oluşturulmamış.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#f4f4f5] border-b border-zinc-200/80">
              <th class="px-6 py-4 font-bold text-xs uppercase tracking-widest text-zinc-500 whitespace-nowrap">İçerik & Detay</th>
              <th class="px-6 py-4 font-bold text-xs uppercase tracking-widest text-zinc-500 whitespace-nowrap text-center">Talep Eden</th>
              <th class="px-6 py-4 font-bold text-xs uppercase tracking-widest text-zinc-500 whitespace-nowrap text-center">Oy Sayısı</th>
              <th class="px-6 py-4 font-bold text-xs uppercase tracking-widest text-zinc-500 whitespace-nowrap">Durum</th>
              <th class="px-6 py-4 font-bold text-xs uppercase tracking-widest text-zinc-500 whitespace-nowrap text-right">İşlem</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr v-for="req in requests" :key="req.id" class="hover:bg-zinc-50/50 transition-colors group">
              
              <td class="px-6 py-5 min-w-[300px] max-w-lg align-top">
                <p class="font-bold text-sm text-black mb-1.5">{{ req.title }}</p>
                <div class="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">{{ req.description }}</div>
              </td>
              
              <td class="px-6 py-5 align-top text-center w-40">
                <div class="flex flex-col items-center justify-center">
                  <div class="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0 mb-1.5 shadow-inner">
                    {{ req.user?.name ? req.user.name[0].toUpperCase() : 'U' }}
                  </div>
                  <div class="text-[10px] font-bold text-black">{{ req.user?.name || 'İsimsiz' }}</div>
                </div>
              </td>

              <td class="px-6 py-5 align-top text-center w-32">
                <span class="inline-flex items-center justify-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl font-black text-sm shadow-sm">
                   <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                   {{ req.voteCount || 0 }}
                </span>
              </td>

              <td class="px-6 py-5 whitespace-nowrap align-top w-32">
                <span :class="getStatusColor(req.status)" class="px-2.5 py-1.5 text-[10px] font-bold uppercase rounded-md border tracking-wider flex justify-center shadow-sm">
                  {{ req.status }}
                </span>
              </td>

              <td class="px-6 py-5 text-right whitespace-nowrap align-top w-48">
                <div class="flex flex-col items-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button v-if="req.status === 'PENDING'" @click="updateStatus(req.id, 'APPROVED')" :disabled="isProcessing" class="w-full text-center text-[10px] uppercase tracking-widest font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors">
                     Onayla (Topluyoruz)
                  </button>
                  <button v-if="req.status === 'APPROVED'" @click="updateStatus(req.id, 'PUBLISHED')" :disabled="isProcessing" class="w-full text-center text-[10px] uppercase tracking-widest font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
                     Yayınlandı Olarak İşaretle
                  </button>
                  <button v-if="req.status !== 'REJECTED' && req.status !== 'PUBLISHED'" @click="updateStatus(req.id, 'REJECTED')" :disabled="isProcessing" class="w-full text-center text-[10px] uppercase tracking-widest font-bold text-red-600 bg-white hover:bg-red-50 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg transition-colors">
                     Reddet
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
