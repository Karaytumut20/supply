<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useToast } from '#imports'

const props = defineProps<{ isOpen: boolean, item: any }>()
const emit = defineEmits(['close'])
const { addToast } = useToast()

const activeTab = ref('overview')
const activeFramework = ref('react')
const selectedLicense = ref('STANDARD')

const close = () => {
    isProcessing.value = false
    activeTab.value = 'overview'
    selectedLicense.value = 'STANDARD'
    emit('close')
}

const { data: user, refresh: refreshUser } = await useFetch('/api/auth/me')

const hasPurchased = computed(() => user.value?.purchases?.some((p: any) => p.projectId === props.item?.id || p.id === props.item?.id))
const isFree = computed(() => !props.item?.price || props.item?.price <= 0)
const hasAccess = computed(() => user.value?.role === 'ADMIN' || (props.item?.isPremium && user.value?.plan === 'PRO') || isFree.value || hasPurchased.value)

const finalPrice = computed(() => {
  if (!props.item?.price) return 0
  return selectedLicense.value === 'COMMERCIAL' ? props.item.price * 3 : props.item.price
})

const isProcessing = ref(false)

const buyItem = async () => {
  if(!user.value) { addToast('Lütfen giriş yapın.', 'error'); window.location.href = '/sign-in'; return; }
  isProcessing.value = true;
  try {
    const res = await $fetch('/api/projects/purchase', { method: 'POST', body: { projectId: props.item.id, licenseType: selectedLicense.value } })
    await refreshUser();
    addToast('Ödeme başarılı! Kaynak kodlara erişebilirsiniz.', 'success')
    activeTab.value = 'code'
  } catch(e: any) { addToast(e.data?.statusMessage || 'Satın alma hatası', 'error') }
  finally { isProcessing.value = false }
}

const currentCode = computed(() => {
  if (activeFramework.value === 'react') return props.item?.sourceCodeReact || '// React code not provided.'
  if (activeFramework.value === 'vue') return props.item?.sourceCodeVue || ''
  if (activeFramework.value === 'html') return props.item?.sourceCodeHtml || ''
  return ''
})

const copyCode = async () => {
  await navigator.clipboard.writeText(currentCode.value)
  addToast(`${activeFramework.value.toUpperCase()} kodu kopyalandı!`, 'success')
}

const copyDeps = async () => {
  if(!props.item?.dependencies) return;
  await navigator.clipboard.writeText(`npm install ${props.item.dependencies}`)
  addToast('Kurulum komutu kopyalandı!', 'success')
}

const shareLink = async () => {
  const url = `${window.location.origin}/item/${props.item.id}`
  await navigator.clipboard.writeText(url)
  addToast('Bağlantı kopyalandı.', 'info')
}

const displayCategories = computed(() => {
  if(!props.item?.categories) return 'Component'
  if(Array.isArray(props.item.categories)) return props.item.categories.join(', ')
  return props.item.categories
})

