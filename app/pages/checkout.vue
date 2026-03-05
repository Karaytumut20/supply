<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { useToast, useCart } from '#imports'

const { cartData, checkout, isCartLoading } = useCart()

const cartTotal = computed(() => {
  if (!cartData.value?.items) return 0
  return cartData.value.items.reduce((sum: number, item: any) => sum + item.price, 0)
})
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

// Meta for hiding the default header
definePageMeta({
  layout: false // We will render a custom clean view without the main navbar for maximum SaaS checkout immersion
})
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col lg:flex-row font-sans relative selection:bg-indigo-500 selection:text-white">

    <!-- Sol Taraf: Sipariş Özeti (Aydınlık) -->
    <div class="w-full lg:w-[55%] xl:w-[60%] flex flex-col p-8 md:p-16 lg:p-24 pb-20 justify-center min-h-[50vh] lg:min-h-screen animate-in fade-in duration-700 relative z-10 bg-white">
       
       <!-- Üst Bar/Logo -->
       <div class="absolute top-8 md:top-12 left-8 md:left-16 lg:left-24">
         <NuxtLink to="/" class="font-black text-2xl tracking-tight flex items-center gap-2 group text-black hover:opacity-80 transition-opacity">
           <div class="flex gap-1 transform transition-transform group-hover:scale-110">
             <div class="w-3.5 h-3.5 rounded-full bg-blue-500"></div>
             <div class="w-3.5 h-3.5 bg-red-500" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
             <div class="w-3.5 h-3.5 bg-yellow-500"></div>
           </div>
           inspo<span class="text-zinc-300">.</span>
         </NuxtLink>
       </div>

       <div class="mt-16 sm:mt-8 w-full max-w-2xl mx-auto lg:mx-0">
         <div class="mb-12">
           <NuxtLink to="/" class="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black mb-6 transition-colors">
              <Icon name="lucide:arrow-left" class="w-4 h-4" /> Alışverişe Dön
           </NuxtLink>
           <h1 class="text-4xl md:text-5xl lg:text-[64px] font-black text-black tracking-tighter leading-none mb-4">Sipariş Özeti</h1>
           <p class="text-zinc-500 font-medium text-lg md:text-xl max-w-md leading-relaxed">Projelerinizi hızlandıracak premium dijital varlıklara anında erişin.</p>
         </div>

         <!-- Sepet Boş -->
         <div v-if="!cartData?.items || cartData.items.length === 0" class="flex flex-col items-start gap-6 border-t border-zinc-100 pt-12">
            <div class="w-20 h-20 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-200 shadow-sm">
                <Icon name="lucide:shopping-cart" class="w-8 h-8 text-zinc-300" />
            </div>
            <div>
              <h2 class="text-2xl font-bold text-black mb-2">Sepetiniz Boş</h2>
              <p class="text-zinc-500 max-w-sm">Görünüşe göre sepetinizde işlenecek bir ürün bulunmuyor.</p>
            </div>
            <NuxtLink to="/" class="mt-2 bg-black hover:bg-zinc-800 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg flex items-center gap-2">
              Kütüphaneye Dön <Icon name="lucide:arrow-right" class="w-4 h-4" />
            </NuxtLink>
         </div>

         <!-- Sepet Dolu -->
         <div v-else class="flex flex-col gap-6 w-full relative">
           <div class="absolute -left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent hidden md:block"></div>
           
           <div v-for="(item, index) in cartData.items" :key="item.id" class="flex flex-col sm:flex-row gap-6 items-start sm:items-center group p-4 sm:p-0 rounded-3xl hover:bg-zinc-50/50 sm:hover:bg-transparent transition-colors" :style="{ animationDelay: `${index * 100}ms` }">
             <div class="w-full sm:w-36 h-48 sm:h-36 bg-[#0a0a0a] sm:rounded-[2rem] rounded-2xl overflow-hidden shrink-0 relative flex items-center justify-center shadow-lg transform transition-transform duration-700 sm:group-hover:scale-[1.03]">
               <video v-if="item.project?.videoUrl" :src="item.project.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"></video>
               <Icon v-else name="lucide:code" class="w-10 h-10 text-zinc-600" />
               <div class="absolute inset-0 ring-1 ring-inset ring-white/10 sm:rounded-[2rem] rounded-2xl pointer-events-none"></div>
             </div>
             
             <div class="flex-1 min-w-0 flex flex-col justify-center">
               <div class="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-widest rounded-md mb-3 w-fit">
                 {{ item.licenseType }} LİSANS
               </div>
               <h4 class="font-black text-xl md:text-2xl text-black leading-tight mb-2 pr-4 break-words">{{ item.project?.title }}</h4>
               <p class="text-zinc-500 text-sm font-medium line-clamp-2 leading-relaxed max-w-[90%]">{{ item.project?.description || 'Premium dijital ürün.' }}</p>
             </div>

             <div class="font-black text-3xl md:text-4xl text-black tracking-tighter mt-4 sm:mt-0">
               ${{ item.price }}
             </div>
           </div>
         </div>
       </div>
    </div>

    <!-- Sağ Taraf: Ödeme Formu (Karanlık Split Screen) -->
    <div class="w-full lg:w-[45%] xl:w-[40%] bg-[#0a0a0a] text-white p-8 md:p-16 lg:p-24 flex flex-col justify-center relative overflow-hidden shrink-0 lg:min-h-screen">
      <!-- Glow Efektleri -->
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>

      <!-- Stripe Mesh Texture -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%); background-size: 8px 8px;"></div>

      <div class="relative z-10 w-full max-w-md mx-auto flex flex-col gap-10">
         <div>
            <h3 class="text-3xl md:text-4xl font-black mb-3 text-white tracking-tight">Güvenli Ödeme</h3>
            <p class="text-zinc-400 font-medium text-lg">Ödeme altyapımız Stripe güvencesi altındadır.</p>
         </div>

         <!-- Receipt Panel -->
         <div class="flex flex-col gap-6 bg-white/5 backdrop-blur-[40px] border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)]">
           <div class="flex items-center gap-3 mb-2">
              <Icon name="lucide:receipt" class="w-5 h-5 text-zinc-400" />
              <span class="font-bold text-white tracking-widest uppercase text-xs">Fiş Özeti</span>
           </div>
           <div class="flex justify-between items-center text-zinc-400 font-medium text-[15px]">
             <span>Ara Toplam</span>
             <span class="text-white font-bold">${{ cartTotal }}</span>
           </div>
           <div class="flex justify-between items-center text-zinc-400 font-medium text-[15px]">
             <span>Vergiler (KDV)</span>
             <span class="text-emerald-400 font-bold tracking-wider text-[11px] bg-emerald-400/10 px-2 py-1 rounded-md">DAHİL</span>
           </div>
           <div class="h-px bg-white/10 my-3 relative overflow-hidden">
             <div class="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]"></div>
           </div>
           <div class="flex justify-between items-end">
             <span class="text-lg font-bold text-zinc-300">Ödenecek Tutar</span>
             <span class="text-5xl sm:text-[64px] font-black text-white tracking-tighter leading-none">${{ cartTotal }}</span>
           </div>
         </div>

         <!-- CTA -->
         <div class="flex flex-col gap-4">
           <button @click="handlePayment" :disabled="isProcessing || isCartLoading || cartTotal === 0" class="group relative w-full h-[76px] bg-white hover:bg-zinc-100 text-black rounded-[2rem] font-bold shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] flex items-center justify-center gap-3 text-[18px] sm:text-[20px] transition-all duration-300 active:scale-95 disabled:opacity-50 overflow-hidden outline-none focus:ring-4 ring-white/30 cursor-pointer disabled:cursor-not-allowed">
              <Icon v-if="!isProcessing && cartTotal > 0" name="lucide:lock" class="w-5 h-5 opacity-50 absolute left-8" />
              
              <div v-if="isProcessing" class="flexitems-center gap-3">
                <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" /> Yönlendiriliyor...
              </div>
              <span v-else-if="cartTotal === 0" class="tracking-tight">Ücretsiz İndir</span>
              <span v-else class="tracking-tight relative z-10 font-black">Stripe ile Öde</span>
              
              <div class="absolute right-8 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                 <Icon name="lucide:arrow-right" class="w-5 h-5" />
              </div>
           </button>

           <div class="text-center mt-2 px-4">
             <p class="text-[11px] text-zinc-500 leading-relaxed font-medium">
               <strong class="text-zinc-300">İade Politikası:</strong> Dijital ürünlerin doğası gereği (yazılım, şablon, animasyon, 3D model vs.), satın alma işlemi tamamlandıktan ve kaynak dosyalarına erişim sağlandıktan sonra <strong class="text-rose-400">kesinlikle iade yapılmamaktadır.</strong> Satın alarak bu şartı kabul etmiş olursunuz.
             </p>
           </div>

           <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 px-2">
             <div class="flex items-center gap-2 opacity-60 hover:opacity-100 transition-all duration-500 cursor-pointer">
                <Icon name="lucide:credit-card" class="w-5 h-5 text-zinc-400" />
                <span class="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Kredi / Banka Kartı</span>
             </div>
             <p class="text-[11px] text-center text-zinc-500 flex items-center justify-center gap-1.5 font-bold tracking-widest uppercase">
               <Icon name="lucide:shield-check" class="w-3.5 h-3.5 text-emerald-500/80" /> Uçtan Uca Şifreleme
             </p>
           </div>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
</style>
