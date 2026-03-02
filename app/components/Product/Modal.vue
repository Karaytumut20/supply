<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useToast } from '#imports'

const props = defineProps<{ isOpen: boolean, item: any }>()
const emit = defineEmits(['close'])
const { addToast } = useToast()

const activeTab = ref('overview')
const activeFramework = ref('react') // 'react', 'vue', 'html'

const close = () => {
    isProcessing.value = false
    activeTab.value = 'overview'
    emit('close')
}

const { data: user, refresh: refreshUser } = await useFetch('/api/auth/me')
const { data: reviews, refresh: refreshReviews } = await useFetch(() => props.item?.id ? `/api/projects/${props.item.id}/reviews` : null)

// Related Products (Cross-sell)
const { data: allProjects } = await useFetch('/api/projects')
const relatedProducts = computed(() => {
  if(!allProjects.value || !props.item) return []
  return allProjects.value
    .filter((p:any) => p.id !== props.item.id && p.categories.includes(props.item.categories.split(',')[0]))
    .slice(0, 3) // Sadece 3 tane göster
})

const reviewForm = ref({ rating: 5, comment: '' })
const isSubmittingReview = ref(false)

const averageRating = computed(() => {
  if(!reviews.value || reviews.value.length === 0) return props.item?.rating?.toFixed(1) || '5.0'
  const total = reviews.value.reduce((acc: number, r: any) => acc + r.rating, 0)
  return (total / reviews.value.length).toFixed(1)
})

const displayTags = computed(() => props.item?.tags ? (Array.isArray(props.item.tags) ? props.item.tags : props.item.tags.split(',').map((t:string) => t.trim())) : [])
const displayCategories = computed(() => props.item?.categories ? (Array.isArray(props.item.categories) ? props.item.categories.join(', ') : props.item.categories) : 'Component')
const hasPurchased = computed(() => user.value?.purchases?.includes(props.item?.id))
const isFree = computed(() => !props.item?.price || props.item?.price <= 0)
const hasAccess = computed(() => user.value?.role === 'ADMIN' || (props.item?.isPremium && user.value?.plan === 'PRO') || isFree.value || hasPurchased.value)

const isProcessing = ref(false)
const buyItem = async () => { /* ... (önceki kodlarla aynı) */ }

const submitReview = async () => { /* ... (önceki kodlarla aynı) */ }

// YENI: Aktif Framework'e gore Kodu Goster
const currentCode = computed(() => {
  if (activeFramework.value === 'react') return props.item?.sourceCodeReact || props.item?.sourceCode || '// React code not provided.'
  if (activeFramework.value === 'vue') return props.item?.sourceCodeVue || props.item?.sourceCode || ''
  if (activeFramework.value === 'html') return props.item?.sourceCodeHtml || props.item?.sourceCode || ''
  return ''
})

const copyCode = async () => {
  await navigator.clipboard.writeText(currentCode.value)
  addToast(`${activeFramework.value.toUpperCase()} Code copied to clipboard!`, 'success')
}

