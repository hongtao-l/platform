<template>
  <div class="home-page">
    <!-- 顶部栏 -->
    <div class="home-topbar">
      <div class="left">
        <h2>我的家</h2>
        <p>{{ deviceStatusText }}</p>
      </div>
      <div class="right">
        <div class="icon-btn" @click="goToMessage">
          <van-icon name="bell" size="18" />
          <span v-if="unreadCount > 0" class="red-dot"></span>
        </div>
        <div class="icon-btn" @click="showAddDevice = true">
          <van-icon name="plus" size="18" />
        </div>
        <div class="avatar-btn" @click="goToMe">{{ userInitial }}</div>
      </div>
    </div>
    
    <!-- 家庭分组标签 -->
    <div class="family-bar">
      <div 
        v-for="(group, index) in familyGroups" 
        :key="index"
        :class="['family-chip', { active: activeGroup === index }]"
        @click="activeGroup = index"
      >
        {{ group.name }}
      </div>
    </div>
    
    <!-- 设备列表 -->
    <div class="device-list">
      <div 
        v-for="device in filteredDevices" 
        :key="device.id"
        class="device-card"
        @click="goToLiveView(device)"
      >
        <!-- 缩略图 -->
        <div class="device-thumb">
          <div class="cam-bg" :style="{ background: device.bgGradient }">
            <van-icon name="video" size="40" color="rgba(255,255,255,0.3)" />
          </div>
          <div class="cam-overlay"></div>
          <div class="cam-status">
            <span :class="['status-badge', device.status]">
              ● {{ statusText(device.status) }}
            </span>
          </div>
          <span v-if="device.isShared" class="share-badge">已分享</span>
          <span class="cam-name">{{ device.name }}</span>
        </div>
        
        <!-- 操作按钮 -->
        <div class="device-actions">
          <div class="dev-action" @click.stop="goToMessage(device)">
            <span v-if="device.unreadCount > 0" class="msg-dot"></span>
            <van-icon name="bell" size="18" />
            <span>消息</span>
          </div>
          <div class="dev-action" @click.stop="goToPlayback(device)">
            <van-icon name="play-circle-o" size="18" />
            <span>回放</span>
          </div>
          <div class="dev-action" @click.stop="goToStore(device)">
            <van-icon name="cloud-o" size="18" />
            <span>
              <span :class="['cloud-tag', { inactive: !device.cloudPlan }]">
                {{ device.cloudPlan || '免费版' }}
              </span>
            </span>
          </div>
          <div class="dev-action" @click.stop="goToSettings(device)">
            <van-icon name="setting-o" size="18" />
            <span>设置</span>
          </div>
        </div>
      </div>
      
      <!-- 添加设备 -->
      <div class="add-device-btn" @click="showAddDevice = true">
        <van-icon name="plus" size="20" color="#1A73E8" />
        <span>添加设备</span>
      </div>
    </div>
    
    <!-- 添加设备弹窗 -->
    <van-popup 
      v-model:show="showAddDevice" 
      position="bottom" 
      round 
      :style="{ height: '60%' }"
    >
      <div class="add-device-popup">
        <div class="popup-header">
          <h3>添加设备</h3>
          <van-icon name="cross" size="20" @click="showAddDevice = false" />
        </div>
        <div class="popup-content">
          <div class="add-method">
            <van-icon name="scan" size="32" color="#1A73E8" />
            <span>扫描二维码</span>
          </div>
          <div class="add-method">
            <van-icon name="search" size="32" color="#1A73E8" />
            <span>搜索设备</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 用户信息
const userInitial = ref('J')
const unreadCount = ref(3)

// 家庭分组
const activeGroup = ref(0)
const familyGroups = ref([
  { name: '全部家庭' },
  { name: '客厅' },
  { name: '入口' },
  { name: '后院' },
  { name: '+ 添加分组' }
])

// 设备列表
const devices = ref([
  {
    id: 'frontdoor',
    name: 'Front Door',
    status: 'online',
    isShared: true,
    cloudPlan: '',
    unreadCount: 2,
    bgGradient: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)',
    group: '入口'
  },
  {
    id: 'backyard',
    name: 'Backyard',
    status: 'online',
    isShared: false,
    cloudPlan: 'Pro',
    unreadCount: 0,
    bgGradient: 'linear-gradient(135deg, #0d2e1a, #1a5c34)',
    group: '后院'
  },
  {
    id: 'garage',
    name: 'Garage',
    status: 'offline',
    isShared: false,
    cloudPlan: '',
    unreadCount: 0,
    bgGradient: 'linear-gradient(135deg, #1a1a1a, #333)',
    group: '客厅'
  }
])

