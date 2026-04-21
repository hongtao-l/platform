<template>
  <div class="liveview-page">
    <!-- 视频区域 -->
    <div class="video-container">
      <!-- 顶部控制 -->
      <div class="top-controls">
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" size="22" color="#fff" />
        </div>
        <span class="device-name">Front Door</span>
        <div class="signal-strength">
          <van-icon name="wifi" size="16" color="#fff" />
          <span>强</span>
        </div>
        <div class="settings-btn" @click="goToSettings">
          <van-icon name="setting-o" size="20" color="#fff" />
        </div>
      </div>
      
      <!-- 视频占位 -->
      <div class="video-placeholder">
        <van-icon name="video" size="60" color="rgba(255,255,255,0.3)" />
      </div>
      
      <!-- 底部控制 -->
      <div class="bottom-controls">
        <div class="control-item" @click="togglePlay">
          <van-icon :name="isPlaying ? 'pause-circle-o' : 'play-circle-o'" size="28" color="#fff" />
        </div>
        <div class="control-item" @click="startRecord">
          <van-icon name="video-o" size="28" color="#fff" />
        </div>
        <div class="control-item" @click="takeScreenshot">
          <van-icon name="photograph" size="28" color="#fff" />
        </div>
        <div class="control-item" @click="startCall">
          <van-icon name="phone-o" size="28" color="#fff" />
        </div>
      </div>
    </div>
    
    <!-- 云台控制 -->
    <div class="ptz-controls">
      <div class="ptz-title">云台控制</div>
      <div class="ptz-pad">
        <div class="ptz-btn up" @click="ptzControl('up')">
          <van-icon name="arrow-up" size="20" />
        </div>
        <div class="ptz-btn left" @click="ptzControl('left')">
          <van-icon name="arrow-left" size="20" />
        </div>
        <div class="ptz-center">
          <van-icon name="plus" size="20" />
        </div>
        <div class="ptz-btn right" @click="ptzControl('right')">
          <van-icon name="arrow-right" size="20" />
        </div>
        <div class="ptz-btn down" @click="ptzControl('down')">
          <van-icon name="arrow-down" size="20" />
        </div>
      </div>
      <div class="zoom-control">
        <span>变焦</span>
        <van-slider v-model="zoomLevel" :min="1" :max="10" />
        <span>{{ zoomLevel }}x</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 播放状态
const isPlaying = ref(true)

// 变焦级别
const zoomLevel = ref(1)

// 返回
const goBack = () => {
  router.back()
}

// 跳转设置
const goToSettings = () => {
  router.push('/settings')
}

// 切换播放
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

// 开始录像
const startRecord = () => {
  // 录像逻辑
}

// 截图
const takeScreenshot = () => {
  // 截图逻辑
}

// 开始通话
const startCall = () => {
  // 通话逻辑
}

// 云台控制
const ptzControl = (direction) => {
  console.log('PTZ:', direction)
}
</script>

<style lang="scss" scoped>
.liveview-page {
  min-height: 100%;
  background-color: #000;
  display: flex;
  flex-direction: column;
}

.video-container {
  flex: 1;
  display: flex;
  flex-direction: column;
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
  
  .signal-strength {
    display: flex;
    align-items: center;
    gap: 4px;
    
    span {
      color: #fff;
      font-size: 11px;
    }
  }
  
  .settings-btn {
    cursor: pointer;
  }
}

.video-placeholder {
  flex: 1;
  background: linear-gradient(135deg, #0d1b3e, #1a3a6e);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 24px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 12px 24px;
  border-radius: $radius-pill;
}

.control-item {
  cursor: pointer;
}

.ptz-controls {
  background-color: $bg-color;
  padding: 16px;
  
  .ptz-title {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12px;
  }
}

.ptz-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
  width: 150px;
  height: 150px;
  margin: 0 auto 16px;
}

.ptz-btn {
  background-color: $bg-page;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:active {
    background-color: $primary-bg;
  }
  
  &.up {
    grid-column: 2;
    grid-row: 1;
  }
  
  &.left {
    grid-column: 1;
    grid-row: 2;
  }
  
  &.right {
    grid-column: 3;
    grid-row: 2;
  }
  
  &.down {
    grid-column: 2;
    grid-row: 3;
  }
}

.ptz-center {
  grid-column: 2;
  grid-row: 2;
  background-color: $primary-color;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.zoom-control {
  display: flex;
  align-items: center;
  gap: 12px;
  
  span {
    font-size: 12px;
    color: $text-secondary;
    min-width: 30px;
  }
  
  .van-slider {
    flex: 1;
  }
}
</style>
