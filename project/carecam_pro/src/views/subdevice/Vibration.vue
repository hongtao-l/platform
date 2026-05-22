<template>
  <div class="subdevice-page">
    <div class="page-header">
      <div class="back-btn" @click="goBack"><van-icon name="arrow-left" size="18" /></div>
      <h2>震动传感器</h2>
      <van-icon name="info-o" size="18" color="#999" @click="showInfo = true" />
    </div>

    <div class="page-body">
      <!-- 状态卡片 -->
      <div class="status-card" :class="vibrating ? 'active' : 'calm'">
        <div class="status-icon">📳</div>
        <div class="status-text">{{ vibrating ? '检测到震动' : '静止' }}</div>
        <div class="status-sub" v-if="vibrating">震动强度：{{ intensity }}</div>
      </div>

      <!-- 震动强度 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="chart-trending-o" size="16" color="#1A73E8" />
          <span>实时震动强度</span>
        </div>
        <div class="vibration-bar">
          <van-progress :percentage="intensityPercent" :color="intensityColor" stroke-width="16" />
          <span class="intensity-text">{{ intensity }} 级</span>
        </div>
      </div>

      <!-- 告警设置 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="warning-o" size="16" color="#FBBC04" />
          <span>告警设置</span>
        </div>
        <div class="setting-row">
          <div class="setting-label">震动告警</div>
          <van-switch v-model="alarmEnabled" size="22" active-color="#1A73E8" />
        </div>
        <div v-if="alarmEnabled" class="threshold-row">
          <span class="threshold-tag">灵敏度</span>
          <van-stepper v-model="alarmSensitivity" :min="1" :max="10" :step="1" />
          <span class="threshold-unit">级</span>
        </div>
        <div class="setting-row">
          <div class="setting-label">持续震动告警</div>
          <van-switch v-model="continuousAlarm" size="22" active-color="#1A73E8" />
        </div>
        <div class="setting-row">
          <div class="setting-label">防拆报警</div>
          <van-switch v-model="tamperAlarm" size="22" active-color="#1A73E8" />
        </div>
      </div>

      <!-- 震动记录 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="notes-o" size="16" color="#7C3AED" />
          <span>震动记录</span>
          <span class="view-all" @click="goToAllLogs">查看全部</span>
        </div>
        <div class="event-item" v-for="ev in events" :key="ev.id">
          <div class="event-icon" :class="ev.type">
            <van-icon :name="ev.type === 'vibrate' ? 'smoke-o' : 'checked'" size="12" color="#fff" />
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
        <div class="info-row"><span>设备名称</span><span>震动传感器</span></div>
        <div class="info-row"><span>设备ID</span><span class="mono">VB-20240501</span></div>
        <div class="info-row"><span>固件版本</span><span>v1.0.0</span></div>
        <div class="info-row"><span>信号强度</span><span><van-icon name="wifi" size="12" /> 强</span></div>
        <div class="info-row"><span>电池电量</span><span>84%</span></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const vibrating = ref(false)
const intensity = ref(2)
const alarmEnabled = ref(true)
const alarmSensitivity = ref(5)
const continuousAlarm = ref(true)
const tamperAlarm = ref(true)
const showInfo = ref(false)

const intensityPercent = computed(() => (intensity.value / 10) * 100)
const intensityColor = computed(() => {
  if (intensity.value >= 7) return '#EA4335'
  if (intensity.value >= 4) return '#FBBC04'
  return '#34A853'
})

const events = ref([
  { id: 1, type: 'vibrate', label: '轻微震动 (2级)', time: '昨天 23:15' },
  { id: 2, type: 'vibrate', label: '中度震动 (5级)', time: '上周 15:30' }
])

const goToAllLogs = () => { console.log('查看全部日志') }
const goBack = () => router.back()
</script>

<style lang="scss" scoped>
.subdevice-page { height: 100%; overflow-y: auto; background: $bg-page; }
.page-header {
  background: $bg-color; padding: 12px 16px; display: flex; align-items: center; gap: 12px;
  border-bottom: 1px solid $border-color;
  h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; }
}
.back-btn {
  width: 32px; height: 32px; border-radius: 50%; background: $bg-page;
  display: flex; align-items: center; justify-content: center; color: $text-primary;
}
.page-body {
  padding: 12px 16px; display: flex; flex-direction: column; gap: 12px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
.status-card {
  background: $bg-color; border-radius: $radius-lg; padding: 32px 20px;
  box-shadow: $shadow-card; text-align: center;
  &.calm { background: #F5FFF5; .status-text { color: #34A853; } }
  &.active { background: #FFFDF5; .status-text { color: #D97706; } }
}
.status-icon { font-size: 48px; margin-bottom: 8px; }
.status-text { font-size: 22px; font-weight: 700; }
.status-sub { font-size: 13px; color: $text-secondary; margin-top: 6px; }
.section-card { background: $bg-color; border-radius: $radius-lg; padding: 14px 16px; box-shadow: $shadow-card; }
.section-title { display: flex; align-items: center; gap: 8px; font-size: $font-md; font-weight: 600; color: $text-primary; margin-bottom: 12px; }
.view-all { margin-left: auto; font-size: $font-sm; color: $primary-color; font-weight: 400; }
.vibration-bar { display: flex; align-items: center; gap: 12px; }
.intensity-text { font-size: 14px; font-weight: 600; color: $text-primary; flex-shrink: 0; }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.setting-label { font-size: $font-md; color: $text-regular; }
.threshold-row { display: flex; align-items: center; gap: 10px; padding: 8px 0 12px; border-bottom: 1px solid $border-light; }
.threshold-tag, .threshold-unit { font-size: $font-sm; color: $text-secondary; }
.event-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.event-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; &.vibrate { background: rgba(251,188,4,0.2); } &.test { background: rgba(52,168,83,0.2); } }
.event-info { display: flex; flex-direction: column; flex: 1; .event-name { font-size: $font-sm; color: $text-regular; } .event-time { font-size: 11px; color: $text-placeholder; } }
.info-popup { padding: 20px 16px; h3 { font-size: 18px; font-weight: 700; color: $text-primary; margin-bottom: 16px; } .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: $text-regular; border-bottom: 1px solid $border-light; .mono { font-family: monospace; font-size: 12px; } } }
</style>
