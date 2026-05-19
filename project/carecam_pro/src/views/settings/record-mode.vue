<template>
  <div class="record-mode-page">
    <!-- 顶部栏 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>录制模式</h2>
    </div>
    
    <!-- 常规录制 -->
    <div class="record-section">
      <div class="section-title">常规录制</div>
      <div class="mode-list">
        <div 
          class="mode-item" 
          v-for="(item, index) in normalRecordList" 
          :key="index"
          :class="{ active: normalRecord === item.value }"
          @click="selectNormalRecord(item.value)"
        >
          <div class="mode-info">
            <div class="mode-title">{{ item.label }}</div>
            <div class="mode-desc">{{ item.desc }}</div>
          </div>
          <van-icon v-if="normalRecord === item.value" name="success" class="mode-check" color="#1A73E8" />
        </div>
      </div>
      
      <!-- 自定义时段配置 -->
      <div class="config-card" v-if="normalRecord === '1'">
        <div class="config-header">
          <span class="config-title">时间段设置</span>
          <van-button size="small" type="primary" plain @click="addTimeSlot">添加时段</van-button>
        </div>
        <div class="time-slot-list">
          <div class="time-slot-item" v-for="(slot, index) in timeSlots" :key="index">
            <div class="time-range">
              <span>{{ slot.startTime }}</span>
              <span class="separator">至</span>
              <span>{{ slot.endTime }}</span>
            </div>
            <van-icon name="delete-o" class="delete-btn" @click="removeTimeSlot(index)" />
          </div>
          <div class="empty-tip" v-if="timeSlots.length === 0">
            暂无时间段，点击上方按钮添加
          </div>
        </div>
      </div>
    </div>
    
    <!-- 事件录制 -->
    <div class="record-section">
      <div class="section-title">事件录制</div>
      <div class="mode-list">
        <div 
          class="mode-item" 
          v-for="(item, index) in eventRecordList" 
          :key="index"
          :class="{ active: eventRecord === item.value }"
          @click="selectEventRecord(item.value)"
        >
          <div class="mode-info">
            <div class="mode-title">{{ item.label }}</div>
            <div class="mode-desc">{{ item.desc }}</div>
          </div>
          <van-icon v-if="eventRecord === item.value" name="success" class="mode-check" color="#1A73E8" />
        </div>
      </div>
      
      <!-- 仅图片配置 -->
      <div class="config-card" v-if="eventRecord === '0'">
        <div class="config-item">
          <div class="config-label">抓图间隔</div>
          <div class="config-control">
            <van-field
              v-model="imageConfig.captureInterval"
              type="number"
              placeholder="请输入抓图间隔"
              class="config-input"
            >
              <template #button>
                <span class="unit">毫秒</span>
              </template>
            </van-field>
          </div>
        </div>
      </div>
      
      <!-- 仅视频配置 -->
      <div class="config-card" v-if="eventRecord === '1'">
        <div class="config-item">
          <div class="config-label">录制时长</div>
          <div class="config-control">
            <van-field
              v-model="videoConfig.recordDuration"
              type="number"
              placeholder="请输入录制时长"
              class="config-input"
            >
              <template #button>
                <span class="unit">秒</span>
              </template>
            </van-field>
          </div>
        </div>
        <div class="config-item">
          <div class="config-label">是否允许设备终止</div>
          <van-switch v-model="videoConfig.allowDeviceTerminate" active-color="#1A73E8" />
        </div>
      </div>
      
      <!-- 图片和视频配置 -->
      <div class="config-card" v-if="eventRecord === '2'">
        <div class="config-item">
          <div class="config-label">抓图间隔</div>
          <div class="config-control">
            <van-field
              v-model="bothConfig.captureInterval"
              type="number"
              placeholder="请输入抓图间隔"
              class="config-input"
            >
              <template #button>
                <span class="unit">毫秒</span>
              </template>
            </van-field>
          </div>
        </div>
        <div class="config-item">
          <div class="config-label">录制时长</div>
          <div class="config-control">
            <van-field
              v-model="bothConfig.recordDuration"
              type="number"
              placeholder="请输入录制时长"
              class="config-input"
            >
              <template #button>
                <span class="unit">秒</span>
              </template>
            </van-field>
          </div>
        </div>
        <div class="config-item">
          <div class="config-label">是否允许设备终止</div>
          <van-switch v-model="bothConfig.allowDeviceTerminate" active-color="#1A73E8" />
        </div>
      </div>
    </div>
    
    <!-- 保存按钮 -->
    <div class="save-section">
      <van-button type="primary" block @click="saveConfig">保存</van-button>
    </div>
    
    <!-- 时间段选择弹窗 -->
    <van-popup v-model:show="showTimePicker" position="bottom" round>
      <div class="time-picker-popup">
        <div class="popup-header">
          <span class="cancel" @click="showTimePicker = false">取消</span>
          <span class="title">选择时间段</span>
          <span class="confirm" @click="confirmTimeSlot">确定</span>
        </div>
        <div class="picker-content">
          <div class="picker-row">
            <span class="picker-label">开始时间</span>
            <van-picker :columns="timeColumns" @change="onStartTimeChange" />
          </div>
          <div class="picker-row">
            <span class="picker-label">结束时间</span>
            <van-picker :columns="timeColumns" @change="onEndTimeChange" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

