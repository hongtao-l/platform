<template>
  <div class="layout-container">
    <!-- 状态栏 -->
    <div class="status-bar">
      <span class="time">{{ currentTime }}</span>
      <div class="status-icons">
        <van-icon name="wifi-o" size="15" />
        <van-icon name="battery-o" size="15" />
      </div>
    </div>
    
    <!-- 页面内容 -->
    <div class="page-content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    
    <!-- 底部导航 -->
    <van-tabbar 
      v-if="showTabbar" 
      v-model="activeTab" 
      active-color="#1A73E8"
      inactive-color="#6B7280"
      :border="true"
    >
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/message" icon="bell" :badge="unreadCount > 0 ? unreadCount : ''">消息</van-tabbar-item>
      <van-tabbar-item to="/me" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeTab = ref(0)
const currentTime = ref('9:41')
const unreadCount = ref(3)

// 是否显示底部导航
const showTabbar = computed(() => {
  return route.meta.showTabbar === true
})

// 更新时间
let timeInterval = null
const updateTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

// 根据路由更新激活的Tab
const updateActiveTab = () => {
  const path = route.path
  if (path.includes('/home')) {
    activeTab.value = 0
  } else if (path.includes('/message')) {
    activeTab.value = 1
  } else if (path.includes('/me')) {
    activeTab.value = 2
  }
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
  updateActiveTab()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: $bg-page;
}

.status-bar {
  height: $status-bar-height;
  background-color: $bg-color;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
  
  .time {
    font-size: 15px;
    font-weight: 700;
    color: $text-primary;
  }
  
  .status-icons {
    display: flex;
    gap: 5px;
    align-items: center;
    color: $text-primary;
  }
}

.page-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

// 覆盖Vant Tabbar样式
:deep(.van-tabbar) {
  height: $tabbar-height;
  padding-bottom: 10px;
  
  .van-tabbar-item {
    font-size: 10px;
    
    .van-tabbar-item__icon {
      font-size: 22px;
      margin-bottom: 2px;
    }
  }
}
</style>
