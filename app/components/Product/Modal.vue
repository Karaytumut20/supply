<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
const props = defineProps<{ isOpen: boolean, item: any }>()
const emit = defineEmits(['close'])
const close = () => {
    isProcessing.value = false
    emit('close')
}
const { data: user, refresh: refreshUser } = await useFetch('/api/auth/me')

// ERİŞİM MANTIĞI: Kim Kodu Görebilir?
const hasAccess = computed(() => {
  if (!user.value) return false;
  if (user.value.role === 'ADMIN') return true; // Admin her seyi gorur
  if (props.item?.isPremium && user.value.plan === 'PRO') return true; // PRO'lar Premiumlari ucretsiz gorur
  if (!props.item?.isPremium && props.item?.price === 0) return true; // Herkese acik ucretsizler
  if (user.value.purchases?.includes(props.item?.id)) return true; // Parasiyla satin almis olanlar
  return false;
})

const isProcessing = ref(false)
const buyItem = async () => {
  if(!user.value) return window.location.href = '/sign-in';
  isProcessing.value = true;
  try {
    await $fetch('/api/projects/purchase', { method: 'POST', body: { projectId: props.item.id } })
    await refreshUser();
  } catch(e) { alert('An error occurred during purchase.') } finally { isProcessing.value = false }
}
const subscribePro = async () => {
  if(!user.value) return window.location.href = '/sign-in';
  isProcessing.value = true;
  try {
    await $fetch('/api/user/subscribe', { method: 'POST' })
    await refreshUser();
  } catch(e) { alert('An error occurred during subscription.') } finally { isProcessing.value = false }
}
const showCode = () => alert('SOURCE CODE:\n\n' + (props.item.sourceCode || 'Code not uploaded yet.'))

