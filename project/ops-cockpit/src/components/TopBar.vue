<script setup>
defineProps({
  updatedAt: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['refresh'])
const navs = ['Dashboard', 'Fleet', 'Logistics', 'Analytics']
</script>

<template>
  <header
    class="flex justify-between items-center h-16 px-6 w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-[0_1px_0_0_rgba(255,255,255,0.06)]"
  >
    <div class="flex items-center gap-4">
      <div class="w-3 h-3 rounded-full bg-primary glow-bg animate-pulse"></div>
      <h1 class="text-headline-md font-bold tracking-tighter text-primary glow-text">运营驾驶舱</h1>
    </div>

    <nav
      class="hidden md:flex gap-6 absolute left-1/2 -translate-x-1/2 h-full items-center font-headline text-body-md font-medium tracking-wide"
    >
      <div
        v-for="(n, i) in navs"
        :key="n"
        :class="
          i === 0
            ? 'text-primary border-b-2 border-primary pb-1 h-full flex items-center shadow-[0_4px_12px_-2px_rgba(0,242,255,0.3)] cursor-pointer'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50 transition-colors duration-200 h-full flex items-center px-3 cursor-pointer'
        "
      >
        {{ n }}
      </div>
    </nav>

    <div class="flex items-center gap-4 text-sm font-data-num text-on-surface-variant">
      <span class="hidden lg:inline">数据更新于 {{ updatedAt }}</span>
      <button
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest text-primary transition-colors cursor-pointer active:scale-95"
        title="刷新"
        @click="emit('refresh')"
      >
        <span class="material-symbols-outlined text-[20px]" :class="{ 'animate-spin': loading }"
          >refresh</span
        >
      </button>
      <div class="hidden sm:flex gap-2 ml-2 text-on-surface-variant">
        <span class="material-symbols-outlined cursor-pointer hover:text-on-surface">notifications</span>
        <span class="material-symbols-outlined cursor-pointer hover:text-on-surface">settings</span>
        <span class="material-symbols-outlined cursor-pointer hover:text-on-surface">account_circle</span>
      </div>
    </div>
  </header>
</template>