// 显示添加设备弹窗
const showAddDevice = ref(false)

// 设备状态统计
const deviceStatusText = computed(() => {
  const online = devices.value.filter(d => d.status === 'online').length
  const offline = devices.value.filter(d => d.status === 'offline').length
  const sleep = devices.value.filter(d => d.status === 'sleep').length
  return `${online}台在线 · ${offline}台离线${sleep > 0 ? ` · ${sleep}台休眠` : ''}`
})

// 根据分组筛选设备
const filteredDevices = computed(() => {
  const groupName = familyGroups.value[activeGroup.value]?.name
  if (groupName === '全部家庭') {
    return devices.value
  }
  return devices.value.filter(d => d.group === groupName)
})

// 状态文字
const statusText = (status) => {
  const map = {
    online: '在线',
    offline: '离线',
    sleep: '休眠'
  }
  return map[status] || status
}

// 页面跳转
const goToMessage = (device) => {
  router.push('/message')
}

const goToLiveView = (device) => {
  router.push('/liveview')
}

const goToPlayback = (device) => {
  router.push('/playback')
}

const goToStore = (device) => {
  router.push('/store')
}

const goToSettings = (device) => {
  router.push('/settings')
}

const goToMe = () => {
  router.push('/me')
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100%;
  background-color: $bg-page;
}

.home-topbar {
  background-color: $bg-color;
  padding: 10px 16px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $border-color;
  
  .left {
    h2 {
      font-size: 18px;
      font-weight: 700;
      color: $text-primary;
    }
    
    p {
      font-size: 12px;
      color: $text-secondary;
      margin-top: 2px;
    }
  }
  
  .right {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: $text-secondary;
  
  .red-dot {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: $danger-color;
    border: 1.5px solid $bg-color;
  }
}

.avatar-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-color, #4A90E2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.family-bar {
  background-color: $bg-color;
  padding: 10px 16px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  border-bottom: 1px solid $border-color;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.family-chip {
  padding: 5px 14px;
  border-radius: $radius-pill;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  border: 1.5px solid $border-color;
  color: $text-secondary;
  background-color: $bg-page;
  transition: $transition;
  
  &.active {
    background-color: $primary-color;
    color: #fff;
    border-color: $primary-color;
  }
}

.device-list {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
  overflow: hidden;
  transition: transform 0.15s;
  
  &:active {
    transform: scale(0.98);
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.cam-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5));
}

.cam-status {
  position: absolute;
  top: 8px;
  left: 10px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  backdrop-filter: blur(4px);
  
  &.online {
    background-color: rgba(52, 168, 83, 0.85);
    color: #fff;
  }
  
  &.offline {
    background-color: rgba(0, 0, 0, 0.45);
    color: #fff;
  }
  
  &.sleep {
    background-color: rgba(251, 188, 4, 0.85);
    color: #1a1a2e;
  }
}

.share-badge {
  position: absolute;
  top: 8px;
  right: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  background-color: rgba(26, 115, 232, 0.85);
  color: #fff;
}

.cam-name {
  position: absolute;
  bottom: 8px;
  left: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.device-actions {
  display: flex;
  border-top: 1px solid $border-color;
}

.dev-action {
  flex: 1;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  border-right: 1px solid $border-color;
  color: $text-secondary;
  
  &:last-child {
    border-right: none;
  }
  
  &:active {
    background-color: $bg-page;
  }
  
  span {
    font-size: 10px;
    font-weight: 500;
  }
  
  .msg-dot {
    position: absolute;
    top: 8px;
    right: calc(50% - 14px);
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: $danger-color;
    border: 1.5px solid $bg-color;
  }
}

.cloud-tag {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 6px;
  background: linear-gradient(135deg, #1A73E8, #4A90E2);
  color: #fff;
  
  &.inactive {
    background-color: $border-color;
    color: $text-secondary;
  }
}

.add-device-btn {
  margin: 0 0 16px;
  padding: 14px;
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 2px dashed $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: border-color 0.2s;
  
  &:active {
    border-color: $primary-color;
  }
  
  span {
    font-size: 14px;
    color: $primary-color;
    font-weight: 500;
  }
}

.add-device-popup {
  padding: 20px 16px;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      font-size: 18px;
      font-weight: 700;
      color: $text-primary;
    }
  }
  
  .popup-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .add-method {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background-color: $bg-page;
    border-radius: $radius-md;
    
    span {
      font-size: 14px;
      font-weight: 500;
      color: $text-primary;
    }
  }
}
</style>
