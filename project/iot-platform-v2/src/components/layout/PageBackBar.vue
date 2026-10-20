<template>
  <div class="flex items-center space-x-3 text-sm min-w-0">
    <button
      class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition-all hover:border-slate-300 flex-shrink-0"
      @click="$emit('back')"
    >
      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M10 19l-7-7m0 0l7-7m-7 7h18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
      </svg>
      <span>{{ backLabel }}</span>
    </button>
    <span class="h-4 w-px bg-slate-300 flex-shrink-0" />
    <h1 class="text-base font-semibold text-slate-900 tracking-tight flex-shrink-0">{{ title }}</h1>
    <span v-if="subtitle" class="text-xs text-slate-400 truncate">{{ subtitle }}</span>
    <div class="flex-1" />
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  backLabel: { type: String, default: '返回' }
})
defineEmits(['back'])
</script>
