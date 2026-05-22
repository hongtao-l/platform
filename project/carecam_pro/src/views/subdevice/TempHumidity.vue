<template>
  <div class="subdevice-page">
    <!-- 顶部栏 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>温湿度传感器</h2>
      <van-icon name="info-o" size="18" color="#999" @click="showInfo = true" />
    </div>

    <div class="page-body">
      <!-- 实时数据 -->
      <div class="reading-card" :class="{ warning: tempAlarm || humidityAlarm }">
        <div class="reading-row">
          <div class="reading-item">
            <div class="reading-value" :class="{ 'temp-high': tempHigh, 'temp-low': tempLow }">
              {{ currentTemp }}<span class="unit">°C</span>
            </div>
            <div class="reading-label">当前温度</div>
          </div>
          <div class="reading-divider"></div>
          <div class="reading-item">
            <div class="reading-value" :class="{ 'humidity-high': humidityHigh, 'humidity-low': humidityLow }">
              {{ currentHumidity }}<span class="unit">%</span>
            </div>
            <div class="reading-label">当前湿度</div>
          </div>
        </div>
        <div class="reading-time">
          更新于 {{ lastUpdate }}
        </div>
      </div>

      <!-- 温度告警阈值 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="hot-o" size="16" color="#EA4335" />
          <span>温度告警阈值</span>
        </div>

        <div class="setting-row">
          <div class="setting-label">高温告警</div>
          <van-switch v-model="highTempEnabled" size="22" active-color="#1A73E8" />
        </div>
        <div v-if="highTempEnabled" class="threshold-row">
          <span class="threshold-tag">阈值</span>
          <van-stepper v-model="highTempThreshold" :min="25" :max="80" :step="0.5" />
          <span class="threshold-unit">°C</span>
        </div>

        <div class="setting-row">
          <div class="setting-label">低温告警</div>
          <van-switch v-model="lowTempEnabled" size="22" active-color="#1A73E8" />
        </div>
        <div v-if="lowTempEnabled" class="threshold-row">
          <span class="threshold-tag">阈值</span>
          <van-stepper v-model="lowTempThreshold" :min="-20" :max="20" :step="0.5" />
          <span class="threshold-unit">°C</span>
        </div>
      </div>

      <!-- 湿度告警阈值 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="water-o" size="16" color="#1A73E8" />
          <span>湿度告警阈值</span>
        </div>

        <div class="setting-row">
          <div class="setting-label">高湿告警</div>
          <van-switch v-model="highHumidityEnabled" size="22" active-color="#1A73E8" />
        </div>
        <div v-if="highHumidityEnabled" class="threshold-row">
          <span class="threshold-tag">阈值</span>
          <van-stepper v-model="highHumidityThreshold" :min="60" :max="100" :step="1" />
          <span class="threshold-unit">%</span>
        </div>

        <div class="setting-row">
          <div class="setting-label">低湿告警</div>
          <van-switch v-model="lowHumidityEnabled" size="22" active-color="#1A73E8" />
        </div>
        <div v-if="lowHumidityEnabled" class="threshold-row">
          <span class="threshold-tag">阈值</span>
          <van-stepper v-model="lowHumidityThreshold" :min="0" :max="40" :step="1" />
          <span class="threshold-unit">%</span>
        </div>
      </div>

      <!-- 历史趋势（占位） -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="chart-trending-o" size="16" color="#7C3AED" />
          <span>24h 趋势</span>
        </div>
        <div class="chart-placeholder">
          <van-icon name="chart-trending-o" size="40" color="rgba(26,115,232,0.15)" />
          <span>温度 / 湿度 趋势图</span>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showInfo" position="bottom" round :style="{ height: '40%' }">
      <div class="info-popup">
        <h3>设备信息</h3>
        <div class="info-row"><span>设备名称</span><span>温湿度传感器</span></div>
        <div class="info-row"><span>设备ID</span><span class="mono">TH-20240501</span></div>
        <div class="info-row"><span>固件版本</span><span>v1.2.0</span></div>
        <div class="info-row"><span>信号强度</span><span><van-icon name="wifi" size="12" /> 强</span></div>
        <div class="info-row"><span>电池电量</span><span>87%</span></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentTemp = ref(26.5)
const currentHumidity = ref(58)
const lastUpdate = ref('14:30:22')

const highTempEnabled = ref(true)
const highTempThreshold = ref(40)
const lowTempEnabled = ref(true)
const lowTempThreshold = ref(5)
const highHumidityEnabled = ref(true)
const highHumidityThreshold = ref(80)
const lowHumidityEnabled = ref(false)
const lowHumidityThreshold = ref(20)

const showInfo = ref(false)

const tempHigh = computed(() => highTempEnabled.value && currentTemp.value > highTempThreshold.value)
const tempLow = computed(() => lowTempEnabled.value && currentTemp.value < lowTempThreshold.value)
const humidityHigh = computed(() => highHumidityEnabled.value && currentHumidity.value > highHumidityThreshold.value)
const humidityLow = computed(() => lowHumidityEnabled.value && currentHumidity.value < lowHumidityThreshold.value)
const tempAlarm = computed(() => tempHigh.value || tempLow.value)
const humidityAlarm = computed(() => humidityHigh.value || humidityLow.value)

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
  padding: 20px;
  box-shadow: $shadow-card;
  transition: background .3s;
  &.warning { background: #FFF5F5; }
}

.reading-row {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.reading-item {
  text-align: center;
}

.reading-value {
  font-size: 42px;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.1;
  .unit { font-size: 18px; font-weight: 400; color: $text-secondary; }
  &.temp-high { color: #EA4335; }
  &.temp-low { color: #1A73E8; }
  &.humidity-high { color: #EA4335; }
  &.humidity-low { color: #FBBC04; }
}

.reading-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: 4px;
}

.reading-divider {
  width: 1px;
  background: $border-color;
  align-self: stretch;
}

.reading-time {
  text-align: center;
  font-size: 11px;
  color: $text-placeholder;
  margin-top: 12px;
}

/* 设置卡片 */
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

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid $border-light;
  &:last-child { border-bottom: none; }
}

.setting-label {
  font-size: $font-md;
  color: $text-regular;
}

.threshold-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0 12px;
  border-bottom: 1px solid $border-light;
}

.threshold-tag {
  font-size: $font-sm;
  color: $text-secondary;
  background: $bg-page;
  padding: 4px 10px;
  border-radius: $radius-pill;
}

.threshold-unit {
  font-size: $font-sm;
  color: $text-secondary;
}

:deep(.van-stepper__input) {
  color: $text-primary;
}

/* 图表占位 */
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
