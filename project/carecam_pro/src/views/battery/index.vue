<template>
  <div class="battery-page">
    <!-- 顶部栏 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>电池管理</h2>
    </div>
    
    <!-- 电池状态 -->
    <div class="battery-status">
      <div class="battery-circle">
        <div class="battery-percent">{{ batteryLevel }}</div>
        <div class="battery-unit">%</div>
      </div>
      <div class="battery-info">
        <div class="status-label">电池状态</div>
        <div class="status-value">{{ batteryStatus }}</div>
        <div class="status-estimate">预计续航：{{ estimatedDays }}天</div>
        <div class="battery-bar">
          <div class="battery-bar-fill" :style="{ width: batteryLevel + '%' }"></div>
        </div>
      </div>
    </div>
    
    <!-- 工作模式 -->
    <div class="section">
      <div class="section-title">工作模式</div>
      <div class="mode-list">
        <div 
          v-for="(mode, index) in workModes" 
          :key="index"
          :class="['mode-item', { active: selectedMode === index }]"
          @click="selectMode(index)"
        >
          <div class="mode-header">
            <van-radio :name="index" :model-value="selectedMode" />
            <div class="mode-info">
              <div class="mode-name">{{ mode.name }}</div>
              <div class="mode-desc">{{ mode.desc }}</div>
            </div>
          </div>
          
          <!-- AOV模式配置 -->
          <div v-if="mode.id === 'aov' && selectedMode === index" class="mode-config">
            <div class="config-item">
              <div class="config-label">拍照帧率（数值越小，功耗越高）</div>
              <div class="config-value" @click="showFrameRatePicker = true">
                <span>{{ frameRate }}s/帧</span>
                <van-icon name="arrow-down" size="14" />
              </div>
            </div>
            <div class="config-item">
              <div class="config-label">省电模式电量阈值</div>
              <div class="config-slider">
                <van-slider v-model="aovThreshold" :min="10" :max="50" :step="10" />
                <span class="slider-value">{{ aovThreshold }}%</span>
              </div>
              <div class="config-hint">电量低于此值时，自动切换至省电模式</div>
            </div>
          </div>
          
          <!-- 常电模式配置 -->
          <div v-if="mode.id === 'alwayson' && selectedMode === index" class="mode-config">
            <div class="config-item">
              <div class="config-label">省电模式电量阈值</div>
              <div class="config-slider">
                <van-slider v-model="alwaysonThreshold" :min="10" :max="50" :step="10" />
                <span class="slider-value">{{ alwaysonThreshold }}%</span>
              </div>
              <div class="config-hint">电量低于此值时，自动切换至省电模式</div>
            </div>
          </div>
          
          <!-- 智能模式入口 -->
          <div v-if="mode.id === 'smart' && selectedMode === index" class="mode-config">
            <div class="schedule-entry" @click="goToSchedule">
              <span>配置计划</span>
              <van-icon name="arrow" size="14" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 运行统计入口 -->
    <div class="section">
      <div class="stats-entry" @click="goToStats">
        <div class="entry-left">
          <div class="entry-icon">
            <van-icon name="chart-trending-o" size="18" color="#4CAF50" />
          </div>
          <div class="entry-info">
            <div class="entry-title">运行统计</div>
            <div class="entry-desc">电量使用趋势</div>
          </div>
        </div>
        <van-icon name="arrow" class="entry-arrow" />
      </div>
    </div>
    
    <!-- 事件录像设置 -->
    <div class="section">
      <div class="section-title">事件录像</div>
      <div class="record-config">
        <div class="config-item">
          <div class="config-label">录像时长</div>
          <div class="config-slider">
            <van-slider v-model="recordDuration" :min="5" :max="30" :step="1" />
            <span class="slider-value">{{ recordDuration }}s</span>
          </div>
        </div>
        <div class="config-checkbox">
          <van-checkbox v-model="stopOnMotionStop" shape="square">
            运动停止则停止录像
          </van-checkbox>
          <div class="checkbox-hint">开启后，设备可在未达到录像时长时自行中断录像</div>
        </div>
      </div>
    </div>
    
    <!-- 帧率选择器 -->
    <van-popup v-model:show="showFrameRatePicker" position="bottom" round>
      <van-picker
        title="选择拍照帧率"
        :columns="frameRateOptions"
        @confirm="onFrameRateConfirm"
        @cancel="showFrameRatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 电池状态
const batteryLevel = ref(78)
const batteryStatus = ref('良好')
const estimatedDays = ref(12)

