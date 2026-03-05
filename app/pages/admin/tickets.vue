<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '#imports'

definePageMeta({ layout: 'admin' })

const { addToast } = useToast()
const { data: tickets, refresh, pending } = await useFetch<any[]>('/api/admin/tickets')

const isProcessing = ref(false)
const isChatModalOpen = ref(false)
const activeTicket = ref<any>(null)
const newMessage = ref('')
const isSending = ref(false)

const openChatModal = (ticket: any) => {
    activeTicket.value = ticket
    isChatModalOpen.value = true
    newMessage.value = ''
    
    // Automatically open the ticket if it's currently CLOSED and they're answering
    if (ticket.status === 'CLOSED') {
        updateStatus(ticket.id, 'OPEN')
    }
}

const sendMessage = async () => {
    if (!newMessage.value.trim() || !activeTicket.value) return
    isSending.value = true
    
    try {
        await $fetch(`/api/admin/tickets/${activeTicket.value.id}/messages`, {
            method: 'POST',
            body: { message: newMessage.value.trim() }
        })
        newMessage.value = ''
        await refresh()
        
        // Refresh active ticket from the newly fetched list
        if (tickets.value) {
            const updated = tickets.value.find(t => t.id === activeTicket.value.id)
            if (updated) activeTicket.value = updated
        }
    } catch (err: any) {
        addToast(err.data?.message || 'Mesaj gönderilemedi', 'error')
    } finally {
        isSending.value = false
    }
}

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
                <div class="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100 line-clamp-2">{{ ticket.message }}</div>
                <div v-if="ticket.messages && ticket.messages.length > 0" class="mt-2 text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {{ ticket.messages.length }} Yanıt
                </div>
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
                  <button @click="openChatModal(ticket)" class="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                     <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> İncele / Yanıtla
                  </button>
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

    <!-- Chat Modal -->
    <Teleport to="body">
      <div v-if="isChatModalOpen && activeTicket" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isChatModalOpen = false"></div>
        <div class="relative w-full max-w-3xl bg-[#fafafa] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
          
          <!-- Modal Header -->
          <div class="flex justify-between items-center p-6 bg-white border-b border-zinc-200 shrink-0">
             <div>
               <div class="flex items-center gap-2 mb-1">
                 <span :class="getStatusColor(activeTicket.status)" class="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded border tracking-wider">
                    {{ activeTicket.status }}
                 </span>
                 <p class="text-xs text-zinc-500 font-medium">Bilet #{{ activeTicket.id.split('-')[0] }}</p>
               </div>
               <h2 class="text-xl font-bold text-black">{{ activeTicket.subject }}</h2>
             </div>
             <button @click="isChatModalOpen = false" class="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors">
               <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
             </button>
          </div>
          
          <!-- Chat History -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            <!-- Original Ticket Message (User) -->
            <div class="flex gap-4">
               <!-- Avatar -->
               <div class="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0 mt-1">
                  {{ activeTicket.user?.name ? activeTicket.user.name[0].toUpperCase() : 'U' }}
               </div>
               <div class="flex-1">
                  <div class="flex items-baseline gap-2 mb-1">
                     <span class="font-bold text-black text-sm">{{ activeTicket.user?.name || 'İsimsiz' }}</span>
                     <span class="text-xs text-zinc-500">{{ new Date(activeTicket.createdAt).toLocaleString() }}</span>
                  </div>
                  <div class="bg-white p-4 rounded-2xl rounded-tl-none border border-zinc-200 text-sm text-zinc-700 shadow-sm whitespace-pre-wrap leading-relaxed">
                     {{ activeTicket.message }}
                  </div>
               </div>
            </div>

            <hr class="border-zinc-200/60" />

            <!-- Replies -->
            <div v-for="msg in activeTicket.messages" :key="msg.id" class="flex gap-4" :class="msg.isAdminReply ? 'flex-row-reverse' : ''">
               <!-- Avatar Admin vs User -->
               <div v-if="msg.isAdminReply" class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0 mt-1 shadow-md">
                  A
               </div>
               <div v-else class="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0 mt-1">
                  {{ activeTicket.user?.name ? activeTicket.user.name[0].toUpperCase() : 'U' }}
               </div>

               <div class="flex-1 flex flex-col" :class="msg.isAdminReply ? 'items-end' : 'items-start'">
                  <div class="flex items-baseline gap-2 mb-1" :class="msg.isAdminReply ? 'flex-row-reverse' : ''">
                     <span class="font-bold text-sm min-w-0" :class="msg.isAdminReply ? 'text-indigo-600' : 'text-black'">{{ msg.isAdminReply ? 'Destek Ekibi' : (activeTicket.user?.name || 'İsimsiz') }}</span>
                     <span class="text-[10px] text-zinc-400 font-medium">{{ new Date(msg.createdAt).toLocaleString() }}</span>
                  </div>
                  <div class="p-4 rounded-2xl text-sm shadow-sm whitespace-pre-wrap leading-relaxed max-w-[85%]" 
                       :class="msg.isAdminReply 
                               ? 'bg-indigo-600 text-white rounded-tr-none border border-indigo-500' 
                               : 'bg-white text-zinc-700 rounded-tl-none border border-zinc-200'">
                     {{ msg.message }}
                  </div>
               </div>
            </div>
            
          </div>

          <!-- Message Input Box -->
          <div class="p-4 bg-white border-t border-zinc-200 shrink-0">
             <form @submit.prevent="sendMessage" class="relative">
                <!-- Status Warning -->
                <div v-if="activeTicket.status === 'CLOSED'" class="absolute -top-10 left-0 right-0 text-center">
                   <span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Bu talep kapatılmış. Mesaj atarsanız durumu "Açık" olarak güncellenecektir.
                   </span>
                </div>

                <textarea v-model="newMessage" rows="3" placeholder="Yanıtınızı buraya yazın..." class="w-full bg-zinc-50 border border-zinc-300 rounded-2xl p-4 pr-16 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none shadow-inner" @keydown.enter.exact.prevent="sendMessage"></textarea>
                
                <button type="submit" :disabled="isSending || !newMessage.trim()" class="absolute bottom-4 right-4 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:bg-zinc-400 shadow-md active:scale-95">
                   <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
             </form>
             <p class="text-center text-[10px] text-zinc-400 mt-2 font-medium">Göndermek için Enter tuşuna basın. Yeni satır için Shift + Enter.</p>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>
