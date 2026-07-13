<script setup>
import { fixed } from '../utils/format.js'

defineProps({
  items: { type: Array, default: () => [] }
})

const cls = {
  primary: { fill: 'bg-primary glow-bg', text: 'text-primary' },
  secondary: { fill: 'bg-secondary', text: 'text-secondary' },
  tertiary: { fill: 'bg-tertiary', text: 'text-tertiary' }
}
// 转化率相对满量程（取 6% 为满格便于对比）
const FULL = 6
</script>

<template>
  <div class="panel p-4 flex flex-col gap-4 h-full">
    <h2 class="text-label-sm font-label text-on-surface-variant uppercase tracking-widest">
      运营位转化率对比
    </h2>
    <div class="flex-1 flex flex-col justify-center gap-6 py-4">
      <div v-for="s in items" :key="s.key" class="flex flex-col gap-1 w-full">
        <div class="flex justify-between text-xs text-on-surface">
          <span>{{ s.label }}</span>
          <span class="font-data-num" :class="cls[s.color].text">{{ fixed(s.rate, 1) }}%</span>
        </div>
        <div class="w-full h-2 bg-surface-container rounded-full overflow-hidden">
          <div
            class="h-full relative transition-all duration-500"
            :class="cls[s.color].fill"
            :style="{ width: Math.min(100, (s.rate / FULL) * 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
