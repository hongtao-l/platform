<template>
  <transition name="ptz-slide">
    <div v-if="visible" class="ptz-panel" :class="{ disabled }">
      <div class="ptz-pad">
        <div class="ptz-btn up" :class="{ disabled }" @touchstart.prevent="onBtn('up')" @touchend.prevent="$emit('ptz-stop')">
          <van-icon name="arrow-up" size="28" color="#fff" />
        </div>
        <div class="ptz-btn left" :class="{ disabled }" @touchstart.prevent="onBtn('left')" @touchend.prevent="$emit('ptz-stop')">
          <van-icon name="arrow-left" size="28" color="#fff" />
        </div>
        <div class="ptz-center" :class="{ disabled }" @click="onBtn('center')">
          <van-icon name="add" size="32" />
        </div>
        <div class="ptz-btn right" :class="{ disabled }" @touchstart.prevent="onBtn('right')" @touchend.prevent="$emit('ptz-stop')">
          <van-icon name="arrow" size="28" color="#fff" />
        </div>
        <div class="ptz-btn down" :class="{ disabled }" @touchstart.prevent="onBtn('down')" @touchend.prevent="$emit('ptz-stop')">
          <van-icon name="arrow-down" size="28" color="#fff" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { showToast } from 'vant'

const props = defineProps({
  visible: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['ptz', 'ptz-stop', 'ptz-center'])

function onBtn(dir) {
  if (props.disabled) {
    showToast({ message: '电量低，暂不可用', className: 'toast-compact' })
    return
  }
  if (dir === 'center') {
    emit('ptz-center')
  } else {
    emit('ptz', dir)
  }
}
</script>

<style lang="scss" scoped>
.ptz-panel {
  background: #1A1A2E;
  padding: 20px;
  border-radius: 12px 12px 0 0;
}

.ptz-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 10px;
  width: 180px;
  height: 180px;
  margin: 0 auto;
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

  &.disabled {
    opacity: 0.35;
    cursor: not-allowed;
    &:active { background: #2A2A40; }
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

  &.disabled {
    opacity: 0.35;
    cursor: not-allowed;
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
