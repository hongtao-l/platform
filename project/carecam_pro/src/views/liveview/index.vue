<template>
  <div class="liveview-page">
    <!-- 顶部栏 -->
    <TopBar
      :device-name="deviceName"
      @back="goBack"
      @settings="goToSettings"
    />

    <!-- 画面区 16:9 -->
    <div class="video-wrapper">
      <div class="video-panel">
        <div class="video-placeholder">
          <van-icon name="video" size="56" color="rgba(255,255,255,0.2)" />
          <span class="video-hint">实时画面</span>
        </div>
        <div class="video-overlay">
          <div class="quality-switch">
            <span
              v-for="q in qualities"
              :key="q.key"
              class="quality-item"
              :class="{ active: currentQuality === q.key }"
              @click="switchQuality(q.key)"
            >{{ q.label }}</span>
          </div>
          <van-icon name="expand-o" size="20" color="#fff" class="fullscreen-btn" @click="toggleFullscreen" />
        </div>

        <!-- 变焦滑块 -->
        <div class="zoom-slider">
          <van-icon name="add" size="14" color="rgba(255,255,255,0.6)" @click="zoomIn" />
          <div class="zoom-track" @click="onZoomTrackClick">
            <div class="zoom-fill" :style="{ height: zoomPercent + '%' }"></div>
            <div class="zoom-thumb" :style="{ bottom: zoomPercent + '%' }"></div>
          </div>
          <van-icon name="minus" size="14" color="rgba(255,255,255,0.6)" @click="zoomOut" />
        </div>
      </div>
    </div>

    <!-- 操作区（PTZ / 更多功能 / 子设备 互斥） -->
    <div class="content-area">
      <!-- PTZ 云台 -->
      <div v-if="activePanel === 'ptz'" class="ptz-wrapper">
        <PTZPanel
          :visible="true"
          @ptz="onPtz"
          @ptz-stop="onPtzStop"
          @ptz-center="onPtzCenter"
        />
      </div>

      <!-- 更多功能 -->
      <div v-else-if="activePanel === 'more'" class="more-panel">
        <div class="more-grid">
          <div
            v-for="fn in moreFunctions"
            :key="fn.key"
            class="more-btn"
            :class="{ active: fn.active }"
            @click="onMoreFn(fn)"
          >
            <div class="more-icon" :style="{ background: fn.active ? 'rgba(26,115,232,0.35)' : '' }">
              <van-icon :name="fn.icon" size="20" color="#fff" />
            </div>
            <span class="more-label">{{ fn.label }}</span>
          </div>
        </div>
      </div>

      <!-- 子设备列表 -->
      <div v-else-if="activePanel === 'subdevice'" class="subdevice-panel">
        <div class="subdevice-list">
          <div
            v-for="dev in subDevices"
            :key="dev.id"
            class="subdevice-card"
            @click="onSubDeviceDetail(dev)"
          >
            <div class="subdevice-icon" :class="dev.online ? 'online' : 'offline'">
              <van-icon name="circle" size="10" color="#fff" />
            </div>
            <div class="subdevice-info">
              <div class="subdevice-name">{{ dev.name }}</div>
              <div class="subdevice-meta">
                <span v-if="dev.value" class="subdevice-value">{{ dev.value }}</span>
                <span v-else class="subdevice-time">{{ dev.lastUpdate }}</span>
              </div>
            </div>
            <div class="subdevice-status">
              <span :class="['status-tag', dev.online ? 'on' : 'off']">
                {{ dev.online ? '在线' : '离线' }}
              </span>
            </div>
            <van-icon name="arrow" color="rgba(255,255,255,0.3)" size="14" />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div class="bottom-toolbar">
      <div
        v-for="btn in mainButtons"
        :key="btn.key"
        class="tool-btn"
        :class="{ active: btn.active }"
        @click="onToolbarAction(btn.key)"
      >
        <div class="tool-icon" :style="{ background: btn.active ? 'rgba(26,115,232,0.35)' : '' }">
          <van-icon :name="btn.icon" size="20" color="#fff" />
        </div>
        <span class="tool-label">{{ btn.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TopBar from '@/components/LiveView/TopBar.vue'
import PTZPanel from '@/components/LiveView/PTZPanel.vue'

const router = useRouter()
const route = useRoute()

const deviceName = ref(route.query.deviceName || '标准摄像机')
const deviceId = ref(route.query.deviceId || '')

const isFullscreen = ref(false)
const currentQuality = ref('hd')
const qualities = [
  { key: 'sd', label: '标清' },
  { key: 'hd', label: '高清' },
  { key: 'uhd', label: '超清' }
]

// 变焦
const zoomLevel = ref(1)
const zoomMin = 1
const zoomMax = 8
const zoomPercent = computed(() => ((zoomLevel.value - zoomMin) / (zoomMax - zoomMin)) * 100)

function zoomIn() { zoomLevel.value = Math.min(zoomMax, zoomLevel.value + 0.5) }
function zoomOut() { zoomLevel.value = Math.max(zoomMin, zoomLevel.value - 0.5) }
function onZoomTrackClick(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const pct = 1 - (e.clientY - rect.top) / rect.height
  zoomLevel.value = zoomMin + (zoomMax - zoomMin) * Math.max(0, Math.min(1, pct))
  zoomLevel.value = Math.round(zoomLevel.value * 2) / 2
}

function switchQuality(key) { currentQuality.value = key }
function toggleFullscreen() { isFullscreen.value = !isFullscreen.value }

// 操作区互斥：null / 'ptz' / 'more' / 'subdevice'
const activePanel = ref(null)
const isRecording = ref(false)
const lightModeIdx = ref(0)
const lightModes = ['关', '补光', '红外', '智能']

const moreFunctions = [
  { key: 'flip_h', label: '水平翻转', icon: 'exchange', active: false },
  { key: 'flip_v', label: '垂直翻转', icon: 'upgrade', active: false },
  { key: 'light_mode', label: '灯光模式', icon: 'bulb-o', active: lightModeIdx.value > 0 },
  { key: 'indicator', label: '指示灯', icon: 'circle', active: false },
  { key: 'detection', label: '人形侦测', icon: 'eye-o', active: false },
  { key: 'gps', label: 'GPS', icon: 'location-o', active: false },
  { key: 'preset', label: '预置位', icon: 'flag-o', active: false },
  { key: 'alarm', label: '一键报警', icon: 'warning-o', active: false }
]

const mainButtons = computed(() => [
  { key: 'ptz', label: 'PTZ', icon: 'guide-o', active: activePanel.value === 'ptz' },
  { key: 'intercom', label: '语音对讲', icon: 'phone-o', active: false },
  { key: 'subdevice', label: '子设备', icon: 'apps-o', active: activePanel.value === 'subdevice' },
  { key: 'playback', label: '回放', icon: 'clock-o', active: false },
  { key: 'record', label: '录制', icon: 'video-o', active: isRecording.value },
  { key: 'more', label: '更多功能', icon: 'more-o', active: activePanel.value === 'more' }
])

const subDevices = ref([
  { id: 'sub1', name: '温湿度传感器', type: 'temp_humidity', category: 'temp_humidity', online: true, value: '26°C / 58%', unit: '' },
  { id: 'sub2', name: '门磁', type: 'door', category: 'door', online: false, lastUpdate: '12:30' },
  { id: 'sub3', name: '烟雾传感器', type: 'smoke', category: 'smoke', online: true, value: '正常', unit: '' },
  { id: 'sub4', name: '燃气传感器', type: 'gas', category: 'gas', online: true, value: '正常', unit: '' },
  { id: 'sub5', name: '遥控器', type: 'remote', category: 'remote', online: true, value: '已配对', unit: '' },
  { id: 'sub6', name: '紧急按钮', type: 'emergency_button', category: 'emergency_button', online: true, value: '待命', unit: '' },
  { id: 'sub7', name: '水浸传感器', type: 'water_sensor', category: 'water_sensor', online: true, value: '正常', unit: '' },
  { id: 'sub8', name: '一氧化碳探测器', type: 'co_detector', category: 'co_detector', online: true, value: '安全', unit: '' },
  { id: 'sub9', name: '门铃', type: 'doorbell', category: 'doorbell', online: true, value: '待机', unit: '' },
  { id: 'sub10', name: '环境探测器', type: 'env_detector', category: 'env_detector', online: true, value: '优', unit: '' },
  { id: 'sub11', name: '红外对射', type: 'infrared_beam', category: 'infrared_beam', online: true, value: '正常', unit: '' },
  { id: 'sub12', name: '震动传感器', type: 'vibration', category: 'vibration', online: false, lastUpdate: '08:15' },
  { id: 'sub13', name: '玻璃破碎探测器', type: 'glass_break', category: 'glass_break', online: true, value: '正常', unit: '' },
  { id: 'sub14', name: '跌倒探测器', type: 'fall_detector', category: 'fall_detector', online: true, value: '正常监护中', unit: '' }
])

function onPtz(dir) { console.log('PTZ:', dir) }
function onPtzStop() { console.log('PTZ stop') }
function onPtzCenter() { console.log('PTZ center') }

function onToolbarAction(key) {
  if (key === 'ptz') {
    activePanel.value = activePanel.value === 'ptz' ? null : 'ptz'
  } else if (key === 'more') {
    activePanel.value = activePanel.value === 'more' ? null : 'more'
  } else if (key === 'subdevice') {
    activePanel.value = activePanel.value === 'subdevice' ? null : 'subdevice'
  } else if (key === 'record') {
    isRecording.value = !isRecording.value
  } else if (key === 'playback') {
    router.push({ path: '/playback', query: { deviceId: deviceId.value, deviceName: deviceName.value } })
  } else if (key === 'intercom') {
    console.log('Intercom pressed')
  }
}

function onMoreFn(fn) {
  switch (fn.key) {
    case 'flip_h': console.log('Horizontal flip'); break
    case 'flip_v': console.log('Vertical flip'); break
    case 'light_mode':
      lightModeIdx.value = (lightModeIdx.value + 1) % lightModes.length
      break
    case 'indicator': console.log('Indicator toggle'); break
    case 'detection': console.log('Detection toggle'); break
    case 'gps': console.log('GPS toggle'); break
    case 'preset': console.log('Preset positions'); break
    case 'alarm': console.log('Alarm triggered'); break
  }
}

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
    console.log('Sub device detail:', dev.name)
  }
}

