<template>
  <div class="liveview-page">
    <!-- 顶部栏 -->
    <TopBar
      :device-name="deviceName"
      @back="goBack"
      @settings="goToSettings"
    />

    <!-- 视频画面区：16:9 全宽 -->
    <div class="video-stage">
      <div class="video-panel">
        <div class="video-placeholder">
          <van-icon name="video" size="56" color="rgba(255,255,255,0.2)" />
          <span class="video-hint">实时画面</span>
        </div>

        <!-- 画面底部控件 -->
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
          <van-icon
            name="expand-o"
            size="20"
            color="#fff"
            class="fullscreen-btn"
            @click="toggleFullscreen"
          />
        </div>
      </div>
    </div>

    <!-- 底部功能区 -->
    <div class="bottom-area">
      <PTZPanel
        :visible="ptzActive"
        v-model:zoom-level="zoomLevel"
        @ptz="onPtz"
        @ptz-stop="onPtzStop"
        @ptz-center="onPtzCenter"
        @zoom="onZoom"
      />
      <BottomToolbar
        :buttons="toolbarButtons"
        @action="onToolbarAction"
      />
    </div>

    <!-- 子设备面板 -->
    <SubDevicePanel
      v-model:visible="showSubDevices"
      :devices="subDevices"
      @detail="onSubDeviceDetail"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TopBar from '@/components/LiveView/TopBar.vue'
import BottomToolbar from '@/components/LiveView/BottomToolbar.vue'
import PTZPanel from '@/components/LiveView/PTZPanel.vue'
import SubDevicePanel from '@/components/LiveView/SubDevicePanel.vue'

const router = useRouter()
const route = useRoute()

// 设备信息
const deviceName = ref(route.query.deviceName || '标准摄像机')
const deviceId = ref(route.query.deviceId || '')

// 视频状态
const isFullscreen = ref(false)
const currentQuality = ref('hd')
const qualities = [
  { key: 'sd', label: '标清' },
  { key: 'hd', label: '高清' },
  { key: 'uhd', label: '超清' }
]

// PTZ 状态
const ptzActive = ref(false)
const zoomLevel = ref(1)

// 子设备
const showSubDevices = ref(false)
const subDevices = ref([
  { id: 'sub1', name: '温湿度传感器', type: 'temp_humidity', category: 'temp_humidity', online: true, value: '26°C / 58%', unit: '' },
  { id: 'sub2', name: '门磁', type: 'door', category: 'door', online: false, lastUpdate: '12:30' },
])

const isRecording = ref(false)
const lightOn = ref(false)

// 工具栏按钮
const toolbarButtons = computed(() => [
  { key: 'intercom', label: '对讲', icon: 'phone-o', active: false },
  { key: 'ptz', label: '云台', icon: 'guide-o', active: ptzActive.value },
  { key: 'playback', label: '回放', icon: 'clock-o', active: false },
  { key: 'more', label: '更多', icon: 'more-o', active: false },
  { key: 'record', label: '录制', icon: 'video-o', active: isRecording.value, extra: true },
  { key: 'subdevice', label: '子设备', icon: 'apps-o', active: false, extra: true },
  { key: 'snapshot', label: '截图', icon: 'photograph', active: false, extra: true },
  { key: 'light', label: '补光', icon: 'bulb-o', active: lightOn.value, extra: true },
])

// PTZ 操作
function onPtz(dir) { console.log('PTZ:', dir) }
function onPtzStop() { console.log('PTZ stop') }
function onPtzCenter() { console.log('PTZ center') }
function onZoom(level) { console.log('Zoom:', level) }

function switchQuality(key) { currentQuality.value = key }
function toggleFullscreen() { isFullscreen.value = !isFullscreen.value }

function onToolbarAction(key) {
  switch (key) {
    case 'ptz': ptzActive.value = !ptzActive.value; break
    case 'subdevice': showSubDevices.value = true; break
    case 'record': isRecording.value = !isRecording.value; break
    case 'light': lightOn.value = !lightOn.value; break
    case 'playback': router.push({ path: '/playback', query: { deviceId: deviceId.value, deviceName: deviceName.value } }); break
    case 'intercom': console.log('Intercom'); break
    case 'snapshot': console.log('Snapshot'); break
  }
}

function onSubDeviceDetail(dev) { console.log('Sub device detail:', dev) }
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

.video-stage {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
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
  transition: all .15s;

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

.bottom-area {
  flex-shrink: 0;
  background: #1A1A2E;
}
</style>
