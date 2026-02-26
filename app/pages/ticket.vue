<script setup lang="ts">
useSeoMeta({ title: 'Support Ticket - Inspo Replica', description: 'Submit a support ticket.' })
</script>
<template>
  <div class="max-w-2xl py-12 mx-auto">
    <h1 class="text-4xl font-bold mb-8 text-center tracking-tight">Submit a Ticket</h1>
    <div class="bg-zinc-900/50 p-8 rounded-[2rem] border border-white/5 flex flex-col gap-5 shadow-2xl shadow-black/50">
      <input type="text" placeholder="Your Name" class="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-shadow" />
      <input type="email" placeholder="Email Address" class="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-shadow" />
      <textarea rows="5" placeholder="How can we help you?" class="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-shadow resize-none"></textarea>
      <UiButton class="w-full py-4 mt-2 rounded-xl text-base">Send Message</UiButton>
    </div>
  </div>
</template>
