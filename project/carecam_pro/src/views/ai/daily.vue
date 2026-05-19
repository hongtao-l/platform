<template>
  <div class="ai-daily-page">
    <div class="ai-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>AI日报</h2>
      <div class="header-right" v-if="hasHistory && isActivated" @click.stop="openHistory">
        <van-icon name="clock-o" size="18" />
      </div>
    </div>

    <!-- 日期选择 — 始终可见 -->
    <div class="date-bar">
      <van-icon name="arrow-left" size="16" color="#1A73E8" @click="prevDay" />
      <div class="date-display" @click="showDatePicker = true">{{ displayDate }}</div>
      <van-icon name="arrow" size="16" color="#1A73E8" @click="nextDay" />
    </div>

    <!-- 设备筛选 — 始终可见 -->
    <div class="device-filter-bar">
      <span
        v-for="(d, i) in deviceOptions"
        :key="i"
        :class="['dev-filter-chip', { active: selectedDevice === d }]"
        @click="onDeviceChange(d)"
      >{{ d }}</span>
    </div>

    <!-- 当前设备未开通 → 内联引导提示 -->
    <template v-if="!isActivated">
      <div class="not-activated-inline">
        <div class="na-inline-icon">📋</div>
        <div class="na-inline-title">AI日报</div>
        <div class="na-inline-desc">每日自动生成图文报告，AI总结家中动态，一目了然</div>
        <button class="na-inline-btn" @click="goToAiHome">立即开通全能AI</button>
      </div>
    </template>

    <!-- 已开通 → 日报内容 -->
    <template v-else>
      <div class="scroll-area" ref="scrollArea">
        <!-- 生成中态 -->
        <template v-if="isGenerating">
          <div class="generating-indicator">
            <div class="gen-step" :class="{ done: genStep >= 1 }">
              <div class="gen-dot"></div>
              <span v-if="genStep < 1">分析关注事件…</span>
              <span v-else>✅ 分析关注事件完成</span>
            </div>
            <div class="gen-step" :class="{ done: genStep >= 2 }">
              <div class="gen-dot"></div>
              <span v-if="genStep < 2">整理时间线…</span>
              <span v-else>✅ 时间线整理完成</span>
            </div>
            <div class="gen-step" :class="{ done: genStep >= 3 }">
              <div class="gen-dot"></div>
              <span v-if="genStep < 3">AI生成总结…</span>
              <span v-else>✅ AI总结生成完成</span>
            </div>
          </div>
        </template>

        <!-- 已生成态 -->
        <template v-else-if="dailyGenerated">
          <!-- 各关注事件数量汇总（含时间线消息） -->
          <div class="section-card">
            <div class="section-title">📊 事件汇总</div>
            <div
              v-for="(evt, i) in focusEvents"
              :key="i"
              class="focus-summary"
              @click="openEventDetail(evt)"
            >
              <div class="focus-summary-top">
                <span class="focus-summary-name">{{ evt.name }}</span>
                <span class="focus-summary-count">{{ evt.count }} 件</span>
              </div>
              <div class="focus-summary-msg">{{ evt.latestMsg }}</div>
              <!-- 时间线消息：最多3条 -->
              <div class="focus-timeline">
                <div
                  v-for="(m, j) in getPreviewMsgs(evt.name)"
                  :key="j"
                  class="ft-item"
                >
                  <div class="ft-dot"></div>
                  <div class="ft-time">{{ m.time }}</div>
                  <div class="ft-text">{{ m.text }}</div>
                </div>
                <!-- 省略号 -->
                <div class="ft-item ft-ellipsis" v-if="shouldShowEllipsis(evt.name)">
                  <div class="ft-dot ft-dot-empty"></div>
                  <div class="ft-time"></div>
                  <div class="ft-text">…</div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI总结 -->
          <div class="section-card">
            <div class="section-title">💡 AI总结</div>
            <div class="summary-text">{{ aiSummary }}</div>
          </div>

          <div style="height:20px"></div>
        </template>

        <!-- 未生成态 -->
        <template v-else>
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <div class="empty-text">{{ isEmptyDate ? '该日期暂无日报' : '生成一份日报，一目了然' }}</div>
            <div class="empty-sub" v-if="!isEmptyDate">点击下方按钮生成 {{ displayDate }} 的日报</div>
          </div>
        </template>
      </div>

      <!-- 底部：生成日报按钮 / 免费用完引导 -->
      <div class="bottom-bar-daily" v-if="!isGenerating">
        <template v-if="remainFree > 0">
          <button class="btn-generate" @click="handleGenerate">
            {{ dailyGenerated ? '重新生成' : '生成日报' }} · 剩余{{ remainFree }}次
          </button>
        </template>
        <template v-else>
          <div class="no-free-hint">本月免费次数已用完</div>
          <button class="btn-buy" @click="goToAiHome">开通套餐获取更多次数</button>
        </template>
      </div>
    </template>

    <!-- 日期选择弹窗 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        v-model="selectedDate"
        title="选择日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 历史报告弹窗 -->
    <van-popup v-model:show="showHistory" position="bottom" round :style="{ height: '50%' }" lock-scroll>
      <div class="history-popup">
        <div class="popup-header">
          <h3>历史日报</h3>
          <van-icon name="cross" size="20" @click.stop="closeHistory" />
        </div>
        <div
          v-for="(h, i) in historyList"
          :key="i"
          :class="['history-item', { active: h.date === selectedDateStr }]"
          @click.stop="loadHistory(h)"
        >
          <div class="history-date">{{ h.date }}</div>
          <div class="history-summary">{{ h.summary }}</div>
          <van-icon name="arrow" size="14" color="#9CA3AF" />
        </div>
      </div>
    </van-popup>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { aiStatus, deviceAiStatus, defaultActivatedDevice, isDeviceActivated } from '@/store/devStatus'

