<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useToast } from '#imports'

const props = defineProps<{ isOpen: boolean, item: any }>()
const emit = defineEmits(['close'])
const { addToast } = useToast()

const activeTab = ref('overview')

const close = () => {
    isProcessing.value = false
    activeTab.value = 'overview'
    emit('close')
}

const { data: user, refresh: refreshUser } = await useFetch('/api/auth/me')
const { data: reviews, pending: reviewsPending, refresh: refreshReviews } = await useFetch(() => props.item?.id ? `/api/projects/${props.item.id}/reviews` : null)

const reviewForm = ref({ rating: 5, comment: '' })
const isSubmittingReview = ref(false)

const averageRating = computed(() => {
  if(!reviews.value || reviews.value.length === 0) return props.item?.rating?.toFixed(1) || '5.0'
  const total = reviews.value.reduce((acc: number, r: any) => acc + r.rating, 0)
  return (total / reviews.value.length).toFixed(1)
})

// GÜVENLİ FORMATLAMA (String veya Array gelme durumuna karşı)
const displayTags = computed(() => {
  if(!props.item?.tags) return []
  if(Array.isArray(props.item.tags)) return props.item.tags
  return props.item.tags.split(',').map((t:string) => t.trim())
})

const displayCategories = computed(() => {
  if(!props.item?.categories) return 'Component'
  if(Array.isArray(props.item.categories)) return props.item.categories.join(', ')
  return props.item.categories
})

const hasAccess = computed(() => {
  if (!user.value) return false;
  if (user.value.role === 'ADMIN') return true;
  if (props.item?.isPremium && user.value.plan === 'PRO') return true;
  if (!props.item?.isPremium && props.item?.price === 0) return true;
  if (user.value.purchases?.includes(props.item?.id)) return true;
  return false;
})

const isProcessing = ref(false)

const buyItem = async () => {
  if(!user.value) return window.location.href = '/sign-in';
  isProcessing.value = true;
  try {
    await $fetch('/api/projects/purchase', { method: 'POST', body: { projectId: props.item.id } })
    await refreshUser();
    addToast('Başarıyla satın alındı.', 'success')
  } catch(e: any) { addToast(e.data?.statusMessage || 'Satın alma hatası', 'error') }
  finally { isProcessing.value = false }
}

const submitReview = async () => {
  if(!user.value) return window.location.href = '/sign-in';
  isSubmittingReview.value = true
  try {
    await $fetch(`/api/projects/${props.item.id}/reviews`, { method: 'POST', body: reviewForm.value })
    reviewForm.value = { rating: 5, comment: '' }
    await refreshReviews()
    addToast('Yorumunuz başarıyla eklendi!', 'success')
  } catch(e: any) {
    addToast(e.data?.message || 'Yorum eklenemedi.', 'error')
  } finally {
    isSubmittingReview.value = false
  }
}

const showCode = () => {
  if(props.item?.sourceCode) alert('SOURCE CODE:\n\n' + props.item.sourceCode)
  else if (props.item?.sourceUrl) window.open(props.item.sourceUrl, '_blank')
  else addToast('İndirme dosyası veya kod bulunamadı.', 'error')
}

