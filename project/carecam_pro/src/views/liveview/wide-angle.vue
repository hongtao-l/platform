<template>
  <div class="wide-angle-page">
    <div class="video-viewport" ref="viewportRef">
      <!-- 32:9 超广角画布 -->
      <div
        class="video-canvas"
        :style="canvasTransform"
        @wheel.prevent="onWheel"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
        @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div class="video-feed">
          <van-icon name="video" size="40" color="rgba(255,255,255,0.2)" />
          <span class="video-hint">32:9 超广角</span>
        </div>
      </div>

      <!-- 全景小地图 -->
      <div v-if="zoom > 1.05" ref="minimapRef" class="panorama-minimap" :style="minimapPosStyle"
        @mousedown.stop="onMinimapDragStart" @mousemove.stop="onMinimapDragMove"
        @mouseup.stop="onMinimapDragEnd" @mouseleave.stop="onMinimapDragEnd"
        @touchstart.prevent.stop="onMinimapTouchStart" @touchmove.prevent.stop="onMinimapTouchMove"
        @touchend.prevent.stop="onMinimapDragEnd">
        <div class="minimap-frame">
          <div class="minimap-view-rect" :style="minimapRectStyle"></div>
        </div>
        <span class="minimap-label">全景</span>
      </div>

      <!-- 顶部栏 -->
      <TopBar :device-name="deviceName" :extra-text="zoomText" :show-signal="false"
        @back="goBack" @settings="goToSettings" />

      <!-- 全屏 -->
      <div v-if="fullscreenActive" class="fullscreen-overlay" @click="fullscreenActive = false">
        <div class="fullscreen-feed">
          <van-icon name="video" size="48" color="rgba(255,255,255,0.15)" />
        </div>
        <span class="fullscreen-hint">点击退出全屏</span>
      </div>
    </div>

    <!-- 底部功能区 -->
    <div class="bottom-area">
      <BottomToolbar :buttons="toolbarButtons" @action="onToolbarAction" />
    </div>

    <!-- 子设备面板 -->
    <SubDevicePanel v-model:visible="showSubDevices" :devices="subDevices" @detail="onSubDeviceDetail" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TopBar from '@/components/LiveView/TopBar.vue'
import BottomToolbar from '@/components/LiveView/BottomToolbar.vue'
import SubDevicePanel from '@/components/LiveView/SubDevicePanel.vue'

const router = useRouter()
const route = useRoute()

const deviceName = ref(route.query.deviceName || '广角摄像机')
const deviceId = ref(route.query.deviceId || '')

const qualities = [
  { key: 'sd', label: '标清' },
  { key: 'hd', label: '高清' },
  { key: 'uhd', label: '超清' }
]

const showSubDevices = ref(false)
const isRecording = ref(false)
const lightOn = ref(false)
const intercomOn = ref(false)
const fullscreenActive = ref(false)

const toolbarButtons = computed(() => [
  { key: 'intercom', label: '对讲', icon: 'phone-o', active: intercomOn.value },
  { key: 'zoom_mode', label: '变倍', icon: 'search', active: false },
  { key: 'playback', label: '回放', icon: 'clock-o', active: false },
  { key: 'more', label: '更多', icon: 'more-o', active: false },
  { key: 'record', label: '录制', icon: 'video-o', active: isRecording.value, extra: true },
  { key: 'subdevice', label: '子设备', icon: 'apps-o', active: false, extra: true },
  { key: 'snapshot', label: '截图', icon: 'photograph', active: false, extra: true },
  { key: 'light', label: '补光', icon: 'bulb-o', active: lightOn.value, extra: true },
])

function onToolbarAction(key) {
  switch (key) {
    case 'subdevice': showSubDevices.value = true; break
    case 'record': isRecording.value = !isRecording.value; break
    case 'light': lightOn.value = !lightOn.value; break
    case 'intercom': intercomOn.value = !intercomOn.value; break
    case 'playback': router.push({ path: '/playback', query: { deviceId: deviceId.value, deviceName: deviceName.value } }); break
    case 'snapshot': console.log('Snapshot'); break
    case 'zoom_mode': console.log('Zoom mode'); break
  }
}

function onSubDeviceDetail(dev) { console.log('Sub device detail:', dev) }

const subDevices = ref([
  { id: 'sub1', name: '温湿度传感器', type: 'temp_humidity', category: 'temp_humidity', online: true, value: '26°C / 58%', unit: '' },
  { id: 'sub2', name: '烟雾传感器', type: 'smoke', category: 'smoke', online: true, value: '正常', unit: '' },
])

// === 缩放/平移 ===
const viewportRef = ref(null)
const zoom = ref(1)
const panX = ref(0), panY = ref(0)
const viewportW = ref(375), viewportH = ref(400)
const videoW = computed(() => viewportW.value)
const videoH = computed(() => videoW.value * 9 / 32)

let isDragging = false, dragStartX = 0, dragStartY = 0, dragStartPanX = 0, dragStartPanY = 0
let pinchDist0 = 0, pinchZoom0 = 0

const zoomText = computed(() => zoom.value > 1.01 ? zoom.value.toFixed(1) + 'x' : '')

const canvasTransform = computed(() => ({
  transform: `translate(${-panX.value * zoom.value}px, ${-panY.value * zoom.value}px) scale(${zoom.value})`,
  transformOrigin: 'top left'
}))

