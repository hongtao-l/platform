<script setup>
defineProps({
  regions: { type: Array, required: true },
  timeRanges: { type: Array, required: true },
  apps: { type: Array, required: true },
  filters: { type: Object, required: true },
  compareMode: { type: String, default: 'yoy' }
})
const emit = defineEmits(['region', 'time', 'app', 'compare'])
</script>

<template>
  <div
    class="px-6 py-4 flex flex-wrap gap-4 items-center border-b border-outline-variant bg-surface-container-lowest z-40 relative"
  >
    <!-- 区域 -->
    <div
      class="flex bg-surface-container rounded-lg p-1 border border-outline-variant text-label-sm font-label tracking-widest"
    >
      <button
        v-for="r in regions"
        :key="r.key"
        class="px-4 py-1.5 rounded-md transition-colors flex items-center gap-1"
        :class="
          filters.region === r.key
            ? 'bg-primary/10 text-primary glow-text-sm border border-primary/30'
            : 'text-on-surface-variant hover:text-on-surface border border-transparent'
        "
        @click="emit('region', r.key)"
      >
        {{ r.label }}
        <span v-if="r.sim" class="text-[8px] font-label px-1 rounded sim-tag">SIM</span>
      </button>
    </div>

    <!-- 时间 -->
    <div
      class="flex bg-surface-container rounded-lg p-1 border border-outline-variant text-label-sm font-label tracking-widest"
    >
      <button
        v-for="t in timeRanges"
        :key="t.key"
        class="px-4 py-1.5 rounded-md transition-colors"
        :class="
          filters.time === t.key
            ? 'bg-surface-container-high text-on-surface'
            : 'text-on-surface-variant hover:text-on-surface'
        "
        @click="emit('time', t.key)"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- 同比 / 环比 切换 -->
    <div
      class="flex items-center gap-2 bg-surface-container rounded-lg p-1 px-3 border border-outline-variant text-label-sm font-label cursor-pointer select-none"
      @click="emit('compare', compareMode === 'yoy' ? 'mom' : 'yoy')"
    >
      <span :class="compareMode === 'yoy' ? 'text-primary' : 'text-on-surface-variant'">同比</span>
      <div class="w-8 h-4 bg-primary/20 rounded-full relative border border-primary/30">
        <div
          class="absolute top-0.5 w-3 h-3 bg-primary rounded-full glow-bg transition-all duration-300"
          :class="compareMode === 'yoy' ? 'left-0.5' : 'right-0.5'"
        ></div>
      </div>
      <span :class="compareMode === 'mom' ? 'text-primary' : 'text-on-surface-variant'">环比</span>
    </div>

    <!-- APP -->
    <div
      class="flex bg-surface-container rounded-lg p-1 border border-outline-variant text-label-sm font-label tracking-widest ml-auto"
    >
      <button
        v-for="a in apps"
        :key="a.key"
        class="px-4 py-1.5 rounded-md transition-colors"
        :class="
          filters.app === a.key
            ? 'bg-primary/10 text-primary glow-text-sm border border-primary/30'
            : 'text-on-surface-variant hover:text-on-surface border border-transparent'
        "
        @click="emit('app', a.key)"
      >
        {{ a.label }}
      </button>
    </div>
  </div>
</template>
