<template>
  <div class="stats-page">
    <!-- 顶部栏 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>运行统计</h2>
    </div>
    
    <!-- Tab切换 -->
    <div class="tab-bar">
      <div 
        :class="['tab-item', { active: activeTab === '24h' }]"
        @click="activeTab = '24h'"
      >
        近 24 小时
      </div>
      <div 
        :class="['tab-item', { active: activeTab === '10d' }]"
        @click="activeTab = '10d'"
      >
        过去 10 天
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="chart-container">
      <div class="chart-header">
        <div class="chart-title">{{ activeTab === '24h' ? '电量变化趋势' : '每日电量消耗' }}</div>
        <div class="chart-subtitle">{{ activeTab === '24h' ? '近 24 小时' : '过去 10 天' }}</div>
      </div>
      
      <!-- 简化的图表展示 -->
      <div class="chart-placeholder">
        <div class="chart-bars">
          <div 
            v-for="(item, index) in chartData" 
            :key="index"
            class="chart-bar"
            :style="{ height: item.value + '%' }"
          >
            <span class="bar-label">{{ item.label }}</span>
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

// Tab
const activeTab = ref('24h')

// 图表数据
const chartData = computed(() => {
  if (activeTab.value === '24h') {
    return [
      { label: '00', value: 95 },
      { label: '04', value: 90 },
      { label: '08', value: 85 },
      { label: '12', value: 82 },
      { label: '16', value: 80 },
      { label: '20', value: 78 }
    ]
  } else {
    return [
      { label: '周一', value: 15 },
      { label: '周二', value: 12 },
      { label: '周三', value: 18 },
      { label: '周四', value: 10 },
      { label: '周五', value: 14 },
      { label: '周六', value: 8 },
      { label: '周日', value: 6 }
    ]
  }
})

// 返回
const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.stats-page {
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

.tab-bar {
  display: flex;
  background-color: $bg-color;
  border-bottom: 1px solid $border-color;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 13px;
  font-weight: 500;
  color: $text-secondary;
  border-bottom: 2px solid transparent;
  
  &.active {
    color: $primary-color;
    border-bottom-color: $primary-color;
    font-weight: 600;
  }
}

.chart-container {
  margin: 16px;
  background-color: $bg-color;
  border-radius: $radius-lg;
  padding: 16px;
  box-shadow: $shadow-card;
}

.chart-header {
  margin-bottom: 16px;
  
  .chart-title {
    font-size: 13px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 2px;
  }
  
  .chart-subtitle {
    font-size: 11px;
    color: $text-secondary;
  }
}

.chart-placeholder {
  height: 180px;
  display: flex;
  align-items: flex-end;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  height: 100%;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, $primary-color, #4A90E2);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  position: relative;
  
  .bar-label {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    color: $text-secondary;
  }
}
</style>
