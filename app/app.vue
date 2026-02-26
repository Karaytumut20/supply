<script setup>
useSeoMeta({
  titleTemplate: '%s - Inspo Clone',
  title: 'Home',
  description: 'The finest collection of website inspiration, curated at the component level.',
  ogType: 'website',
  ogTitle: 'Inspo Clone',
  ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
})
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="#000000" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