const router = useRouter()
const goBack = () => router.back()
const goToAiHome = () => router.push('/ai?show=activate')

// 全局已开通 + 当前设备已开通 → true
const isActivated = computed(() =>
  aiStatus.value !== 'not_activated' && isDeviceActivated(selectedDevice.value)
)

// 日期
const today = new Date()
const displayYear = ref(today.getFullYear())
const displayMonth = ref(today.getMonth() + 1)
const displayDay = ref(today.getDate())
const selectedDate = ref([String(today.getFullYear()), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')])
const showDatePicker = ref(false)
const showHistory = ref(false)
const minDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
const maxDate = today

const displayDate = computed(() => `${displayYear.value}年${displayMonth.value}月${displayDay.value}日`)
const selectedDateStr = computed(() => `${displayYear.value}-${String(displayMonth.value).padStart(2, '0')}-${String(displayDay.value).padStart(2, '0')}`)

const prevDay = () => {
  const d = new Date(displayYear.value, displayMonth.value - 1, displayDay.value - 1)
  displayYear.value = d.getFullYear()
  displayMonth.value = d.getMonth() + 1
  displayDay.value = d.getDate()
  resetDaily()
}
const nextDay = () => {
  const d = new Date(displayYear.value, displayMonth.value - 1, displayDay.value + 1)
  if (d > today) return
  displayYear.value = d.getFullYear()
  displayMonth.value = d.getMonth() + 1
  displayDay.value = d.getDate()
  resetDaily()
}
const onDateConfirm = ({ selectedValues }) => {
  displayYear.value = parseInt(selectedValues[0])
  displayMonth.value = parseInt(selectedValues[1])
  displayDay.value = parseInt(selectedValues[2])
  showDatePicker.value = false
  resetDaily()
}

// 日报状态
const isGenerating = ref(false)
const genStep = ref(0)
const dailyGenerated = ref(false)
const isEmptyDate = ref(false)

const remainFree = computed(() => 5)

// 设备筛选
const deviceOptions = Object.keys(deviceAiStatus.value)
const selectedDevice = ref(defaultActivatedDevice.value)

const onDeviceChange = (device) => {
  selectedDevice.value = device
  resetDaily()
}

// 日报数据 — 使用全能AI配置的关注事件
const focusEvents = ref([
  { name: '人员经过', count: 3, latestMsg: '🚶 门口有人经过，检测到人脸' },
  { name: '宠物活动', count: 5, latestMsg: '🐱 猫咪在客厅跑酷，活力满满' },
  { name: '告警', count: 1, latestMsg: '🔔 后窗异常移动，已AI过滤' }
])

const eventMsgMap = {
  '人员经过': [
    { time: '07:45', text: '🚶 奶奶出门买菜经过门口', bg: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)' },
    { time: '10:00', text: '🚶 快递员在门口放下包裹', bg: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)' },
    { time: '11:20', text: '🚶 奶奶买菜回家经过门口', bg: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)' }
  ],
  '宠物活动': [
    { time: '06:20', text: '🐱 猫咪在客厅跑酷', bg: 'linear-gradient(135deg, #0d2e1a, #1a5c34)' },
    { time: '08:30', text: '🐱 猫咪在厨房吃猫粮', bg: 'linear-gradient(135deg, #0d2e1a, #1a5c34)' },
    { time: '10:15', text: '🐱 猫咪在阳台晒太阳', bg: 'linear-gradient(135deg, #0d2e1a, #1a5c34)' },
    { time: '14:00', text: '🐱 猫咪从沙发跳到茶几', bg: 'linear-gradient(135deg, #0d2e1a, #1a5c34)' },
    { time: '16:30', text: '🐱 猫咪抓沙发被抓拍', bg: 'linear-gradient(135deg, #0d2e1a, #1a5c34)' }
  ],
  '告警': [
    { time: '03:12', text: '🔔 后窗有异常移动，AI识别为树枝', bg: 'linear-gradient(135deg, #3a1a1a, #6e1a1a)' }
  ]
}

const aiSummary = ref('今天一切正常，奶奶出门1次，猫咪很活跃。全天未检测到异常告警，家中安全状况良好。')

const openEventDetail = (evt) => {
  const msgs = eventMsgMap[evt.name] || []
  const listStr = encodeURIComponent(JSON.stringify(msgs))
  router.push(`/ai/daily-event?name=${encodeURIComponent(evt.name)}&list=${listStr}&index=0`)
}

// 每个关注事件最多展示 3 条：第1条、省略号、最后1条
const getPreviewMsgs = (name) => {
  const msgs = eventMsgMap[name] || []
  if (msgs.length <= 3) return msgs
  return [msgs[0], msgs[msgs.length - 1]]
}
const shouldShowEllipsis = (name) => {
  const msgs = eventMsgMap[name] || []
  return msgs.length > 3
}

const historyList = ref([
  { date: '2026-04-27', summary: '奶奶出门2次，猫咪很活跃' },
  { date: '2026-04-26', summary: '一切正常，奶奶生活规律' },
  { date: '2026-04-25', summary: '猫咪特别活跃，运动量满分' },
  { date: '2026-04-24', summary: '奶奶今天在家一天没有出门' }
])

const hasHistory = computed(() => historyList.value.length > 0)

const openHistory = () => {
  showHistory.value = true
}

const closeHistory = () => {
  showHistory.value = false
}

const loadHistory = (h) => {
  showHistory.value = false
  const parts = h.date.split('-')
  displayYear.value = parseInt(parts[0])
  displayMonth.value = parseInt(parts[1])
  displayDay.value = parseInt(parts[2])
  dailyGenerated.value = true
}

const resetDaily = () => {
  dailyGenerated.value = false
  isGenerating.value = false
  genStep.value = 0
  isEmptyDate.value = false
}

// 生成日报（模拟逐步生成）
const handleGenerate = () => {
  isGenerating.value = true
  dailyGenerated.value = false
  genStep.value = 0

  // 模拟逐步生成
  setTimeout(() => { genStep.value = 1 }, 800)
  setTimeout(() => { genStep.value = 2 }, 1800)
  setTimeout(() => {
    genStep.value = 3
    setTimeout(() => {
      isGenerating.value = false
      dailyGenerated.value = true
    }, 500)
  }, 2800)
}
</script>

<style lang="scss" scoped>
.ai-daily-page { height: 100%; background: $bg-page; display: flex; flex-direction: column; }
.ai-header { background: $bg-color; padding: 12px 16px; border-bottom: 1px solid $border-color; display: flex; align-items: center; gap: 12px; flex-shrink: 0; h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; } }
.back-btn, .header-right { width: 32px; height: 32px; border-radius: 50%; background: $bg-page; display: flex; align-items: center; justify-content: center; color: $text-secondary; flex-shrink: 0; }

/* 内联未开通引导 */
.not-activated-inline { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
.na-inline-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.6; }
.na-inline-title { font-size: 16px; font-weight: 700; color: $text-primary; }
.na-inline-desc { font-size: 12px; color: $text-secondary; margin-top: 6px; text-align: center; max-width: 260px; line-height: 1.5; }
.na-inline-btn { margin-top: 20px; padding: 10px 28px; background: linear-gradient(135deg, #1A73E8, #1557B0); color: #fff; border: none; border-radius: $radius-md; font-size: 14px; font-weight: 600; cursor: pointer; }

/* 日期栏 */
.date-bar { background: $bg-color; padding: 10px 16px; display: flex; align-items: center; justify-content: center; gap: 12px; flex-shrink: 0; border-bottom: 1px solid $border-color; }
.date-display { font-size: 15px; font-weight: 700; color: $text-primary; cursor: pointer; padding: 4px 12px; }
/* 设备筛选 */
.device-filter-bar { background: $bg-color; padding: 8px 16px; display: flex; gap: 6px; flex-shrink: 0; border-bottom: 1px solid $border-color; overflow-x: auto; }
.dev-filter-chip { flex-shrink: 0; padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 500; color: $text-secondary; background: $bg-page; border: 1px solid $border-color; cursor: pointer; transition: all 0.15s; white-space: nowrap; &.active { background: $primary-color; color: #fff; border-color: $primary-color; } }

/* 滚动区 */
.scroll-area { flex: 1; overflow-y: auto; padding: 16px; }

/* 生成中指示器 */
.generating-indicator { padding: 20px; }
.gen-step { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; font-size: 13px; color: $text-secondary; &.done { color: $success-color; } .gen-dot { width: 10px; height: 10px; border-radius: 50%; background: $border-color; flex-shrink: 0; } &.done .gen-dot { background: $success-color; } }

/* 已生成卡片 */
.section-card { background: $bg-card; border-radius: $radius-lg; padding: 16px; margin-bottom: 12px; box-shadow: $shadow-card; }
.section-title { font-size: 14px; font-weight: 700; color: $text-primary; margin-bottom: 12px; }

.focus-summary { margin-bottom: 12px; border-bottom: 1px solid $border-light; padding-bottom: 10px; cursor: pointer; &:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; } }
.focus-summary-top { display: flex; justify-content: space-between; align-items: center; }
.focus-summary-name { font-size: 13px; font-weight: 600; color: $text-primary; }
.focus-summary-count { font-size: 12px; color: $primary-color; font-weight: 600; }
.focus-summary-msg { font-size: 12px; color: $text-secondary; margin-top: 4px; line-height: 1.4; }

/* 每个关注事件下的时间线消息 */
.focus-timeline { margin-top: 8px; padding-left: 4px; border-left: 2px solid $border-color; }
.ft-item { display: flex; align-items: baseline; gap: 6px; margin-bottom: 6px; position: relative; &:last-child { margin-bottom: 0; } }
.ft-dot { width: 6px; height: 6px; border-radius: 50%; background: $primary-color; flex-shrink: 0; margin-left: -13px; }
.ft-dot-empty { background: transparent; border: 1.5px solid $border-color; }
.ft-time { font-size: 10px; color: $text-placeholder; width: 40px; flex-shrink: 0; }
.ft-text { font-size: 12px; color: $text-primary; }
.ft-ellipsis .ft-text { font-size: 14px; letter-spacing: 2px; color: $text-placeholder; }
.summary-text { font-size: 14px; color: $text-primary; line-height: 1.6; }

/* 空态 */
.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
.empty-icon { font-size: 56px; margin-bottom: 12px; }
.empty-text { font-size: 16px; font-weight: 700; color: $text-primary; }
.empty-sub { font-size: 13px; color: $text-secondary; margin-top: 8px; }

/* 底部 */
.bottom-bar-daily { flex-shrink: 0; padding: 12px 16px; padding-bottom: calc(12px + env(safe-area-inset-bottom, 8px)); border-top: 1px solid $border-color; background: $bg-color; }
.btn-generate { width: 100%; padding: 12px; background: linear-gradient(135deg, #1A73E8, #1557B0); color: #fff; border: none; border-radius: $radius-md; font-size: 15px; font-weight: 600; cursor: pointer; }
.no-free-hint { font-size: 12px; color: $text-secondary; text-align: center; margin-bottom: 8px; }
.btn-buy { width: 100%; padding: 12px; background: $bg-card; color: $primary-color; border: 1.5px solid $primary-color; border-radius: $radius-md; font-size: 14px; font-weight: 600; cursor: pointer; }

/* 历史弹窗 */
.history-popup { padding: 20px 16px 32px; }
.popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; h3 { font-size: 16px; font-weight: 700; color: $text-primary; } }
.history-item { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid $border-light; cursor: pointer; &.active { background: $primary-bg; border-radius: $radius-sm; padding: 12px 10px; } &:last-child { border-bottom: none; } }
.history-date { font-size: 13px; font-weight: 600; color: $text-primary; width: 100px; flex-shrink: 0; }
.history-summary { flex: 1; font-size: 12px; color: $text-secondary; }
</style>