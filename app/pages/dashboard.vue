<script setup lang="ts">
useSeoMeta({ title: 'My Dashboard' })
const { data: user, pending: userPending } = await useFetch('/api/auth/me')
if (!userPending.value && !user.value) { if (typeof window !== 'undefined') window.location.href = '/sign-in' }
const { data: dashboardData, pending: dashPending } = await useFetch('/api/user/dashboard')
const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/'
}
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
<template>
  <div v-if="user" class="min-h-screen bg-[#fafafa] pt-24 pb-12 px-6">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex justify-between items-end mb-10 border-b border-zinc-200 pb-6">
        <div>
          <h1 class="text-3xl font-bold text-black tracking-tight">Dashboard</h1>
          <p class="text-zinc-500 mt-1">Welcome back, {{ user.name }}. Manage your saved items and tickets here.</p>
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
      <div v-if="dashPending" class="animate-pulse text-zinc-400">Loading your dashboard data...</div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div class="lg:col-span-2">
          <h2 class="text-xl font-semibold mb-6 text-black">Saved Inspirations ({{ dashboardData?.savedProjects?.length || 0 }})</h2>
          <div v-if="dashboardData?.savedProjects?.length === 0" class="p-8 bg-white rounded-2xl border border-zinc-200 text-zinc-500 text-center">
            You haven't saved any projects yet. Browse the homepage and bookmark your favorites!
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-for="proj in dashboardData.savedProjects" :key="proj.id" class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-4 group cursor-pointer">
              <div class="w-full aspect-video rounded-xl bg-zinc-100 overflow-hidden relative">
                <video :src="proj.videoUrl" autoplay loop muted playsinline class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></video>
              </div>
              <div>
                <h3 class="font-medium text-black">{{ proj.title }}</h3>
                <p class="text-sm text-zinc-500">{{ proj.categories }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-black">My Tickets</h2>
            <NuxtLink to="/ticket" class="text-sm text-blue-600 hover:underline">New Ticket</NuxtLink>
          </div>
          <div v-if="dashboardData?.tickets?.length === 0" class="p-6 bg-white rounded-2xl border border-zinc-200 text-zinc-500 text-center text-sm">
            No support tickets found.
          </div>
          <div v-else class="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div v-for="ticket in dashboardData.tickets" :key="ticket.id" class="p-5 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors cursor-pointer">
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-mono text-zinc-400">ID: {{ ticket.id.substring(0,8) }}</span>
                <span :class="ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500'" class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                  {{ ticket.status }}
                </span>
              </div>
              <h3 class="font-medium text-black text-sm mb-1">{{ ticket.subject }}</h3>
              <p class="text-xs text-zinc-500">{{ formatDate(ticket.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>