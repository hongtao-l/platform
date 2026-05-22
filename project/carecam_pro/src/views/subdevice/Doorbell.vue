<template>
  <div class="subdevice-page">
    <div class="page-header">
      <div class="back-btn" @click="goBack"><van-icon name="arrow-left" size="18" /></div>
      <h2>门铃</h2>
      <van-icon name="info-o" size="18" color="#999" @click="showInfo = true" />
    </div>

    <div class="page-body">
      <!-- 状态卡片 -->
      <div class="status-card">
        <div class="status-icon">🔔</div>
        <div class="status-text">待机中</div>
        <div class="status-sub">今日响铃：{{ todayRings }} 次</div>
      </div>

      <!-- 门铃设置 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="setting-o" size="16" color="#1A73E8" />
          <span>门铃设置</span>
        </div>
        <div class="setting-row">
          <div class="setting-label">铃声</div>
          <div class="sensitivity-radio">
            <span v-for="r in ringtones" :key="r.key" :class="['radio-item', { active: ringtone === r.key }]" @click="ringtone = r.key">{{ r.label }}</span>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-label">音量</div>
          <van-slider v-model="volume" :min="0" :max="100" bar-height="4px" active-color="#1A73E8" style="width:120px" />
        </div>
        <div class="setting-row">
          <div class="setting-label">静音时段</div>
          <van-switch v-model="quietMode" size="22" active-color="#1A73E8" />
        </div>
        <div v-if="quietMode" class="timeout-row">
          <van-field v-model="quietStart" readonly size="small" class="time-input" @click="showQuietStartPicker = true" />
          <span class="timeout-label">至</span>
          <van-field v-model="quietEnd" readonly size="small" class="time-input" @click="showQuietEndPicker = true" />
        </div>
        <div class="setting-row">
          <div class="setting-label">移动侦测</div>
          <van-switch v-model="motionDetect" size="22" active-color="#1A73E8" />
        </div>
      </div>

      <!-- 门铃记录 -->
      <div class="section-card">
        <div class="section-title">
          <van-icon name="notes-o" size="16" color="#7C3AED" />
          <span>响铃记录</span>
          <span class="view-all" @click="goToAllLogs">查看全部</span>
        </div>
        <div class="log-item" v-for="log in ringLogs" :key="log.id">
          <van-icon name="bell" size="14" color="#1A73E8" />
          <span class="log-action">{{ log.type }}</span>
          <span class="log-time">{{ log.time }}</span>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showQuietStartPicker" position="bottom" round>
      <van-time-picker v-model="quietStartTime" title="开始时间" @confirm="onStartConfirm" @cancel="showQuietStartPicker = false" />
    </van-popup>
    <van-popup v-model:show="showQuietEndPicker" position="bottom" round>
      <van-time-picker v-model="quietEndTime" title="结束时间" @confirm="onEndConfirm" @cancel="showQuietEndPicker = false" />
    </van-popup>

    <van-popup v-model:show="showInfo" position="bottom" round :style="{ height: '40%' }">
      <div class="info-popup">
        <h3>设备信息</h3>
        <div class="info-row"><span>设备名称</span><span>门铃</span></div>
        <div class="info-row"><span>设备ID</span><span class="mono">DB-20240501</span></div>
        <div class="info-row"><span>固件版本</span><span>v1.1.0</span></div>
        <div class="info-row"><span>信号强度</span><span><van-icon name="wifi" size="12" /> 强</span></div>
        <div class="info-row"><span>电池电量</span><span>75%</span></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const todayRings = ref(3)
const ringtone = ref('dingdong')
const volume = ref(70)
const quietMode = ref(false)
const quietStart = ref('22:00')
const quietEnd = ref('07:00')
const motionDetect = ref(true)
const showInfo = ref(false)
const showQuietStartPicker = ref(false)
const showQuietEndPicker = ref(false)
const quietStartTime = ref(['22', '00'])
const quietEndTime = ref(['07', '00'])

const ringtones = [
  { key: 'dingdong', label: '叮咚' },
  { key: 'bell', label: '铃声' },
  { key: 'music', label: '音乐' }
]

const onStartConfirm = ({ selectedValues }) => { quietStart.value = selectedValues.join(':'); showQuietStartPicker.value = false }
const onEndConfirm = ({ selectedValues }) => { quietEnd.value = selectedValues.join(':'); showQuietEndPicker.value = false }

const ringLogs = ref([
  { id: 1, type: '有人按铃', time: '今天 14:30' },
  { id: 2, type: '有人按铃', time: '今天 09:15' },
  { id: 3, type: '移动侦测', time: '今天 08:00' }
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
}
.status-icon { font-size: 48px; margin-bottom: 8px; }
.status-text { font-size: 22px; font-weight: 700; color: #34A853; }
.status-sub { font-size: 13px; color: $text-secondary; margin-top: 4px; }
.section-card { background: $bg-color; border-radius: $radius-lg; padding: 14px 16px; box-shadow: $shadow-card; }
.section-title { display: flex; align-items: center; gap: 8px; font-size: $font-md; font-weight: 600; color: $text-primary; margin-bottom: 12px; }
.view-all { margin-left: auto; font-size: $font-sm; color: $primary-color; font-weight: 400; }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.setting-label { font-size: $font-md; color: $text-regular; }
.sensitivity-radio { display: flex; gap: 6px; }
.radio-item { font-size: 12px; padding: 4px 14px; border-radius: $radius-pill; border: 1.5px solid $border-color; color: $text-secondary; cursor: pointer; &.active { background: $primary-color; color: #fff; border-color: $primary-color; } }
.timeout-row { display: flex; align-items: center; gap: 8px; padding: 8px 0 12px; border-bottom: 1px solid $border-light; }
.timeout-label { font-size: $font-sm; color: $text-secondary; }
.time-input { width: 80px; padding: 4px 8px !important; text-align: center; }
.log-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid $border-light; .log-action { font-size: $font-sm; color: $text-regular; flex: 1; } .log-time { font-size: $font-sm; color: $text-secondary; } }
.info-popup { padding: 20px 16px; h3 { font-size: 18px; font-weight: 700; color: $text-primary; margin-bottom: 16px; } .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: $text-regular; border-bottom: 1px solid $border-light; .mono { font-family: monospace; font-size: 12px; } } }
</style>
