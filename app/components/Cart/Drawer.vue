<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '#imports'

const { isCartOpen, cartData, removeFromCart, checkout, isCartLoading } = useCart()
const router = useRouter()

const cartTotal = computed(() => {
  if (!cartData.value?.items) return 0
  return cartData.value.items.reduce((sum: number, item: any) => sum + item.price, 0)
})

const proceedToCheckout = () => {
  isCartOpen.value = false
  router.push('/checkout')
}

// Kilitleme
watch(isCartOpen, (val) => {
    if (typeof document !== 'undefined') {
        if (val) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
    }
})
</script>

<template>
  <Teleport to="body">
    <!-- Ultra Premium Backdrop -->
    <Transition enter-active-class="transition duration-700 ease-out" enter-from-class="opacity-0 backdrop-blur-none" enter-to-class="opacity-100 backdrop-blur-md" leave-active-class="transition duration-500 ease-in" leave-from-class="opacity-100 backdrop-blur-md" leave-to-class="opacity-0 backdrop-blur-none">
      <div v-if="isCartOpen" @click="isCartOpen = false" class="fixed inset-0 bg-zinc-900/40 z-[100]"></div>
    </Transition>

    <!-- Floating Glassmorphism Drawer -->
    <Transition enter-active-class="transition duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform" enter-from-class="translate-x-[120%] opacity-0 rotate-2" enter-to-class="translate-x-0 opacity-100 rotate-0" leave-active-class="transition duration-400 cubic-bezier(0.7, 0, 0.84, 0) transform" leave-from-class="translate-x-0 opacity-100" leave-to-class="translate-x-[120%] opacity-0">
      <div v-if="isCartOpen" class="fixed inset-y-0 sm:inset-y-4 right-0 sm:right-4 w-full sm:w-[440px] bg-white/80 backdrop-blur-[40px] shadow-[0_0_100px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.5)] z-[110] flex flex-col sm:rounded-[2.5rem] overflow-hidden">
        
        <!-- Üst Dekoratif Şerit -->
        <div class="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <!-- Header -->
        <div class="px-8 py-6 flex justify-between items-center shrink-0 border-b border-black/5 bg-white/50">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-black tracking-tight text-black leading-none">Sepetim</h2>
            <span v-if="cartData?.items?.length > 0" class="bg-black text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm">{{ cartData.items.length }} Ürün</span>
          </div>
          <button @click="isCartOpen = false" class="w-10 h-10 bg-black/5 hover:bg-black/10 rounded-full text-black flex items-center justify-center transition-all active:scale-95 group focus:outline-none">
            <Icon name="lucide:x" class="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
          <div v-if="isCartLoading" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm gap-4">
             <div class="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
          </div>
          
          <div v-if="!cartData?.items || cartData.items.length === 0" class="flex flex-col items-center justify-center h-full text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-zinc-100 to-zinc-200/50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-black/5">
              <Icon name="lucide:shopping-cart" class="w-10 h-10 text-zinc-400 transform -rotate-12 transition-transform hover:rotate-12 duration-500" />
            </div>
            <h3 class="text-2xl font-black text-black mb-3 tracking-tight">Ürün Seçilmedi</h3>
            <p class="text-zinc-500 text-sm mb-8 leading-relaxed max-w-[240px]">Tasarımlarınızı bir sonraki seviyeye taşımak için kütüphanemizi keşfedin.</p>
            <button @click="isCartOpen = false" class="bg-black text-white px-8 py-4 rounded-2xl font-bold text-[15px] hover:bg-zinc-800 transition-transform active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center gap-2 group">
              Keşfetmeye Başla <Icon name="lucide:arrow-right" class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div v-else class="flex flex-col gap-5">
            <div v-for="(item, index) in cartData.items" :key="item.id" class="group flex gap-4 p-4 bg-white/70 hover:bg-white rounded-3xl border border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 animate-in slide-in-from-right-4 fade-in" :style="{ animationDelay: `${index * 50}ms` }">
              <div class="w-[84px] h-[84px] bg-[#0a0a0a] rounded-2xl overflow-hidden shrink-0 relative flex items-center justify-center shadow-inner group-hover:shadow-[0_0_0_4px_rgba(0,0,0,0.05)] transition-all">
                 <video v-if="item.project?.videoUrl" :src="item.project.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"></video>
                 <Icon v-else name="lucide:code" class="w-8 h-8 text-zinc-600" />
                 <div class="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl"></div>
              </div>
              <div class="flex-1 py-0.5 flex flex-col relative justify-between">
                <button @click="removeFromCart(item.id)" class="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-50 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 transform scale-90 hover:scale-100 z-10" title="Sil">
                  <Icon name="lucide:x" class="w-3.5 h-3.5" />
                </button>
                <div>
                  <h4 class="font-bold text-[14px] text-black leading-snug line-clamp-2 pr-6">{{ item.project?.title }}</h4>
                  <p class="text-[10px] font-black tracking-widest uppercase text-indigo-500 mt-1">{{ item.licenseType }} LİSANS</p>
                </div>
                <div class="mt-auto pt-2 flex items-end justify-between">
                  <span class="font-black text-xl text-black leading-none">${{ item.price }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Premium Footer -->
        <div v-if="cartData?.items && cartData.items.length > 0" class="p-8 bg-white/80 border-t border-black/5 shrink-0 z-10 relative backdrop-blur-2xl">
          <div class="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent pointer-events-none -top-10 h-10"></div>
          <div class="flex justify-between items-end mb-6">
            <span class="text-zinc-500 font-bold text-sm tracking-wide">Ara Toplam</span>
            <span class="text-4xl font-black text-black tracking-tighter">${{ cartTotal }}</span>
          </div>
          <button @click="proceedToCheckout" class="w-full bg-black hover:bg-zinc-800 text-white h-[68px] rounded-[1.5rem] font-bold shadow-[0_15px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between px-8 text-[17px] transition-all active:scale-95 group">
            <span>Güvenli Ödeme</span>
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
               <Icon name="lucide:arrow-right" class="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
@keyframes slide-in-right {
  0% { transform: translateX(20px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
.slide-in-from-right-4 {
  animation-name: slide-in-right;
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
