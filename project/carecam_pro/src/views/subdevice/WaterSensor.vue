<template>
  <div class="subdevice-page">
    <div class="page-header">
      <div class="back-btn" @click="goBack"><van-icon name="arrow-left" size="18" /></div>
      <h2>水浸传感器</h2>
      <van-icon name="info-o" size="18" color="#999" @click="showInfo = true" />
    </div>

    <div class="page-body">
      <!-- 状态卡片 -->
      <div class="status-card" :class="leaking ? 'leaking' : 'dry'">
        <div class="status-icon">💧</div>
        <div class="status-text">{{ leaking ? '⚠ 检测到漏水' : '正常' }}</div>
        <div class="status-sub" v-if="leaking">触发时间：{{ leakTime }}</div>
      </div>

      <!-- 告警设置 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="warning-o" size="16" color="#1A73E8" />
          <span>告警设置</span>
        </div>
        <div class="setting-row">
          <div class="setting-label">漏水告警</div>
          <van-switch v-model="alarmEnabled" size="22" active-color="#1A73E8" />
        </div>
        <div class="setting-row">
          <div class="setting-label">灵敏度</div>
          <div class="sensitivity-radio">
            <span v-for="s in sensitivities" :key="s.key" :class="['radio-item', { active: sensitivity === s.key }]" @click="sensitivity = s.key">{{ s.label }}</span>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-label">联动关阀</div>
          <van-switch v-model="autoShutoff" size="22" active-color="#1A73E8" />
        </div>
        <div class="setting-hint" v-if="autoShutoff">检测到漏水时自动关闭水阀</div>
        <div class="setting-row">
          <div class="setting-label">报警音</div>
          <van-switch v-model="soundEnabled" size="22" active-color="#1A73E8" />
        </div>
      </div>

      <!-- 自检 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="checked" size="16" color="#34A853" />
          <span>设备自检</span>
        </div>
        <van-button block round type="primary" @click="onTest" :loading="testing">测试告警</van-button>
        <div class="test-hint">按下按钮后设备将发出短促告警音，确认设备正常</div>
      </div>

      <!-- 报警记录 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="notes-o" size="16" color="#7C3AED" />
          <span>报警记录</span>
        </div>
        <div class="event-item" v-for="ev in events" :key="ev.id">
          <div class="event-icon" :class="ev.type">
            <van-icon :name="ev.type === 'leak' ? 'warning-o' : 'checked'" size="12" color="#fff" />
          </div>
          <div class="event-info">
            <span class="event-name">{{ ev.label }}</span>
            <span class="event-time">{{ ev.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <van-dialog v-model:show="showTestResult" :message="testResultMsg" confirm-button-text="确定" :show-cancel-button="false" />

    <van-popup v-model:show="showInfo" position="bottom" round :style="{ height: '40%' }">
      <div class="info-popup">
        <h3>设备信息</h3>
        <div class="info-row"><span>设备名称</span><span>水浸传感器</span></div>
        <div class="info-row"><span>设备ID</span><span class="mono">WS-20240501</span></div>
        <div class="info-row"><span>固件版本</span><span>v1.0.0</span></div>
        <div class="info-row"><span>信号强度</span><span><van-icon name="wifi" size="12" /> 强</span></div>
        <div class="info-row"><span>电池电量</span><span>82%</span></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const leaking = ref(false)
const leakTime = ref('')
const alarmEnabled = ref(true)
const sensitivity = ref('medium')
const autoShutoff = ref(true)
const soundEnabled = ref(true)
const testing = ref(false)
const showInfo = ref(false)
const showTestResult = ref(false)
const testResultMsg = ref('')

const sensitivities = [
  { key: 'low', label: '低' },
  { key: 'medium', label: '中' },
  { key: 'high', label: '高' }
]

const onTest = () => {
  testing.value = true
  setTimeout(() => {
    testing.value = false
    showTestResult.value = true
    testResultMsg.value = '设备自检正常'
  }, 2000)
}

const events = ref([
  { id: 1, type: 'leak', label: '漏水报警', time: '昨天 22:15' },
  { id: 2, type: 'test', label: '功能测试', time: '昨天 18:00' }
])

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
  &.dry { background: #F5FFF5; .status-text { color: #34A853; } }
  &.leaking { background: #FFF5F5; .status-text { color: #EA4335; } }
}
.status-icon { font-size: 48px; margin-bottom: 8px; }
.status-text { font-size: 22px; font-weight: 700; }
.status-sub { font-size: 13px; color: $text-secondary; margin-top: 6px; }
.section-card { background: $bg-color; border-radius: $radius-lg; padding: 14px 16px; box-shadow: $shadow-card; }
.section-title { display: flex; align-items: center; gap: 8px; font-size: $font-md; font-weight: 600; color: $text-primary; margin-bottom: 12px; }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.setting-label { font-size: $font-md; color: $text-regular; }
.setting-hint { font-size: 11px; color: $text-placeholder; margin-top: -4px; padding-bottom: 8px; border-bottom: 1px solid $border-light; }
.sensitivity-radio { display: flex; gap: 6px; }
.radio-item { font-size: 12px; padding: 4px 14px; border-radius: $radius-pill; border: 1.5px solid $border-color; color: $text-secondary; cursor: pointer; &.active { background: $primary-color; color: #fff; border-color: $primary-color; } }
.test-hint { font-size: 11px; color: $text-placeholder; text-align: center; margin-top: 8px; }
.event-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.event-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; &.leak { background: rgba(234,67,53,0.2); } &.test { background: rgba(52,168,83,0.2); } }
.event-info { display: flex; flex-direction: column; flex: 1; .event-name { font-size: $font-sm; color: $text-regular; } .event-time { font-size: 11px; color: $text-placeholder; } }
.info-popup { padding: 20px 16px; h3 { font-size: 18px; font-weight: 700; color: $text-primary; margin-bottom: 16px; } .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: $text-regular; border-bottom: 1px solid $border-light; .mono { font-family: monospace; font-size: 12px; } } }
</style>
