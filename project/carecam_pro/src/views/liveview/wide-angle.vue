<template>
  <div class="wide-angle-page">
    <!-- 视频视口 -->
    <div class="video-viewport" ref="viewportRef">
      <!-- 32:9 超广角画面 -->
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

      <!-- 全景浮窗（放大后显示，可拖拽） -->
      <div
        v-if="zoom > 1.05"
        ref="minimapRef"
        class="panorama-minimap"
        :style="minimapPosStyle"
        @mousedown.stop="onMinimapDragStart"
        @mousemove.stop="onMinimapDragMove"
        @mouseup.stop="onMinimapDragEnd"
        @mouseleave.stop="onMinimapDragEnd"
        @touchstart.prevent.stop="onMinimapTouchStart"
        @touchmove.prevent.stop="onMinimapTouchMove"
        @touchend.prevent.stop="onMinimapDragEnd"
      >
        <div class="minimap-frame">
          <div class="minimap-view-rect" :style="minimapRectStyle"></div>
        </div>
        <span class="minimap-label">全景</span>
      </div>

      <!-- 顶部栏 -->
      <div class="top-bar">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" size="22" color="#fff" />
        </div>
        <span class="device-name">{{ deviceName }}</span>
        <div class="top-right">
          <span class="zoom-badge" v-if="zoom > 1.01">{{ zoomText }}</span>
          <van-icon name="setting-o" size="18" color="#fff" @click.stop="goToDeviceSettings" />
        </div>
      </div>

      <!-- 底部工具栏 -->
      <div class="bottom-toolbar">
        <!-- 第一行：常用功能 -->
        <div class="toolbar-row">
          <div class="tool-btn" @click="toggleLight">
            <div class="tool-icon" :style="{ background: lightOn ? 'rgba(255,107,0,0.35)' : '' }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/></svg>
            </div>
            <span class="tool-label">补光</span>
          </div>
          <div class="tool-btn" @click="toggleSiren">
            <div class="tool-icon" :style="{ background: sirenOn ? 'rgba(234,67,53,0.35)' : '' }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <span class="tool-label">警笛</span>
          </div>
          <div class="tool-btn" @click="toggleRecord">
            <div class="tool-icon" :style="{ background: isRecording ? 'rgba(234,67,53,0.35)' : '' }">
              <span class="record-dot" :class="{ active: isRecording }"></span>
            </div>
            <span class="tool-label">{{ isRecording ? '录像中' : '录像' }}</span>
          </div>
          <div class="tool-btn" @click="takeSnapshot">
            <div class="tool-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="1"/><circle cx="12" cy="12" r="3"/><path d="M3 8h2l1.5-2h11L19 8h2"/></svg>
            </div>
            <span class="tool-label">截图</span>
          </div>
          <div class="tool-btn" @click="toggleIntercom">
            <div class="tool-icon" :style="{ background: intercomOn ? 'rgba(26,115,232,0.35)' : '' }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <span class="tool-label">对讲</span>
          </div>

          <!-- 更多按钮 -->
          <div class="tool-btn" @click="showMoreRow = !showMoreRow">
            <div class="tool-icon" :style="{ background: showMoreRow ? 'rgba(255,255,255,0.18)' : '' }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <span class="tool-label">更多</span>
          </div>
        </div>

        <!-- 第二行：更多功能（点击"更多"展开） -->
        <div class="toolbar-row toolbar-extra" v-show="showMoreRow">
          <div class="tool-btn" @click="toggleZoomMode">
            <div class="tool-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M15 15l4 4"/><path d="M10 7v4H6M14 7v4h4"/></svg>
            </div>
            <span class="tool-label">变倍</span>
          </div>
          <div class="tool-btn" @click="toggleDirection">
            <div class="tool-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M8 8l-4 4 4 4M16 8l4 4-4 4"/></svg>
            </div>
            <span class="tool-label">水平</span>
          </div>
          <div class="tool-btn" @click="toggleVertical">
            <div class="tool-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M8 8l4-4 4 4M8 16l4 4 4-4"/></svg>
            </div>
            <span class="tool-label">垂直</span>
          </div>
          <div class="tool-btn" @click="goToPresets">
            <div class="tool-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span class="tool-label">预设位</span>
          </div>
          <div class="tool-btn" @click="togglePTZMode">
            <div class="tool-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
            </div>
            <span class="tool-label">云台</span>
          </div>
        </div>
      </div>
    </div>
    <!-- /video-viewport -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const deviceName = ref(route.query.deviceName || 'Camera_01')

