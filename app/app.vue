<script setup>
useSeoMeta({
  titleTemplate: '%s - Inspo Clone',
  title: 'Home',
  description: 'Premium UI components and animations for developers.',
})
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="#000000" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UiToast />
  </div>
</template>