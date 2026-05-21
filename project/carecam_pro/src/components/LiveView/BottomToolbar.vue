<template>
  <div class="bottom-toolbar">
    <div class="toolbar-grid">
      <div
        v-for="btn in primaryButtons"
        :key="btn.key"
        class="tool-btn"
        :class="{ active: btn.active }"
        @click="onBtnClick(btn)"
      >
        <div class="tool-icon" :style="{ background: btn.active ? activeBg : '' }">
          <van-icon :name="btn.icon" size="20" color="#fff" />
        </div>
        <span class="tool-label">{{ btn.label }}</span>
      </div>
    </div>

    <div class="toolbar-grid toolbar-extra" v-show="showExtra && extraButtons.length">
      <div
        v-for="btn in extraButtons"
        :key="btn.key"
        class="tool-btn"
        :class="{ active: btn.active }"
        @click="onBtnClick(btn)"
      >
        <div class="tool-icon" :style="{ background: btn.active ? activeBg : '' }">
          <van-icon :name="btn.icon" size="20" color="#fff" />
        </div>
        <span class="tool-label">{{ btn.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  buttons: { type: Array, default: () => [] }
})

const emit = defineEmits(['action'])

const activeBg = 'rgba(26,115,232,0.35)'
const showExtra = ref(false)

const primaryButtons = computed(() => props.buttons.filter(b => !b.extra))
const extraButtons = computed(() => props.buttons.filter(b => b.extra))

function onBtnClick(btn) {
  if (btn.key === 'more') {
    showExtra.value = !showExtra.value
  }
  emit('action', btn.key)
}
</script>

<style lang="scss" scoped>
.bottom-toolbar {
  padding: 6px 8px;
  padding-bottom: calc(6px + env(safe-area-inset-bottom));
}

.toolbar-grid {
  display: flex;
  justify-content: space-around;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 10px 4px;
}

.toolbar-extra {
  margin-top: 6px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  min-width: 44px;
}

.tool-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background .15s;
}

.tool-btn:active .tool-icon {
  transform: scale(0.92);
}

.tool-label {
  font-size: 10px;
  color: rgba(255,255,255,0.6);
  white-space: nowrap;
}
</style>
