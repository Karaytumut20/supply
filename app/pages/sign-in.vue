<script setup lang="ts">
useSeoMeta({ title: 'Sign In - Inspo Replica', description: 'Login to your account.' })
</script>
<template>
  <div class="flex items-center justify-center min-h-[75vh]">
    <div class="w-full max-w-md bg-zinc-900/50 p-10 rounded-[2.5rem] border border-white/5 text-center shadow-2xl shadow-black">
      <h1 class="text-3xl font-bold mb-3 tracking-tight">Welcome Back</h1>
      <p class="text-zinc-400 mb-8 font-light text-sm">Enter your details to sign in to your account.</p>

      <div class="flex flex-col gap-4 mb-8">
        <input type="email" placeholder="Email address" class="w-full bg-[#0c0c0c] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-shadow" />
        <input type="password" placeholder="Password" class="w-full bg-[#0c0c0c] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-shadow" />
      </div>

      <UiButton class="w-full py-4 mb-6 rounded-2xl text-base font-semibold shadow-lg shadow-white/5">Sign In</UiButton>
      <p class="text-sm text-zinc-500 font-medium">Don't have an account? <a href="#" class="text-white hover:underline decoration-white/30 underline-offset-4">Sign up</a></p>
    </div>
  </div>
</template>
