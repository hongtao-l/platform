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

    <!-- 全局状态切换按钮（调试用） -->
    <div class="dev-toggle-btn" @click="showDevPanel = !showDevPanel">⚙</div>
    
    <transition name="slide-left">
      <div class="dev-panel" v-show="showDevPanel">
        <div class="dev-panel-header">
          <span>状态切换</span>
          <van-icon name="cross" size="16" @click="showDevPanel = false" />
        </div>
        <div v-for="s in devStatuses" :key="s.key" :class="['dev-option', { active: s.key === currentKey }]" @click="switchStatus(s.key)">{{ s.label }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { aiStatus } from '@/store/devStatus'

const route = useRoute()
const activeTab = ref(0)
const currentTime = ref('9:41')
const unreadCount = ref(3)

// ===== 全局状态切换（调试用） =====
const showDevPanel = ref(false)
const devStatuses = [
  { key: 'not_activated', label: '未开通AI' },
  { key: 'activated_basic', label: '已开通Basic' },
  { key: 'activated_pro', label: '已开通Pro' }
]
const currentKey = computed(() => aiStatus.value)

const switchStatus = (key) => {
  aiStatus.value = key
  showDevPanel.value = false
}
// =====


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

/* 全局状态切换按钮（右侧浮动） */
.dev-toggle-btn {
  position: fixed;
  right: 0;
  top: 120px;
  z-index: 9999;
  width: 36px;
  height: 36px;
  border-radius: 18px 0 0 18px;
  background: #1A73E8;
  color: #fff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

/* 右侧滑出面板 */
.dev-panel {
  position: fixed;
  right: 0;
  top: 120px;
  z-index: 9998;
  background: #fff;
  border-radius: 10px 0 0 10px;
  padding: 12px 14px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  min-width: 170px;
}
.dev-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  span { font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; }
}
.dev-option {
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background 0.15s;
  &:hover { background: #F3F4F6; }
  &.active { background: #1A73E8; color: #fff; }
}

.slide-left-enter-active, .slide-left-leave-active { transition: all 0.2s ease; }
.slide-left-enter-from, .slide-left-leave-to { transform: translateX(30px); opacity: 0; }

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
