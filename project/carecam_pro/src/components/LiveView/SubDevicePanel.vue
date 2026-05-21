<template>
  <van-popup
    :show="visible"
    position="bottom"
    round
    :style="{ maxHeight: '60vh' }"
    @update:show="$emit('update:visible', $event)"
  >
    <div class="subdevice-panel">
      <div class="panel-header">
        <span class="panel-title">子设备</span>
        <van-icon name="cross" size="18" color="#999" @click="$emit('update:visible', false)" />
      </div>

      <div class="panel-body" v-if="devices && devices.length">
        <template v-for="group in groupedDevices" :key="group.name">
          <div class="device-group">
            <span class="group-name">{{ group.name }}</span>
            <div
              class="device-row"
              v-for="dev in group.items"
              :key="dev.id"
              @click="$emit('detail', dev)"
            >
              <div class="device-info">
                <span class="device-icon">{{ getDeviceIcon(dev.type) }}</span>
                <div class="device-meta">
                  <span class="device-row-name">{{ dev.name }}</span>
                  <span class="device-status" :class="{ offline: !dev.online }">
                    {{ dev.online ? '● 在线' : '○ 离线' }}
                  </span>
                </div>
              </div>
              <div class="device-value" v-if="dev.online">
                <span v-if="dev.value !== null && dev.value !== undefined">{{ dev.value }}{{ dev.unit }}</span>
                <span v-else class="no-data">--</span>
              </div>
              <div class="device-value offline-time" v-else>
                {{ dev.lastUpdate || '--' }}
              </div>
              <van-icon name="arrow" size="14" color="#999" />
            </div>
          </div>
        </template>
      </div>

      <div class="panel-empty" v-else>
        <van-icon name="info-o" size="40" color="#ccc" />
        <span>暂无子设备</span>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  devices: { type: Array, default: () => [] }
})

defineEmits(['update:visible', 'detail'])

const DEVICE_GROUPS = {
  temp_humidity: { name: '环境传感器', icon: '🌡' },
  smoke: { name: '安防传感器', icon: '🚨' },
  door: { name: '安防传感器', icon: '🚪' },
  radar: { name: '安防传感器', icon: '📡' },
  other: { name: '其他', icon: '📟' }
}

const groupedDevices = computed(() => {
  const groups = {}
  for (const dev of props.devices) {
    const cat = dev.category || 'other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(dev)
  }
  return Object.entries(groups).map(([key, items]) => ({
    name: DEVICE_GROUPS[key]?.name || '其他',
    items
  }))
})

function getDeviceIcon(type) {
  return DEVICE_GROUPS[type]?.icon || '📟'
}
</script>

<style lang="scss" scoped>
.subdevice-panel {
  padding-bottom: env(safe-area-inset-bottom);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
}

.panel-body {
  padding: 8px 0;
}

.device-group {
  padding: 0 16px;

  .group-name {
    font-size: 12px;
    color: #999;
    padding: 8px 0 4px;
    display: block;
  }
}

.device-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;

  &:active { background: #fafafa; }
}

.device-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-icon {
  font-size: 22px;
}

.device-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.device-row-name {
  font-size: 14px;
  color: #1A1A2E;
}

.device-status {
  font-size: 11px;
  color: #16A34A;

  &.offline {
    color: #999;
  }
}

.device-value {
  font-size: 14px;
  color: #1A1A2E;
  font-weight: 500;
  margin-right: 6px;

  &.offline-time {
    font-size: 11px;
    color: #999;
    font-weight: 400;
  }
}

.no-data {
  color: #ccc;
}

.panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  gap: 10px;
  color: #999;
  font-size: 14px;
}
</style>