watch(() => props.isOpen, (val) => {
  if (typeof document !== 'undefined') document.body.style.overflow = val ? 'hidden' : ''
  if(val) refreshReviews()
})
onUnmounted(() => { if (typeof document !== 'undefined') document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-8">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-2xl transition-opacity" @click="close"></div>

        <Transition enter-active-class="transition duration-700 ease-out delay-75" enter-from-class="opacity-0 translate-y-16 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100">
          <div v-if="isOpen" class="relative w-full max-w-[1400px] h-full md:h-[90vh] lg:h-[85vh] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/20">

            <button @click="close" class="absolute top-6 right-6 z-50 p-3.5 bg-white/20 hover:bg-white/80 backdrop-blur-xl text-black rounded-full transition-all shadow-lg border border-black/10 group">
               <svg class="transform group-hover:rotate-90 transition-transform duration-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div class="w-full lg:w-[55%] bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden h-[45vh] lg:h-full shrink-0">
               <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 40px 40px;"></div>

               <div class="w-full h-full relative flex flex-col items-center justify-center p-6 lg:p-12">
                 <div class="w-full max-w-4xl relative rounded-[1.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)] ring-1 ring-white/10 group">
                   <video :src="item?.video || item?.videoUrl" autoplay loop muted playsinline class="w-full aspect-video md:aspect-[16/10] object-cover"></video>
                 </div>
               </div>
            </div>

            <div class="w-full lg:w-[45%] flex flex-col bg-white relative h-[55vh] lg:h-full">

               <div class="flex px-8 pt-8 gap-6 border-b border-zinc-100 shrink-0">
                  <button @click="activeTab = 'overview'" :class="activeTab === 'overview' ? 'text-black border-black' : 'text-zinc-400 border-transparent hover:text-zinc-700'" class="pb-4 font-bold tracking-wide uppercase text-xs border-b-2 transition-colors">Overview</button>
                  <button @click="activeTab = 'code'" :class="activeTab === 'code' ? 'text-black border-black' : 'text-zinc-400 border-transparent hover:text-zinc-700'" class="pb-4 font-bold tracking-wide uppercase text-xs border-b-2 transition-colors">Source Code</button>
                  <button @click="activeTab = 'reviews'" :class="activeTab === 'reviews' ? 'text-black border-black' : 'text-zinc-400 border-transparent hover:text-zinc-700'" class="pb-4 font-bold tracking-wide uppercase text-xs border-b-2 transition-colors">Reviews ({{ reviews?.length || 0 }})</button>
               </div>

               <div class="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar bg-[#fafafa]">

                   <div v-if="activeTab === 'overview'" class="animate-in fade-in slide-in-from-bottom-2">
                     <h2 class="text-3xl lg:text-4xl font-extrabold tracking-tight text-black mb-3">{{ item?.title }}</h2>
                     <p class="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-6">{{ displayCategories }}</p>

                     <div class="prose prose-sm prose-zinc mb-8">
                        <p class="text-zinc-600 leading-relaxed font-medium">{{ item?.description || 'Accelerate your development workflow. This highly polished digital asset provides production-ready code.' }}</p>
                     </div>

                     <div v-if="relatedProducts.length > 0" class="mt-12 border-t border-zinc-200 pt-8">
                        <h4 class="text-sm font-bold text-zinc-900 mb-4">More from this category</h4>
                        <div class="grid grid-cols-2 gap-4">
                           <div v-for="rel in relatedProducts" :key="rel.id" class="bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm cursor-pointer group" @click="emit('open', rel)">
                              <video :src="rel.videoUrl" autoplay loop muted playsinline class="w-full aspect-video rounded-xl object-cover mb-2 group-hover:opacity-80 transition-opacity"></video>
                              <p class="text-xs font-bold text-black px-1 truncate">{{ rel.title }}</p>
                           </div>
                        </div>
                     </div>
                   </div>

                   <div v-if="activeTab === 'code'" class="animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col">
                      <div v-if="!hasAccess" class="relative rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50 h-full flex flex-col items-center justify-center">
                        <div class="absolute inset-0 bg-white/40 backdrop-blur-sm z-10"></div>
                        <div class="relative z-20 text-center p-6">
                           <div class="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 mx-auto text-black">
                             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                           </div>
                           <h4 class="font-bold text-xl mb-2 text-black">Premium Content</h4>
                           <p class="text-sm text-zinc-600 mb-6">Upgrade to PRO or purchase this item to unlock the React, Vue, and HTML source codes.</p>
                        </div>
                      </div>

                      <div v-else class="bg-[#0d0d0d] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col flex-1 h-[400px]">
                        <div class="flex items-center justify-between px-4 pt-2 bg-[#141414] border-b border-zinc-800">
                          <div class="flex gap-1">
                            <button @click="activeFramework = 'react'" :class="activeFramework === 'react' ? 'bg-[#1e1e1e] text-[#61dafb] border-t-2 border-t-[#61dafb]' : 'text-zinc-500 hover:text-zinc-300 border-t-2 border-t-transparent'" class="px-4 py-2 text-xs font-bold font-mono rounded-t-lg transition-colors">React</button>
                            <button @click="activeFramework = 'vue'" :class="activeFramework === 'vue' ? 'bg-[#1e1e1e] text-[#41b883] border-t-2 border-t-[#41b883]' : 'text-zinc-500 hover:text-zinc-300 border-t-2 border-t-transparent'" class="px-4 py-2 text-xs font-bold font-mono rounded-t-lg transition-colors">Vue</button>
                            <button @click="activeFramework = 'html'" :class="activeFramework === 'html' ? 'bg-[#1e1e1e] text-[#e34f26] border-t-2 border-t-[#e34f26]' : 'text-zinc-500 hover:text-zinc-300 border-t-2 border-t-transparent'" class="px-4 py-2 text-xs font-bold font-mono rounded-t-lg transition-colors">HTML</button>
                          </div>
                          <button @click="copyCode" class="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md mb-1">
                            Copy Code
                          </button>
                        </div>
                        <div class="p-6 overflow-y-auto text-[13px] font-mono leading-relaxed text-zinc-300 whitespace-pre-wrap flex-1 custom-scrollbar">
                           {{ currentCode }}
                        </div>
                      </div>
                   </div>

                   <div v-if="activeTab === 'reviews'" class="animate-in fade-in slide-in-from-bottom-2">
                     <p class="text-sm text-zinc-500 mb-4">Reviews will be shown here.</p>
                   </div>
               </div>

               <div class="p-6 bg-white border-t border-zinc-200 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] relative z-30 shrink-0">
                 <div v-if="hasAccess">
                   <button @click="activeTab='code'" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-[56px] rounded-xl font-bold transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 text-[15px]">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> View Source Code
                   </button>
                 </div>
                 <div v-else>
                   <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-[56px] rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 text-[15px]">
                     Buy for ${{ item?.price || 0 }}
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
<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
</style>