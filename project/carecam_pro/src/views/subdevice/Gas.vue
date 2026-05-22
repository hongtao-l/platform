<template>
  <div class="subdevice-page">
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>燃气传感器</h2>
      <van-icon name="info-o" size="18" color="#999" @click="showInfo = true" />
    </div>

    <div class="page-body">
      <!-- 实时数据 -->
      <div class="reading-card" :class="alarmLevel">
        <div class="gauge-area">
          <van-circle
            :rate="gasPercent"
            :speed="60"
            :text="gasLabel"
            :color="alarmLevel === 'alarm' ? '#EA4335' : alarmLevel === 'warn' ? '#FBBC04' : '#34A853'"
            :stroke-width="60"
            size="160"
          />
        </div>
        <div class="reading-detail">
          <span class="detail-val">{{ gasValue }} %LEL</span>
          <span class="detail-tag" :class="alarmLevel">{{ alarmText }}</span>
        </div>
        <div class="reading-time">更新于 {{ lastUpdate }}</div>
      </div>

      <!-- 紧急操作 -->
      <div class="section-card emergency-card">
        <div class="section-title">
          <van-icon name="warning-o" size="16" color="#EA4335" />
          <span>紧急操作</span>
        </div>
        <van-button block round type="danger" @click="onEmergencyShutoff" :loading="shuttingOff">
          紧急关闭阀门
        </van-button>
        <div class="emergency-hint">紧急情况下可远程关闭燃气阀门，请谨慎操作</div>
        <div class="valve-status">
          <span :class="['valve-dot', valveOpen ? 'open' : 'closed']"></span>
          <span>阀门状态：{{ valveOpen ? '开启' : '已关闭' }}</span>
          <van-button v-if="!valveOpen" size="small" round type="primary" @click="onValveOpen" text="重新打开" />
        </div>
      </div>

      <!-- 告警阈值 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="warning-o" size="16" color="#FBBC04" />
          <span>告警设置</span>
        </div>

        <div class="setting-row">
          <div class="setting-label">燃气告警</div>
          <van-switch v-model="alarmEnabled" size="22" active-color="#1A73E8" />
        </div>
        <div v-if="alarmEnabled" class="threshold-row">
          <span class="threshold-tag">告警阈值</span>
          <van-stepper v-model="alarmThreshold" :min="5" :max="50" :step="1" />
          <span class="threshold-unit">%LEL</span>
        </div>

        <div class="setting-row">
          <div class="setting-label">灵敏度</div>
          <div class="sensitivity-radio">
            <span v-for="s in sensitivities" :key="s.key" :class="['radio-item', { active: sensitivity === s.key }]" @click="sensitivity = s.key">{{ s.label }}</span>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-label">报警音</div>
          <van-switch v-model="soundEnabled" size="22" active-color="#1A73E8" />
        </div>

        <div class="setting-row">
          <div class="setting-label">联动关阀</div>
          <van-switch v-model="autoShutoff" size="22" active-color="#1A73E8" />
        </div>
        <div class="setting-hint">检测到燃气泄漏时自动关闭阀门</div>
      </div>

      <!-- 自检 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="checked" size="16" color="#34A853" />
          <span>设备自检</span>
        </div>
        <van-button block round type="primary" @click="onTestAlarm" :loading="testing">
          测试告警
        </van-button>
        <div class="test-hint">按下按钮后设备将发出短促告警音，确认设备正常</div>
      </div>

      <!-- 历史 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="chart-trending-o" size="16" color="#7C3AED" />
          <span>24h 燃气浓度趋势</span>
        </div>
        <div class="chart-placeholder">
          <van-icon name="chart-trending-o" size="40" color="rgba(26,115,232,0.15)" />
          <span>燃气浓度趋势图</span>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showInfo" position="bottom" round :style="{ height: '40%' }">
      <div class="info-popup">
        <h3>设备信息</h3>
        <div class="info-row"><span>设备名称</span><span>燃气传感器</span></div>
        <div class="info-row"><span>设备ID</span><span class="mono">GS-20240501</span></div>
        <div class="info-row"><span>固件版本</span><span>v1.0.0</span></div>
        <div class="info-row"><span>信号强度</span><span><van-icon name="wifi" size="12" /> 强</span></div>
        <div class="info-row"><span>电池电量</span><span>68%</span></div>
      </div>
    </van-popup>

    <van-dialog
      v-model:show="showTestResult"
      :message="testResultMsg"
      confirm-button-text="确定"
      :show-cancel-button="false"
    />

    <van-dialog
      v-model:show="showShutoffConfirm"
      title="确认紧急关阀？"
      message="关闭阀门后，燃气供应将被切断。只有手动或通过此页面重新打开。"
      show-cancel-button
      @confirm="confirmShutoff"
      confirm-button-text="确认关闭"
      confirm-button-color="#EA4335"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const gasValue = ref(3)
