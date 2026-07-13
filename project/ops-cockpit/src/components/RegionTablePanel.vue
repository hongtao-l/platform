<script setup>
import { money, int, fixed } from '../utils/format.js'

defineProps({
  rows: { type: Array, default: () => [] }
})

const barCls = {
  primary: 'bg-primary/10',
  secondary: 'bg-secondary/10',
  tertiary: 'bg-tertiary/10',
  warning: 'bg-warning/10'
}
const textCls = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  warning: 'text-warning'
}
const toneCls = {
  success: 'text-success',
  error: 'text-error',
  neutral: 'text-on-surface'
}
</script>

<template>
  <div class="panel p-4 flex flex-col gap-3">
    <h2 class="text-label-sm font-label text-on-surface-variant uppercase tracking-widest">
      区域指标对比
    </h2>
    <div class="w-full overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="text-on-surface-variant font-label border-b border-outline-variant">
            <th class="pb-2 font-normal">区域</th>
            <th class="pb-2 font-normal text-right">收入</th>
            <th class="pb-2 font-normal text-right">用户数</th>
            <th class="pb-2 font-normal text-right">转化率</th>
          </tr>
        </thead>
        <tbody class="font-data-num">
          <tr
            v-for="r in rows"
            :key="r.key"
            class="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-highest/30 transition-colors"
          >
            <td class="py-2 text-on-surface font-body">
              <span class="inline-flex items-center gap-1"
                >{{ r.label }}
                <span v-if="r.sim" class="text-[8px] font-label px-1 rounded sim-tag">SIM</span></span
              >
            </td>
            <td class="py-2 text-right relative">
              <div
                class="absolute inset-y-1 right-0 rounded z-0 transition-all duration-500"
                :class="barCls[r.color]"
                :style="{ width: r.barPct + '%' }"
              ></div>
              <span class="relative z-10" :class="textCls[r.color]">{{ money(r.revenue) }}</span>
            </td>
            <td class="py-2 text-right">{{ int(r.users) }}</td>
            <td class="py-2 text-right" :class="toneCls[r.convTone]">{{ fixed(r.conversion, 1) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