// 常规录制模式
const normalRecord = ref('0')

// 事件录制模式
const eventRecord = ref('0')

// 时间段列表
const timeSlots = ref([])

// 时间选择弹窗
const showTimePicker = ref(false)
const tempStartTime = ref('00:00')
const tempEndTime = ref('23:59')

// 仅图片配置
const imageConfig = reactive({
  captureInterval: ''
})

// 仅视频配置
const videoConfig = reactive({
  recordDuration: '',
  allowDeviceTerminate: false
})

// 图片和视频配置
const bothConfig = reactive({
  captureInterval: '',
  recordDuration: '',
  allowDeviceTerminate: false
})

// 时间选项
const timeColumns = (() => {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
  return [
    hours.map(h => ({ text: h, value: h })),
    { text: ':', value: ':' },
    minutes.map(m => ({ text: m, value: m }))
  ]
})()

// 常规录制选项
const normalRecordList = ref([
  { value: '0', label: '全天', desc: '24小时持续录制' },
  { value: '1', label: '自定义时段', desc: '按设置的时间段录制' },
  { value: '2', label: '关闭', desc: '不进行常规录制' }
])

// 事件录制选项
const eventRecordList = ref([
  { value: '0', label: '仅图片', desc: '事件触发时仅抓拍图片' },
  { value: '1', label: '仅视频', desc: '事件触发时录制视频' },
  { value: '2', label: '图片和视频', desc: '事件触发时同时抓拍图片和录制视频' }
])

// 返回
const goBack = () => {
  router.back()
}

// 选择常规录制模式
const selectNormalRecord = (value) => {
  normalRecord.value = value
}

// 选择事件录制模式
const selectEventRecord = (value) => {
  eventRecord.value = value
}

// 添加时间段
const addTimeSlot = () => {
  showTimePicker.value = true
}

// 移除时间段
const removeTimeSlot = (index) => {
  timeSlots.value.splice(index, 1)
}

// 开始时间变化
const onStartTimeChange = ({ selectedValues }) => {
  tempStartTime.value = `${selectedValues[0]}:${selectedValues[2]}`
}

// 结束时间变化
const onEndTimeChange = ({ selectedValues }) => {
  tempEndTime.value = `${selectedValues[0]}:${selectedValues[2]}`
}

// 确认时间段
const confirmTimeSlot = () => {
  timeSlots.value.push({
    startTime: tempStartTime.value,
    endTime: tempEndTime.value
  })
  showTimePicker.value = false
}

// 保存配置
const saveConfig = () => {
  showToast('保存成功')
  router.back()
}
</script>

<style lang="scss" scoped>
.record-mode-page {
  min-height: 100%;
  background-color: $bg-page;
  padding-bottom: 80px;
}

.page-header {
  background-color: $bg-color;
  padding: 12px 16px;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
  
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

.record-section {
  margin: 12px 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 8px;
  padding-left: 4px;
}

.mode-list {
  background-color: $bg-color;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-card;
}

.mode-item {
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
  
  &.active {
    background-color: rgba(26, 115, 232, 0.05);
  }
}

.mode-info {
  flex: 1;
}

.mode-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.mode-desc {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}

.mode-check {
  flex-shrink: 0;
}

.config-card {
  background-color: $bg-color;
  border-radius: $radius-lg;
  padding: 16px;
  margin-top: 12px;
  box-shadow: $shadow-card;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.config-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.time-slot-list {
  margin-top: 8px;
}

.time-slot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background-color: $bg-page;
  border-radius: $radius-sm;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.time-range {
  font-size: 14px;
  color: $text-primary;
  
  .separator {
    margin: 0 8px;
    color: $text-secondary;
  }
}

.delete-btn {
  color: $danger-color;
  font-size: 18px;
}

.empty-tip {
  text-align: center;
  font-size: 13px;
  color: $text-secondary;
  padding: 16px 0;
}

.config-item {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.config-label {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: 8px;
}

.config-control {
  display: flex;
  align-items: center;
}

.config-input {
  flex: 1;
  
  :deep(.van-field__control) {
    text-align: right;
  }
}

.unit {
  font-size: 12px;
  color: $text-secondary;
}

.save-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background-color: $bg-color;
  border-top: 1px solid $border-color;
}

// 时间选择弹窗
.time-picker-popup {
  background-color: $bg-color;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid $border-color;
  
  .title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }
  
  .cancel {
    font-size: 14px;
    color: $text-secondary;
  }
  
  .confirm {
    font-size: 14px;
    color: $primary-color;
    font-weight: 500;
  }
}

.picker-content {
  padding: 16px;
}

.picker-row {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.picker-label {
  display: block;
  font-size: 13px;
  color: $text-secondary;
  margin-bottom: 8px;
}
</style>
