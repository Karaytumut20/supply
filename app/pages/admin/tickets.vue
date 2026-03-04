<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '#imports'

definePageMeta({ layout: 'admin' })

const { addToast } = useToast()
const { data: tickets, refresh, pending } = await useFetch<any[]>('/api/admin/tickets')

const isProcessing = ref(false)

const updateStatus = async (ticketId: string, newStatus: string) => {
    isProcessing.value = true
    try {
        await $fetch(`/api/admin/tickets/${ticketId}`, {
            method: 'PATCH',
            body: { status: newStatus }
        })
        addToast('Talep durumu güncellendi', 'success')
        await refresh()
    } catch (err: any) {
        addToast(err.data?.message || 'Güncelleme hatası', 'error')
    } finally {
        isProcessing.value = false
    }
}

const getStatusColor = (status: string) => {
    switch(status) {
        case 'OPEN': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
        case 'CLOSED': return 'bg-zinc-100 text-zinc-700 border-zinc-200'
        default: return 'bg-zinc-100 text-zinc-700 border-zinc-200'
    }
}
</script>

<template>
  <div class="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-black">Destek Talepleri</h1>
        <p class="text-zinc-500 font-medium text-sm mt-1">Kullanıcılardan gelen destek biletlerini yönetin.</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
      <div v-if="pending" class="p-12 text-center text-zinc-400">Yükleniyor...</div>
      
      <div v-else-if="!tickets || tickets.length === 0" class="p-16 text-center">
        <Icon name="lucide:inbox" class="w-16 h-16 text-zinc-300 mx-auto mb-4" />
        <h3 class="text-lg font-bold text-black mb-1">Henüz Talep Yok</h3>
        <p class="text-zinc-500 text-sm">Hiç destek bileti bulunmuyor.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#f4f4f5] border-b border-zinc-200/80">
              <th class="px-6 py-4 font-bold text-xs uppercase tracking-widest text-zinc-500 whitespace-nowrap">Kullanıcı</th>
              <th class="px-6 py-4 font-bold text-xs uppercase tracking-widest text-zinc-500 whitespace-nowrap">Konu & Mesaj</th>
              <th class="px-6 py-4 font-bold text-xs uppercase tracking-widest text-zinc-500 whitespace-nowrap">Durum</th>
              <th class="px-6 py-4 font-bold text-xs uppercase tracking-widest text-zinc-500 whitespace-nowrap">Tarih</th>
              <th class="px-6 py-4 font-bold text-xs uppercase tracking-widest text-zinc-500 whitespace-nowrap text-right">İşlem</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr v-for="ticket in tickets" :key="ticket.id" class="hover:bg-zinc-50/50 transition-colors group">
              <td class="px-6 py-5 align-top">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                    {{ ticket.user?.name ? ticket.user.name[0].toUpperCase() : 'U' }}
                  </div>
                  <div>
                    <div class="text-sm font-bold text-black">{{ ticket.user?.name || 'İsimsiz' }}</div>
                    <div class="text-xs text-zinc-500">{{ ticket.user?.email }}</div>
                    <span v-if="ticket.user?.plan === 'PRO'" class="inline-block px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded-sm mt-1">PRO</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-5 min-w-[300px] max-w-lg align-top">
                <p class="font-bold text-sm text-black mb-1.5">{{ ticket.subject }}</p>
                <div class="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">{{ ticket.message }}</div>
              </td>
              <td class="px-6 py-5 whitespace-nowrap align-top">
                <span :class="getStatusColor(ticket.status)" class="px-2.5 py-1 text-xs font-bold uppercase rounded-md border tracking-wider">
                  {{ ticket.status }}
                </span>
              </td>
              <td class="px-6 py-5 text-sm text-zinc-500 whitespace-nowrap align-top">
                {{ new Date(ticket.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-6 py-5 text-right whitespace-nowrap align-top">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button v-if="ticket.status !== 'RESOLVED'" @click="updateStatus(ticket.id, 'RESOLVED')" :disabled="isProcessing" class="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                     Çözüldü
                  </button>
                  <button v-if="ticket.status !== 'CLOSED'" @click="updateStatus(ticket.id, 'CLOSED')" :disabled="isProcessing" class="text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors">
                     Kapat
                  </button>
                  <button v-if="ticket.status !== 'OPEN'" @click="updateStatus(ticket.id, 'OPEN')" :disabled="isProcessing" class="text-xs font-bold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 px-3 py-1.5 rounded-lg transition-colors">
                     Aç
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
