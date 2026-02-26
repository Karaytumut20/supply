<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  as?: string | object
  to?: string
}>()

const component = computed(() => {
  if (props.to) return NuxtLink
  return props.as || 'button'
})

const baseClass = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:pointer-events-none text-sm px-4 py-2.5 rounded-xl'

const variants = {
  primary: 'bg-white text-black hover:bg-zinc-200',
  secondary: 'bg-zinc-800/80 text-white hover:bg-zinc-700',
  outline: 'border border-zinc-700/50 text-white hover:bg-zinc-800/50',
  ghost: 'text-zinc-400 hover:text-white hover:bg-zinc-800/50',
}
</script>
<template>
  <component :is="component" :to="to" :class="cn(baseClass, variants[variant || 'primary'], $attrs.class ?? '')">
    <slot />
  </component>
</template>