watch(() => props.isOpen, (val) => { if (typeof document !== 'undefined') document.body.style.overflow = val ? 'hidden' : '' })
onUnmounted(() => { if (typeof document !== 'undefined') document.body.style.overflow = '' })
</script>
<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-300 ease-in-out" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-8">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-2xl transition-opacity" @click="close"></div>
        
        <!-- Modal Container -->
        <Transition enter-active-class="transition duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] delay-75" enter-from-class="opacity-0 translate-y-16 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition duration-300" leave-from-class="opacity-100 translate-y-0 scale-100" leave-to-class="opacity-0 translate-y-8 scale-95">
          <div v-if="isOpen" class="relative w-full max-w-[1400px] h-full md:h-[90vh] lg:h-[85vh] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/20">
            
            <!-- Close Button -->
            <button @click="close" class="absolute top-6 right-6 z-50 p-3.5 bg-white/20 hover:bg-white/80 backdrop-blur-xl text-black rounded-full transition-all duration-300 shadow-lg border border-black/10 group focus:outline-none focus:ring-2 focus:ring-black">
               <svg class="transform group-hover:rotate-90 transition-transform duration-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <!-- Left Side: Visual Showcase (60%) -->
            <div class="w-full lg:w-[60%] bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden h-[45vh] lg:h-full shrink-0">
               <!-- Subtle Grid Background -->
               <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 40px 40px;"></div>
               
               <!-- Glowing Accents -->
               <div class="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
               <div class="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
               
               <div class="w-full h-full relative flex flex-col items-center justify-center p-6 lg:p-12">
                 
                 <!-- E-Commerce Type Badge Overlay -->
                 <div class="absolute top-6 left-6 z-20 flex gap-2">
                    <span v-if="item?.productType" class="bg-black/50 backdrop-blur-md border border-white/10 text-white px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-lg flex items-center gap-2">
                       <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                       {{ item.productType }}
                    </span>
                 </div>

                 <!-- Main Preview -->
                 <div class="w-full max-w-4xl relative rounded-[1.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)] transform transition-transform duration-700 hover:scale-[1.02] ring-1 ring-white/10 group cursor-pointer" @click="hasAccess ? showCode() : null">
                   <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10 transition-opacity duration-300 group-hover:opacity-0"></div>
                   
                   <video v-if="item?.video" :src="item.video" autoplay loop muted playsinline class="w-full aspect-video md:aspect-[16/10] object-cover"></video>
                   <div v-else class="w-full aspect-video md:aspect-[16/10] bg-zinc-900 flex items-center justify-center text-zinc-600 font-mono text-sm">No Preview Available</div>
                   
                   <!-- Show Code Overlay on Hover (if has access) -->
                   <div v-if="hasAccess" class="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
                      <div class="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> View Source
                      </div>
                   </div>
                 </div>
               </div>
            </div>
            
            <!-- Right Side: E-Commerce Details & Actions (40%) -->
            <div class="w-full lg:w-[40%] flex flex-col bg-[#fafafa] relative h-[55vh] lg:h-full">
               
               <div class="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 no-scrollbar">
                   
                   <div class="flex gap-2 mb-6 mt-2 md:mt-0">
                     <span v-if="item?.isPremium" class="bg-gradient-to-r from-amber-400 to-amber-500 text-black px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-md flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Premium
                     </span>
                     <span v-else class="bg-zinc-200 text-zinc-800 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">Free Access</span>
                   </div>
                   
                   <!-- Title & Meta -->
                   <h2 class="text-3xl lg:text-4xl font-extrabold tracking-tight text-black mb-4 leading-tight">{{ item?.title }}</h2>
                   
                   <div class="flex flex-wrap gap-2 mb-8 text-sm">
                      <span v-for="cat in (typeof item?.categories === 'string' ? item.categories.split(',') : item?.categories)" :key="cat" class="text-zinc-500 font-semibold bg-white px-3 py-1 rounded-lg border border-zinc-200 shadow-sm relative overflow-hidden group">
                         <span class="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent z-10"></span>
                         {{ cat.trim() }}
                      </span>
                   </div>
                   
                   <!-- Description -->
                   <div class="prose prose-zinc mb-10">
                      <p class="text-zinc-600 leading-relaxed text-[15px] font-medium">
                        Accelerate your development workflow. This highly polished digital asset provides production-ready code, beautiful structure, and fluid animations. Zero dependencies required.
                      </p>
                   </div>
                   
                   <!-- E-Commerce Feature List -->
                   <div class="bg-white rounded-[1.5rem] p-6 border border-zinc-200 shadow-sm mb-10 relative overflow-hidden">
                      <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl"></div>
                      <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-5">What's Included</h4>
                      <ul class="space-y-4 relative z-10">
                        <li class="flex items-start gap-3">
                           <div class="mt-0.5 bg-indigo-100 p-1 rounded-full text-indigo-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                           <div><p class="text-sm font-bold text-black">Production Ready Code</p><p class="text-xs text-zinc-500 mt-0.5">Clean, documented, and properly typed.</p></div>
                        </li>
                        <li class="flex items-start gap-3">
                           <div class="mt-0.5 bg-indigo-100 p-1 rounded-full text-indigo-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                           <div><p class="text-sm font-bold text-black">Modern Framework Support</p><p class="text-xs text-zinc-500 mt-0.5">Vue 3 / Nuxt 3 Composition API & Tailwind CSS.</p></div>
                        </li>
                        <li class="flex items-start gap-3">
                           <div class="mt-0.5 bg-indigo-100 p-1 rounded-full text-indigo-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                           <div><p class="text-sm font-bold text-black">Lifetime Updates</p><p class="text-xs text-zinc-500 mt-0.5">Get continuous improvements to this asset.</p></div>
                        </li>
                      </ul>
                   </div>
                   
                   <!-- Trust Signals -->
                   <div class="flex items-center justify-between py-6 border-t border-zinc-200/60 mt-auto">
                     <div class="flex items-center gap-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-300"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <span class="text-xs font-bold text-zinc-400 tracking-wide uppercase">Secure encrypted checkout</span>
                     </div>
                     <div class="flex gap-2 opacity-60 grayscale">
                        <div class="w-8 h-5 bg-zinc-200 rounded text-[8px] font-black flex items-center justify-center">VISA</div>
                        <div class="w-8 h-5 bg-zinc-200 rounded text-[8px] font-black flex items-center justify-center">M/C</div>
                     </div>
                   </div>
               </div>
               
               <!-- Sticky Checkout Actions -->
               <div class="p-6 md:p-8 bg-white border-t border-zinc-200 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] relative z-30">
                 
                 <!-- Option 1: User Already Has Access -->
                 <div v-if="hasAccess" class="space-y-3">
                   <div class="flex items-center justify-between mb-4">
                      <span class="text-sm font-bold text-emerald-600 flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Asset Unlocked</span>
                   </div>
                   <button @click="showCode" class="w-full bg-black hover:bg-zinc-800 text-white h-[60px] rounded-[1.25rem] font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 group text-[15px]">
                     <svg class="group-hover:animate-pulse" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                     Access Source Code
                   </button>
                 </div>
                 
                 <!-- Option 2: Needs to Purchase -->
                 <div v-else class="space-y-4">
                   <div class="flex items-center justify-between mb-2 px-1">
                      <div>
                         <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">One-Time Fee</p>
                         <p class="text-4xl font-black text-black tracking-tight" v-if="item?.price > 0">${{ item?.price }}<span class="text-sm font-bold text-zinc-400">.00</span></p>
                         <p class="text-4xl font-black text-black tracking-tight" v-else>Free</p>
                      </div>
                   </div>

                   <button @click="buyItem" :disabled="isProcessing" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-[60px] rounded-[1.25rem] font-bold transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.4)] hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 relative overflow-hidden text-[15px]">
                     <span v-if="isProcessing" class="absolute inset-0 flex items-center justify-center bg-indigo-700"><svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></span>
                     <span v-else class="flex items-center gap-2">Buy This Asset Intantly</span>
                   </button>
                   
                   <!-- Premium Upsell Option -->
                   <div v-if="item?.isPremium && user?.plan !== 'PRO'" class="pt-3">
                     <p class="text-center text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-3 relative flex items-center justify-center before:bg-zinc-200 before:h-px before:flex-grow before:mr-4 after:bg-zinc-200 after:h-px after:flex-grow after:ml-4">Or The Better Deal</p>
                     
                     <button @click="subscribePro" :disabled="isProcessing" class="w-full bg-black text-white hover:bg-zinc-800 h-[60px] rounded-[1.25rem] font-bold transition-all flex items-center justify-between px-6 relative overflow-hidden group shadow-lg">
                       <!-- Shimmer effect -->
                       <div class="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"></div>
                       
                       <span class="flex items-center gap-2 text-[15px] z-20">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="text-amber-400" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          Unlock <b>All</b> Assets
                       </span>
                       <span class="text-amber-400 text-sm z-20">$149 <span class="text-zinc-500 line-through text-xs ml-1">$299</span></span>
                     </button>
                   </div>
                 </div>
                 
               </div>
            </div>
            
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
<style scoped>
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>