// === 视频缩放/平移 ===
const viewportRef = ref(null)
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const viewportW = ref(375)
const viewportH = ref(400)
const videoW = computed(() => viewportW.value)
const videoH = computed(() => videoW.value * 9 / 32)

// 拖拽状态
let isDragging = false
let dragStartX = 0, dragStartY = 0, dragStartPanX = 0, dragStartPanY = 0
let pinchDist0 = 0, pinchZoom0 = 0

const zoomText = computed(() => zoom.value.toFixed(1) + 'x')

const canvasTransform = computed(() => ({
  transform: `translate(${-panX.value * zoom.value}px, ${-panY.value * zoom.value}px) scale(${zoom.value})`,
  transformOrigin: 'top left'
}))

// === 全景浮窗 ===
const minimapRef = ref(null)
const minimapX = ref(0)
const minimapY = ref(60)
let mmDragging = false, mmStartX = 0, mmStartY = 0, mmStartPosX = 0, mmStartPosY = 0

const minimapPosStyle = computed(() => ({
  right: minimapX.value + 'px',
  top: minimapY.value + 'px'
}))

const minimapRectStyle = computed(() => {
  const z = zoom.value
  return {
    left: (panX.value / videoW.value) * 100 + '%',
    top: (panY.value / videoH.value) * 100 + '%',
    width: (100 / z) + '%',
    height: (100 / z) + '%'
  }
})

const onMinimapDragStart = (e) => {
  mmDragging = true
  mmStartX = e.clientX; mmStartY = e.clientY
  mmStartPosX = minimapX.value; mmStartPosY = minimapY.value
}
const onMinimapDragMove = (e) => {
  if (!mmDragging) return
  minimapX.value = mmStartPosX - (e.clientX - mmStartX)
  minimapY.value = mmStartPosY + (e.clientY - mmStartY)
}
const onMinimapDragEnd = () => { mmDragging = false }
const onMinimapTouchStart = (e) => {
  const t = e.touches[0]
  mmDragging = true
  mmStartX = t.clientX; mmStartY = t.clientY
  mmStartPosX = minimapX.value; mmStartPosY = minimapY.value
}
const onMinimapTouchMove = (e) => {
  if (!mmDragging) return
  const t = e.touches[0]
  minimapX.value = mmStartPosX - (t.clientX - mmStartX)
  minimapY.value = mmStartPosY + (t.clientY - mmStartY)
}

// === 鼠标/触摸缩放与平移 ===
const onWheel = (e) => {
  const z0 = zoom.value
  const dz = -e.deltaY * 0.005
  const newZoom = Math.max(1, Math.min(8, z0 + dz * z0))
  const vx = panX.value + e.offsetX / z0
  const vy = panY.value + e.offsetY / z0
  zoom.value = newZoom
  panX.value = vx - e.offsetX / newZoom
  panY.value = vy - e.offsetY / newZoom
}

const onMouseDown = (e) => {
  isDragging = true
  dragStartX = e.clientX; dragStartY = e.clientY
  dragStartPanX = panX.value; dragStartPanY = panY.value
}
const onMouseMove = (e) => {
  if (!isDragging) return
  panX.value = dragStartPanX - (e.clientX - dragStartX) / zoom.value
  panY.value = dragStartPanY - (e.clientY - dragStartY) / zoom.value
}
const onMouseUp = () => { isDragging = false }

