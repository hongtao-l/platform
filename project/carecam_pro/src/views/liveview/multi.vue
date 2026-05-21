<template>
  <div class="multi-page">
    <!-- 顶部栏 -->
    <TopBar
      :device-name="deviceName"
      :extra-text="`${lensCount} 目`"
      @back="goBack"
      @settings="goToSettings"
    />

    <!-- 多路画面滚动区 -->
    <div class="multi-scroll">
      <div
        v-for="(_, idx) in lensList"
        :key="idx"
        class="screen-panel"
        :class="{ active: activeScreen === idx }"
        @click="activeScreen = idx"
      >
        <div class="screen-feed">
          <van-icon name="video" size="32" color="rgba(255,255,255,0.15)" />
          <span class="screen-label">镜头 {{ idx + 1 }}</span>
        </div>

        <div class="screen-overlay" v-if="activeScreen === idx">
          <div class="quality-switch">
            <span
              v-for="q in qualities"
              :key="q.key"
              class="quality-item"
              :class="{ active: streamQualities[idx] === q.key }"
              @click.stop="switchQuality(idx, q.key)"
            >{{ q.label }}</span>
          </div>
          <van-icon name="expand-o" size="18" color="#fff" class="fullscreen-btn"
            @click.stop="fullscreenIdx = idx" />
        </div>
      </div>
    </div>

    <!-- 底部功能区 -->
    <div class="bottom-area">
      <BottomToolbar :buttons="toolbarButtons" @action="onToolbarAction" />
    </div>

    <!-- 全屏某一路 -->
    <div v-if="fullscreenIdx !== null" class="fullscreen-overlay" @click="fullscreenIdx = null">
      <div class="fullscreen-feed">
        <van-icon name="video" size="48" color="rgba(255,255,255,0.15)" />
        <span class="fullscreen-label">镜头 {{ fullscreenIdx + 1 }} — 全屏</span>
      </div>
      <span class="fullscreen-hint">点击退出全屏</span>
    </div>

    <!-- 子设备面板 -->
    <SubDevicePanel v-model:visible="showSubDevices" :devices="subDevices" @detail="onSubDeviceDetail" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TopBar from '@/components/LiveView/TopBar.vue'
import BottomToolbar from '@/components/LiveView/BottomToolbar.vue'
import SubDevicePanel from '@/components/LiveView/SubDevicePanel.vue'

const router = useRouter()
const route = useRoute()

const deviceName = ref(route.query.deviceName || '多目摄像机')
const deviceId = ref(route.query.deviceId || '')
const lensCount = ref(Math.min(Math.max(parseInt(route.query.lensCount) || 4, 1), 4))

const lensList = computed(() => Array.from({ length: lensCount.value }, (_, i) => i))
const activeScreen = ref(0)
const streamQualities = ref(lensList.value.map(() => 'hd'))
const fullscreenIdx = ref(null)

const qualities = [
  { key: 'sd', label: '标清' },
  { key: 'hd', label: '高清' },
  { key: 'uhd', label: '超清' }
]

function switchQuality(idx, key) { streamQualities.value[idx] = key }

const showSubDevices = ref(false)
const isRecording = ref(false)

const toolbarButtons = computed(() => [
  { key: 'intercom', label: '对讲', icon: 'phone-o', active: false },
  { key: 'playback', label: '回放', icon: 'clock-o', active: false },
  { key: 'more', label: '更多', icon: 'more-o', active: false },
  { key: 'record', label: '录制', icon: 'video-o', active: isRecording.value, extra: true },
  { key: 'subdevice', label: '子设备', icon: 'apps-o', active: false, extra: true },
  { key: 'snapshot', label: '截图', icon: 'photograph', active: false, extra: true },
])

function onToolbarAction(key) {
  switch (key) {
    case 'subdevice': showSubDevices.value = true; break
    case 'record': isRecording.value = !isRecording.value; break
    case 'playback': router.push({ path: '/playback', query: { deviceId: deviceId.value, deviceName: deviceName.value } }); break
    case 'intercom': console.log('Intercom'); break
    case 'snapshot': console.log('Snapshot'); break
  }
}

function onSubDeviceDetail(dev) { console.log('Sub device detail:', dev) }

const subDevices = ref([
  { id: 'sub1', name: '温湿度传感器', type: 'temp_humidity', category: 'temp_humidity', online: true, value: '26°C / 58%', unit: '' },
  { id: 'sub2', name: '毫米波雷达', type: 'radar', category: 'radar', online: true, value: '有人', unit: '' },
])

const goBack = () => router.back()
const goToSettings = () => router.push({ path: '/settings', query: { deviceId: deviceId.value, deviceName: deviceName.value } })
</script>

<style lang="scss" scoped>
.multi-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000;
  overflow: hidden;
}

.multi-scroll {
  flex: 1;
  overflow-y: auto;
}

.screen-panel {
  width: 100%;
  aspect-ratio: 16 / 9;
  position: relative;
  border: 2px solid transparent;
  transition: border .2s;

  &.active { border-color: #1A73E8; }
}

.screen-feed {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #0d1b3e, #1a3a6e);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.screen-label { font-size: 12px; color: rgba(255,255,255,0.2); margin-top: 4px; }

.screen-overlay {
  position: absolute; bottom: 0; left: 0; right: 0; padding: 8px 10px;
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(0deg, rgba(0,0,0,0.45) 0%, transparent 100%);
}

.quality-switch {
  display: flex; gap: 3px; background: rgba(0,0,0,0.4); border-radius: 4px; padding: 2px;
}
.quality-item {
  font-size: 10px; color: rgba(255,255,255,0.45); padding: 2px 8px; border-radius: 3px; cursor: pointer;
  &.active { color: #fff; background: rgba(26,115,232,0.55); }
}
.fullscreen-btn { cursor: pointer; opacity: 0.6; &:active { opacity: 1; } }

.fullscreen-overlay {
  position: fixed; inset: 0; z-index: 100; background: #000;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
}
.fullscreen-feed {
  width: 100%; height: 80%;
  background: linear-gradient(135deg, #0d1b3e, #1a3a6e);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.fullscreen-label { font-size: 14px; color: rgba(255,255,255,0.25); }
.fullscreen-hint { font-size: 12px; color: rgba(255,255,255,0.3); }

.bottom-area {
  flex-shrink: 0;
  background: #1A1A2E;
}
</style>
