<script setup>
definePageMeta({
  layout: 'admin'
})

useSeoMeta({ title: 'Platform Analytics - Admin' })

const { data: dbStats } = await useFetch('/api/admin/stats')
</script>

<template>
  <div class="space-y-6 animate-in fade-in">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <p class="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Platform Revenue</p>
        <h3 class="text-4xl font-black text-emerald-600">${{ dbStats?.totalRevenue?.toFixed(2) || '0.00' }}</h3>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <p class="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Users</p>
        <h3 class="text-4xl font-black text-black">{{ dbStats?.usersCount || 0 }}</h3>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <p class="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Pro Subscribers</p>
        <h3 class="text-4xl font-black text-indigo-600">{{ dbStats?.proUsersCount || 0 }}</h3>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <p class="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Products</p>
        <h3 class="text-4xl font-black text-black">{{ dbStats?.projectsCount || 0 }}</h3>
      </div>
    </div>
  </div>
</template>