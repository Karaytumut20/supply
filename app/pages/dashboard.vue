<script setup lang="ts">
const { data: user, pending } = await useFetch('/api/auth/me')
// Eger kullanici yoksa ana sayfaya at
if (!pending.value && !user.value) {
  if (typeof window !== 'undefined') window.location.href = '/sign-in'
}
const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/'
}
</script>
<template>
  <div v-if="user" class="min-h-screen bg-[#fafafa] pt-24 pb-12 px-6">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex justify-between items-end mb-10 border-b border-zinc-200 pb-6">
        <div>
          <h1 class="text-3xl font-bold text-black tracking-tight">Dashboard</h1>
          <p class="text-zinc-500 mt-1">Welcome back, {{ user.name }}. Manage your items here.</p>
          <div v-if="user.role === 'ADMIN'" class="mt-4">
            <NuxtLink to="/admin" class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border border-indigo-100 hover:bg-indigo-100 transition-colors">
              Go to Admin Panel ->
            </NuxtLink>
          </div>
        </div>
        <button @click="handleLogout" class="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-300 rounded-xl text-sm font-medium transition-colors text-black">
          Log Out
        </button>
      </div>
      <div class="text-zinc-500">Biletleriniz ve Favorileriniz buraya gelecek (Asama 3)...</div>
    </div>
  </div>
</template>