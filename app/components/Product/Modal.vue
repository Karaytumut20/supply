<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useToast } from '#imports'

const props = defineProps<{ isOpen: boolean, item: any }>()
const emit = defineEmits(['close'])
const close = () => { emit('close'); activeTab.value = 'overview' }

const { data: user } = await useFetch('/api/auth/me')
const { data: dashboardData, refresh: refreshDash } = await useFetch('/api/user/dashboard')
const { addToast } = useToast()

const activeTab = ref('overview')
const isSaving = ref(false)
const isPurchasing = ref(false)

const hasPurchased = computed(() => dashboardData.value?.purchases?.some((p: any) => p.id === props.item?.id))
const isFree = computed(() => !props.item?.price || props.item?.price <= 0)
const hasAccess = computed(() => user.value?.isPro || isFree.value || hasPurchased.value)

const copyCode = async () => {
  const code = `import { motion } from 'framer-motion'\n\nexport const ${props.item?.title.replace(/\s+/g,'')} = () => {\n  return (\n    <div className="flex flex-col">\n      {/* Premium Code Here */}\n    </div>\n  )\n}`
  await navigator.clipboard.writeText(code)
  addToast('Kopyalandı! Panoya eklendi.', 'success')
}

const purchaseProject = async () => {
  if (!user.value) { addToast('Lütfen önce giriş yapın.', 'error'); window.location.href = '/sign-in'; return; }
  isPurchasing.value = true;
  try {
    const res = await $fetch('/api/projects/purchase', { method: 'POST', body: { projectId: props.item.id } })
    addToast(res.message, 'success')
    await refreshDash()
  } catch(e: any) { addToast(e.data?.statusMessage || 'Hata!', 'error') }
  finally { isPurchasing.value = false }
}

const downloadSource = () => {
  if(props.item?.sourceUrl) window.open(props.item.sourceUrl, '_blank')
  else addToast('İndirme bağlantısı bulunamadı.', 'error')
}

