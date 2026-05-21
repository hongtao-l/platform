<template>
  <div class="top-bar">
    <div class="back-btn" @click="$emit('back')">
      <van-icon name="arrow-left" size="22" color="#fff" />
    </div>
    <span class="device-name">{{ deviceName }}</span>
    <div class="top-right">
      <span v-if="extraText" class="extra-text">{{ extraText }}</span>
      <div class="signal-strength" v-if="showSignal">
        <van-icon name="wifi" size="14" color="#fff" />
      </div>
      <van-icon name="setting-o" size="20" color="#fff" @click="$emit('settings')" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  deviceName: { type: String, default: '' },
  extraText: { type: String, default: '' },
  showSignal: { type: Boolean, default: true }
})

defineEmits(['back', 'settings'])
</script>

<style lang="scss" scoped>
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
  background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%);
}

.back-btn {
  cursor: pointer;
  flex-shrink: 0;
}

.device-name {
  flex: 1;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.extra-text {
  font-size: 11px;
  color: #fff;
  background: rgba(255,255,255,0.12);
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.signal-strength {
  display: flex;
  align-items: center;
}
</style>
