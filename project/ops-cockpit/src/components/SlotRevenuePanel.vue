<script setup>
import { money } from '../utils/format.js'

defineProps({
  items: { type: Array, default: () => [] }
})

const cls = {
  primary: {
    bar: 'bg-gradient-to-t from-primary/10 to-primary/40 border-primary/50',
    cap: 'bg-primary glow-bg',
    text: 'text-primary glow-text-sm'
  },
  secondary: {
    bar: 'bg-gradient-to-t from-secondary/10 to-secondary/40 border-secondary/50',
    cap: 'bg-secondary',
    text: 'text-secondary'
  },
  tertiary: {
    bar: 'bg-gradient-to-t from-tertiary/10 to-tertiary/40 border-tertiary/50',
    cap: 'bg-tertiary',
    text: 'text-tertiary'
  }
}
</script>

<template>
  <div class="panel p-4 flex flex-col gap-4 h-full">
    <h2 class="text-label-sm font-label text-on-surface-variant uppercase tracking-widest">
      运营位收入排行
    </h2>
    <div
      class="flex-1 flex items-end justify-around pb-6 pt-4 chart-grid border-b border-l border-outline-variant relative px-4"
    >
      <div
        v-for="s in items"
        :key="s.key"
        class="flex flex-col items-center gap-2 relative group w-1/3"
      >
        <div
          class="absolute -top-8 font-data-num text-sm opacity-0 group-hover:opacity-100 transition-opacity"
          :class="cls[s.color].text"
        >
          {{ money(s.revenue) }}
        </div>
        <div
          class="w-10 border rounded-t-lg relative transition-all duration-500"
          :class="cls[s.color].bar"
          :style="{ height: Math.max(16, s.heightPct * 1.6) + 'px' }"
        >
          <div class="absolute top-0 w-full h-1 rounded-t-lg" :class="cls[s.color].cap"></div>
        </div>
        <span class="text-xs text-on-surface mt-2">{{ s.label }}</span>
      </div>
    </div>
  </div>
</template>
