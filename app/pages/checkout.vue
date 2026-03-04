<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useToast, useCart } from '#imports'

const { cartData, cartTotal, checkout, isCartLoading } = useCart()
const router = useRouter()
const { addToast } = useToast()
const isProcessing = ref(false)

const handlePayment = async () => {
    isProcessing.value = true
    try {
        const res = await checkout()
        if (typeof window !== 'undefined' && res && res.url) {
            window.location.href = res.url
        } else {
             addToast('Yönlendirme başlatılamadı.', 'error')
        }
    } catch(e) {
        addToast('Ödeme sırasında bir hata oluştu.', 'error')
    } finally {
        isProcessing.value = false
    }
}
</script>

<template>
  <div class="min-h-screen bg-[#fafafa] pt-32 pb-24 px-5">
    <div class="max-w-[1000px] mx-auto">
      <h1 class="text-3xl md:text-4xl font-black text-black tracking-tight mb-8">Güvenli Ödeme</h1>

      <div v-if="!cartData?.items || cartData.items.length === 0" class="text-center py-20 bg-white rounded-3xl border border-zinc-200 shadow-sm">
        <Icon name="lucide:shopping-bag" class="w-16 h-16 text-zinc-300 mx-auto mb-4" />
        <h2 class="text-xl font-bold text-black mb-2">Sepetiniz Boş</h2>
        <p class="text-zinc-500 mb-6">Ödeme yapmak için sepetinize ürün eklemelisiniz.</p>
        <NuxtLink to="/" class="inline-flex bg-black hover:bg-zinc-800 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-md">
          Kütüphaneye Dön
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        <!-- Sol: Ürün Özeti -->
        <div class="lg:col-span-7 flex flex-col gap-4">
           <h3 class="text-xl font-bold mb-2">Sipariş Özeti</h3>
           <div class="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 flex flex-col gap-6">
              <div v-for="item in cartData.items" :key="item.id" class="flex gap-4 items-center group">
                 <div class="w-24 h-20 bg-zinc-900 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center shadow-inner">
                   <video v-if="item.project?.videoUrl" :src="item.project.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"></video>
                   <Icon v-else name="lucide:code" class="w-6 h-6 text-zinc-600" />
                 </div>
                 <div class="flex-1">
                   <h4 class="font-bold text-base text-black truncate">{{ item.project?.title }}</h4>
                   <p class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{{ item.licenseType }} LİSANS</p>
                 </div>
                 <div class="font-black text-lg text-black">
                   ${{ item.price }}
                 </div>
              </div>
           </div>
        </div>

        <!-- Sağ: Ödeme Formu (Simülasyon) -->
        <div class="lg:col-span-5">
           <div class="bg-white rounded-3xl border border-zinc-200 shadow-[0_20px_40px_rgba(0,0,0,0.04)] p-6 md:p-8 sticky top-32">
              <h3 class="text-xl font-bold mb-6">Ödeme Bilgileri</h3>

              <div class="flex flex-col gap-4 mb-8">
                <div class="flex justify-between items-center text-zinc-500">
                  <span>Ara Toplam</span>
                  <span class="font-semibold text-black">${{ cartTotal }}</span>
                </div>
                <div class="flex justify-between items-center text-zinc-500">
                  <span>Satış Vergileri</span>
                  <span class="font-semibold text-black">$0</span>
                </div>
                <div class="h-px bg-zinc-100 my-2"></div>
                <div class="flex justify-between items-center">
                  <span class="text-lg font-bold text-black">Genel Toplam</span>
                  <span class="text-3xl font-black text-black">${{ cartTotal }}</span>
                </div>
              </div>

              <button @click="handlePayment" :disabled="isProcessing || isCartLoading || cartTotal === 0" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-[64px] rounded-2xl font-bold shadow-[0_10px_30px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2 disabled:opacity-70 text-[16px] transition-all active:scale-95 focus:ring-4 focus:ring-indigo-300 mt-4">
                <Icon v-if="!isProcessing && cartTotal > 0" name="lucide:lock" class="w-4 h-4 opacity-70" />
                <span v-if="isProcessing">Güvenli Ödeme İşleniyor...</span>
                <span v-else-if="cartTotal === 0">Ücretsiz Ürünler Direkt İndirilebilir</span>
                <span v-else>Stripe ile Güvenli Ödeme Yap (${{ cartTotal }})</span>
              </button>

              <div class="mt-6 flex flex-col items-center gap-3">
                <p class="text-xs text-center text-zinc-400 flex items-center justify-center gap-1.5 font-medium">
                  <Icon name="lucide:shield-check" class="w-4 h-4 text-emerald-500" /> 256-bit SSL Tam Korumalı Ödeme
                </p>
                <div class="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <Icon name="logos:stripe" class="h-6 w-auto" />
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>
