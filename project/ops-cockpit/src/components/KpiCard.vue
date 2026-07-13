<script setup>
// 通用 KPI 卡片
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  // 变化值（数字，正负决定箭头与配色）
  delta: { type: Number, default: null },
  compareLabel: { type: String, default: '同比' },
  // 主数值是否高亮（青色发光）
  highlight: { type: Boolean, default: false },
  // 底部附注（如“单用户平均收入”）
  note: { type: String, default: '' }
})
</script>

<template>
  <div class="panel p-5 flex flex-col justify-between h-28 relative overflow-hidden group anim-fade-up">
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
    ></div>
    <span class="text-label-sm font-label text-on-surface-variant uppercase tracking-widest z-10">{{
      label
    }}</span>
    <div
      class="text-[28px] font-data-num font-bold leading-none z-10 value-num"
      :class="highlight ? 'text-primary glow-text' : 'text-on-surface'"
    >
      {{ value }}
    </div>
    <div class="flex justify-between items-end w-full z-10">
      <div class="flex items-center gap-2 text-sm">
        <span
          v-if="delta !== null"
          class="flex items-center font-data-num text-xs"
          :class="delta >= 0 ? 'text-success' : 'text-error'"
        >
          <span class="material-symbols-outlined text-[14px]">{{
            delta >= 0 ? 'arrow_upward' : 'arrow_downward'
          }}</span>
          {{ Math.abs(delta).toFixed(1) }}%
        </span>
        <span class="text-on-surface-variant text-xs">{{ compareLabel }}</span>
      </div>
      <span v-if="note" class="text-on-surface-variant text-[10px]">{{ note }}</span>
    </div>
  </div>
</template>
