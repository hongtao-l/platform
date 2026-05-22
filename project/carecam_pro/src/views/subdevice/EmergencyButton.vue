<template>
  <div class="subdevice-page">
    <div class="page-header">
      <div class="back-btn" @click="goBack"><van-icon name="arrow-left" size="18" /></div>
      <h2>紧急按钮</h2>
      <van-icon name="info-o" size="18" color="#999" @click="showInfo = true" />
    </div>

    <div class="page-body">
      <!-- 状态卡片 -->
      <div class="status-card" :class="triggered ? 'triggered' : 'standby'">
        <div class="status-icon">🆘</div>
        <div class="status-text">{{ triggered ? '⚠ 已触发' : '待命中' }}</div>
        <div class="status-sub" v-if="triggered">触发时间：{{ triggerTime }}</div>
      </div>

      <!-- 测试 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="checked" size="16" color="#34A853" />
          <span>功能测试</span>
        </div>
        <van-button block round type="primary" @click="onTest" :loading="testing">测试按钮</van-button>
        <div class="test-hint">点击后将模拟触发紧急告警，确认设备正常工作</div>
      </div>

      <!-- 告警设置 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="warning-o" size="16" color="#EA4335" />
          <span>告警设置</span>
        </div>
        <div class="setting-row">
          <div class="setting-label">联动报警</div>
          <van-switch v-model="linkedAlarm" size="22" active-color="#1A73E8" />
        </div>
        <div class="setting-row">
          <div class="setting-label">报警通知</div>
          <div class="checkbox-group">
            <label class="checkbox-item"><van-checkbox v-model="notifyMethods" shape="square" checked-color="#1A73E8">App推送</van-checkbox></label>
            <label class="checkbox-item"><van-checkbox v-model="notifyMethods" shape="square" checked-color="#1A73E8">短信</van-checkbox></label>
            <label class="checkbox-item"><van-checkbox v-model="notifyMethods" shape="square" checked-color="#1A73E8">电话</van-checkbox></label>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-label">防拆报警</div>
          <van-switch v-model="tamperAlarm" size="22" active-color="#1A73E8" />
        </div>
        <div class="setting-row">
          <div class="setting-label">低电量报警</div>
          <van-switch v-model="lowBatteryAlarm" size="22" active-color="#1A73E8" />
        </div>
      </div>

      <!-- 触发日志 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="notes-o" size="16" color="#7C3AED" />
          <span>触发记录</span>
          <span class="view-all" @click="goToAllLogs">查看全部</span>
        </div>
        <div class="event-item" v-for="ev in events" :key="ev.id">
          <div class="event-icon" :class="ev.type">
            <van-icon :name="ev.type === 'trigger' ? 'warning-o' : 'checked'" size="12" color="#fff" />
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
        <div class="info-row"><span>设备名称</span><span>紧急按钮</span></div>
        <div class="info-row"><span>设备ID</span><span class="mono">EB-20240501</span></div>
        <div class="info-row"><span>固件版本</span><span>v1.0.0</span></div>
        <div class="info-row"><span>信号强度</span><span><van-icon name="wifi" size="12" /> 强</span></div>
        <div class="info-row"><span>电池电量</span><span>{{ battery }}%</span></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const triggered = ref(false)
const triggerTime = ref('')
const testing = ref(false)
const battery = ref(90)
const linkedAlarm = ref(true)
const tamperAlarm = ref(true)
const lowBatteryAlarm = ref(true)
const notifyMethods = ref(['App推送', '短信'])
const showInfo = ref(false)
const showTestResult = ref(false)
const testResultMsg = ref('')

const onTest = () => {
  testing.value = true
  setTimeout(() => {
    testing.value = false
    showTestResult.value = true
    testResultMsg.value = '测试完成，设备正常'
  }, 2000)
}

const events = ref([
  { id: 1, type: 'test', label: '功能测试', time: '今天 14:30' },
  { id: 2, type: 'test', label: '功能测试', time: '昨天 10:15' }
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
  &.standby { background: #F5FFF5; .status-text { color: #34A853; } }
  &.triggered { background: #FFF5F5; .status-text { color: #EA4335; } }
}
.status-icon { font-size: 48px; margin-bottom: 8px; }
.status-text { font-size: 22px; font-weight: 700; }
.status-sub { font-size: 13px; color: $text-secondary; margin-top: 6px; }
.section-card { background: $bg-color; border-radius: $radius-lg; padding: 14px 16px; box-shadow: $shadow-card; }
.section-title { display: flex; align-items: center; gap: 8px; font-size: $font-md; font-weight: 600; color: $text-primary; margin-bottom: 12px; }
.view-all { margin-left: auto; font-size: $font-sm; color: $primary-color; font-weight: 400; }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.setting-label { font-size: $font-md; color: $text-regular; }
.checkbox-group { display: flex; gap: 12px; }
.checkbox-item { font-size: 13px; }
.test-hint { font-size: 11px; color: $text-placeholder; text-align: center; margin-top: 8px; }
.event-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.event-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; &.trigger { background: rgba(234,67,53,0.2); } &.test { background: rgba(52,168,83,0.2); } }
.event-info { display: flex; flex-direction: column; flex: 1; .event-name { font-size: $font-sm; color: $text-regular; } .event-time { font-size: 11px; color: $text-placeholder; } }
.info-popup { padding: 20px 16px; h3 { font-size: 18px; font-weight: 700; color: $text-primary; margin-bottom: 16px; } .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: $text-regular; border-bottom: 1px solid $border-light; .mono { font-family: monospace; font-size: 12px; } } }
</style>
