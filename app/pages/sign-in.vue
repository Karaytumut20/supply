<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

useSeoMeta({ title: 'Sign In' })
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  // Mock login for now -> Gerçek projede: await signIn('credentials', { email: email.value, password: password.value, callbackUrl: '/dashboard' })
  setTimeout(() => {
    isLoading.value = false
    router.push('/dashboard')
  }, 1000)
}
</script>

<template>
  <div class="min-h-screen flex bg-white">
    <div class="hidden lg:flex w-1/2 bg-[#0a0a0a] relative p-12 flex-col justify-between overflow-hidden">
      <div class="absolute inset-0 opacity-40 mix-blend-overlay overflow-hidden">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" class="w-full h-full object-cover animate-slow-pan" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
      <div class="relative z-10 flex gap-1.5 reveal-text">
        <div class="w-[20px] h-[20px] rounded-full bg-[#3b82f6]"></div>
        <div class="w-[20px] h-[20px] bg-[#ef4444]" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
        <div class="w-[20px] h-[20px] bg-[#eab308]"></div>
      </div>
      <div class="relative z-10">
        <h2 class="text-4xl lg:text-5xl font-medium text-white mb-6 tracking-tight leading-tight reveal-text delay-100">Start saving<br/>your inspiration.</h2>
        <p class="text-zinc-400 text-lg max-w-md font-light reveal-text delay-150">Join the community of creators. Collect your favorite web animations in one place.</p>
      </div>
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
      <NuxtLink to="/" class="absolute top-8 left-8 text-zinc-500 hover:text-black transition-colors flex items-center gap-2 text-sm font-medium">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Home
      </NuxtLink>

      <div class="w-full max-w-sm reveal-text delay-50">
        <h1 class="text-3xl font-bold tracking-tight text-black mb-2">Welcome back</h1>
        <p class="text-zinc-500 text-sm mb-8">Enter your details below to access your account.</p>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Email address</label>
            <input v-model="email" type="email" required placeholder="hello@example.com" class="w-full bg-[#f4f4f5] border border-transparent focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 rounded-xl px-4 py-3.5 text-black outline-none transition-all duration-200" />
          </div>
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-sm font-medium text-zinc-700">Password</label>
              <a href="#" class="text-xs text-zinc-500 hover:text-black transition-colors">Forgot password?</a>
            </div>
            <input v-model="password" type="password" required placeholder="••••••••" class="w-full bg-[#f4f4f5] border border-transparent focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 rounded-xl px-4 py-3.5 text-black outline-none transition-all duration-200" />
          </div>

          <button :disabled="isLoading" class="w-full bg-black text-white py-3.5 rounded-xl font-medium mt-2 hover:bg-zinc-800 transition-colors focus:ring-4 focus:ring-zinc-300 disabled:opacity-70 flex justify-center items-center h-[52px]">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
