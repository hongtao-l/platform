<template>
  <transition name="ptz-slide">
    <div v-if="visible" class="ptz-panel">
      <div class="ptz-title">云台控制</div>

      <div class="ptz-pad">
        <div class="ptz-btn up" @touchstart.prevent="$emit('ptz', 'up')" @touchend.prevent="$emit('ptz-stop')">
          <van-icon name="arrow-up" size="20" color="#fff" />
        </div>
        <div class="ptz-btn left" @touchstart.prevent="$emit('ptz', 'left')" @touchend.prevent="$emit('ptz-stop')">
          <van-icon name="arrow-left" size="20" color="#fff" />
        </div>
        <div class="ptz-center" @click="$emit('ptz-center')">
          <van-icon name="add" size="22" />
        </div>
        <div class="ptz-btn right" @touchstart.prevent="$emit('ptz', 'right')" @touchend.prevent="$emit('ptz-stop')">
          <van-icon name="arrow" size="20" color="#fff" />
        </div>
        <div class="ptz-btn down" @touchstart.prevent="$emit('ptz', 'down')" @touchend.prevent="$emit('ptz-stop')">
          <van-icon name="arrow-down" size="20" color="#fff" />
        </div>
      </div>

      <div class="zoom-control">
        <span class="zoom-label">变焦</span>
        <van-slider v-model="localZoom" :min="1" :max="10" @update:model-value="$emit('zoom', $event)" />
        <span class="zoom-value">{{ localZoom }}x</span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  zoomLevel: { type: Number, default: 1 }
})

const emit = defineEmits(['ptz', 'ptz-stop', 'ptz-center', 'zoom', 'update:zoomLevel'])

const localZoom = computed({
  get: () => props.zoomLevel,
  set: (v) => emit('update:zoomLevel', v)
})
</script>

<style lang="scss" scoped>
.ptz-panel {
  background: #1A1A2E;
  padding: 16px;
  border-radius: 12px 12px 0 0;
}

.ptz-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
  padding-left: 4px;
}

.ptz-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
  width: 130px;
  height: 130px;
  margin: 0 auto 16px;
}

.ptz-btn {
  background: #2A2A40;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;

  &:active {
    background: rgba(26, 115, 232, 0.3);
  }

  &.up { grid-column: 2; grid-row: 1; }
  &.left { grid-column: 1; grid-row: 2; }
  &.right { grid-column: 3; grid-row: 2; }
  &.down { grid-column: 2; grid-row: 3; }
}

.ptz-center {
  grid-column: 2;
  grid-row: 2;
  background: #1A73E8;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
}

.zoom-control {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 4px;
}

.zoom-label, .zoom-value {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  min-width: 28px;
}

.zoom-value {
  text-align: right;
}

:deep(.van-slider) {
  flex: 1;

  .van-slider__bar {
    background: #1A73E8;
  }
  .van-slider__button {
    width: 20px;
    height: 20px;
    background: #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }
}

.ptz-slide-enter-active,
.ptz-slide-leave-active {
  transition: all .25s ease;
}

.ptz-slide-enter-from,
.ptz-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