watch(() => props.isOpen, (val) => {
  if (typeof document !== 'undefined') document.body.style.overflow = val ? 'hidden' : ''
  if(val) refreshReviews()
})
onUnmounted(() => { if (typeof document !== 'undefined') document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-8">

        <div class="absolute inset-0 bg-black/80 backdrop-blur-2xl transition-opacity" @click="close"></div>

        <Transition enter-active-class="transition duration-700 ease-out delay-75" enter-from-class="opacity-0 translate-y-16 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition duration-300" leave-from-class="opacity-100 translate-y-0 scale-100" leave-to-class="opacity-0 translate-y-8 scale-95">
          <div v-if="isOpen" class="relative w-full max-w-[1400px] h-full md:h-[90vh] lg:h-[85vh] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/20">

            <button @click="close" class="absolute top-6 right-6 z-50 p-3.5 bg-white/20 hover:bg-white/80 backdrop-blur-xl text-black rounded-full transition-all duration-300 shadow-lg border border-black/10 group focus:outline-none">
               <svg class="transform group-hover:rotate-90 transition-transform duration-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div class="w-full lg:w-[55%] bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden h-[45vh] lg:h-full shrink-0">
               <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 40px 40px;"></div>
               <div class="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>

               <div class="w-full h-full relative flex flex-col items-center justify-center p-6 lg:p-12">
                 <div class="w-full max-w-4xl relative rounded-[1.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)] ring-1 ring-white/10 group cursor-pointer" @click="hasAccess ? showCode() : null">
                   <video v-if="item?.video || item?.videoUrl" :src="item?.video || item?.videoUrl" autoplay loop muted playsinline class="w-full aspect-video md:aspect-[16/10] object-cover"></video>
                   <div v-else class="w-full aspect-video md:aspect-[16/10] bg-zinc-900 flex items-center justify-center text-zinc-600 font-mono text-sm">No Preview Available</div>

                   <div v-if="hasAccess" class="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
                      <div class="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> View Source
                      </div>
                   </div>
                 </div>
               </div>
            </div>

            <div class="w-full lg:w-[45%] flex flex-col bg-white relative h-[55vh] lg:h-full">

               <div class="flex px-8 pt-8 gap-6 border-b border-zinc-100 shrink-0">
                  <button @click="activeTab = 'overview'" :class="activeTab === 'overview' ? 'text-black border-black' : 'text-zinc-400 border-transparent hover:text-zinc-700'" class="pb-4 font-bold tracking-wide uppercase text-xs border-b-2 transition-colors">Overview</button>
                  <button @click="activeTab = 'reviews'" :class="activeTab === 'reviews' ? 'text-black border-black' : 'text-zinc-400 border-transparent hover:text-zinc-700'" class="pb-4 font-bold tracking-wide uppercase text-xs border-b-2 transition-colors flex items-center gap-1.5">
                    Reviews <span class="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[9px]">{{ reviews?.length || 0 }}</span>
                  </button>
               </div>

               <div class="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar bg-[#fafafa]">

                   <div v-if="activeTab === 'overview'" class="animate-in fade-in slide-in-from-bottom-2">
                     <div class="flex gap-2 mb-4">
                        <span v-for="tag in displayTags" :key="tag" class="bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase shadow-sm border border-zinc-200/50">{{ tag }}</span>
                     </div>

                     <h2 class="text-3xl lg:text-4xl font-extrabold tracking-tight text-black mb-3">{{ item?.title }}</h2>
                     <p class="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-6">{{ displayCategories }}</p>

                     <div class="flex items-center gap-2 mb-6">
                        <div class="flex text-amber-400">
                          <svg v-for="i in 5" :key="i" width="16" height="16" :class="i <= Math.round(Number(averageRating)) ? 'text-amber-400' : 'text-zinc-200'" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </div>
                        <span class="text-sm font-bold text-zinc-700">{{ averageRating }}</span>
                        <span class="text-xs text-zinc-400">({{ reviews?.length || 0 }} reviews)</span>
                     </div>

                     <div class="prose prose-sm prose-zinc mb-8">
                        <p class="text-zinc-600 leading-relaxed font-medium">{{ item?.description || 'Accelerate your development workflow. This highly polished digital asset provides production-ready code, beautiful structure, and fluid animations.' }}</p>
                     </div>
                   </div>

                   <div v-if="activeTab === 'reviews'" class="animate-in fade-in slide-in-from-bottom-2">
                      <div class="flex items-end justify-between mb-8 pb-6 border-b border-zinc-200">
                        <div>
                          <h3 class="text-3xl font-black text-black">{{ averageRating }}</h3>
                          <div class="flex text-amber-400 mt-1">
                            <svg v-for="i in 5" :key="i" width="14" height="14" :class="i <= Math.round(Number(averageRating)) ? 'text-amber-400' : 'text-zinc-200'" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          </div>
                          <p class="text-xs text-zinc-500 mt-1">Based on {{ reviews?.length || 0 }} reviews</p>
                        </div>
                        <button v-if="hasAccess" @click="activeTab = 'write_review'" class="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">Write Review</button>
                      </div>

                      <div v-if="reviewsPending" class="py-10 text-center text-sm text-zinc-400 animate-pulse">Loading reviews...</div>
                      <div v-else-if="!reviews?.length" class="py-10 text-center text-zinc-500 bg-white border border-zinc-200 rounded-2xl border-dashed">
                        <p class="text-sm font-medium">No reviews yet. Be the first to review this component!</p>
                      </div>
                      <div v-else class="space-y-6">
                         <div v-for="rev in reviews" :key="rev.id" class="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                           <div class="flex justify-between items-start mb-3">
                             <div class="flex items-center gap-3">
                               <div class="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-xs">{{ rev.user?.name?.charAt(0) || 'U' }}</div>
                               <div>
                                 <p class="text-sm font-bold text-zinc-900 leading-none">{{ rev.user?.name || 'Anonymous' }}</p>
                                 <p class="text-[10px] text-zinc-400 mt-1">{{ new Date(rev.createdAt).toLocaleDateString() }}</p>
                               </div>
                             </div>
                             <div class="flex text-amber-400">
                               <svg v-for="i in 5" :key="i" width="12" height="12" :class="i <= rev.rating ? 'text-amber-400' : 'text-zinc-200'" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                             </div>
                           </div>
                           <p class="text-sm text-zinc-600 leading-relaxed">{{ rev.comment }}</p>
                         </div>
                      </div>
                   </div>

                   <div v-if="activeTab === 'write_review'" class="animate-in fade-in slide-in-from-bottom-2">
                      <button @click="activeTab = 'reviews'" class="text-xs font-bold text-zinc-500 hover:text-black flex items-center gap-1 mb-6">Back to reviews</button>
                      <h3 class="text-xl font-bold text-black mb-6">Write a Review</h3>
                      <form @submit.prevent="submitReview" class="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
                         <div>
                           <label class="block text-sm font-semibold text-zinc-800 mb-2">Rating</label>
                           <select v-model="reviewForm.rating" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black">
                             <option value="5">5 - Excellent</option>
                             <option value="4">4 - Very Good</option>
                             <option value="3">3 - Average</option>
                             <option value="2">2 - Poor</option>
                             <option value="1">1 - Terrible</option>
                           </select>
                         </div>
                         <div>
                           <label class="block text-sm font-semibold text-zinc-800 mb-2">Review Comment</label>
                           <textarea v-model="reviewForm.comment" rows="4" placeholder="What did you like about this component?" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black resize-none"></textarea>
                         </div>
                         <button type="submit" :disabled="isSubmittingReview" class="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg disabled:opacity-50">
                           {{ isSubmittingReview ? 'Submitting...' : 'Post Review' }}
                         </button>
                      </form>
                   </div>
               </div>

               <div class="p-6 bg-white border-t border-zinc-200 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] relative z-30 shrink-0">
                 <div v-if="hasAccess">
                   <button @click="showCode" class="w-full bg-black hover:bg-zinc-800 text-white h-[56px] rounded-xl font-bold transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 text-[15px]">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> Get Source Code
                   </button>
                 </div>
                 <div v-else>
                   <button @click="buyItem" :disabled="isProcessing" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-[56px] rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 text-[15px]">
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