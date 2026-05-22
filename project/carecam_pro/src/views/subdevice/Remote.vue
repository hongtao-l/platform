<template>
  <div class="subdevice-page">
    <div class="page-header">
      <div class="back-btn" @click="goBack"><van-icon name="arrow-left" size="18" /></div>
      <h2>遥控器</h2>
      <van-icon name="info-o" size="18" color="#999" @click="showInfo = true" />
    </div>

    <div class="page-body">
      <!-- 状态卡片 -->
      <div class="status-card" :class="paired ? 'paired' : 'unpaired'">
        <div class="status-icon">🎮</div>
        <div class="status-text">{{ paired ? '已配对' : '未配对' }}</div>
        <div class="status-sub">信号强度：{{ signalLevel }}</div>
      </div>

      <!-- 按键测试 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="point-gift-o" size="16" color="#1A73E8" />
          <span>按键测试</span>
        </div>
        <div class="key-grid">
          <div v-for="k in keys" :key="k.key" class="key-btn" :class="{ pressed: k.pressed }"
            @touchstart="k.pressed = true" @touchend="k.pressed = false; onKeyPress(k)">
            <van-icon :name="k.icon" size="20" />
            <span>{{ k.label }}</span>
          </div>
        </div>
        <div class="last-key" v-if="lastKey">最近按下：{{ lastKey }}</div>
      </div>

      <!-- 遥控器设置 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="setting-o" size="16" color="#7C3AED" />
          <span>遥控器设置</span>
        </div>
        <div class="setting-row">
          <div class="setting-label">按键灵敏度</div>
          <div class="sensitivity-radio">
            <span v-for="s in sensitivities" :key="s.key" :class="['radio-item', { active: sensitivity === s.key }]" @click="sensitivity = s.key">{{ s.label }}</span>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-label">按键音</div>
          <van-switch v-model="keySound" size="22" active-color="#1A73E8" />
        </div>
        <div class="setting-row">
          <div class="setting-label">低电量告警</div>
          <van-switch v-model="lowBatteryAlarm" size="22" active-color="#1A73E8" />
        </div>
      </div>

      <!-- 操作日志 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="notes-o" size="16" color="#7C3AED" />
          <span>操作记录</span>
        </div>
        <div class="log-item" v-for="log in logs" :key="log.id">
          <span class="log-action">{{ log.action }}</span>
          <span class="log-time">{{ log.time }}</span>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showInfo" position="bottom" round :style="{ height: '40%' }">
      <div class="info-popup">
        <h3>设备信息</h3>
        <div class="info-row"><span>设备名称</span><span>遥控器</span></div>
        <div class="info-row"><span>设备ID</span><span class="mono">RC-20240501</span></div>
        <div class="info-row"><span>固件版本</span><span>v1.0.0</span></div>
        <div class="info-row"><span>配对状态</span><span>{{ paired ? '已配对' : '未配对' }}</span></div>
        <div class="info-row"><span>电池电量</span><span>{{ battery }}%</span></div>
        <div class="info-row"><span>信号强度</span><span>{{ signalLevel }}</span></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const paired = ref(true)
const battery = ref(85)
const signalLevel = ref('强')
const sensitivity = ref('medium')
const keySound = ref(true)
const lowBatteryAlarm = ref(true)
const showInfo = ref(false)
const lastKey = ref('')

const sensitivities = [
  { key: 'low', label: '低' },
  { key: 'medium', label: '中' },
  { key: 'high', label: '高' }
]

const keys = ref([
  { key: 'up', label: '上', icon: 'arrow-up', pressed: false },
  { key: 'down', label: '下', icon: 'arrow-down', pressed: false },
  { key: 'left', label: '左', icon: 'arrow-left', pressed: false },
  { key: 'right', label: '右', icon: 'arrow', pressed: false },
  { key: 'ok', label: '确认', icon: 'success', pressed: false },
  { key: 'back', label: '返回', icon: 'revoke', pressed: false }
])

const logs = ref([
  { id: 1, action: '按下「确认」键', time: '今天 14:30' },
  { id: 2, action: '按下「上」键', time: '今天 14:28' },
  { id: 3, action: '按下「左」键', time: '今天 14:25' }
])

function onKeyPress(k) {
  lastKey.value = k.label + ' (' + new Date().toLocaleTimeString() + ')'
}

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
  &.paired { background: #F5FFF5; .status-text { color: #34A853; } }
  &.unpaired { background: #FFF5F5; .status-text { color: #EA4335; } }
}
.status-icon { font-size: 48px; margin-bottom: 8px; }
.status-text { font-size: 22px; font-weight: 700; }
.status-sub { font-size: 13px; color: $text-secondary; margin-top: 4px; }
.section-card { background: $bg-color; border-radius: $radius-lg; padding: 14px 16px; box-shadow: $shadow-card; }
.section-title { display: flex; align-items: center; gap: 8px; font-size: $font-md; font-weight: 600; color: $text-primary; margin-bottom: 12px; }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.setting-label { font-size: $font-md; color: $text-regular; }
.sensitivity-radio { display: flex; gap: 6px; }
.radio-item { font-size: 12px; padding: 4px 14px; border-radius: $radius-pill; border: 1.5px solid $border-color; color: $text-secondary; cursor: pointer; &.active { background: $primary-color; color: #fff; border-color: $primary-color; } }
.key-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.key-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 8px; background: $bg-page; border-radius: $radius-md; cursor: pointer; user-select: none;
  &.pressed { background: rgba(26,115,232,0.15); color: $primary-color; }
  span { font-size: 11px; }
}
.last-key { text-align: center; font-size: 12px; color: $text-secondary; margin-top: 10px; }
.log-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid $border-light; .log-action { font-size: $font-sm; color: $text-regular; flex: 1; } .log-time { font-size: $font-sm; color: $text-secondary; } }
.info-popup { padding: 20px 16px; h3 { font-size: 18px; font-weight: 700; color: $text-primary; margin-bottom: 16px; } .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: $text-regular; border-bottom: 1px solid $border-light; .mono { font-family: monospace; font-size: 12px; } } }
</style>
