<template>
  <div class="subdevice-page">
    <div class="page-header">
      <div class="back-btn" @click="goBack"><van-icon name="arrow-left" size="18" /></div>
      <h2>环境探测器</h2>
      <van-icon name="info-o" size="18" color="#999" @click="showInfo = true" />
    </div>

    <div class="page-body">
      <!-- 实时数据 -->
      <div class="reading-card">
        <div class="env-grid">
          <div class="env-item">
            <van-icon name="hot-o" size="24" color="#EA4335" />
            <span class="env-value">{{ temp }}<small>°C</small></span>
            <span class="env-label">温度</span>
          </div>
          <div class="env-item">
            <van-icon name="water-o" size="24" color="#1A73E8" />
            <span class="env-value">{{ humidity }}<small>%</small></span>
            <span class="env-label">湿度</span>
          </div>
          <div class="env-item">
            <van-icon name="smoke-o" size="24" color="#7C3AED" />
            <span class="env-value">{{ pm25 }}<small>µg/m³</small></span>
            <span class="env-label">PM2.5</span>
          </div>
          <div class="env-item">
            <van-icon name="circle-o" size="24" color="#34A853" />
            <span class="env-value">{{ co2 }}<small>ppm</small></span>
            <span class="env-label">CO₂</span>
          </div>
        </div>
        <div class="reading-time">更新于 {{ lastUpdate }}</div>
      </div>

      <!-- 空气质量评估 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="medal-o" size="16" color="#FBBC04" />
          <span>空气质量</span>
        </div>
        <div class="air-quality">
          <van-progress :percentage="airQualityScore" :color="airQualityColor" stroke-width="12" />
          <span class="quality-text" :style="{ color: airQualityColor }">{{ airQualityLabel }}</span>
        </div>
      </div>

      <!-- 告警设置 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="warning-o" size="16" color="#FBBC04" />
          <span>告警设置</span>
        </div>
        <div class="setting-row">
          <div class="setting-label">高温告警</div>
          <van-switch v-model="highTempAlarm" size="22" active-color="#1A73E8" />
        </div>
        <div v-if="highTempAlarm" class="threshold-row">
          <span class="threshold-tag">阈值</span>
          <van-stepper v-model="highTempThreshold" :min="25" :max="60" :step="1" />
          <span class="threshold-unit">°C</span>
        </div>
        <div class="setting-row">
          <div class="setting-label">PM2.5告警</div>
          <van-switch v-model="pm25Alarm" size="22" active-color="#1A73E8" />
        </div>
        <div v-if="pm25Alarm" class="threshold-row">
          <span class="threshold-tag">阈值</span>
          <van-stepper v-model="pm25Threshold" :min="35" :max="500" :step="5" />
          <span class="threshold-unit">µg/m³</span>
        </div>
        <div class="setting-row">
          <div class="setting-label">CO₂告警</div>
          <van-switch v-model="co2Alarm" size="22" active-color="#1A73E8" />
        </div>
        <div v-if="co2Alarm" class="threshold-row">
          <span class="threshold-tag">阈值</span>
          <van-stepper v-model="co2Threshold" :min="400" :max="5000" :step="100" />
          <span class="threshold-unit">ppm</span>
        </div>
      </div>

      <!-- 历史趋势 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="chart-trending-o" size="16" color="#7C3AED" />
          <span>24h 趋势</span>
        </div>
        <div class="chart-placeholder">
          <van-icon name="chart-trending-o" size="40" color="rgba(26,115,232,0.15)" />
          <span>温湿度 / PM2.5 / CO₂ 趋势图</span>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showInfo" position="bottom" round :style="{ height: '40%' }">
      <div class="info-popup">
        <h3>设备信息</h3>
        <div class="info-row"><span>设备名称</span><span>环境探测器</span></div>
        <div class="info-row"><span>设备ID</span><span class="mono">ED-20240501</span></div>
        <div class="info-row"><span>固件版本</span><span>v1.2.0</span></div>
        <div class="info-row"><span>信号强度</span><span><van-icon name="wifi" size="12" /> 强</span></div>
        <div class="info-row"><span>电池电量</span><span>80%</span></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const temp = ref(24.5)
const humidity = ref(55)
const pm25 = ref(28)
const co2 = ref(620)
const lastUpdate = ref('14:30:22')

const highTempAlarm = ref(true)
const highTempThreshold = ref(35)
const pm25Alarm = ref(true)
const pm25Threshold = ref(75)
const co2Alarm = ref(true)
const co2Threshold = ref(1000)
const showInfo = ref(false)

const airQualityScore = computed(() => {
  const pm = Math.min(100, (pm25.value / 150) * 100)
  const c = Math.min(100, (co2.value / 2000) * 100)
  return 100 - Math.round((pm + c) / 2)
})

const airQualityColor = computed(() => {
  if (airQualityScore.value >= 80) return '#34A853'
  if (airQualityScore.value >= 50) return '#FBBC04'
  return '#EA4335'
})

const airQualityLabel = computed(() => {
  if (airQualityScore.value >= 80) return '优'
  if (airQualityScore.value >= 50) return '良'
  return '差'
})

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
.reading-card {
  background: $bg-color; border-radius: $radius-lg; padding: 20px;
  box-shadow: $shadow-card;
}
.env-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.env-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.env-value { font-size: 24px; font-weight: 700; color: $text-primary; small { font-size: 12px; font-weight: 400; color: $text-secondary; } }
.env-label { font-size: 11px; color: $text-secondary; }
.reading-time { text-align: center; font-size: 11px; color: $text-placeholder; margin-top: 12px; padding-top: 12px; border-top: 1px solid $border-light; }
.section-card { background: $bg-color; border-radius: $radius-lg; padding: 14px 16px; box-shadow: $shadow-card; }
.section-title { display: flex; align-items: center; gap: 8px; font-size: $font-md; font-weight: 600; color: $text-primary; margin-bottom: 12px; }
.air-quality { display: flex; align-items: center; gap: 12px; }
.quality-text { font-size: 16px; font-weight: 700; flex-shrink: 0; }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.setting-label { font-size: $font-md; color: $text-regular; }
.threshold-row { display: flex; align-items: center; gap: 10px; padding: 8px 0 12px; border-bottom: 1px solid $border-light; }
.threshold-tag, .threshold-unit { font-size: $font-sm; color: $text-secondary; }
.chart-placeholder { height: 120px; background: $bg-page; border-radius: $radius-md; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; span { font-size: $font-sm; color: $text-placeholder; } }
.info-popup { padding: 20px 16px; h3 { font-size: 18px; font-weight: 700; color: $text-primary; margin-bottom: 16px; } .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: $text-regular; border-bottom: 1px solid $border-light; .mono { font-family: monospace; font-size: 12px; } } }
</style>
