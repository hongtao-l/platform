<template>
  <div class="message-page">
    <!-- 搜索栏 -->
    <div class="search-wrap">
      <div class="search-box">
        <van-icon name="search" size="17" color="#6B7280" />
        <input 
          type="text" 
          v-model="searchText" 
          placeholder="AI 搜索 — 描述发生了什么..."
        />
        <span class="ai-tag">AI</span>
        <van-icon name="audio" size="17" color="#1A73E8" />
      </div>
      
      <!-- 日期和筛选 -->
      <div class="filter-row">
        <div class="filter-trigger" @click="showDatePicker = true">
          <van-icon name="calendar-o" size="14" color="#6B7280" />
          <span>{{ dateLabel }}</span>
          <van-icon name="arrow-down" size="12" color="#6B7280" />
        </div>
        <div class="filter-trigger" @click="showFilterPanel = true">
          <van-icon name="filter-o" size="14" color="#6B7280" />
          <span>筛选</span>
          <span v-if="filterCount > 0" class="filter-badge">{{ filterCount }}</span>
        </div>
      </div>
    </div>
    
    <!-- 消息列表 -->
    <div class="msg-list">
      <div 
        v-for="msg in filteredMessages" 
        :key="msg.id"
        class="msg-item"
        @click="goToMessageDetail(msg)"
      >
        <div class="msg-thumb" :style="{ background: msg.bgGradient }"></div>
        <div class="msg-content">
          <div class="msg-type">{{ msg.type }}</div>
          <div class="msg-device">{{ msg.deviceName }}</div>
          <div class="msg-time">{{ msg.time }}</div>
          <span :class="['msg-tag', `tag-${msg.tagType}`]">{{ msg.tag }}</span>
        </div>
      </div>
    </div>
    
    <!-- 底部营销提示 -->
    <div class="bottom-tip">
      <div class="tip-content" @click="goToStore">
        <van-icon name="info-o" size="14" color="#1A73E8" />
        <span>开通智能服务，畅享更多智能服务及精彩回看</span>
        <van-icon name="arrow" size="12" color="#1A73E8" />
      </div>
    </div>
    
    <!-- 日期选择器 -->
    <van-popup 
      v-model:show="showDatePicker" 
      position="bottom" 
      round
    >
      <van-date-picker 
        v-model="selectedDate"
        title="选择日期"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
    
    <!-- 筛选面板 -->
    <van-popup 
      v-model:show="showFilterPanel" 
      position="bottom" 
      round
      :style="{ height: '50%' }"
    >
      <div class="filter-panel">
        <div class="panel-header">
          <span>筛选</span>
          <van-icon name="cross" size="20" @click="showFilterPanel = false" />
        </div>
        
        <div class="filter-section">
          <div class="section-title">设备</div>
          <div class="chips">
            <span 
              v-for="(device, index) in deviceOptions" 
              :key="index"
              :class="['chip', { active: selectedDevices.includes(device) }]"
              @click="toggleDevice(device)"
            >
              {{ device }}
            </span>
          </div>
        </div>
        
        <div class="filter-section">
          <div class="section-title">事件类型</div>
          <div class="chips">
            <span 
              v-for="(event, index) in eventOptions" 
              :key="index"
              :class="['chip', { active: selectedEvents.includes(event) }]"
              @click="toggleEvent(event)"
            >
              {{ event }}
            </span>
          </div>
        </div>
        
        <div class="panel-actions">
          <van-button block plain @click="resetFilter">重置</van-button>
          <van-button block type="primary" @click="applyFilter">应用</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索
const searchText = ref('')

// 日期选择
const showDatePicker = ref(false)
const selectedDate = ref(['2024', '04', '20'])
const dateLabel = ref('全部日期')

// 筛选
const showFilterPanel = ref(false)
const deviceOptions = ['全部设备', 'Front Door', 'Backyard', 'Garage']
const eventOptions = ['全部事件', '人形', '移动', '车辆', '声音', '包裹', '动物']
const selectedDevices = ref(['全部设备'])
const selectedEvents = ref(['全部事件'])
const filterCount = ref(0)

// 消息列表
const messages = ref([
  {
    id: 1,
    type: '检测到人形',
    deviceName: 'Front Door',
    time: '今天 09:38',
    tag: '人形',
    tagType: 'person',
    bgGradient: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)'
  },
  {
    id: 2,
    type: '检测到移动',
    deviceName: 'Backyard',
    time: '今天 09:20',
    tag: '移动',
    tagType: 'motion',
    bgGradient: 'linear-gradient(135deg, #0d2e1a, #1a5c34)'
  },
  {
    id: 3,
    type: '检测到车辆',
    deviceName: 'Front Door',
    time: '今天 08:55',
    tag: '车辆',
    tagType: 'vehicle',
    bgGradient: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)'
  },
  {
    id: 4,
    type: '声音告警',
    deviceName: 'Backyard',
    time: '昨天 22:14',
    tag: '声音',
    tagType: 'sound',
    bgGradient: 'linear-gradient(135deg, #0d2e1a, #1a5c34)'
  },
  {
    id: 5,
    type: '检测到人形',
    deviceName: 'Front Door',
    time: '昨天 20:02',
    tag: '人形',
    tagType: 'person',
    bgGradient: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)'
  }
])

