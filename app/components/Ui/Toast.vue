<script setup lang="ts">
import { useToast } from '#imports'
const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id"
           class="pointer-events-auto flex items-center justify-between px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-medium min-w-[280px] backdrop-blur-md transition-all"
           :class="{
             'bg-emerald-50/90 text-emerald-800 border-emerald-200/50 shadow-emerald-500/10': toast.type === 'success',
             'bg-red-50/90 text-red-800 border-red-200/50 shadow-red-500/10': toast.type === 'error',
             'bg-white/90 text-zinc-800 border-zinc-200/50 shadow-black/5': toast.type === 'info'
           }">
        <div class="flex items-center gap-3">
          <svg v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <svg v-if="toast.type === 'error'" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          <svg v-if="toast.type === 'info'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>{{ toast.message }}</span>
        </div>
        <button @click="removeToast(toast.id)" class="ml-4 text-zinc-400 hover:text-zinc-800 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
.toast-move, .toast-enter-active, .toast-leave-active { transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.toast-enter-from { opacity: 0; transform: translateY(30px) scale(0.9); }
.toast-leave-to { opacity: 0; transform: translateY(20px) scale(0.9); }
.toast-leave-active { position: absolute; }
</style>