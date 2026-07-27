<template>
  <van-popup
    v-model:show="show"
    position="center"
    round
    :closeable="true"
    :close-on-click-overlay="false"
    :style="{ width: '300px', borderRadius: '16px', overflow: 'hidden' }"
    @click-close-icon="onDismiss"
  >
    <div class="upgrade-content">
      <div class="upgrade-icon-wrap">
        <div class="upgrade-icon">
          <van-icon name="upgrade" size="32" color="#fff" />
        </div>
      </div>
      <h3 class="upgrade-title">发现新版本 v{{ info?.version }}</h3>
      <div class="upgrade-log">
        <div class="upgrade-log-label">更新内容：</div>
        <pre class="upgrade-log-text">{{ info?.releaseNotes }}</pre>
      </div>
      <van-button round block type="primary" class="upgrade-btn" @click="onUpgrade">立即更新</van-button>
      <div class="upgrade-skip" @click="onDismiss">稍后提醒</div>
    </div>
  </van-popup>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  info: Object
})

const emit = defineEmits(['update:visible', 'upgrade', 'dismiss'])

const show = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

function onUpgrade() {
  emit('upgrade')
}

function onDismiss() {
  emit('dismiss')
}
</script>

<style lang="scss" scoped>
.upgrade-content {
  background: #fff;
  text-align: center;
  padding: 28px 20px 20px;
}

.upgrade-icon-wrap {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.upgrade-icon {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: linear-gradient(135deg, #1A73E8, #4FC3F7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upgrade-title {
  font-size: 17px;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 16px;
}

.upgrade-log {
  text-align: left;
  margin-bottom: 20px;
}

.upgrade-log-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.upgrade-log-text {
  font-size: 13px;
  color: #888;
  line-height: 1.7;
  max-height: 120px;
  overflow-y: auto;
  margin: 0;
  font-family: inherit;
  white-space: pre-wrap;
}

.upgrade-btn {
  height: 44px;
  font-size: 15px;
  margin-bottom: 4px;
}

.upgrade-skip {
  display: inline-block;
  padding: 10px 12px;
  font-size: 12px;
  color: #999;
  cursor: pointer;
}
</style>
