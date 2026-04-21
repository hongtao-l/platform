<template>
  <div class="device-page">
    <!-- 导航栏 -->
    <van-nav-bar title="设备管理">
      <template #right>
        <van-icon name="plus" size="20" @click="handleAddDevice" />
      </template>
    </van-nav-bar>
    
    <!-- 设备列表 -->
    <div class="device-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div class="device-card" v-for="device in deviceList" :key="device.id">
            <div class="device-header">
              <div class="device-info">
                <van-image
                  round
                  width="40"
                  height="40"
                  :src="device.cover"
                />
                <div class="device-detail">
                  <div class="device-name">{{ device.name }}</div>
                  <div class="device-id">ID: {{ device.deviceId }}</div>
                </div>
              </div>
              <van-tag :type="device.online ? 'success' : 'default'">
                {{ device.online ? '在线' : '离线' }}
              </van-tag>
            </div>
            <div class="device-preview">
              <van-image
                width="100%"
                height="180"
                fit="cover"
                :src="device.preview"
              />
              <div class="preview-overlay">
                <van-icon name="play-circle-o" size="40" color="#fff" />
              </div>
            </div>
            <div class="device-footer">
              <div class="device-time">
                <van-icon name="clock-o" />
                {{ device.lastOnline }}
              </div>
              <div class="device-actions">
                <van-button size="small" type="primary" plain>预览</van-button>
                <van-button size="small" plain>设置</van-button>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'

// 下拉刷新
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

// 设备列表
const deviceList = ref([
  {
    id: 1,
    name: '客厅摄像头',
    deviceId: 'IPC_001',
    online: true,
    cover: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    preview: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
    lastOnline: '刚刚'
  },
  {
    id: 2,
    name: '门口摄像头',
    deviceId: 'IPC_002',
    online: true,
    cover: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    preview: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg',
    lastOnline: '5分钟前'
  },
  {
    id: 3,
    name: '卧室摄像头',
    deviceId: 'IPC_003',
    online: false,
    cover: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    preview: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
    lastOnline: '2小时前'
  }
])

// 下拉刷新
const onRefresh = () => {
  setTimeout(() => {
    refreshing.value = false
    showToast('刷新成功')
  }, 1000)
}

// 加载更多
const onLoad = () => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

// 添加设备
const handleAddDevice = () => {
  showToast('添加设备')
}
</script>

<style lang="scss" scoped>
.device-page {
  height: 100%;
  background-color: $bg-page;
  overflow-y: auto;
  padding-bottom: 60px;
}

.device-list {
  padding: 12px 16px;
}

.device-card {
  background-color: $bg-color;
  border-radius: $radius-lg;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: $shadow-sm;
  
  .device-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    
    .device-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .device-detail {
      .device-name {
        font-size: 16px;
        font-weight: 500;
        color: $text-primary;
      }
      
      .device-id {
        font-size: 12px;
        color: $text-secondary;
        margin-top: 2px;
      }
    }
  }
  
  .device-preview {
    position: relative;
    
    .preview-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.2);
    }
  }
  
  .device-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    
    .device-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: $text-secondary;
    }
    
    .device-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
