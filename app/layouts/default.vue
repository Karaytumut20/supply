<template>
  <div class="min-h-screen bg-white font-sans">
    <header class="absolute top-0 w-full z-50 px-6 py-5 flex items-center justify-end pointer-events-none">
      <div class="flex items-center gap-3 pointer-events-auto text-[13px] font-medium">
        <NuxtLink to="/ticket" class="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-zinc-300 transition-colors px-3 py-1.5 rounded-full flex items-center gap-2">
          Feedback <span class="opacity-50 font-mono text-[10px] border border-zinc-600 rounded-full w-3.5 h-3.5 flex items-center justify-center">?</span>
        </NuxtLink>
        <NuxtLink to="/about" class="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-zinc-300 transition-colors px-3 py-1.5 rounded-full flex items-center gap-2">
          About <span class="text-[9px] bg-zinc-600 text-white px-1.5 py-0.5 rounded uppercase tracking-widest">New</span>
        </NuxtLink>
        <NuxtLink to="/sign-in" class="bg-white hover:bg-zinc-200 text-black transition-colors px-4 py-1.5 rounded-full">
          Sign in
        </NuxtLink>
      </div>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