function goBack() { router.back() }
function goToSettings() { router.push({ path: '/settings', query: { deviceId: deviceId.value, deviceName: deviceName.value } }) }
</script>

<style lang="scss" scoped>
.liveview-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000;
  overflow: hidden;
}

/* ===== 画面区 ===== */
.video-wrapper {
  flex-shrink: 0;
  padding-top: 20%;
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
  background: linear-gradient(135deg, #0d1b3e 0%, #1a3a6e 40%, #0f2744 70%, #162d50 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.video-hint {
  font-size: 12px;
  color: rgba(255,255,255,0.2);
  letter-spacing: 1px;
}

.video-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%);
}

.quality-switch {
  display: flex;
  gap: 4px;
  background: rgba(0,0,0,0.45);
  border-radius: 6px;
  padding: 3px;
}

.quality-item {
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;

  &.active {
    color: #fff;
    background: rgba(26,115,232,0.6);
  }
}

.fullscreen-btn {
  cursor: pointer;
  opacity: 0.7;
  &:active { opacity: 1; }
}

/* ===== 变焦滑块 ===== */
.zoom-slider {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: rgba(0,0,0,0.35);
  border-radius: 12px;
  z-index: 5;
}

.zoom-track {
  width: 3px;
  height: 80px;
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.zoom-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(255,255,255,0.35);
  border-radius: 2px;
}

