<template>
  <div class="settings-page">
    <!-- 顶部栏 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>设备设置</h2>
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
import { useRouter } from 'vue-router'

const router = useRouter()

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