watch(() => props.isOpen, (val) => {
  if (typeof document !== 'undefined') document.body.style.overflow = val ? 'hidden' : ''
})
onUnmounted(() => { if (typeof document !== 'undefined') document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-8">

        <div class="absolute inset-0 bg-black/80 backdrop-blur-2xl transition-opacity" @click="close"></div>

        <Transition enter-active-class="transition duration-700 ease-out delay-75" enter-from-class="opacity-0 translate-y-16 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100">
          <div v-if="isOpen" class="relative w-full max-w-[1300px] h-full md:h-[90vh] lg:h-[85vh] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/20">

            <div class="w-full lg:w-[55%] bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden aspect-video lg:aspect-auto lg:h-full shrink-0">
               <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 40px 40px;"></div>
               <div class="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
               <div class="w-full h-full relative flex flex-col items-center justify-center p-0 lg:p-12">
                 <div class="w-full lg:max-w-4xl relative lg:rounded-[1.5rem] overflow-hidden lg:shadow-[0_0_80px_rgba(0,0,0,0.4)] lg:ring-1 lg:ring-white/10 group">
                   <video :src="item?.video || item?.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover"></video>
                 </div>
               </div>
            </div>

            <div class="w-full lg:w-[45%] flex flex-col bg-white relative flex-1 min-h-0 lg:h-full">

               <div class="flex flex-wrap items-end sm:items-center justify-between border-b border-zinc-200 px-6 sm:px-8 pt-6 pb-0 gap-4 shrink-0 w-full">
                 <div class="flex gap-4 sm:gap-6">
                    <button @click="activeTab = 'overview'" :class="activeTab === 'overview' ? 'text-black border-black' : 'text-zinc-400 border-transparent hover:text-zinc-700'" class="pb-4 font-bold tracking-wide uppercase text-xs border-b-2 transition-colors whitespace-nowrap">Overview</button>
                    <button @click="activeTab = 'code'" :class="activeTab === 'code' ? 'text-black border-black' : 'text-zinc-400 border-transparent hover:text-zinc-700'" class="pb-4 font-bold tracking-wide uppercase text-xs border-b-2 transition-colors whitespace-nowrap">Source Code</button>
                 </div>

                 <div class="flex items-center gap-1 sm:gap-3 pb-4">
                   <a v-if="item?.demoUrl" :href="item.demoUrl" target="_blank" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2.5 sm:px-3 py-1.5 rounded-lg active:scale-95">
                     <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> <span class="hidden sm:block">Live Demo</span>
                   </a>

                   <button @click="shareLink" class="text-xs font-bold text-zinc-500 hover:text-black flex items-center gap-1.5 transition-colors bg-zinc-100 hover:bg-zinc-200 px-2.5 sm:px-3 py-1.5 rounded-lg active:scale-95">
                     <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> <span class="hidden sm:block">Share</span>
                   </button>

                   <div class="w-px h-4 bg-zinc-200 mx-1 sm:mx-2 hidden sm:block"></div>

                   <button @click="close" class="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-all active:scale-95 group focus:outline-none ml-1" title="Kapat">
                     <svg class="transform group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                   </button>
                 </div>
               </div>

               <div class="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[#fafafa]">
                   <div v-if="activeTab === 'overview'" class="animate-in fade-in slide-in-from-bottom-2">
                     <h2 class="text-3xl lg:text-4xl font-extrabold tracking-tight text-black mb-3">{{ item?.title }}</h2>
                     <p class="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-6">{{ displayCategories }}</p>

                     <p class="text-zinc-600 leading-relaxed font-medium mb-8">{{ item?.description || 'A highly polished digital asset providing production-ready code.' }}</p>

                     <div class="bg-white border border-zinc-200 rounded-2xl p-5 mb-8 shadow-sm">
                       <h4 class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">What's Included</h4>
                       <ul class="space-y-2">
                         <li class="flex items-center gap-2.5 text-sm text-zinc-700 font-medium"><svg class="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>React, Vue & HTML source code</li>
                         <li class="flex items-center gap-2.5 text-sm text-zinc-700 font-medium"><svg class="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>Lifetime updates & access</li>
                         <li class="flex items-center gap-2.5 text-sm text-zinc-700 font-medium"><svg class="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>Copy-paste ready, zero config</li>
                         <li v-if="item?.dependencies" class="flex items-center gap-2.5 text-sm text-zinc-700 font-medium"><svg class="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>Npm install command included</li>
                       </ul>
                     </div>

                     <div v-if="!hasAccess && !isFree" class="space-y-3 mb-8">
                       <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Select License</h4>
                       <div @click="selectedLicense = 'STANDARD'" :class="selectedLicense === 'STANDARD' ? 'border-black bg-zinc-50' : 'border-zinc-200 bg-white'" class="p-4 rounded-2xl border-2 cursor-pointer transition-all hover:border-zinc-300 relative">
                         <div class="flex justify-between items-center mb-1">
                           <h5 class="font-bold text-black">Standard License</h5>
                           <span class="font-black text-lg">${{ item?.price }}</span>
                         </div>
                         <p class="text-sm text-zinc-500">For a single personal or client project.</p>
                         
                       </div>

                       <div @click="selectedLicense = 'COMMERCIAL'" :class="selectedLicense === 'COMMERCIAL' ? 'border-indigo-600 bg-indigo-50/50' : 'border-zinc-200 bg-white'" class="p-4 rounded-2xl border-2 cursor-pointer transition-all hover:border-zinc-300 relative">
                         <div class="flex justify-between items-center mb-1">
                           <h5 class="font-bold text-indigo-900">Commercial / Extended</h5>
                           <span class="font-black text-lg text-indigo-700">${{ item?.price * 3 }}</span>
                         </div>
                         <p class="text-sm text-indigo-700/70">For unlimited projects, SaaS, or templates.</p>
                         
                       </div>
                     </div>
                   </div>

                   <div v-if="activeTab === 'code'" class="animate-in fade-in h-full flex flex-col">
                      <div v-if="!hasAccess" class="relative rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50 h-full flex flex-col items-center justify-center min-h-[300px]">
                        <div class="absolute inset-0 bg-white/40 backdrop-blur-sm z-10"></div>
                        <div class="relative z-20 text-center p-6">
                           <div class="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 mx-auto text-black">
                             <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                           </div>
                           <h4 class="font-bold text-xl mb-2 text-black">Premium Content</h4>
                           <p class="text-sm text-zinc-600 mb-6">Upgrade to PRO or purchase this item to unlock the React, Vue, and HTML source codes.</p>
                        </div>
                      </div>

                      <div v-else class="flex flex-col h-full gap-4">
                        <div v-if="item?.dependencies" class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm shrink-0">
                          <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">1. Install Dependencies</p>
                          <div class="flex items-center justify-between bg-[#f4f4f5] p-3 rounded-xl">
                            <code class="text-xs font-mono text-pink-600 font-medium select-all overflow-x-auto no-scrollbar whitespace-nowrap">npm i {{ item.dependencies }}</code>
                            <button @click="copyDeps" class="text-xs font-bold text-zinc-500 hover:text-black shrink-0 ml-4">Copy</button>
                          </div>
                        </div>

                        <div class="bg-[#0d0d0d] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col flex-1 min-h-[300px]">
                          <div class="flex items-center justify-between px-4 pt-2 bg-[#141414] border-b border-zinc-800 shrink-0">
                            <div class="flex gap-1 overflow-x-auto no-scrollbar">
                              <button @click="activeFramework = 'react'" :class="activeFramework === 'react' ? 'bg-[#1e1e1e] text-[#61dafb] border-t-2 border-t-[#61dafb]' : 'text-zinc-500 hover:text-zinc-300 border-t-2 border-t-transparent'" class="px-4 py-2 text-xs font-bold font-mono rounded-t-lg transition-colors whitespace-nowrap">React</button>
                              <button @click="activeFramework = 'vue'" :class="activeFramework === 'vue' ? 'bg-[#1e1e1e] text-[#41b883] border-t-2 border-t-[#41b883]' : 'text-zinc-500 hover:text-zinc-300 border-t-2 border-t-transparent'" class="px-4 py-2 text-xs font-bold font-mono rounded-t-lg transition-colors whitespace-nowrap">Vue</button>
                              <button @click="activeFramework = 'html'" :class="activeFramework === 'html' ? 'bg-[#1e1e1e] text-[#e34f26] border-t-2 border-t-[#e34f26]' : 'text-zinc-500 hover:text-zinc-300 border-t-2 border-t-transparent'" class="px-4 py-2 text-xs font-bold font-mono rounded-t-lg transition-colors whitespace-nowrap">HTML</button>
                            </div>
                            <button @click="copyCode" class="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md mb-1 shrink-0 ml-2">
                              <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Copy
                            </button>
                          </div>
                          <div class="p-6 overflow-y-auto text-[13px] font-mono leading-relaxed text-zinc-300 whitespace-pre-wrap flex-1 custom-scrollbar">
                             {{ currentCode }}
                          </div>
                        </div>
                      </div>
                   </div>
               </div>

               <div class="p-6 bg-white border-t border-zinc-200 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] relative z-30 shrink-0">
                 <div v-if="hasAccess">
                   <button @click="activeTab='code'" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-[56px] rounded-xl font-bold shadow-xl flex justify-center items-center gap-2 text-[15px] transition-transform active:scale-95 focus:ring-4 focus:ring-emerald-200">
                     <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> View Source Code
                   </button>
                 </div>
                 <div v-else>
                   <button @click="buyItem" :disabled="isProcessing" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-[56px] rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 text-[15px] transition-transform active:scale-95 focus:ring-4 focus:ring-indigo-200">
                     <span v-if="isProcessing">Simulating Checkout...</span>
                     <span v-else>Secure Checkout • ${{ finalPrice }}</span>
                   </button>
                 </div>
               </div>

            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