const minimapX = ref(0), minimapY = ref(60)
let mmDragging = false, mmStartX = 0, mmStartY = 0, mmStartPosX = 0, mmStartPosY = 0

const minimapPosStyle = computed(() => ({ right: minimapX.value + 'px', top: minimapY.value + 'px' }))
const minimapRectStyle = computed(() => {
  const z = zoom.value
  return { left: (panX.value / videoW.value) * 100 + '%', top: (panY.value / videoH.value) * 100 + '%', width: (100 / z) + '%', height: (100 / z) + '%' }
})

const onMinimapDragStart = (e) => { mmDragging = true; mmStartX = e.clientX; mmStartY = e.clientY; mmStartPosX = minimapX.value; mmStartPosY = minimapY.value }
const onMinimapDragMove = (e) => { if (!mmDragging) return; minimapX.value = mmStartPosX - (e.clientX - mmStartX); minimapY.value = mmStartPosY + (e.clientY - mmStartY) }
const onMinimapDragEnd = () => { mmDragging = false }
const onMinimapTouchStart = (e) => { const t = e.touches[0]; mmDragging = true; mmStartX = t.clientX; mmStartY = t.clientY; mmStartPosX = minimapX.value; mmStartPosY = minimapY.value }
const onMinimapTouchMove = (e) => { if (!mmDragging) return; const t = e.touches[0]; minimapX.value = mmStartPosX - (t.clientX - mmStartX); minimapY.value = mmStartPosY + (t.clientY - mmStartY) }

const onWheel = (e) => {
  const z0 = zoom.value; const dz = -e.deltaY * 0.005
  const newZoom = Math.max(1, Math.min(8, z0 + dz * z0))
  const vx = panX.value + e.offsetX / z0; const vy = panY.value + e.offsetY / z0
  zoom.value = newZoom; panX.value = vx - e.offsetX / newZoom; panY.value = vy - e.offsetY / newZoom
}
const onMouseDown = (e) => { isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY; dragStartPanX = panX.value; dragStartPanY = panY.value }
const onMouseMove = (e) => { if (!isDragging) return; panX.value = dragStartPanX - (e.clientX - dragStartX) / zoom.value; panY.value = dragStartPanY - (e.clientY - dragStartY) / zoom.value }
const onMouseUp = () => { isDragging = false }
const onTouchStart = (e) => {
  if (e.touches.length === 2) { pinchDist0 = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); pinchZoom0 = zoom.value }
  else if (e.touches.length === 1) { isDragging = true; dragStartX = e.touches[0].clientX; dragStartY = e.touches[0].clientY; dragStartPanX = panX.value; dragStartPanY = panY.value }
}
const onTouchMove = (e) => {
  if (e.touches.length === 2) {
    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2; const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
    const r = dist / pinchDist0; const z = Math.max(1, Math.min(8, pinchZoom0 * r))
    const rect = viewportRef.value?.getBoundingClientRect()
    if (rect) { const z0 = zoom.value; const vx = panX.value + (cx - rect.left) / z0; const vy = panY.value + (cy - rect.top) / z0; zoom.value = z; panX.value = vx - (cx - rect.left) / z; panY.value = vy - (cy - rect.top) / z }
  } else if (e.touches.length === 1 && isDragging) { panX.value = dragStartPanX - (e.touches[0].clientX - dragStartX) / zoom.value; panY.value = dragStartPanY - (e.touches[0].clientY - dragStartY) / zoom.value }
}
const onTouchEnd = () => { isDragging = false }

const goBack = () => router.back()
const goToSettings = () => router.push({ path: '/settings', query: { deviceId: deviceId.value, deviceName: deviceName.value } })

let ro = null
onMounted(() => {
  if (viewportRef.value) {
    ro = new ResizeObserver(([e]) => { viewportW.value = e.contentRect.width; viewportH.value = e.contentRect.height })
    ro.observe(viewportRef.value)
  }
})
onUnmounted(() => { ro?.disconnect() })
</script>

<style lang="scss" scoped>
.wide-angle-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000;
  overflow: hidden;
}

.video-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #000;
}

.video-canvas {
  position: absolute; left: 0; width: 100%; top: 28%;
  aspect-ratio: 32 / 9;
  cursor: grab;
  &:active { cursor: grabbing; }
}

.video-feed, .fullscreen-feed {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #0d1b3e 0%, #1a3a6e 30%, #0f2744 60%, #162d50 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  border-top: 1px solid rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.video-hint { font-size: 11px; color: rgba(255,255,255,0.25); letter-spacing: 1px; }

.panorama-minimap {
  position: absolute; width: 80px;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
  border-radius: 6px; padding: 4px; z-index: 20; cursor: move;
}
.minimap-frame { width: 72px; aspect-ratio: 32/9; background: rgba(255,255,255,0.06); border-radius: 3px; position: relative; overflow: hidden; }
.minimap-view-rect { position: absolute; border: 1.5px solid #FF6B00; background: rgba(255,107,0,0.12); border-radius: 1px; }
.minimap-label { display: block; text-align: center; font-size: 9px; color: rgba(255,255,255,0.4); margin-top: 2px; }

.fullscreen-overlay {
  position: absolute; inset: 0; z-index: 50; background: #000;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
}
.fullscreen-hint { font-size: 12px; color: rgba(255,255,255,0.3); }

.bottom-area {
  flex-shrink: 0;
  background: #1A1A2E;
}
</style>
