<script setup>
import { computed } from 'vue'
import { money, fixed } from '../utils/format.js'

const props = defineProps({
  items: { type: Array, default: () => [] },
  total: { type: Number, default: 0 }
})

const R = 40
const C = 2 * Math.PI * R // ≈ 251.33

const strokeHex = {
  primary: '#00F2FF',
  secondary: '#3E63DD',
  tertiary: '#7000FF',
  warning: '#FFB74D'
}
const dotCls = {
  primary: 'bg-primary glow-bg',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
  warning: 'bg-warning'
}
const textCls = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  warning: 'text-warning'
}

// 累积角度生成环形分段
const segments = computed(() => {
  let cum = 0
  return props.items.map((it) => {
    const arc = (it.percent / 100) * C
    const rotation = (cum / 100) * 360
    cum += it.percent
    return {
      ...it,
      stroke: strokeHex[it.color],
      dash: `${arc} ${C - arc}`,
      rotation
    }
  })
})
</script>

<template>
  <div class="panel p-4 flex flex-col items-center gap-4">
    <div class="w-full flex justify-start">
      <h2 class="text-label-sm font-label text-on-surface-variant uppercase tracking-widest">
        区域收入占比
      </h2>
    </div>
    <div class="relative w-36 h-36 flex items-center justify-center">
      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          fill="transparent"
          :r="R"
          stroke="rgba(255,255,255,0.06)"
          stroke-width="12"
        />
        <circle
          v-for="s in segments"
          :key="s.key"
          cx="50"
          cy="50"
          fill="transparent"
          :r="R"
          :stroke="s.stroke"
          :stroke-dasharray="s.dash"
          stroke-linecap="round"
          stroke-width="12"
          class="origin-center transition-all duration-700"
          :style="{ transform: `rotate(${s.rotation}deg)` }"
        />
      </svg>
      <div class="absolute flex flex-col items-center">
        <span class="text-[20px] font-data-num font-bold text-primary glow-text leading-none">{{
          money(total)
        }}</span>
      </div>
    </div>
    <div class="w-full grid grid-cols-2 gap-2 text-xs">
      <div v-for="s in items" :key="s.key" class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full" :class="dotCls[s.color]"></div>
        <span class="text-on-surface"
          >{{ s.label }}
          <span class="font-data-num ml-1" :class="textCls[s.color]">{{ fixed(s.percent, 0) }}%</span></span
        >
        <span v-if="s.sim" class="text-[8px] font-label px-1 rounded sim-tag">SIM</span>
      </div>
    </div>
  </div>
</template>
