<template>
  <div class="subdevice-page">
    <div class="page-header">
      <div class="back-btn" @click="goBack"><van-icon name="arrow-left" size="18" /></div>
      <h2>跌倒探测器</h2>
      <van-icon name="info-o" size="18" color="#999" @click="showInfo = true" />
    </div>

    <div class="page-body">
      <!-- 状态卡片 -->
      <div class="status-card" :class="triggered ? 'triggered' : 'normal'">
        <div class="status-icon">🦽</div>
        <div class="status-text">{{ triggered ? '⚠ 检测到跌倒' : '正常监护中' }}</div>
        <div class="status-sub" v-if="triggered">触发时间：{{ triggerTime }}</div>
      </div>

      <!-- 探测器状态 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="eye-o" size="16" color="#1A73E8" />
          <span>监测状态</span>
        </div>
        <div class="info-grid">
          <div class="info-cell">
            <span class="info-cell-label">探测覆盖</span>
            <span class="info-cell-val on">正常</span>
          </div>
          <div class="info-cell">
            <span class="info-cell-label">探测角度</span>
            <span class="info-cell-val">{{ angle }}°</span>
          </div>
          <div class="info-cell">
            <span class="info-cell-label">探测距离</span>
            <span class="info-cell-val">{{ range }}m</span>
          </div>
          <div class="info-cell">
            <span class="info-cell-label">安装高度</span>
            <span class="info-cell-val">{{ height }}m</span>
          </div>
        </div>
      </div>

      <!-- 告警设置 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="warning-o" size="16" color="#FBBC04" />
          <span>告警设置</span>
        </div>
        <div class="setting-row">
          <div class="setting-label">跌倒告警</div>
          <van-switch v-model="alarmEnabled" size="22" active-color="#1A73E8" />
        </div>
        <div class="setting-row">
          <div class="setting-label">灵敏度</div>
          <div class="sensitivity-radio">
            <span v-for="s in sensitivities" :key="s.key" :class="['radio-item', { active: sensitivity === s.key }]" @click="sensitivity = s.key">{{ s.label }}</span>
          </div>
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
          <div class="setting-label">自动求救</div>
          <van-switch v-model="autoSOS" size="22" active-color="#1A73E8" />
        </div>
        <div class="setting-hint" v-if="autoSOS">检测到跌倒后30秒内未手动取消，将自动通知紧急联系人</div>
      </div>

      <!-- 事件记录 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="notes-o" size="16" color="#7C3AED" />
          <span>事件记录</span>
          <span class="view-all" @click="goToAllLogs">查看全部</span>
        </div>
        <div class="event-item" v-for="ev in events" :key="ev.id">
          <div class="event-icon" :class="ev.type">
            <van-icon :name="ev.type === 'fall' ? 'warning-o' : 'checked'" size="12" color="#fff" />
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
        <div class="info-row"><span>设备名称</span><span>跌倒探测器</span></div>
        <div class="info-row"><span>设备ID</span><span class="mono">FD-20240501</span></div>
        <div class="info-row"><span>固件版本</span><span>v1.0.0</span></div>
        <div class="info-row"><span>信号强度</span><span><van-icon name="wifi" size="12" /> 强</span></div>
        <div class="info-row"><span>电池电量</span><span>76%</span></div>
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
const angle = ref(120)
const range = ref(6)
const height = ref(2.8)
const alarmEnabled = ref(true)
const sensitivity = ref('medium')
const linkedAlarm = ref(true)
const autoSOS = ref(true)
const notifyMethods = ref(['App推送', '短信', '电话'])
const showInfo = ref(false)

const sensitivities = [
  { key: 'low', label: '低' },
  { key: 'medium', label: '中' },
  { key: 'high', label: '高' }
]

const events = ref([
  { id: 1, type: 'test', label: '定期巡检', time: '今天 08:00' },
  { id: 2, type: 'test', label: '定期巡检', time: '昨天 08:00' }
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
  &.normal { background: #F5FFF5; .status-text { color: #34A853; } }
  &.triggered { background: #FFF5F5; .status-text { color: #EA4335; } }
}
.status-icon { font-size: 48px; margin-bottom: 8px; }
.status-text { font-size: 22px; font-weight: 700; }
.status-sub { font-size: 13px; color: $text-secondary; margin-top: 6px; }
.section-card { background: $bg-color; border-radius: $radius-lg; padding: 14px 16px; box-shadow: $shadow-card; }
.section-title { display: flex; align-items: center; gap: 8px; font-size: $font-md; font-weight: 600; color: $text-primary; margin-bottom: 12px; }
.view-all { margin-left: auto; font-size: $font-sm; color: $primary-color; font-weight: 400; }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.info-cell { display: flex; flex-direction: column; gap: 2px; .info-cell-label { font-size: 11px; color: $text-secondary; } .info-cell-val { font-size: 16px; font-weight: 600; color: $text-primary; &.on { color: #34A853; } } }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.setting-label { font-size: $font-md; color: $text-regular; }
.setting-hint { font-size: 11px; color: $text-placeholder; margin-top: 6px; }
.checkbox-group { display: flex; gap: 12px; }
.checkbox-item { font-size: 13px; }
.sensitivity-radio { display: flex; gap: 6px; }
.radio-item { font-size: 12px; padding: 4px 14px; border-radius: $radius-pill; border: 1.5px solid $border-color; color: $text-secondary; cursor: pointer; &.active { background: $primary-color; color: #fff; border-color: $primary-color; } }
.event-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.event-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; &.fall { background: rgba(234,67,53,0.2); } &.test { background: rgba(52,168,83,0.2); } }
.event-info { display: flex; flex-direction: column; flex: 1; .event-name { font-size: $font-sm; color: $text-regular; } .event-time { font-size: 11px; color: $text-placeholder; } }
.info-popup { padding: 20px 16px; h3 { font-size: 18px; font-weight: 700; color: $text-primary; margin-bottom: 16px; } .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: $text-regular; border-bottom: 1px solid $border-light; .mono { font-family: monospace; font-size: 12px; } } }
</style>
