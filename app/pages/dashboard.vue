<script setup lang="ts">
useSeoMeta({ title: 'My Dashboard' })

const savedProjects = [
  { id: 1, title: 'Estrela Transitions', categories: 'Page Transition', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop' },
  { id: 2, title: 'Nexus Store', categories: 'Navigation', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop' }
]

const myTickets = [
  { id: 'TCK-001', subject: 'Account Upgrade', status: 'OPEN', date: 'Oct 24, 2025' },
  { id: 'TCK-002', subject: 'Bug Report in Hero component', status: 'CLOSED', date: 'Oct 20, 2025' }
]
</script>

<template>
  <div class="min-h-screen bg-[#fafafa] pt-24 pb-12 px-6">
    <div class="max-w-[1200px] mx-auto">

      <div class="flex justify-between items-end mb-10 border-b border-zinc-200 pb-6">
        <div>
          <h1 class="text-3xl font-bold text-black tracking-tight">Dashboard</h1>
          <p class="text-zinc-500 mt-1">Welcome back, John Doe. Manage your saved items and tickets here.</p>
        </div>
        <NuxtLink to="/" class="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-sm font-medium transition-colors">
          Log Out
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">

        <div class="lg:col-span-2">
          <h2 class="text-xl font-semibold mb-6">Saved Inspirations</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-for="proj in savedProjects" :key="proj.id" class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-4 group cursor-pointer">
              <div class="w-full aspect-video rounded-xl bg-zinc-100 overflow-hidden relative">
                 <img :src="proj.img" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
            <h2 class="text-xl font-semibold">My Tickets</h2>
            <NuxtLink to="/ticket" class="text-sm text-blue-600 hover:underline">New Ticket</NuxtLink>
          </div>
          <div class="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div v-for="ticket in myTickets" :key="ticket.id" class="p-5 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors cursor-pointer">
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-mono text-zinc-400">{{ ticket.id }}</span>
                <span :class="ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500'" class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                  {{ ticket.status }}
                </span>
              </div>
              <h3 class="font-medium text-black text-sm mb-1">{{ ticket.subject }}</h3>
              <p class="text-xs text-zinc-500">{{ ticket.date }}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
