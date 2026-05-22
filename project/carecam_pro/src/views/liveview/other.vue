<template>
  <div class="other-page">
    <!-- 顶部栏 -->
    <TopBar
      :device-name="deviceName"
      :show-signal="false"
      @back="goBack"
      @settings="goToSettings"
    />

    <!-- 画面区 -->
    <div class="video-section">
      <div class="video-panel">
        <div class="video-placeholder">
          <van-icon name="video" size="64" color="rgba(255,255,255,0.15)" />
          <span class="video-hint">{{ deviceTypeLabel }}</span>
          <span class="video-sub">{{ deviceName }}</span>
        </div>
      </div>

      <!-- 状态信息卡 -->
      <div class="status-card">
        <div class="status-row">
          <span class="status-key">设备类型</span>
          <span class="status-val">{{ deviceTypeLabel }}</span>
        </div>
        <div class="status-row">
          <span class="status-key">设备ID</span>
          <span class="status-val mono">{{ deviceId || '—' }}</span>
        </div>
        <div class="status-row">
          <span class="status-key">设备状态</span>
          <span class="status-val">
            <span class="status-dot online"></span>在线
          </span>
        </div>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div class="bottom-area">
      <BottomToolbar :buttons="toolbarButtons" @action="onToolbarAction" />
    </div>

    <!-- 子设备面板 -->
    <SubDevicePanel v-model:visible="showSubDevices" :devices="subDevices" @detail="onSubDeviceDetail" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getDeviceTypeLabel, DeviceType } from '@/utils/deviceType'
import TopBar from '@/components/LiveView/TopBar.vue'
import BottomToolbar from '@/components/LiveView/BottomToolbar.vue'
import SubDevicePanel from '@/components/LiveView/SubDevicePanel.vue'

const router = useRouter()
const route = useRoute()

const deviceName = ref(route.query.deviceName || '其他设备')
const deviceId = ref(route.query.deviceId || '')

const deviceTypeLabel = computed(() => getDeviceTypeLabel(DeviceType.OTHER))

const showSubDevices = ref(false)
const isRecording = ref(false)
const intercomOn = ref(false)

const toolbarButtons = computed(() => [
  { key: 'intercom', label: '对讲', icon: 'phone-o', active: intercomOn.value },
  { key: 'playback', label: '回放', icon: 'clock-o', active: false },
  { key: 'subdevice', label: '子设备', icon: 'apps-o', active: showSubDevices.value },
  { key: 'record', label: '录制', icon: 'video-o', active: isRecording.value, extra: true },
  { key: 'snapshot', label: '截图', icon: 'photograph', active: false, extra: true }
])

function onToolbarAction(key) {
  switch (key) {
    case 'subdevice': showSubDevices.value = !showSubDevices.value; break
    case 'record': isRecording.value = !isRecording.value; break
    case 'intercom': intercomOn.value = !intercomOn.value; break
    case 'playback': router.push({ path: '/playback', query: { deviceId: deviceId.value, deviceName: deviceName.value } }); break
    case 'snapshot': console.log('Snapshot'); break
  }
}

const subDevices = ref([
  { id: 'sub1', name: '遥控器', type: 'remote', category: 'remote', online: true, value: '已配对', unit: '' },
  { id: 'sub2', name: '紧急按钮', type: 'emergency_button', category: 'emergency_button', online: true, value: '待命', unit: '' },
  { id: 'sub3', name: '一氧化碳探测器', type: 'co_detector', category: 'co_detector', online: true, value: '安全', unit: '' },
  { id: 'sub4', name: '水浸传感器', type: 'water_sensor', category: 'water_sensor', online: true, value: '正常', unit: '' },
  { id: 'sub5', name: '门铃', type: 'doorbell', category: 'doorbell', online: true, value: '待机', unit: '' },
  { id: 'sub6', name: '环境探测器', type: 'env_detector', category: 'env_detector', online: true, value: '优', unit: '' },
  { id: 'sub7', name: '红外对射', type: 'infrared_beam', category: 'infrared_beam', online: true, value: '正常', unit: '' },
  { id: 'sub8', name: '震动传感器', type: 'vibration', category: 'vibration', online: false, lastUpdate: '08:15' },
  { id: 'sub9', name: '玻璃破碎探测器', type: 'glass_break', category: 'glass_break', online: true, value: '正常', unit: '' },
  { id: 'sub10', name: '跌倒探测器', type: 'fall_detector', category: 'fall_detector', online: true, value: '正常', unit: '' }
])

function onSubDeviceDetail(dev) {
  const routeMap = {
    temp_humidity: '/subdevice/temp-humidity',
    door: '/subdevice/door',
    smoke: '/subdevice/smoke',
    gas: '/subdevice/gas',
    remote: '/subdevice/remote',
    emergency_button: '/subdevice/emergency-button',
    co_detector: '/subdevice/co-detector',
    water_sensor: '/subdevice/water-sensor',
    doorbell: '/subdevice/doorbell',
    env_detector: '/subdevice/env-detector',
    infrared_beam: '/subdevice/infrared-beam',
    vibration: '/subdevice/vibration',
    glass_break: '/subdevice/glass-break',
    fall_detector: '/subdevice/fall-detector'
  }
  const path = routeMap[dev.category]
  if (path) {
    router.push({ path, query: { deviceId: dev.id, deviceName: dev.name } })
  } else {
    console.log('Sub device detail:', dev.name, dev.category)
  }
}

function goBack() { router.back() }
function goToSettings() { router.push({ path: '/settings', query: { deviceId: deviceId.value, deviceName: deviceName.value } }) }
</script>

<style lang="scss" scoped>
.other-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000;
  overflow: hidden;
}

.video-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.video-panel {
  width: 100%;
  aspect-ratio: 16 / 9;
  position: relative;
  background: #000;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #2d1a3e 40%, #1a1a2e 70%, #252550 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.video-hint {
  font-size: 14px;
  color: rgba(255,255,255,0.35);
  font-weight: 600;
}

.video-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.2);
}

/* 状态信息卡 */
.status-card {
  margin: 12px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-key {
  font-size: 12px;
  color: rgba(255,255,255,0.35);
}

.status-val {
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  display: flex;
  align-items: center;
  gap: 6px;

  &.mono {
    font-family: monospace;
    font-size: 12px;
  }
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;

  &.online { background: #4ADE80; }
}

/* 底部 */
.bottom-area {
  flex-shrink: 0;
  background: #1A1A2E;
}
</style>
