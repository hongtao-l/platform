<template>
  <div class="settings-page">
    <!-- 顶部栏 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>设备设置</h2>
      <van-icon name="info-o" size="18" color="#999" @click="showDeviceInfo = true" />
    </div>

    <!-- 设备基础信息卡片 -->
    <div class="device-info-card">
      <div class="device-thumb">
        <div class="cam-bg">
          <van-icon name="video" size="36" color="rgba(255,255,255,0.3)" />
        </div>
        <div class="cam-overlay"></div>
        <div class="cam-name">{{ deviceName }}</div>
        <span :class="['status-dot', deviceStatus]">● {{ deviceStatus === 'online' ? '在线' : '离线' }}</span>
      </div>
      <div class="device-meta">
        <div class="meta-row">
          <span class="meta-label">设备名称</span>
          <span class="meta-value">{{ deviceName }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">设备ID</span>
          <span class="meta-value mono">{{ deviceId || '--' }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">固件版本</span>
          <span class="meta-value">v2.1.0</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">信号强度</span>
          <span class="meta-value"><van-icon name="wifi" size="14" /> 强</span>
        </div>
      </div>
    </div>

    <!-- 设置项列表 -->
    <div class="settings-list">
      <div class="settings-item" v-for="(item, index) in settingsItems" :key="index" @click="handleSetting(item)">
        <div class="setting-left">
          <div class="setting-icon" :style="{ backgroundColor: item.bgColor }">
            <van-icon :name="item.icon" size="18" :color="item.iconColor" />
          </div>
          <div class="setting-info">
            <div class="setting-title">{{ item.title }}</div>
            <div class="setting-desc">{{ item.desc }}</div>
          </div>
        </div>
        <van-icon name="arrow" class="setting-arrow" />
      </div>
    </div>
    
    <!-- 删除设备 -->
    <div class="delete-section">
      <van-button block plain type="danger" @click="showDeleteConfirm = true">
        删除设备
      </van-button>
    </div>
    
    <!-- 删除确认弹窗 -->
    <van-dialog 
      v-model:show="showDeleteConfirm" 
      title="删除设备？" 
      message="删除设备后，您将无法查看和接收来自该设备的视频和消息"
      show-cancel-button
      @confirm="deleteDevice"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const deviceName = ref(route.query.deviceName || 'Front Door')
const deviceId = ref(route.query.deviceId || '')
const deviceStatus = ref('online')
const showDeviceInfo = ref(false)

// 删除确认
const showDeleteConfirm = ref(false)

// 设置项
const settingsItems = ref([
  {
    title: '侦测设置',
    desc: '运动、人形、车辆',
    icon: 'eye-o',
    iconColor: '#1A73E8',
    bgColor: '#EEF5FF',
    action: 'detection'
  },
  {
    title: '通知设置',
    desc: '告警与推送',
    icon: 'bell',
    iconColor: '#EA580C',
    bgColor: '#FFF7ED',
    action: 'notification'
  },
  {
    title: '画面设置',
    desc: '亮度、对比度',
    icon: 'tv-o',
    iconColor: '#7C3AED',
    bgColor: '#F5F3FF',
    action: 'display'
  },
  {
    title: '音频设置',
    desc: '麦克风、扬声器',
    icon: 'volume-o',
    iconColor: '#FF9800',
    bgColor: '#FFF3E0',
    action: 'audio'
  },
  {
    title: '存储设置',
    desc: 'SD卡管理',
    icon: 'card',
    iconColor: '#009688',
    bgColor: '#E0F2F1',
    action: 'storage'
  },
  {
    title: '云台设置',
    desc: '水平、垂直、变焦',
    icon: 'expand-o',
    iconColor: '#4CAF50',
    bgColor: '#E8F5E9',
    action: 'ptz'
  },
  {
    title: '工作模式',
    desc: '低功耗、AOV、长电',
    icon: 'flash',
    iconColor: '#4CAF50',
    bgColor: '#E8F5E9',
    action: 'work_mode'
  },
  {
    title: '录制模式',
    desc: '常规录制、事件录制',
    icon: 'video',
    iconColor: '#2196F3',
    bgColor: '#E3F2FD',
    action: 'record_mode'
  },
  {
    title: '电池管理',
    desc: '电源设置',
    icon: 'battery-o',
    iconColor: '#8BC34A',
    bgColor: '#F1F8E9',
    action: 'battery'
  },
  {
    title: '灯光设置',
    desc: 'LED、红外',
    icon: 'sun-o',
    iconColor: '#CDDC39',
    bgColor: '#FFFDE7',
    action: 'light'
  },
  {
    title: '一键分享',
    desc: '邀请家人',
    icon: 'share-o',
    iconColor: '#5C6BC0',
    bgColor: '#E0E7FF',
    action: 'share'
  }
])

// 返回
const goBack = () => {
  router.back()
}

// 处理设置项点击
const handleSetting = (item) => {
  if (item.action === 'battery') {
    router.push('/battery')
  } else if (item.action === 'work_mode') {
    router.push('/settings/work-mode')
  } else if (item.action === 'record_mode') {
    router.push('/settings/record-mode')
  }
}

// 删除设备
const deleteDevice = () => {
  router.push('/home')
}
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100%;
  background-color: $bg-page;
}

.page-header {
  background-color: $bg-color;
  padding: 12px 16px;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  gap: 12px;
  
  h2 {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
    flex: 1;
  }
}

.back-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-primary;
}

.device-info-card {
  background: $bg-color;
  margin: 12px 16px;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
  overflow: hidden;
}

.device-thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  position: relative;
  overflow: hidden;
}

.cam-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0d1b3e, #1a3a6e);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cam-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5));
}

.cam-name {
  position: absolute;
  bottom: 28px;
  left: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.status-dot {
  position: absolute;
  bottom: 8px;
  left: 10px;
  font-size: 11px;
  font-weight: 500;
  color: #fff;

  &.online { color: #16A34A; }
  &.offline { color: #999; }
}

.device-meta {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.meta-label {
  color: $text-secondary;
}

.meta-value {
  color: $text-primary;
  font-weight: 500;

  &.mono {
    font-family: monospace;
    font-size: 11px;
  }
}

.settings-list {
  background-color: $bg-color;
  margin: 12px 16px;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-card;
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid $border-color;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background-color: $bg-page;
  }
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.setting-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.setting-desc {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 2px;
}

.setting-arrow {
  color: $text-secondary;
}

.delete-section {
  padding: 12px 16px;
}
</style>
