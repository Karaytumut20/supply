<template>
  <footer class="bg-[#050505] text-white pt-24 pb-12 px-6 md:px-12 border-t border-zinc-900">
    <div class="max-w-[1600px] mx-auto">

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
        <div class="lg:col-span-2 flex flex-col gap-6">
          <NuxtLink to="/" class="font-bold text-2xl tracking-tight flex items-center gap-2 group">
            <div class="flex gap-1">
              <div class="w-4 h-4 rounded-full bg-blue-500"></div>
              <div class="w-4 h-4 bg-red-500" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
              <div class="w-4 h-4 bg-yellow-500"></div>
            </div>
            inspo<span class="text-zinc-500">.</span>
          </NuxtLink>
          <p class="text-zinc-400 text-sm max-w-sm leading-relaxed">
            The ultimate marketplace for developers and designers. Discover premium, production-ready web components and animations.
          </p>
          <div class="flex gap-4 mt-2">
            <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">𝕏</a>
            <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">In</a>
            <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">Gh</a>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-semibold text-white mb-2">Platform</h4>
          <NuxtLink to="/" class="text-zinc-400 hover:text-white text-sm transition-colors">Browse Components</NuxtLink>
          <NuxtLink to="/" class="text-zinc-400 hover:text-white text-sm transition-colors">Pricing</NuxtLink>
          <NuxtLink to="/" class="text-zinc-400 hover:text-white text-sm transition-colors">Submit Component <span class="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded ml-1">New</span></NuxtLink>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-semibold text-white mb-2">Resources</h4>
          <NuxtLink to="/" class="text-zinc-400 hover:text-white text-sm transition-colors">Documentation</NuxtLink>
          <NuxtLink to="/ticket" class="text-zinc-400 hover:text-white text-sm transition-colors">Help Center</NuxtLink>
          <NuxtLink to="/" class="text-zinc-400 hover:text-white text-sm transition-colors">Licensing</NuxtLink>
        </div>

        <div class="flex flex-col gap-4">
          <h4 class="font-semibold text-white mb-2">Company</h4>
          <NuxtLink to="/" class="text-zinc-400 hover:text-white text-sm transition-colors">About Us</NuxtLink>
          <NuxtLink to="/" class="text-zinc-400 hover:text-white text-sm transition-colors">Privacy Policy</NuxtLink>
          <NuxtLink to="/" class="text-zinc-400 hover:text-white text-sm transition-colors">Terms of Service</NuxtLink>
        </div>
      </div>

      <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
        <p>© 2026 Inspo Marketplace. All rights reserved.</p>
        <div class="flex items-center gap-2">
          <span>Secured by</span>
          <span class="font-bold text-white tracking-widest">STRIPE</span>
        </div>
      </div>
    </div>
  </footer>
</template>