// 工作模式
const selectedMode = ref(0)
const workModes = ref([
  { id: 'powersave', name: '省电模式', desc: '设备默认休眠，通过事件唤醒录像，续航更长' },
  { id: 'aov', name: 'AOV 模式', desc: '设备持续运行，每隔一段时间抓拍一张图片，有事件发生时触发告警录像' },
  { id: 'alwayson', name: '常电模式', desc: '设备一直连续录像，电池电量低于设定值时，自动进入省电模式' },
  { id: 'smart', name: '智能模式', desc: '根据时间计划配置需要使用的工作模式' }
])

// AOV配置
const frameRate = ref(5)
const aovThreshold = ref(20)
const showFrameRatePicker = ref(false)
const frameRateOptions = [
  { text: '1s/帧 (高能耗)', value: 1 },
  { text: '2s/帧 (高能耗)', value: 2 },
  { text: '3s/帧 (高能耗)', value: 3 },
  { text: '4s/帧', value: 4 },
  { text: '5s/帧', value: 5 },
  { text: '6s/帧', value: 6 },
  { text: '7s/帧', value: 7 },
  { text: '8s/帧', value: 8 },
  { text: '9s/帧', value: 9 },
  { text: '10s/帧', value: 10 }
]

// 常电模式配置
const alwaysonThreshold = ref(30)

// 事件录像配置
const recordDuration = ref(15)
const stopOnMotionStop = ref(false)

// 返回
const goBack = () => {
  router.back()
}

// 选择模式
const selectMode = (index) => {
  selectedMode.value = index
}

// 帧率确认
const onFrameRateConfirm = ({ selectedOptions }) => {
  frameRate.value = selectedOptions[0].value
  showFrameRatePicker.value = false
}

// 跳转智能模式计划
const goToSchedule = () => {
  router.push('/smart-schedule')
}

// 跳转运行统计
const goToStats = () => {
  router.push('/battery-stats')
}
</script>

<style lang="scss" scoped>
.battery-page {
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

.battery-status {
  padding: 16px;
  background-color: $bg-color;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  gap: 16px;
}

.battery-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8BC34A, #9CCC65);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  .battery-percent {
    font-size: 28px;
    font-weight: 800;
    color: #fff;
  }
  
  .battery-unit {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.8);
  }
}

.battery-info {
  flex: 1;
  
  .status-label {
    font-size: 14px;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 8px;
  }
  
  .status-value {
    font-size: 16px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 4px;
  }
  
  .status-estimate {
    font-size: 12px;
    color: $text-secondary;
  }
  
  .battery-bar {
    width: 100%;
    height: 6px;
    background-color: $border-color;
    border-radius: 3px;
    margin-top: 8px;
    overflow: hidden;
    
    .battery-bar-fill {
      height: 100%;
      background-color: #8BC34A;
      border-radius: 3px;
    }
  }
}

.section {
  padding: 12px 16px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mode-list {
  background-color: $bg-color;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-card;
}

.mode-item {
  padding: 14px 16px;
  border-bottom: 1px solid $border-color;
  
  &:last-child {
    border-bottom: none;
  }
}

.mode-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.mode-info {
  flex: 1;
}

.mode-name {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.mode-desc {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}

.mode-config {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid $border-color;
}

.config-item {
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.config-label {
  font-size: 12px;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 8px;
}

.config-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  background-color: $bg-page;
  border: 1.5px solid $border-color;
  
  span {
    font-size: 14px;
    font-weight: 700;
    color: $primary-color;
  }
}

.config-slider {
  display: flex;
  align-items: center;
  gap: 10px;
  
  .van-slider {
    flex: 1;
  }
  
  .slider-value {
    font-size: 14px;
    font-weight: 600;
    color: $primary-color;
    min-width: 40px;
    text-align: right;
  }
}

.config-hint {
  font-size: 11px;
  color: $text-secondary;
  margin-top: 6px;
}

.schedule-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  border-radius: $radius-pill;
  background-color: $bg-page;
  border: 1px solid $border-color;
  
  span {
    font-size: 11px;
    color: $text-secondary;
  }
}

.stats-entry {
  background-color: $bg-color;
  border-radius: $radius-lg;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  box-shadow: $shadow-card;
}

.entry-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.entry-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: #E8F5E9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.entry-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.entry-desc {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 2px;
}

.entry-arrow {
  color: $text-secondary;
}

.record-config {
  background-color: $bg-color;
  border-radius: $radius-lg;
  padding: 16px;
  box-shadow: $shadow-card;
}

.config-checkbox {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid $border-color;
  
  .checkbox-hint {
    font-size: 11px;
    color: $text-secondary;
    margin-top: 6px;
  }
}
</style>
