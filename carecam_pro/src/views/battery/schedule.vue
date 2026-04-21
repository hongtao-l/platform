<template>
  <div class="schedule-page">
    <!-- 顶部栏 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>智能模式</h2>
      <div class="add-btn" @click="showAddModal = true">
        <van-icon name="plus" size="16" color="#fff" />
      </div>
    </div>
    
    <!-- 默认执行模式 -->
    <div class="default-mode">
      <div class="default-label">默认执行模式</div>
      <div class="default-hint">计划外时间段执行该模式</div>
      <div class="mode-buttons">
        <div 
          v-for="(mode, index) in defaultModes" 
          :key="index"
          :class="['mode-btn', { active: selectedDefault === index }]"
          @click="selectedDefault = index"
        >
          {{ mode }}
        </div>
      </div>
    </div>
    
    <!-- 时间计划列表 -->
    <div class="section">
      <div class="section-title">时间计划</div>
      <div class="schedule-list">
        <div v-for="(schedule, index) in schedules" :key="index" class="schedule-item">
          <div class="schedule-header">
            <div class="schedule-info">
              <span :class="['mode-tag', schedule.modeClass]">{{ schedule.mode }}</span>
              <span class="schedule-time">{{ schedule.timeRange }}</span>
            </div>
            <div class="delete-btn" @click="deleteSchedule(index)">
              <van-icon name="delete-o" size="14" color="#EA4335" />
            </div>
          </div>
          <div class="schedule-days">
            <span 
              v-for="(day, i) in weekDays" 
              :key="i"
              :class="['day-tag', { active: schedule.days.includes(i) }]"
            >
              {{ day }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="empty-hint">
        点击右上角 + 添加时间计划
      </div>
    </div>
    
    <!-- 添加计划弹窗 -->
    <van-popup v-model:show="showAddModal" position="bottom" round :style="{ height: '60%' }">
      <div class="add-modal">
        <div class="modal-header">
          <span>添加时间计划</span>
          <van-icon name="cross" size="20" @click="showAddModal = false" />
        </div>
        
        <div class="modal-content">
          <!-- 工作模式 -->
          <div class="form-section">
            <div class="form-label">工作模式</div>
            <div class="mode-buttons">
              <div 
                v-for="(mode, index) in defaultModes" 
                :key="index"
                :class="['mode-btn', { active: newSchedule.mode === index }]"
                @click="newSchedule.mode = index"
              >
                {{ mode }}
              </div>
            </div>
          </div>
          
          <!-- 时间段 -->
          <div class="form-section">
            <div class="form-label">时间段</div>
            <div class="time-range">
              <div class="time-input">
                <div class="time-label">开始时间</div>
                <input type="time" v-model="newSchedule.startTime" />
              </div>
              <van-icon name="arrow" size="16" color="#6B7280" />
              <div class="time-input">
                <div class="time-label">结束时间</div>
                <input type="time" v-model="newSchedule.endTime" />
              </div>
            </div>
          </div>
          
          <!-- 重复 -->
          <div class="form-section">
            <div class="form-label">重复</div>
            <div class="day-select">
              <span 
                v-for="(day, i) in weekDays" 
                :key="i"
                :class="['day-tag', { active: newSchedule.days.includes(i) }]"
                @click="toggleDay(i)"
              >
                {{ day }}
              </span>
            </div>
          </div>
          
          <van-button block type="primary" @click="addSchedule">确认添加</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 默认模式
const defaultModes = ['省电模式', 'AOV模式', '常电模式']
const selectedDefault = ref(0)

// 星期
const weekDays = ['一', '二', '三', '四', '五', '六', '日']

// 计划列表
const schedules = ref([
  {
    mode: 'AOV模式',
    modeClass: 'aov',
    timeRange: '08:00 - 22:00',
    days: [0, 1, 2, 3, 4]
  },
  {
    mode: '常电模式',
    modeClass: 'alwayson',
    timeRange: '22:00 - 08:00',
    days: [5, 6]
  }
])

// 添加弹窗
const showAddModal = ref(false)
const newSchedule = ref({
  mode: 0,
  startTime: '08:00',
  endTime: '22:00',
  days: [0, 1, 2, 3, 4]
})

// 返回
const goBack = () => {
  router.back()
}

// 删除计划
const deleteSchedule = (index) => {
  schedules.value.splice(index, 1)
}

// 切换日期
const toggleDay = (index) => {
  const i = newSchedule.value.days.indexOf(index)
  if (i > -1) {
    newSchedule.value.days.splice(i, 1)
  } else {
    newSchedule.value.days.push(index)
  }
}

// 添加计划
const addSchedule = () => {
  const modeNames = ['省电模式', 'AOV模式', '常电模式']
  const modeClasses = ['powersave', 'aov', 'alwayson']
  
  schedules.value.push({
    mode: modeNames[newSchedule.value.mode],
    modeClass: modeClasses[newSchedule.value.mode],
    timeRange: `${newSchedule.value.startTime} - ${newSchedule.value.endTime}`,
    days: [...newSchedule.value.days].sort()
  })
  
  showAddModal.value = false
}
</script>

<style lang="scss" scoped>
.schedule-page {
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

.add-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
}

.default-mode {
  padding: 16px;
  background-color: $bg-color;
  border-bottom: 1px solid $border-color;
  
  .default-label {
    font-size: 12px;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 4px;
  }
  
  .default-hint {
    font-size: 11px;
    color: $text-secondary;
    margin-bottom: 12px;
  }
}

.mode-buttons {
  display: flex;
  gap: 8px;
}

.mode-btn {
  flex: 1;
  padding: 10px 6px;
  border-radius: 10px;
  border: 1.5px solid $border-color;
  background-color: $bg-page;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: $text-secondary;
  
  &.active {
    border-color: $primary-color;
    background-color: $primary-bg;
    color: $primary-color;
  }
}

.section {
  padding: 12px 16px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-item {
  background-color: $bg-color;
  border-radius: $radius-lg;
  padding: 14px 16px;
  box-shadow: $shadow-card;
}

.schedule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.schedule-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-tag {
  padding: 3px 10px;
  border-radius: $radius-pill;
  font-size: 12px;
  font-weight: 700;
  
  &.powersave {
    background-color: $primary-bg;
    color: $primary-color;
  }
  
  &.aov {
    background-color: $primary-bg;
    color: $primary-color;
  }
  
  &.alwayson {
    background-color: #E8F5E9;
    color: #34A853;
  }
}

.schedule-time {
  font-size: 15px;
  font-weight: 700;
  color: $text-primary;
}

.delete-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #FFEBEE;
  display: flex;
  align-items: center;
  justify-content: center;
}

.schedule-days {
  display: flex;
  gap: 5px;
}

.day-tag {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background-color: $border-color;
  color: $text-secondary;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.active {
    background-color: $primary-color;
    color: #fff;
  }
}

.empty-hint {
  text-align: center;
  padding: 20px 0 8px;
  font-size: 12px;
  color: $text-secondary;
}

.add-modal {
  padding: 16px;
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    span {
      font-size: 15px;
      font-weight: 700;
      color: $text-primary;
    }
  }
  
  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.form-section {
  .form-label {
    font-size: 12px;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 8px;
  }
}

.time-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-input {
  flex: 1;
  background-color: $bg-page;
  border-radius: 8px;
  border: 1.5px solid $border-color;
  padding: 10px 12px;
  text-align: center;
  
  .time-label {
    font-size: 10px;
    color: $text-secondary;
    margin-bottom: 4px;
  }
  
  input {
    border: none;
    background: transparent;
    font-size: 16px;
    font-weight: 700;
    color: $text-primary;
    text-align: center;
    outline: none;
    width: 100%;
  }
}

.day-select {
  display: flex;
  gap: 6px;
}
</style>
