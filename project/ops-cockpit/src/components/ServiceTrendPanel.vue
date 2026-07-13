<script setup>
import { computed } from 'vue'

const props = defineProps({
  // { labels: string[6], series: [{ key,label,color,points:number[6] }] }
  trend: { type: Object, default: () => ({ labels: [], series: [] }) }
})

const W = 100
const H = 40
const PAD_T = 4
const PAD_B = 4

const strokeHex = { primary: '#00F2FF', secondary: '#3E63DD', tertiary: '#7000FF' }
const dashArr = { primary: '0', secondary: '2 2', tertiary: '1 3' }
const legendCls = {
  primary: 'bg-primary glow-bg',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary'
}

const maxVal = computed(() => {
  let m = 0
  for (const s of props.trend.series || []) for (const p of s.points) m = Math.max(m, p)
  return m || 1
})

const paths = computed(() => {
  const series = props.trend.series || []
  return series.map((s) => {
    const n = s.points.length
    const pts = s.points.map((v, i) => {
      const x = n > 1 ? (i / (n - 1)) * W : 0
      const y = PAD_T + (1 - v / maxVal.value) * (H - PAD_T - PAD_B)
      return { x, y }
    })
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    return {
      key: s.key,
      color: s.color,
      stroke: strokeHex[s.color],
      dash: dashArr[s.color],
      d,
      last: pts[pts.length - 1] || { x: 0, y: 0 }
    }
  })
})
</script>

<template>
  <div class="panel p-4 flex flex-col gap-3 flex-1">
    <div class="flex justify-between items-center">
      <h2 class="text-label-sm font-label text-on-surface-variant uppercase tracking-widest">
        服务收入趋势
      </h2>
      <div class="flex gap-3 text-[10px] font-label text-on-surface-variant">
        <span v-for="s in trend.series" :key="s.key" class="flex items-center gap-1">
          <span class="w-2 h-0.5 rounded-full" :class="legendCls[s.color]"></span>{{ s.label }}
        </span>
      </div>
    </div>
    <div
      class="w-full flex-1 chart-grid border-l border-b border-outline-variant relative mt-1 min-h-0"
    >
      <svg
        class="absolute inset-0 w-full h-full overflow-visible"
        preserveAspectRatio="none"
        :viewBox="`0 0 ${W} ${H}`"
      >
        <path
          v-for="p in paths"
          :key="p.key"
          :d="p.d"
          fill="none"
          :stroke="p.stroke"
          :stroke-dasharray="p.dash"
          stroke-width="1.5"
          stroke-linejoin="round"
          stroke-linecap="round"
          :style="
            p.color === 'primary' ? 'filter: drop-shadow(0 0 4px rgba(0,242,255,0.4));' : ''
          "
        />
        <circle
          v-for="p in paths"
          :key="p.key + '-dot'"
          :cx="p.last.x"
          :cy="p.last.y"
          :fill="p.stroke"
          r="1.5"
        />
      </svg>
    </div>
    <div class="flex justify-between text-[10px] font-data-num text-on-surface-variant px-1">
      <span v-for="(l, i) in trend.labels" :key="i">{{ l }}</span>
    </div>
  </div>
</template>