watch(() => props.isOpen, (val) => { if (typeof document !== 'undefined') document.body.style.overflow = val ? 'hidden' : '' })
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-zinc-900/80 backdrop-blur-md" @click="close"></div>

        <Transition enter-active-class="transition duration-400 ease-out delay-75" enter-from-class="opacity-0 translate-y-8 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100">
          <div v-if="isOpen" class="relative w-full max-w-[1300px] bg-white rounded-[2rem] shadow-2xl flex flex-col lg:flex-row h-[90vh] lg:h-[85vh] overflow-hidden">

            <button @click="close" class="absolute top-6 right-6 z-30 p-2.5 bg-zinc-100 hover:bg-zinc-200 text-black rounded-full transition-colors">
               <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div class="w-full lg:w-[55%] bg-[#0a0a0a] p-4 lg:p-10 flex flex-col items-center justify-center relative">
               <div class="w-full relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                 <video autoplay loop muted playsinline class="w-full aspect-video object-cover"><source :src="item?.video" type="video/mp4" /></video>
               </div>
            </div>

            <div class="w-full lg:w-[45%] flex flex-col bg-white overflow-hidden">

               <div class="flex border-b border-zinc-200 px-8 pt-8 gap-6">
                 <button @click="activeTab = 'overview'" :class="activeTab === 'overview' ? 'border-black text-black' : 'border-transparent text-zinc-500'" class="pb-4 font-semibold border-b-2 hover:text-black transition-colors">Overview</button>
                 <button @click="activeTab = 'installation'" :class="activeTab === 'installation' ? 'border-black text-black' : 'border-transparent text-zinc-500'" class="pb-4 font-semibold border-b-2 hover:text-black transition-colors">Source Code</button>
               </div>

               <div class="flex-1 overflow-y-auto p-8">

                 <div v-show="activeTab === 'overview'" class="animate-in fade-in duration-300">
                    <h2 class="text-3xl font-bold tracking-tight text-black mb-3">{{ item?.title }}</h2>
                    <p class="text-zinc-600 leading-relaxed mb-8">{{ item?.description || 'Get full access to the source code of this beautiful component.' }}</p>

                    <div class="bg-[#f8f8f9] rounded-2xl p-6 mb-8 border border-zinc-200/60">
                      <div class="flex items-baseline gap-3 mb-4">
                        <span class="text-4xl font-extrabold text-black">${{ item?.price || '0.00' }}</span>
                        <span class="text-sm text-zinc-400 font-medium line-through" v-if="!isFree">${{ (item?.price * 1.5).toFixed(2) }}</span>
                        <span v-if="user?.isPro" class="ml-auto text-xs font-bold uppercase text-purple-600 bg-purple-100 px-2 py-1 rounded">Free for Pro</span>
                      </div>
                      <ul class="space-y-3 text-sm text-zinc-700 font-medium">
                        <li class="flex items-center gap-3">✅ 100% Source Code Access</li>
                        <li class="flex items-center gap-3">✅ Commercial License included</li>
                      </ul>
                    </div>
                 </div>

                 <div v-show="activeTab === 'installation'" class="animate-in fade-in duration-300 h-full flex flex-col">

                    <div v-if="!hasAccess" class="relative rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50 h-full flex flex-col">
                      <div class="p-6 blur-[6px] opacity-40 font-mono text-sm text-zinc-800 leading-relaxed select-none">
                        <span class="text-pink-600">import</span> { motion } <span class="text-pink-600">from</span> 'framer-motion'<br/><br/>
                        <span class="text-blue-600">export const</span> <span class="text-yellow-600">Component</span> = () => {<br/>
                        &nbsp;&nbsp;return &lt;div&gt;Hidden Source Code...&lt;/div&gt;<br/>}
                      </div>
                      <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/20 backdrop-blur-sm">
                         <div class="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 text-black">
                           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                         </div>
                         <h4 class="font-bold text-xl mb-2">Unlock Source Code</h4>
                         <p class="text-sm text-zinc-600 mb-6 max-w-xs">Purchase this component or subscribe to Pro to reveal the code.</p>
                         <button @click="purchaseProject" class="bg-black text-white px-6 py-3 rounded-xl font-medium shadow-md hover:bg-zinc-800 transition-colors">Unlock for ${{ item?.price }}</button>
                      </div>
                    </div>

                    <div v-else class="bg-[#0d0d0d] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col flex-1">
                      <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#141414]">
                        <div class="flex gap-2">
                          <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                          <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                          <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                        </div>
                        <button @click="copyCode" class="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1 rounded-md">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Copy Code
                        </button>
                      </div>
                      <div class="p-6 overflow-y-auto text-[13px] font-mono leading-relaxed flex-1">
                        <span class="text-[#ff7b72]">import</span> <span class="text-white">{</span> motion <span class="text-white">}</span> <span class="text-[#ff7b72]">from</span> <span class="text-[#a5d6ff]">'framer-motion'</span><br/><br/>
                        <span class="text-[#ff7b72]">export const</span> <span class="text-[#d2a8ff]">{{ item?.title.replace(/\s+/g,'') }}</span> = <span class="text-[#79c0ff]">()</span> <span class="text-[#ff7b72]">=></span> {<br/>
                        &nbsp;&nbsp;<span class="text-[#ff7b72]">return</span> (<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="text-[#7ee787]">div</span> <span class="text-[#79c0ff]">className</span>=<span class="text-[#a5d6ff]">"relative w-full h-full flex items-center..."</span>&gt;<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#8b949e]">{/* Full component source code */}</span><br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="text-[#7ee787]">motion.div</span><br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#79c0ff]">initial</span>=<span class="text-[#a5d6ff]">{{ opacity: 0, y: 20 }}</span><br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#79c0ff]">animate</span>=<span class="text-[#a5d6ff]">{{ opacity: 1, y: 0 }}</span><br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&gt;<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ready for production!<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span class="text-[#7ee787]">motion.div</span>&gt;<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span class="text-[#7ee787]">div</span>&gt;<br/>
                        &nbsp;&nbsp;)<br/>
                        }
                      </div>
                    </div>
                 </div>

               </div>

               <div v-if="!hasAccess && activeTab === 'overview'" class="p-6 border-t border-zinc-200 bg-white">
                 <button @click="purchaseProject" :disabled="isPurchasing" class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 disabled:opacity-70">
                   {{ isPurchasing ? 'Processing...' : 'Buy Now - $' + item?.price }}
                 </button>
               </div>
               <div v-else-if="hasAccess && activeTab === 'overview'" class="p-6 border-t border-zinc-200 bg-white">
                 <button @click="activeTab='installation'" class="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                   View Source Code
                 </button>
               </div>

            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>