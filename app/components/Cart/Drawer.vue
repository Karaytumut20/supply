<script setup lang="ts">
import { computed } from 'vue'
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
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0">
      <div v-if="isCartOpen" @click="isCartOpen = false" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"></div>
    </Transition>

    <!-- Drawer Panel -->
    <Transition enter-active-class="transition duration-300 ease-in-out transform" enter-from-class="translate-x-full" leave-active-class="transition duration-300 ease-in-out transform" leave-to-class="translate-x-full">
      <div v-if="isCartOpen" class="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-[110] flex flex-col border-l border-zinc-200">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div class="flex items-center gap-2">
            <Icon name="lucide:shopping-bag" class="w-5 h-5 text-black" />
            <h2 class="text-xl font-bold tracking-tight text-black">Your Cart</h2>
            <span v-if="cartData?.items && cartData.items.length > 0" class="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full">{{ cartData.items.length }}</span>
          </div>
          <button @click="isCartOpen = false" class="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition-all active:scale-95">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div v-if="isCartLoading" class="flex flex-col items-center justify-center h-full text-zinc-400 gap-3">
             <div class="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
             <p class="text-sm font-semibold">Sepet yükleniyor...</p>
          </div>
          <div v-else-if="!cartData?.items || cartData.items.length === 0" class="flex flex-col items-center justify-center h-full text-center">
            <div class="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-100">
              <Icon name="lucide:shopping-cart" class="w-8 h-8 text-zinc-300" />
            </div>
            <h3 class="text-lg font-bold text-black mb-1">Sepetiniz boş</h3>
            <p class="text-zinc-500 text-sm mb-6">Görünüşe göre henüz sepetinize bir ürün eklemediniz.</p>
            <button @click="isCartOpen = false" class="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all active:scale-95 shadow-md">
              Kütüphaneyi Keşfet
            </button>
          </div>
          <div v-else class="flex flex-col gap-4">
            <div v-for="item in cartData.items" :key="item.id" class="flex gap-4 p-3 bg-white rounded-2xl border border-zinc-200/80 shadow-sm group hover:border-zinc-300 transition-colors">
              <div class="w-24 h-20 bg-zinc-900 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center">
                 <video v-if="item.project?.videoUrl" :src="item.project.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover opacity-80"></video>
                 <Icon v-else name="lucide:code" class="w-6 h-6 text-zinc-600" />
              </div>
              <div class="flex-1 min-w-0 py-1 flex flex-col justify-between">
                <div>
                  <h4 class="font-bold text-sm text-black truncate">{{ item.project?.title }}</h4>
                  <p class="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mt-0.5">{{ item.licenseType }} LİSANS</p>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <span class="font-black text-black">${{ item.price }}</span>
                  <button @click="removeFromCart(item.id)" class="text-xs font-bold text-zinc-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <Icon name="lucide:trash-2" class="w-3.5 h-3.5" /> Kaldır
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="cartData?.items && cartData.items.length > 0" class="p-6 bg-white border-t border-zinc-100 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10">
          <div class="flex justify-between items-center mb-6">
            <span class="text-zinc-500 font-medium tracking-wide">Toplam Tutar</span>
            <span class="text-3xl font-black text-black">${{ cartTotal }}</span>
          </div>
          <button @click="proceedToCheckout" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-[56px] rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-[15px] transition-transform active:scale-95">
            Güvenli Ödemeye Geç
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
