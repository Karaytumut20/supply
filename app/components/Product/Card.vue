<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToast } from '#imports'

const props = defineProps<{ item: any }>()
const emit = defineEmits(['open'])
const { addToast } = useToast()
const { data: user } = await useFetch('/api/auth/me', { key: 'auth-user', headers: useRequestHeaders(['cookie']) as HeadersInit })

const isFree = computed(() => !props.item.price || props.item.price <= 0)

// HATA ÇÖZÜMÜ: Categories Array mi String mi kontrol ediliyor
const displayCategory = computed(() => {
  if (!props.item.categories) return 'Component'
  if (Array.isArray(props.item.categories)) return props.item.categories[0] || 'Component'
  if (typeof props.item.categories === 'string') return props.item.categories.split(',')[0].trim()
  return 'Component'
})

const techList = computed(() => {
  if(!props.item.techStack) return []
  if(Array.isArray(props.item.techStack)) return props.item.techStack.slice(0, 2)
  return props.item.techStack.split(',').map((t:string)=>t.trim()).slice(0, 2)
})

const isNew = computed(() => {
  if (!props.item.createdAt) return false
  const age = Date.now() - new Date(props.item.createdAt).getTime()
  return age < 7 * 24 * 60 * 60 * 1000 // 7 days
})

const hasPurchased = computed(() => {
  if (!user.value?.purchases || !props.item?.id) return false;
  return user.value.purchases.some((p: any) => p.projectId === props.item.id || p.id === props.item.id);
})

const techColor = (tech: string) => {
  const t = tech.toLowerCase()
  if (t.includes('gsap')) return 'bg-green-50 text-green-700 border-green-200'
  if (t.includes('three')) return 'bg-blue-50 text-blue-700 border-blue-200'
  if (t.includes('react')) return 'bg-cyan-50 text-cyan-700 border-cyan-200'
  if (t.includes('vue')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (t.includes('webgl')) return 'bg-purple-50 text-purple-700 border-purple-200'
  return 'bg-zinc-100 text-zinc-600 border-zinc-200'
}

const isSaving = ref(false)
const quickSave = async (e: Event) => {
  e.stopPropagation()
  if(!user.value) { addToast('Lütfen önce giriş yapın.', 'error'); return; }
  isSaving.value = true
  try {
    const res = await $fetch('/api/projects/save', { method: 'POST', body: { projectId: props.item.id } })
    addToast(res.message || 'Başarıyla kaydedildi.', 'success')
  } catch(e) { addToast('Hata oluştu', 'error') }
  finally { isSaving.value = false }
}
</script>

<template>
  <div class="group flex flex-col cursor-pointer" @click="emit('open', item)">
    <div class="relative w-full aspect-[4/4.2] bg-[#f4f4f5] rounded-[32px] flex items-center justify-center p-6 sm:p-8 overflow-hidden transition-colors duration-300 group-hover:bg-[#ebebec]">
      <!-- NEW badge -->
      <div v-if="isNew && !hasPurchased" class="absolute top-5 left-5 z-30">
        <span class="bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest shadow-md">NEW</span>
      </div>
      <button v-else-if="!hasPurchased" @click="quickSave" class="absolute top-5 left-5 z-30 w-9 h-9 bg-white/90 backdrop-blur-md hover:bg-white text-zinc-400 hover:text-red-500 rounded-full shadow-sm border border-zinc-200/50 flex items-center justify-center transition-all active:scale-90" :disabled="isSaving">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
      </button>

      <div v-if="hasPurchased" class="absolute top-5 left-5 z-30">
        <span class="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-md flex items-center gap-1.5"><Icon name="lucide:check-circle" class="w-3.5 h-3.5"/> SAHİP</span>
      </div>

      <div class="absolute top-5 right-5 z-20">
        <span v-if="!isFree" class="bg-black/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide shadow-lg shadow-black/10">${{ item.price }}</span>
        <span v-else class="bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide shadow-lg shadow-emerald-500/20">Free</span>
      </div>

      <div class="w-full relative rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-black transform transition-transform duration-500 group-hover:scale-[1.04]">
         <video style="will-change: transform; transform: translateZ(0);" preload="metadata" autoplay loop muted playsinline class="w-full aspect-video object-cover pointer-events-none">
            <source :src="item.video || item.videoUrl" type="video/mp4" />
         </video>
         <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span class="bg-white/90 backdrop-blur-md text-black px-4 py-2 rounded-full text-xs font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">View Details</span>
         </div>
      </div>
    </div>

    <div class="flex justify-between items-start px-2 mt-4">
      <div class="flex flex-col min-w-0 flex-1">
        <h3 class="text-[17px] font-medium text-zinc-900 leading-tight group-hover:text-black transition-colors truncate">{{ item.title }}</h3>
        <div class="flex items-center gap-2 mt-1 text-[13px] text-zinc-500">
          <span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> {{ item.downloads || 0 }}</span>
          <span>•</span>
          <span class="truncate max-w-[100px]">{{ displayCategory }}</span>
        </div>
        <!-- Tech badges -->
        <div v-if="techList.length" class="flex gap-1.5 mt-2 flex-wrap">
          <span v-for="tech in techList" :key="tech" :class="techColor(tech)" class="px-2 py-0.5 rounded-full text-[10px] font-bold border">{{ tech }}</span>
        </div>
      </div>
    </div>
  </div>
</template>