.zoom-thumb {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #1A73E8;
  border: 2px solid #fff;
}

/* ===== 操作区 ===== */
.content-area {
  flex: 1;
  overflow-y: auto;
  background: #1A1A2E;
}

.ptz-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* 更多功能 */
.more-panel {
  padding: 12px 8px;
}

.more-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.more-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 6px 0;
}

.more-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s;
}

.more-btn:active .more-icon {
  transform: scale(0.92);
}

.more-label {
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  text-align: center;
}

/* 子设备 */
.subdevice-panel {
  padding: 8px 12px;
}

.subdevice-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.subdevice-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
  cursor: pointer;

  &:active {
    background: rgba(255,255,255,0.08);
  }
}

.subdevice-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.online {
    background: rgba(52,168,83,0.3);
  }
  &.offline {
    background: rgba(255,255,255,0.08);
  }
}

.subdevice-info {
  flex: 1;
}

.subdevice-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
}

.subdevice-meta {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  margin-top: 2px;
}

.status-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;

  &.on {
    background: rgba(52,168,83,0.2);
    color: #4ADE80;
  }
  &.off {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.35);
  }
}

/* ===== 底部工具栏 ===== */
.bottom-toolbar {
  display: flex;
  justify-content: space-around;
  background: #1A1A2E;
  padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
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
  transition: background .15s;
}

.tool-btn:active .tool-icon {
  transform: scale(0.92);
}

.tool-label {
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
}

.tool-btn.active .tool-label {
  color: rgba(255,255,255,0.9);
}
</style>
