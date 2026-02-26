<template>
  <footer class="bg-[#0a0a0a] text-white py-16 px-6 md:px-12 mt-12 border-t border-zinc-800">
    <div class="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

      <div class="flex flex-col gap-4">
        <div class="flex gap-1.5 items-center">
          <div class="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
          <div class="w-4 h-4 bg-[#ef4444]" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
          <div class="w-4 h-4 bg-[#eab308]"></div>
          <span class="font-bold text-lg ml-2 tracking-tight">inspo<span class="text-zinc-500">.clone</span></span>
        </div>
        <p class="text-zinc-500 text-sm max-w-xs">
          The finest collection of website inspiration, curated at the component level.
        </p>
      </div>

      <div class="flex gap-8 text-sm font-medium text-zinc-400">
        <NuxtLink to="/" class="hover:text-white transition-colors">Twitter</NuxtLink>
        <NuxtLink to="/" class="hover:text-white transition-colors">Instagram</NuxtLink>
        <NuxtLink to="/" class="hover:text-white transition-colors">Submit</NuxtLink>
      </div>

    </div>
  </footer>
</template>
