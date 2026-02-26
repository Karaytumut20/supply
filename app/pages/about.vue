<script setup lang="ts">
useSeoMeta({ title: 'About - Inspo Replica', description: 'Learn more about this clone.' })
</script>
<template>
  <div class="max-w-3xl py-16">
    <h1 class="text-5xl font-bold mb-8 tracking-tight">About Us</h1>
    <p class="text-zinc-400 text-lg sm:text-xl leading-relaxed mb-8 font-light">
      This structure replicates the visual aesthetics and interaction rules of inspo.page. Engineered with Nuxt 3, Tailwind CSS v3.4, and custom Vue transitions to deliver a smooth, high-end browsing experience.
    </p>
    <UiButton as="NuxtLink" to="/" class="rounded-full px-6">Explore Templates</UiButton>
  </div>
</template>