const lastUpdate = ref('14:30:22')
const alarmThreshold = ref(20)
const alarmEnabled = ref(true)
const sensitivity = ref('medium')
const soundEnabled = ref(true)
const autoShutoff = ref(true)
const testing = ref(false)
const shuttingOff = ref(false)
const valveOpen = ref(true)
const showInfo = ref(false)
const showShutoffConfirm = ref(false)
const showTestResult = ref(false)

const sensitivities = [
  { key: 'low', label: '低' },
  { key: 'medium', label: '中' },
  { key: 'high', label: '高' },
]

const gasPercent = computed(() => Math.min(100, (gasValue.value / 50) * 100))
const gasLabel = computed(() => gasPercent.value.toFixed(0) + '%')

const alarmLevel = computed(() => {
  if (!alarmEnabled.value) return 'normal'
  if (gasValue.value >= alarmThreshold.value) return 'alarm'
  if (gasValue.value >= alarmThreshold.value * 0.6) return 'warn'
  return 'normal'
})

const alarmText = computed(() => {
  if (alarmLevel.value === 'alarm') return '⚠ 危险'
  if (alarmLevel.value === 'warn') return '注意'
  return '正常'
})

const onEmergencyShutoff = () => {
  showShutoffConfirm.value = true
}

const confirmShutoff = () => {
  shuttingOff.value = true
  setTimeout(() => {
    valveOpen.value = false
    shuttingOff.value = false
    showTestResult.value = true
    testResultMsg.value = '阀门已关闭'
  }, 1500)
}

const onValveOpen = () => {
  valveOpen.value = true
  showTestResult.value = true
  testResultMsg.value = '阀门已开启'
}

const testResultMsg = ref('')

const onTestAlarm = () => {
  testing.value = true
  setTimeout(() => {
    testing.value = false
    showTestResult.value = true
    testResultMsg.value = '设备自检正常'
  }, 2000)
}

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

/* 实时数据 */
.reading-card {
  background: $bg-color;
  border-radius: $radius-lg;
  padding: 24px 20px;
  box-shadow: $shadow-card;
  text-align: center;
  &.normal { background: $bg-color; }
  &.warn { background: #FFFDF5; }
  &.alarm { background: #FFF5F5; }
}

.gauge-area {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.reading-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  .detail-val { font-size: 20px; font-weight: 700; color: $text-primary; }
  .detail-tag {
    font-size: 12px; padding: 2px 10px; border-radius: $radius-pill;
    &.normal { background: $success-light; color: $success-color; }
    &.warn { background: $warning-light; color: #B8860B; }
    &.alarm { background: $danger-light; color: $danger-color; }
  }
}

.reading-time {
  text-align: center;
  font-size: 11px;
  color: $text-placeholder;
  margin-top: 12px;
}

/* 设置 */
.section-card {
  background: $bg-color;
  border-radius: $radius-lg;
  padding: 14px 16px;
  box-shadow: $shadow-card;
}

.emergency-card {
  border: 1.5px solid rgba(234,67,53,0.2);
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

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid $border-light;
  &:last-child { border-bottom: none; }
}

.setting-label { font-size: $font-md; color: $text-regular; }

.setting-hint {
  font-size: 11px;
  color: $text-placeholder;
  margin-top: 6px;
}

.threshold-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0 12px;
  border-bottom: 1px solid $border-light;
}

.threshold-tag, .threshold-unit {
  font-size: $font-sm;
  color: $text-secondary;
}

.sensitivity-radio {
  display: flex;
  gap: 6px;
}

.radio-item {
  font-size: 12px;
  padding: 4px 14px;
  border-radius: $radius-pill;
  border: 1.5px solid $border-color;
  color: $text-secondary;
  cursor: pointer;
  &.active { background: $primary-color; color: #fff; border-color: $primary-color; }
}

.emergency-hint {
  font-size: 11px;
  color: $text-placeholder;
  text-align: center;
  margin-top: 8px;
}

.valve-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid $border-light;
  font-size: $font-md;
  color: $text-regular;
}

.valve-dot {
  width: 10px; height: 10px; border-radius: 50%;
  &.open { background: $success-color; }
  &.closed { background: $danger-color; }
}

.test-hint {
  font-size: 11px;
  color: $text-placeholder;
  text-align: center;
  margin-top: 8px;
}

.chart-placeholder {
  height: 120px;
  background: $bg-page;
  border-radius: $radius-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  span { font-size: $font-sm; color: $text-placeholder; }
}

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