const onTouchStart = (e) => {
  if (e.touches.length === 2) {
    pinchDist0 = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    pinchZoom0 = zoom.value
  } else if (e.touches.length === 1) {
    isDragging = true
    dragStartX = e.touches[0].clientX; dragStartY = e.touches[0].clientY
    dragStartPanX = panX.value; dragStartPanY = panY.value
  }
}
const onTouchMove = (e) => {
  if (e.touches.length === 2) {
    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
    const r = dist / pinchDist0
    const z = Math.max(1, Math.min(8, pinchZoom0 * r))
    const rect = viewportRef.value?.getBoundingClientRect()
    if (rect) {
      const z0 = zoom.value
      const vx = panX.value + (cx - rect.left) / z0
      const vy = panY.value + (cy - rect.top) / z0
      zoom.value = z
      panX.value = vx - (cx - rect.left) / z
      panY.value = vy - (cy - rect.top) / z
    }
  } else if (e.touches.length === 1 && isDragging) {
    panX.value = dragStartPanX - (e.touches[0].clientX - dragStartX) / zoom.value
    panY.value = dragStartPanY - (e.touches[0].clientY - dragStartY) / zoom.value
  }
}
const onTouchEnd = () => { isDragging = false }

// === 工具栏 ===
const showMoreRow = ref(false)
const lightOn = ref(false)
const sirenOn = ref(false)
const isRecording = ref(false)
const intercomOn = ref(false)

const toggleLight = () => { lightOn.value = !lightOn.value }
const toggleSiren = () => { sirenOn.value = !sirenOn.value }
const toggleRecord = () => { isRecording.value = !isRecording.value }
const takeSnapshot = () => { console.log('snapshot') }
const toggleIntercom = () => { intercomOn.value = !intercomOn.value }
const toggleZoomMode = () => { console.log('zoom mode') }
const toggleDirection = () => { console.log('direction') }
const toggleVertical = () => { console.log('vertical') }
const goToPresets = () => { console.log('presets') }
const togglePTZMode = () => { console.log('ptz mode') }

const goBack = () => { router.back() }
const goToDeviceSettings = () => { router.push('/settings') }

let ro = null
onMounted(() => {
  if (viewportRef.value) {
    ro = new ResizeObserver(([e]) => {
      viewportW.value = e.contentRect.width
      viewportH.value = e.contentRect.height
    })
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

// 32:9 视频画布
.video-canvas {
  position: absolute;
  left: 0;
  width: 100%;
  top: 12%;
  aspect-ratio: 32 / 9;
  cursor: grab;
  &:active { cursor: grabbing; }
}

.video-feed {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0d1b3e 0%, #1a3a6e 30%, #0f2744 60%, #162d50 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-top: 1px solid rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.video-hint {
  font-size: 11px;
  color: rgba(255,255,255,0.25);
  letter-spacing: 1px;
}

// 全景浮窗
.panorama-minimap {
  position: absolute;
  width: 80px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  border-radius: 6px;
  padding: 4px;
  z-index: 20;
  cursor: move;
}

.minimap-frame {
  width: 72px;
  aspect-ratio: 32 / 9;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
}

.minimap-view-rect {
  position: absolute;
  border: 1.5px solid #FF6B00;
  background: rgba(255, 107, 0, 0.12);
  border-radius: 1px;
}

.minimap-label {
  display: block;
  text-align: center;
  font-size: 9px;
  color: rgba(255,255,255,0.4);
  margin-top: 2px;
}

// 顶部栏
.top-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
  background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%);
}

.device-name {
  flex: 1; color: #fff; font-size: 15px; font-weight: 600;
}

.top-right {
  display: flex; align-items: center; gap: 10px;
}

.zoom-badge {
  font-size: 11px; color: #fff;
  background: rgba(255,255,255,0.12);
  padding: 3px 8px; border-radius: 10px; font-weight: 500;
}

// 底部工具栏
.bottom-toolbar {
  position: absolute;
  bottom: 8px; left: 8px; right: 8px;
  z-index: 10;
}

.toolbar-row {
  display: flex;
  justify-content: space-around;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 8px 4px;
}

.toolbar-extra {
  margin-top: 6px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  min-width: 40px;
  .tool-icon {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: background .15s;
  }
  &:active .tool-icon { transform: scale(0.92); }
  .tool-label {
    font-size: 9px;
    color: rgba(255,255,255,0.6);
    white-space: nowrap;
  }
}

.record-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  &.active {
    background: #EA4335;
    box-shadow: 0 0 6px rgba(234,67,53,0.5);
  }
}
</style>