// 筛选后的消息
const filteredMessages = computed(() => {
  return messages.value
})

// 日期确认
const onDateConfirm = ({ selectedValues }) => {
  dateLabel.value = `${selectedValues[1]}月${selectedValues[2]}日`
  showDatePicker.value = false
}

// 切换设备筛选
const toggleDevice = (device) => {
  if (device === '全部设备') {
    selectedDevices.value = ['全部设备']
  } else {
    const index = selectedDevices.value.indexOf(device)
    if (index > -1) {
      selectedDevices.value.splice(index, 1)
    } else {
      selectedDevices.value = selectedDevices.value.filter(d => d !== '全部设备')
      selectedDevices.value.push(device)
    }
  }
}

// 切换事件筛选
const toggleEvent = (event) => {
  if (event === '全部事件') {
    selectedEvents.value = ['全部事件']
  } else {
    const index = selectedEvents.value.indexOf(event)
    if (index > -1) {
      selectedEvents.value.splice(index, 1)
    } else {
      selectedEvents.value = selectedEvents.value.filter(e => e !== '全部事件')
      selectedEvents.value.push(event)
    }
  }
}

// 重置筛选
const resetFilter = () => {
  selectedDevices.value = ['全部设备']
  selectedEvents.value = ['全部事件']
  filterCount.value = 0
}

// 应用筛选
const applyFilter = () => {
  let count = 0
  if (!selectedDevices.value.includes('全部设备')) {
    count += selectedDevices.value.length
  }
  if (!selectedEvents.value.includes('全部事件')) {
    count += selectedEvents.value.length
  }
  filterCount.value = count
  showFilterPanel.value = false
}

// 跳转消息详情
const goToMessageDetail = (msg) => {
  // 可以跳转到消息详情页
}

// 跳转服务商城
const goToStore = () => {
  router.push('/store')
}
</script>

<style lang="scss" scoped>
.message-page {
  min-height: 100%;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

.search-wrap {
  background-color: $bg-color;
  padding: 12px 16px;
  border-bottom: 1px solid $border-color;
  flex-shrink: 0;
}

.search-box {
  background-color: $bg-page;
  border-radius: $radius-md;
  padding: 9px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  
  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    color: $text-primary;
    background-color: transparent;
    
    &::placeholder {
      color: $text-secondary;
    }
  }
}

.ai-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  background: linear-gradient(135deg, #1A73E8, #9C27B0);
  color: #fff;
}

.filter-row {
  display: flex;
  gap: 8px;
}

.filter-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: $radius-pill;
  border: 1.5px solid $border-color;
  background-color: $bg-page;
  cursor: pointer;
  
  span {
    font-size: 12px;
    font-weight: 500;
    color: $text-primary;
  }
  
  .filter-badge {
    background-color: $primary-color;
    color: #fff;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
  }
}

.msg-list {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.msg-item {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 12px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  box-shadow: $shadow-card;
}

.msg-thumb {
  width: 72px;
  height: 54px;
  border-radius: 10px;
  flex-shrink: 0;
}

.msg-content {
  flex: 1;
}

.msg-type {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.msg-device {
  font-size: 11px;
  color: $text-secondary;
  margin-top: 2px;
}

.msg-time {
  font-size: 11px;
  color: $text-secondary;
  margin-top: 3px;
}

.msg-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  margin-top: 4px;
  
  &.tag-person {
    background-color: #DBEAFE;
    color: #1D4ED8;
  }
  
  &.tag-motion {
    background-color: #FEF3C7;
    color: #D97706;
  }
  
  &.tag-vehicle {
    background-color: #EDE9FE;
    color: #6D28D9;
  }
  
  &.tag-sound {
    background-color: #D1FAE5;
    color: #065F46;
  }
}

.bottom-tip {
  background-color: $bg-color;
  border-top: 1px solid $border-color;
  padding: 8px 16px;
  flex-shrink: 0;
  
  .tip-content {
    display: flex;
    align-items: center;
    gap: 8px;
    
    span {
      flex: 1;
      font-size: 11px;
      color: $text-secondary;
    }
  }
}

.filter-panel {
  padding: 16px;
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    span {
      font-size: 16px;
      font-weight: 700;
      color: $text-primary;
    }
  }
  
  .filter-section {
    margin-bottom: 16px;
    
    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: $text-secondary;
      margin-bottom: 8px;
    }
    
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .chip {
      padding: 5px 12px;
      border-radius: $radius-pill;
      font-size: 12px;
      font-weight: 500;
      border: 1.5px solid $border-color;
      color: $text-secondary;
      background-color: $bg-page;
      
      &.active {
        background-color: $primary-color;
        color: #fff;
        border-color: $primary-color;
      }
    }
  }
  
  .panel-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
}
</style>
