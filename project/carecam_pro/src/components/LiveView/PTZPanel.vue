<template>
  <transition name="ptz-slide">
    <div v-if="visible" class="ptz-panel">
      <div class="ptz-pad">
        <div class="ptz-btn up" @touchstart.prevent="$emit('ptz', 'up')" @touchend.prevent="$emit('ptz-stop')">
          <van-icon name="arrow-up" size="28" color="#fff" />
        </div>
        <div class="ptz-btn left" @touchstart.prevent="$emit('ptz', 'left')" @touchend.prevent="$emit('ptz-stop')">
          <van-icon name="arrow-left" size="28" color="#fff" />
        </div>
        <div class="ptz-center" @click="$emit('ptz-center')">
          <van-icon name="add" size="32" />
        </div>
        <div class="ptz-btn right" @touchstart.prevent="$emit('ptz', 'right')" @touchend.prevent="$emit('ptz-stop')">
          <van-icon name="arrow" size="28" color="#fff" />
        </div>
        <div class="ptz-btn down" @touchstart.prevent="$emit('ptz', 'down')" @touchend.prevent="$emit('ptz-stop')">
          <van-icon name="arrow-down" size="28" color="#fff" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false }
})

defineEmits(['ptz', 'ptz-stop', 'ptz-center'])
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
