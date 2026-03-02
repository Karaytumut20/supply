<script setup lang="ts">
import { watch, onUnmounted, ref } from 'vue'

const props = defineProps<{ isOpen: boolean; user?: any }>()
const emit = defineEmits(['close'])
const close = () => emit('close')

watch(() => props.isOpen, (val) => {
  if (typeof document !== 'undefined') document.body.style.overflow = val ? 'hidden' : ''
})

onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})

const isLoading = ref(false)

const handleSubscribe = async () => {
  if (!props.user) {
    navigateTo('/sign-in')
    return
  }
  
  isLoading.value = true
  try {
    // We would integrate Stripe/Checkout here
    // For now, let's mock the UI interaction
    await new Promise(r => setTimeout(r, 1000))
    alert('Stripe Checkout will be initialized here.')
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">

        <div class="absolute inset-0 bg-zinc-900/60 backdrop-blur-xl" @click="close"></div>

        <Transition enter-active-class="transition duration-500 ease-out delay-75" enter-from-class="opacity-0 translate-y-12 scale-95 rotate-1" enter-to-class="opacity-100 translate-y-0 scale-100 rotate-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0 scale-100" leave-to-class="opacity-0 translate-y-8 scale-95">
          <div v-if="isOpen" class="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.3)] border border-white/40 overflow-hidden flex flex-col md:flex-row">
            
            <button @click="close" class="absolute top-6 right-6 z-20 p-2.5 bg-white/10 hover:bg-white text-zinc-400 hover:text-black rounded-full transition-colors focus:outline-none mix-blend-difference group">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-90 transition-transform"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <!-- Left Premium Card -->
            <div class="w-full md:w-[45%] bg-black text-white p-10 md:p-12 relative overflow-hidden flex flex-col justify-between">
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-amber-500/20 z-0"></div>
              <div class="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMC41Ij48L3BhdGg+Cjwvc3ZnPg==')] z-0 mix-blend-overlay"></div>
              
              <div class="relative z-10">
                <div class="inline-block px-3 py-1 mb-8 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-bold tracking-widest uppercase text-amber-400 font-mono shadow-[0_0_20px_rgba(251,191,36,0.2)]">Premium Access</div>
                
                <h2 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">Elevate your<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">workflow.</span></h2>
                <p class="text-zinc-400 text-lg leading-relaxed font-light">Get unlimited access to the entire component library, premium templates, and advanced UI effects.</p>
              </div>

              <div class="relative z-10 mt-12 space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span class="text-zinc-200 font-medium">Over 200+ Premium Components</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 text-purple-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span class="text-zinc-200 font-medium">Ready-to-use Boilerplates</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span class="text-zinc-200 font-medium">Priority Support & Regular Updates</span>
                </div>
              </div>
            </div>

            <!-- Right Pricing -->
            <div class="w-full md:w-[55%] p-10 md:p-12 bg-white flex flex-col justify-center">
              <div class="mb-8">
                <h3 class="text-3xl font-bold text-zinc-900 mb-2">Lifetime Access</h3>
                <p class="text-zinc-500 font-light">Pay once, use forever. Next-level UI tools at your fingertips.</p>
              </div>

              <div class="bg-zinc-50 rounded-2xl border border-zinc-200/60 p-6 mb-8 relative">
                <div class="absolute -top-3 right-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">Most Popular</div>
                <div class="flex items-baseline gap-2 mb-2">
                  <span class="text-5xl font-bold tracking-tighter text-black">$149</span>
                  <span class="text-zinc-400 line-through decoration-zinc-300 font-medium">$299</span>
                </div>
                <p class="text-sm text-zinc-500">One-time payment. All inclusive.</p>
              </div>

              <button @click="handleSubscribe" :disabled="isLoading" class="w-full bg-black text-white hover:bg-zinc-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 py-4 rounded-xl font-bold text-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ user ? 'Unlock Pro Now' : 'Sign in to Unlock' }}
              </button>
              <p class="text-center text-xs text-zinc-400 mt-4 font-light">Secured via Stripe. 14-day money-back guarantee.</p>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
