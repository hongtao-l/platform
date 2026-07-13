<script setup>
import { money } from '../utils/format.js'

defineProps({
  items: { type: Array, default: () => [] }
})

const rankCls = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary'
}
const valCls = {
  primary: 'text-primary glow-text-sm',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary'
}
const fillCls = {
  primary: 'bg-primary glow-bg',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary'
}
</script>

<template>
  <div class="panel p-4 flex flex-col gap-3">
    <h2 class="text-label-sm font-label text-on-surface-variant uppercase tracking-widest">
      服务营收排行
    </h2>
    <div class="flex flex-col gap-3 mt-1">
      <div v-for="s in items" :key="s.key" class="flex items-center gap-3">
        <span class="font-data-num font-bold text-sm w-4" :class="rankCls[s.color]">{{ s.rank }}</span>
        <div class="flex flex-col flex-1 gap-1">
          <div class="flex justify-between text-xs text-on-surface">
            <span>{{ s.label }}</span>
            <span class="font-data-num" :class="valCls[s.color]">{{ money(s.revenue) }}</span>
          </div>
          <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              class="h-full relative transition-all duration-500"
              :class="fillCls[s.color]"
              :style="{ width: s.barPct + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
