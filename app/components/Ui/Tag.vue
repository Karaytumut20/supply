<script setup lang="ts">
const props = defineProps<{
  variant?: 'new' | 'hot' | 'offer' | 'default' | string
}>()

const variants: Record<string, string> = {
  new: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  hot: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  offer: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  default: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50 backdrop-blur-md'
}
</script>
<template>
  <span :class="cn('px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-md border', variants[variant || 'default'])">
    <slot />
  </span>
</template>
