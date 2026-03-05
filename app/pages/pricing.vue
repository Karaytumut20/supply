<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '#imports'

useSeoMeta({ title: 'Pricing - Get Pro Access' })

const { data: user, refresh: refreshUser } = await useFetch('/api/auth/me', { key: 'auth-user', headers: useRequestHeaders(['cookie']) as HeadersInit })
const { addToast } = useToast()
const isUpgrading = ref(false)
const isYearly = ref(true)

const upgradePlan = async (targetPlan: 'PRO' | 'ULTIMATE') => {
  if(!user.value) {
    addToast('Lütfen önce giriş yapın.', 'error')
    window.location.href = '/sign-in'
    return
  }
  if(user.value.plan === targetPlan) {
    addToast(`Zaten ${targetPlan} üyesisiniz!`, 'info')
    return
  }
  if (user.value.plan === 'ULTIMATE') {
      addToast('Zaten en üst pakettesiniz.', 'info')
      return;
  }

  isUpgrading.value = true
  try {
    const res = await $fetch('/api/user/upgrade', { method: 'POST', body: { targetPlan } })
    addToast(res.message, 'success')
    await refreshUser()
    setTimeout(() => window.location.href = '/dashboard', 1500)
  } catch(e) {
    addToast('Yükseltme başarısız oldu.', 'error')
  } finally {
    isUpgrading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-6 relative overflow-hidden">
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black to-transparent pointer-events-none"></div>

    <div class="max-w-[1200px] mx-auto relative z-10 flex flex-col items-center">

      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Level up your <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">workflow.</span>
        </h1>
        <p class="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
          Choose the right plan for you. Get lifetime access to premium components or subscribe to unlock everything instantly.
        </p>
      </div>

      <div class="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-full mb-16 backdrop-blur-md">
        <button @click="isYearly = false" :class="!isYearly ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'" class="px-6 py-2 rounded-full text-sm font-bold transition-all">Monthly</button>
        <button @click="isYearly = true" :class="isYearly ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'" class="px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2">
          Yearly <span class="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:block">Save 20%</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl mx-auto">

        <div class="bg-white/5 border border-white/10 rounded-[2rem] p-10 flex flex-col backdrop-blur-md">
          <h3 class="text-2xl font-bold mb-2">Pay per component</h3>
          <p class="text-zinc-400 text-sm mb-8">Perfect for single projects and freelancers.</p>
          <div class="flex items-baseline gap-2 mb-8">
            <span class="text-5xl font-extrabold">Free</span>
            <span class="text-zinc-500">to join</span>
          </div>
          <ul class="space-y-4 mb-10 flex-1">
            <li class="flex items-center gap-3 text-zinc-300"><svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Browse all components</li>
            <li class="flex items-center gap-3 text-zinc-300"><svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Download free assets</li>
            <li class="flex items-center gap-3 text-zinc-300"><svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Pay individually for premium items</li>
            <li class="flex items-center gap-3 text-zinc-500"><svg class="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> No full library access</li>
          </ul>
          <NuxtLink to="/" class="w-full text-center bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold transition-all">Start Browsing</NuxtLink>
        </div>

        <div class="relative bg-gradient-to-b from-indigo-500/20 to-purple-500/5 border border-indigo-500/30 rounded-[2rem] p-10 flex flex-col shadow-2xl shadow-indigo-500/10 transform md:-translate-y-4 backdrop-blur-md">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg">Most Popular</div>
          <h3 class="text-2xl font-bold mb-2 text-white">All-Access Pro</h3>
          <p class="text-indigo-200/70 text-sm mb-8">For agencies and serious developers.</p>
          <div class="flex items-baseline gap-2 mb-8">
            <span class="text-5xl font-extrabold text-white">${{ isYearly ? '19' : '29' }}</span>
            <span class="text-indigo-300/60">/ month</span>
          </div>
          <ul class="space-y-4 mb-10 flex-1">
            <li class="flex items-center gap-3 text-indigo-50"><svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <strong class="text-white">Unlock all</strong> premium components</li>
            <li class="flex items-center gap-3 text-indigo-50"><svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Unlimited commercial projects</li>
            <li class="flex items-center gap-3 text-indigo-50"><svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> React, Vue & HTML source code</li>
            <li class="flex items-center gap-3 text-indigo-50"><svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Priority email support</li>
          </ul>

          <button v-if="user?.plan === 'PRO' || user?.plan === 'ULTIMATE'" disabled class="w-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 py-4 rounded-xl font-bold cursor-not-allowed">Active / Enrolled Plan</button>
          <button v-else @click="upgradePlan('PRO')" :disabled="isUpgrading" class="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70">
            {{ isUpgrading ? 'Processing...' : 'Upgrade to Pro' }}
          </button>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-[2rem] p-8 lg:p-10 flex flex-col backdrop-blur-md">
          <h3 class="text-2xl font-bold mb-2">Lifetime Ultimate</h3>
          <p class="text-zinc-400 text-sm mb-8">For enterprise teams and studios.</p>
          <div class="flex items-baseline gap-2 mb-8">
            <span class="text-5xl font-extrabold">$249</span>
            <span class="text-zinc-500">once</span>
          </div>
          <ul class="space-y-4 mb-10 flex-1">
            <li class="flex items-center gap-3 text-zinc-300"><svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <strong class="text-white">Lifetime access</strong> to everything</li>
            <li class="flex items-center gap-3 text-zinc-300"><svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Priority template requests</li>
            <li class="flex items-center gap-3 text-zinc-300"><svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 1-on-1 private support</li>
            <li class="flex items-center gap-3 text-zinc-300"><svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Multi-seat enterprise license</li>
          </ul>

          <button v-if="user?.plan === 'ULTIMATE'" disabled class="w-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 py-4 rounded-xl font-bold cursor-not-allowed">Active Plan</button>
          <button v-else @click="upgradePlan('ULTIMATE')" :disabled="isUpgrading" class="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-70">
            {{ isUpgrading ? 'Processing...' : (user?.plan === 'PRO' ? 'Upgrade to Ultimate' : 'Get Lifetime') }}
          </button>
        </div>

      </div>

      <!-- No Refunds Disclaimer -->
      <div class="mt-16 text-center w-full max-w-2xl mx-auto">
         <div class="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 inline-block backdrop-blur-sm">
            <p class="text-sm text-rose-200/80 leading-relaxed font-medium">
              <strong class="text-rose-400">Önemli İade Politikası:</strong> Premium dijital ürünlerin ve kaynak kodların anında erişime açılması nedeniyle, satın alımlardan sonra <strong class="text-white">kesinlikle iade (refund) yapılmamaktadır.</strong> Lütfen satın almadan önce projelerin demosunu inceleyiniz.
            </p>
         </div>
      </div>
    </div>
  </div>
</template>