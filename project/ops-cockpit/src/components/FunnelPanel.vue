<script setup>
import { fixed, int } from '../utils/format.js'

defineProps({
  funnel: { type: Array, default: () => [] },
  stepRates: { type: Array, default: () => [] },
  overallRate: { type: Number, default: 0 },
  overallDelta: { type: Number, default: 1.2 },
  tabs: { type: Array, default: () => [] },
  activeTab: { type: String, default: 'mall' }
})
const emit = defineEmits(['tab'])

// 静态类名映射（保证 Tailwind JIT 能扫描到）
const cls = {
  primary: { bar: 'bg-primary/20 border-primary', fill: 'bg-primary', text: 'text-primary glow-text-sm' },
  secondary: { bar: 'bg-secondary/20 border-secondary', fill: 'bg-secondary', text: 'text-secondary' },
  tertiary: { bar: 'bg-tertiary/20 border-tertiary', fill: 'bg-tertiary', text: 'text-tertiary' },
  success: { bar: 'bg-success/20 border-success', fill: 'bg-success', text: 'text-success' }
}
</script>

<template>
  <div class="panel p-4 flex flex-col gap-4">
    <div class="flex justify-between items-center border-b border-outline-variant pb-3">
      <h2 class="text-label-sm font-label text-on-surface-variant uppercase tracking-widest">转化漏斗</h2>
      <div class="flex gap-4 text-sm font-label">
        <span
          v-for="t in tabs"
          :key="t.key"
          class="cursor-pointer transition-colors pb-1"
          :class="
            activeTab === t.key
              ? 'text-primary border-b border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          "
          @click="emit('tab', t.key)"
          >{{ t.label }}</span
        >
      </div>
    </div>

    <div
      class="relative py-6 flex justify-between items-center h-40 chart-grid rounded-lg border border-outline-variant px-8"
    >
      <template v-for="(s, i) in funnel" :key="s.key">
        <!-- 阶段柱 -->
        <div class="flex flex-col items-center z-10">
          <div
            class="w-12 rounded-t-lg relative flex items-end justify-center pb-2 border transition-all duration-500"
            :class="cls[s.color].bar"
            :style="{ height: s.heightPct * 1.1 + 'px' }"
          >
            <div
              class="w-full h-full absolute bottom-0 left-0 rounded-t-lg opacity-40"
              :class="cls[s.color].fill"
            ></div>
          </div>
          <span class="mt-4 text-on-surface-variant text-sm">{{ s.label }}</span>
          <span class="font-data-num font-bold" :class="cls[s.color].text">{{ int(s.value) }}</span>
        </div>

        <!-- 阶段间转化率 -->
        <div
          v-if="i < funnel.length - 1"
          class="flex flex-col items-center justify-center relative -top-6"
        >
          <div class="h-px w-16 bg-outline-variant absolute top-1/2 -z-10"></div>
          <span
            class="text-xs font-data-num text-on-surface-variant bg-surface-container px-2 py-1 rounded border border-outline-variant"
            >↓ {{ fixed(stepRates[i], 1) }}%</span
          >
        </div>
      </template>
    </div>

    <div
      class="flex justify-between items-center bg-surface-container-high rounded-lg p-3 px-4 border border-outline-variant"
    >
      <span class="text-sm text-on-surface"
        >整体转化率 <span class="font-data-num font-bold ml-2">{{ fixed(overallRate, 1) }}%</span></span
      >
      <span class="text-sm text-on-surface-variant flex items-center gap-2"
        >环比
        <span
          class="font-data-num text-xs flex items-center"
          :class="overallDelta >= 0 ? 'text-success' : 'text-error'"
          ><span class="material-symbols-outlined text-[14px]">{{
            overallDelta >= 0 ? 'arrow_upward' : 'arrow_downward'
          }}</span>
          {{ Math.abs(overallDelta).toFixed(1) }}%</span
        ></span
      >
    </div>
  </div>
</template>
