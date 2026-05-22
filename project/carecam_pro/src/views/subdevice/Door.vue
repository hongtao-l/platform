<template>
  <div class="subdevice-page">
    <!-- 顶部栏 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>门磁传感器</h2>
      <van-icon name="info-o" size="18" color="#999" @click="showInfo = true" />
    </div>

    <div class="page-body">
      <!-- 实时状态 -->
      <div class="status-card" :class="isOpen ? 'open' : 'closed'">
        <div class="status-icon">
          <van-icon name="door-o" size="64" />
        </div>
        <div class="status-text">{{ isOpen ? '门已开启' : '门已关闭' }}</div>
        <div v-if="isOpen" class="open-duration">已开启 {{ openDuration }}</div>
      </div>

      <!-- 开关记录 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="clock-o" size="16" color="#1A73E8" />
          <span>最近记录</span>
        </div>
        <div class="log-item">
          <van-icon name="add-o" size="14" color="#34A853" />
          <span class="log-action">开门</span>
          <span class="log-time">今天 14:32:10</span>
        </div>
        <div class="log-item">
          <van-icon name="minus" size="14" color="#6B7280" />
          <span class="log-action">关门</span>
          <span class="log-time">今天 12:15:38</span>
        </div>
        <div class="log-item">
          <van-icon name="add-o" size="14" color="#34A853" />
          <span class="log-action">开门</span>
          <span class="log-time">昨天 18:22:05</span>
        </div>
      </div>

      <!-- 告警设置 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="warning-o" size="16" color="#FBBC04" />
          <span>告警设置</span>
        </div>

        <div class="setting-row">
          <div class="setting-label">开门超时告警</div>
          <van-switch v-model="timeoutAlarmEnabled" size="22" active-color="#1A73E8" />
        </div>
        <div v-if="timeoutAlarmEnabled" class="timeout-row">
          <span class="timeout-label">超过</span>
          <van-stepper v-model="timeoutMinutes" :min="1" :max="120" :step="1" />
          <span class="timeout-label">分钟未关则告警</span>
        </div>

        <div class="setting-row">
          <div class="setting-label">防拆告警</div>
          <van-switch v-model="tamperAlarmEnabled" size="22" active-color="#1A73E8" />
        </div>

        <div class="setting-row">
          <div class="setting-label">夜間开门告警</div>
          <van-switch v-model="nightAlarmEnabled" size="22" active-color="#1A73E8" />
        </div>
        <div v-if="nightAlarmEnabled" class="timeout-row">
          <span class="timeout-label">时段</span>
          <van-field v-model="nightStart" readonly size="small" class="time-input" @click="showNightStartPicker = true" />
          <span class="timeout-label">至</span>
          <van-field v-model="nightEnd" readonly size="small" class="time-input" @click="showNightEndPicker = true" />
        </div>
      </div>

      <!-- 事件日志 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="notes-o" size="16" color="#7C3AED" />
          <span>事件日志</span>
          <span class="view-all" @click="goToAllLogs">查看全部</span>
        </div>
        <div class="event-item" v-for="ev in recentEvents" :key="ev.id">
          <div class="event-icon" :class="ev.type">
            <van-icon :name="ev.type === 'open' ? 'add-o' : 'minus'" size="12" color="#fff" />
          </div>
          <div class="event-info">
            <span class="event-name">{{ ev.label }}</span>
            <span class="event-time">{{ ev.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showInfo" position="bottom" round :style="{ height: '40%' }">
      <div class="info-popup">
        <h3>设备信息</h3>
        <div class="info-row"><span>设备名称</span><span>门磁传感器</span></div>
        <div class="info-row"><span>设备ID</span><span class="mono">DC-20240501</span></div>
        <div class="info-row"><span>固件版本</span><span>v1.1.0</span></div>
        <div class="info-row"><span>信号强度</span><span><van-icon name="wifi" size="12" /> 强</span></div>
        <div class="info-row"><span>电池电量</span><span>92%</span></div>
      </div>
    </van-popup>

    <van-popup v-model:show="showNightStartPicker" position="bottom" round>
      <van-time-picker v-model="nightStartTime" title="开始时间" @confirm="onNightStartConfirm" @cancel="showNightStartPicker = false" />
    </van-popup>
    <van-popup v-model:show="showNightEndPicker" position="bottom" round>
      <van-time-picker v-model="nightEndTime" title="结束时间" @confirm="onNightEndConfirm" @cancel="showNightEndPicker = false" />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const isOpen = ref(true)
const openDuration = ref('3 分钟')

const timeoutAlarmEnabled = ref(true)
const timeoutMinutes = ref(5)
const tamperAlarmEnabled = ref(true)
const nightAlarmEnabled = ref(false)
const nightStart = ref('22:00')
const nightEnd = ref('06:00')

const showInfo = ref(false)
const showNightStartPicker = ref(false)
const showNightEndPicker = ref(false)
const nightStartTime = ref(['22', '00'])
const nightEndTime = ref(['06', '00'])

const onNightStartConfirm = ({ selectedValues }) => {
  nightStart.value = selectedValues.join(':')
  showNightStartPicker.value = false
}
const onNightEndConfirm = ({ selectedValues }) => {
  nightEnd.value = selectedValues.join(':')
  showNightEndPicker.value = false
}

const recentEvents = ref([
  { id: 1, type: 'open', label: '门打开', time: '今天 14:32:10' },
  { id: 2, type: 'close', label: '门关闭', time: '今天 12:15:38' },
  { id: 3, type: 'open', label: '门打开', time: '昨天 18:22:05' },
  { id: 4, type: 'close', label: '门关闭', time: '昨天 17:45:01' },
])

const goToAllLogs = () => { console.log('查看全部日志') }
const goBack = () => router.back()
</script>

<style lang="scss" scoped>
.subdevice-page {
  height: 100%;
  overflow-y: auto;
  background: $bg-page;
}

.page-header {
  background: $bg-color;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid $border-color;
  h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; }
}

.back-btn {
  width: 32px; height: 32px; border-radius: 50%;
  background: $bg-page; display: flex; align-items: center; justify-content: center;
  color: $text-primary;
}

.page-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

/* 状态卡片 */
.status-card {
  background: $bg-color;
  border-radius: $radius-lg;
  padding: 32px 20px;
  box-shadow: $shadow-card;
  text-align: center;
  &.open { background: #FFF5F5; .status-text { color: #EA4335; } }
  &.closed { background: #F5FFF5; .status-text { color: #34A853; } }
}

.status-icon { margin-bottom: 12px; color: $text-primary; }

.status-text {
  font-size: 22px;
  font-weight: 700;
}

.open-duration {
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: 6px;
}

/* 设置 */
.section-card {
  background: $bg-color;
  border-radius: $radius-lg;
  padding: 14px 16px;
  box-shadow: $shadow-card;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 12px;
}

.view-all {
  margin-left: auto;
  font-size: $font-sm;
  color: $primary-color;
  font-weight: 400;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid $border-light;
  &:last-child { border-bottom: none; }
}

.setting-label { font-size: $font-md; color: $text-regular; }

.timeout-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0 12px;
  border-bottom: 1px solid $border-light;
}

.timeout-label { font-size: $font-sm; color: $text-secondary; }

.time-input {
  width: 80px;
  padding: 4px 8px !important;
  text-align: center;
}

/* 日志 */
.log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid $border-light;
  .log-action { font-size: $font-sm; color: $text-regular; flex: 1; }
  .log-time { font-size: $font-sm; color: $text-secondary; }
}

/* 事件 */
.event-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid $border-light;
  &:last-child { border-bottom: none; }
}

.event-icon {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  &.open { background: rgba(52,168,83,0.2); }
  &.close { background: rgba(107,114,128,0.2); }
}

.event-info {
  display: flex; flex-direction: column; flex: 1;
  .event-name { font-size: $font-sm; color: $text-regular; }
  .event-time { font-size: 11px; color: $text-placeholder; }
}

/* 设备信息 */
.info-popup {
  padding: 20px 16px;
  h3 { font-size: 18px; font-weight: 700; color: $text-primary; margin-bottom: 16px; }
  .info-row {
    display: flex; justify-content: space-between;
    padding: 8px 0; font-size: 14px; color: $text-regular;
    border-bottom: 1px solid $border-light;
    .mono { font-family: monospace; font-size: 12px; }
  }
}
</style>
