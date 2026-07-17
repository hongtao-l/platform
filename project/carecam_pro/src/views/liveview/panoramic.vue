<template>
  <div class="panoramic-page">
    <div class="video-viewport">
      <!-- 静态参考图 -->
      <img
        :src="currentImage"
        :alt="modeLabel"
        class="pano-img"
      />

      <!-- 顶部栏 -->
      <TopBar
        :device-name="deviceName"
        :extra-text="modeLabel"
        :show-signal="false"
        @back="goBack"
        @settings="goToSettings"
      />
    </div>

    <!-- 模式选择器 -->
    <div class="mode-bar">
      <div
        v-for="m in modes"
        :key="m.key"
        :class="['mode-chip', { active: activeMode === m.key }]"
        @click="switchMode(m.key)"
      >
        <van-icon :name="m.icon" size="14" />
        <span>{{ m.label }}</span>
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TopBar from '@/components/LiveView/TopBar.vue'
import BottomToolbar from '@/components/LiveView/BottomToolbar.vue'
import SubDevicePanel from '@/components/LiveView/SubDevicePanel.vue'

const router = useRouter()
const route = useRoute()

// ===== 设备信息 =====
const deviceName = ref(route.query.deviceName || '360°全景摄像机')
const deviceId = ref(route.query.deviceId || '')

// ===== 模式定义 =====
const modes = [
  { key: 'fisheye',   label: '鱼眼',   icon: 'eye-o',     img: '/demo/fisheye.png' },
  { key: 'panorama',  label: '全景',   icon: 'photo-o',   img: '/demo/panorama.png' },
  { key: '360vr',     label: '360°VR', icon: 'globe-o',   img: '/demo/panorama.png' },
  { key: '180vr',     label: '180°VR', icon: 'gem-o',     img: '/demo/panorama.png' },
  { key: 'littleplanet', label: '小星球', icon: 'star-o',  img: '/demo/littleplanet.png' },
  { key: 'dual',      label: '双鱼眼', icon: 'cluster-o',  img: '/demo/dual.png' }
]

const activeMode = ref('dual')

const currentImage = computed(() => {
  const mode = modes.find(m => m.key === activeMode.value)
  return mode?.img || '/demo/panorama.png'
})

const modeLabel = computed(() => {
  return modes.find(m => m.key === activeMode.value)?.label || ''
})

// ===== 底部工具栏 =====
const showSubDevices = ref(false)
const isRecording = ref(false)
const intercomOn = ref(false)

const toolbarButtons = computed(() => [
  { key: 'intercom', label: '对讲', icon: 'phone-o', active: intercomOn.value },
  { key: 'playback', label: '回放', icon: 'clock-o', active: false },
  { key: 'more', label: '更多', icon: 'more-o', active: false },
  { key: 'record', label: '录制', icon: 'video-o', active: isRecording.value, extra: true },
  { key: 'subdevice', label: '子设备', icon: 'apps-o', active: false, extra: true },
  { key: 'snapshot', label: '截图', icon: 'photograph', active: false, extra: true }
])

const subDevices = ref([])

function switchMode(key) {
  activeMode.value = key
}

function onToolbarAction(key) {
  switch (key) {
    case 'subdevice': showSubDevices.value = true; break
    case 'record': isRecording.value = !isRecording.value; break
    case 'intercom': intercomOn.value = !intercomOn.value; break
    case 'playback': router.push({ path: '/playback', query: { deviceId: deviceId.value, deviceName: deviceName.value } }); break
  }
}

function onSubDeviceDetail(device) {
  // 子设备详情
}

function goBack() {
  router.back()
}

function goToSettings() {
  router.push('/settings')
}
</script>

<style lang="scss" scoped>
.panoramic-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  user-select: none;
  -webkit-user-select: none;
}

// ===== 主视口 =====
.video-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #0D1117;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pano-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

// ===== 模式选择器 =====
.mode-bar {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: #161B22;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.mode-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 14px;
  font-size: 12px;
  color: #888;
  background: rgba(255,255,255,0.04);
  cursor: pointer;
  transition: all .15s;

  &.active {
    color: #fff;
    background: rgba(26,115,232,0.3);
  }

  &:active {
    transform: scale(0.95);
  }
}

// ===== 底部 =====
.bottom-area {
  flex-shrink: 0;
  background: #0d0d0d;
}
</style>
