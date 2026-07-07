<template>
  <div class="playback-page">
    <!-- 视频区域 -->
    <div class="video-container">
      <!-- 顶部控制 -->
      <div class="top-controls">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" size="22" color="#fff" />
        </div>
        <span class="device-name">Front Door</span>
      </div>
      
      <!-- 视频占位 -->
      <div class="video-placeholder">
        <van-icon name="video" size="60" color="rgba(255,255,255,0.3)" />
      </div>
    </div>

    <!-- 回放源切换 -->
    <div class="source-tabs">
      <div 
        :class="['source-tab', { active: activeSource === 'cloud' }]"
        @click="activeSource = 'cloud'"
      >
        云回放
      </div>
      <div 
        :class="['source-tab', { active: activeSource === 'sd' }]"
        @click="activeSource = 'sd'"
      >
        SD卡回放
      </div>
    </div>
    
    <!-- 时间轴 -->
    <div class="timeline-container">
      <div class="timeline-header">
        <span>时间轴</span>
        <span class="current-time">{{ currentTime }}</span>
      </div>
      <div class="timeline-bar">
        <div class="timeline-track">
          <div 
            v-for="(event, index) in timelineEvents" 
            :key="index"
            class="timeline-event"
            :style="{ left: event.position + '%' }"
          ></div>
          <div class="timeline-progress" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
      <div class="timeline-labels">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>

    <!-- 慢速提示条 -->
    <transition name="speed-bar-slide">
      <div v-if="showSpeedHint && !speedHintDismissed" class="speed-hint-bar" @click="goToStore">
        <div class="speed-hint-left">
          <van-icon name="info-o" size="14" color="rgba(255,255,255,0.65)" />
          <span class="speed-hint-text">{{ hintText }}</span>
        </div>
        <div class="speed-hint-right">
          <span class="speed-hint-cta">了解云存储</span>
          <van-icon name="cross" size="16" color="rgba(255,255,255,0.45)" @click.stop="speedHintDismissed = true" />
        </div>
      </div>
    </transition>

    <!-- 事件列表 -->
    <div class="events-section">
      <div class="section-title">事件</div>
      <div class="event-list">
        <div
          v-for="(event, index) in events"
          :key="index"
          class="event-item"
          @click="playEvent(event)"
        >
          <div class="event-thumb" :style="{ background: event.bgGradient }"></div>
          <div class="event-info">
            <div class="event-type">{{ event.type }}</div>
            <div class="event-time">{{ event.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 回放源
const activeSource = ref('cloud')

// 网络资源分配策略（服务端控制地区，当前仅印度）
const speedThreshold = 100 // KB/s
const hintText = '当前网络较慢，云存储服务可提升流畅度'
const speedHintDismissed = ref(false)
const loadSpeed = ref(80) // TODO: 真实测速，当前模拟慢速
const hasCloudStorage = ref(false) // TODO: 接入真实云存状态
const isSupportedRegion = ref(true) // TODO: 接入后台地区接口，当前模拟印度

const showSpeedHint = computed(() => {
  if (!isSupportedRegion.value) return false
  if (hasCloudStorage.value) return false
  if (activeSource.value !== 'cloud') return false
  if (loadSpeed.value >= speedThreshold) return false
  return true
})

const goToStore = () => {
  router.push('/store?tab=cloud')
}

// 当前时间
const currentTime = ref('09:38')
const progress = ref(40)

// 时间轴事件
const timelineEvents = ref([
  { position: 15 },
  { position: 25 },
  { position: 45 },
  { position: 60 },
  { position: 75 }
])

// 事件列表
const events = ref([
  {
    type: '检测到人形',
    time: '今天 09:38',
    bgGradient: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)'
  },
  {
    type: '检测到移动',
    time: '今天 09:20',
    bgGradient: 'linear-gradient(135deg, #0d2e1a, #1a5c34)'
  },
  {
    type: '检测到车辆',
    time: '今天 08:55',
    bgGradient: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)'
  }
])

// 返回
const goBack = () => {
  router.back()
}

// 播放事件
const playEvent = (event) => {
  console.log('Play event:', event)
}
</script>

<style lang="scss" scoped>
.playback-page {
  min-height: 100%;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

.video-container {
  height: 220px;
  background-color: #000;
  position: relative;
}

.top-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
  
  .device-name {
    flex: 1;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
  }
}

.video-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0d1b3e, #1a3a6e);
  display: flex;
  align-items: center;
  justify-content: center;
}

.source-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background-color: $bg-color;
  border-bottom: 1px solid $border-color;
}

.source-tab {
  padding: 6px 16px;
  border-radius: $radius-pill;
  font-size: 12px;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.1);
  color: #aaa;
  
  &.active {
    background-color: $primary-color;
    color: #fff;
  }
}

.timeline-container {
  background-color: $bg-color;
  padding: 12px 16px;
  border-bottom: 1px solid $border-color;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  span {
    font-size: 12px;
    color: $text-secondary;
  }
  
  .current-time {
    font-weight: 600;
    color: $primary-color;
  }
}

.timeline-bar {
  height: 24px;
  background-color: $bg-page;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.timeline-track {
  width: 100%;
  height: 100%;
  position: relative;
}

.timeline-event {
  position: absolute;
  top: 0;
  width: 3px;
  height: 100%;
  background-color: $primary-color;
  border-radius: 2px;
}

.timeline-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: rgba(26, 115, 232, 0.3);
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  
  span {
    font-size: 10px;
    color: $text-secondary;
  }
}

.events-section {
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 12px;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-item {
  display: flex;
  gap: 12px;
  background-color: $bg-color;
  border-radius: $radius-md;
  padding: 12px;
  box-shadow: $shadow-card;
}

.event-thumb {
  width: 72px;
  height: 48px;
  border-radius: 8px;
  flex-shrink: 0;
}

.event-info {
  flex: 1;
}

.event-type {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.event-time {
  font-size: 11px;
  color: $text-secondary;
  margin-top: 4px;
}

// 慢速提示条
.speed-hint-bar {
  height: 44px;
  background: linear-gradient(90deg, rgba(26, 115, 232, 0.12), rgba(26, 115, 232, 0.04));
  border-top: 1px solid rgba(26, 115, 232, 0.1);
  border-bottom: 1px solid rgba(26, 115, 232, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 10;
  cursor: pointer;
  flex-shrink: 0;
}

.speed-hint-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.speed-hint-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
}

.speed-hint-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.speed-hint-cta {
  font-size: 11px;
  color: #90CAF9;
  font-weight: 500;
}

.speed-bar-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.speed-bar-slide-leave-active {
  transition: all 0.25s ease-in;
}
.speed-bar-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.speed-bar-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
