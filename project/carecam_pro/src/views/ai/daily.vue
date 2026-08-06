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

    <!-- 设备筛选 -->
    <div class="device-filter-bar">
      <span
        v-for="(d, i) in deviceOptions"
        :key="i"
        :class="['dev-filter-chip', { active: selectedDevice === d }]"
        @click="onDeviceChange(d)"
      >{{ d }}</span>
    </div>

    <!-- 当前设备未开通 → 截图预览 + 开通引导 -->
    <template v-if="!isActivated">
      <div class="not-activated-area">
        <div class="screenshot-phone">
          <div class="phone-notch"></div>
          <div class="screenshot-content">
            <div class="ss-badge">开通后</div>
            <div class="ss-device-bar">
              <span class="ss-chip ss-chip-active">{{ selectedDevice }}</span>
            </div>
            <div class="ss-card">
              <div class="ss-card-title">💡 AI总结</div>
              <div class="ss-summary-title">{{ agentConfig?.sampleReport?.summary || '今日一切安好' }}</div>
              <div class="ss-summary-text">{{ agentConfig?.sampleReport?.summary || '全天未检测到异常事件，家中安全状况良好。' }}</div>
            </div>
            <div class="ss-card">
              <div class="ss-card-title">📊 事件汇总</div>
              <div class="ss-event" v-for="(s, i) in (agentConfig?.sampleReport?.sections || previewSections)" :key="i">
                <span class="ss-event-name">{{ s.icon }} {{ s.label }}</span>
                <span class="ss-event-count">{{ s.count }} 件</span>
              </div>
            </div>
          </div>
        </div>
        <button class="na-inline-btn" @click="goToAgentPage">立即开通{{ agentConfig?.name || 'Agent' }}</button>
      </div>
    </template>

    <!-- 已开通 → 日报内容 -->
    <template v-else>
      <div class="scroll-area" ref="scrollArea">
        <!-- 生成中态 -->
        <template v-if="dailyStatus === 'generating'">
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
        <template v-else-if="dailyStatus === 'done'">
          <div class="section-card summary-card">
            <div class="section-title">💡 AI总结</div>
            <div class="summary-title-text">{{ currentSummaryTitle }}</div>
            <div class="summary-text" v-show="summaryExpanded">{{ currentAiSummary }}</div>
            <div class="summary-expand" v-if="!summaryExpanded" @click="summaryExpanded = true">
              点击查看详情 <van-icon name="arrow-down" size="12" />
            </div>
            <div class="summary-collapse" v-if="summaryExpanded" @click="summaryExpanded = false">
              收起 <van-icon name="arrow-up" size="12" />
            </div>
          </div>

          <div class="section-card">
            <div class="section-title">📊 事件汇总</div>
            <div
              v-for="(evt, i) in focusEvents"
              :key="i"
              class="focus-summary"
              :class="{ 'focus-summary-other': evt.name === '其他' }"
              @click="evt.name !== '其他' && openEventDetail(evt)"
            >
              <div class="focus-summary-top">
                <span class="focus-summary-name">{{ evt.icon }} {{ evt.name }}</span>
                <span class="focus-summary-count">{{ evt.count }} 件</span>
              </div>
              <div class="focus-timeline" v-if="getTimelineMsgs(evt.name).first.text">
                <div class="ft-item">
                  <div class="ft-dot"></div>
                  <div class="ft-time">{{ getTimelineMsgs(evt.name).first.time }}</div>
                  <div class="ft-text">{{ getTimelineMsgs(evt.name).first.text }}</div>
                </div>
                <div class="ft-item ft-ellipsis" v-if="getTimelineMsgs(evt.name).hasMiddle">
                  <div class="ft-dot ft-dot-empty"></div>
                  <div class="ft-time"></div>
                  <div class="ft-text">…</div>
                </div>
                <div class="ft-item">
                  <div class="ft-dot"></div>
                  <div class="ft-time">{{ getTimelineMsgs(evt.name).last.time }}</div>
                  <div class="ft-text">{{ getTimelineMsgs(evt.name).last.text }}</div>
                </div>
              </div>
            </div>
          </div>

          <div style="height:20px"></div>
        </template>

        <!-- 未生成态 -->
        <template v-else>
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <div class="empty-text">今日日报尚未生成</div>
            <div class="empty-sub">点击下方按钮生成今日日报</div>
          </div>
        </template>
      </div>

      <div class="bottom-bar-daily" v-if="dailyStatus !== 'generating'">
        <template v-if="dailyStatus === 'idle' || remainFree > 0">
          <button class="btn-generate" @click="handleGenerate">
            {{ dailyStatus === 'done' ? '重新生成' : '生成日报' }} · 剩余{{ remainFree }}次
          </button>
        </template>
        <template v-else>
          <div class="no-free-hint">今日生成次数已用完（每日最多{{ maxDailyGen }}次），明天自动重置</div>
        </template>
      </div>

      <div class="ai-disclaimer">本功能由AI大模型提供，个别结果可能存在误差</div>
    </template>

    <!-- 历史报告弹窗 -->
    <van-popup v-model:show="showHistory" position="bottom" round :style="{ height: '50%' }" lock-scroll>
      <div class="history-popup">
        <div class="popup-header">
          <h3>历史日报（近7日）</h3>
          <van-icon name="cross" size="20" @click.stop="closeHistory" />
        </div>
        <div
          v-for="(h, i) in historyList"
          :key="i"
          :class="['history-item', { active: h.date === todayStr }]"
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { deviceAgent, agentConfigs, isDeviceAgentActive, getDeviceAgent } from '@/store/devStatus'

const router = useRouter()
const goBack = () => router.back()

const deviceOptions = Object.keys(deviceAgent.value)

function getDefaultDevice() {
  for (const [dev, a] of Object.entries(deviceAgent.value)) {
    if (a && a.status === 'active') return dev
  }
  return deviceOptions[0] || '标准摄像机'
}
const selectedDevice = ref(getDefaultDevice())

const currentAgentInfo = computed(() => getDeviceAgent(selectedDevice.value))
const isActivated = computed(() => isDeviceAgentActive(selectedDevice.value))
const agentConfig = computed(() => {
  if (!currentAgentInfo.value) return null
  return agentConfigs.value.find(a => a.id === currentAgentInfo.value.agentId)
})

const goToAgentPage = () => {
  const info = currentAgentInfo.value
  if (info && info.status === 'active') return
  router.push('/agent-market')
}

// 日期
const today = new Date()
const todayStr = computed(() => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)

const dailyStatus = ref('idle')
const genStep = ref(0)
const showHistory = ref(false)

const maxDailyGen = 3
const genCountKey = computed(() => `ai_daily_gen_${todayStr.value}_${selectedDevice.value}`)
const autoGenKey = computed(() => `ai_daily_auto_${todayStr.value}_${selectedDevice.value}`)

function loadGenCount() {
  try { return parseInt(localStorage.getItem(genCountKey.value), 10) || 0 } catch { return 0 }
}
const todayGenCount = ref(loadGenCount())

watch(selectedDevice, () => { todayGenCount.value = loadGenCount() })
const remainFree = computed(() => Math.max(0, maxDailyGen - todayGenCount.value))

const onDeviceChange = (device) => {
  selectedDevice.value = device
  resetDaily()
}

// 预览用默认数据
const previewSections = [
  { icon: '👤', label: '人员经过', count: 3 },
  { icon: '🐱', label: '宠物活动', count: 5 },
  { icon: '⚠', label: '告警', count: 1 }
]

// 根据Agent动态生成日报数据
const focusEvents = computed(() => {
  const cfg = agentConfig.value
  if (!cfg) return [{ name: '其他', icon: '📋', count: 4 }]
  const counts = [3, 5, 2, 1, 4, 3, 2, 1]
  return cfg.focusList.slice(0, 5).map((f, i) => ({
    name: f.name,
    icon: f.icon,
    count: counts[i] || 1
  }))
})

// 事件消息映射 — 从 agent sampleMessages 构建
const eventMsgMap = computed(() => {
  const cfg = agentConfig.value
  if (!cfg || !cfg.focusList || !cfg.sampleMessages) return {}
  const map = {}
  cfg.sampleMessages.forEach((msg, i) => {
    const focus = cfg.focusList[i % cfg.focusList.length]
    if (focus) {
      if (!map[focus.name]) map[focus.name] = []
      map[focus.name].push({
        time: msg.time,
        text: `${focus.icon} ${msg.title}`
      })
    }
  })
  // 确保每个关注事件至少有一条
  cfg.focusList.forEach(f => {
    if (!map[f.name]) map[f.name] = [{ time: '--:--', text: `暂无${f.name}事件` }]
  })
  return map
})

const currentAiSummary = computed(() => agentConfig.value?.sampleReport?.summary || '今日一切正常，未检测到异常事件。')
const currentSummaryTitle = computed(() => {
  const s = currentAiSummary.value
  return s.length > 15 ? s.slice(0, 15) + '…' : s
})
const summaryExpanded = ref(false)

const openEventDetail = (evt) => {
  const msgs = eventMsgMap.value[evt.name] || []
  const listStr = encodeURIComponent(JSON.stringify(msgs))
  router.push(`/ai/daily-event?name=${encodeURIComponent(evt.name)}&list=${listStr}&index=0`)
}

function getTimelineMsgs(name) {
  const msgs = eventMsgMap.value[name] || []
  return {
    first: msgs[0] || { time: '', text: '' },
    last: msgs.length > 1 ? msgs[msgs.length - 1] : (msgs[0] || { time: '', text: '' }),
    hasMiddle: msgs.length > 2
  }
}

// Agent特定的历史数据
const allHistory = computed(() => {
  const name = agentConfig.value?.name || ''
  return [
    { date: '2026-05-27', summary: `${name}全天活动正常，无异常事件` },
    { date: '2026-05-26', summary: `一切正常，${name}识别准确` },
    { date: '2026-05-25', summary: `${name}活跃度较高，记录完整` },
    { date: '2026-05-24', summary: `今日${name}安静，无特别事件` },
    { date: '2026-05-23', summary: `${name}检测到多次活动，详情见报告` },
    { date: '2026-05-22', summary: `一切正常，天气晴朗` },
    { date: '2026-05-21', summary: `${name}模式正常，AI运行稳定` }
  ]
})

const historyList = computed(() => {
  const sevenAgo = new Date(today)
  sevenAgo.setDate(sevenAgo.getDate() - 7)
  const cutoff = `${sevenAgo.getFullYear()}-${String(sevenAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenAgo.getDate()).padStart(2, '0')}`
  return allHistory.value.filter(h => h.date >= cutoff && h.date <= todayStr.value)
})
const hasHistory = computed(() => historyList.value.length > 0)

const openHistory = () => { showHistory.value = true }
const closeHistory = () => { showHistory.value = false }

const shouldAutoGen = computed(() => {
  const now = new Date()
  return now.getHours() >= 20 && remainFree.value > 0 && dailyStatus.value === 'idle'
})

onMounted(() => {
  try { localStorage.removeItem(genCountKey.value); localStorage.removeItem(autoGenKey.value) } catch {}
  todayGenCount.value = 0
  try {
    const autoDone = localStorage.getItem(autoGenKey.value)
    if (!autoDone && shouldAutoGen.value) {
      localStorage.setItem(autoGenKey.value, '1')
      handleGenerate()
    }
  } catch {}
})

const loadHistory = (h) => { showHistory.value = false; dailyStatus.value = 'done' }
const resetDaily = () => { dailyStatus.value = 'idle'; genStep.value = 0 }

const handleGenerate = () => {
  if (dailyStatus.value !== 'idle' && remainFree.value <= 0) return
  dailyStatus.value = 'generating'
  genStep.value = 0
  todayGenCount.value++
  try { localStorage.setItem(genCountKey.value, String(todayGenCount.value)) } catch {}
  setTimeout(() => { genStep.value = 1 }, 800)
  setTimeout(() => { genStep.value = 2 }, 1800)
  setTimeout(() => { genStep.value = 3; setTimeout(() => { dailyStatus.value = 'done' }, 500) }, 2800)
}
</script>

<style lang="scss" scoped>
.ai-daily-page { height: 100%; background: $bg-page; display: flex; flex-direction: column; }
.ai-header { background: $bg-color; padding: 12px 16px; border-bottom: 1px solid $border-color; display: flex; align-items: center; gap: 12px; flex-shrink: 0; h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; } }
.back-btn, .header-right { width: 32px; height: 32px; border-radius: 50%; background: $bg-page; display: flex; align-items: center; justify-content: center; color: $text-secondary; flex-shrink: 0; }

.not-activated-area { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 16px 20px; overflow-y: auto; }
.screenshot-phone { width: 100%; max-width: 360px; border: 3px solid #1f2937; border-radius: 28px; overflow: hidden; background: $bg-page; box-shadow: 0 8px 30px rgba(0,0,0,0.15); margin-bottom: 20px; position: relative; }
.phone-notch { width: 70px; height: 7px; background: #1f2937; border-radius: 4px; margin: 12px auto 8px; }
.screenshot-content { padding: 10px 14px 16px; display: flex; flex-direction: column; gap: 8px; }
.ss-badge { align-self: flex-start; font-size: 10px; color: $primary-color; background: $primary-bg; padding: 2px 8px; border-radius: 4px; margin-bottom: 2px; }
.ss-device-bar { display: flex; gap: 4px; }
.ss-chip { font-size: 10px; padding: 3px 10px; border-radius: 12px; background: #f3f4f6; color: #9CA3AF; }
.ss-chip-active { background: $primary-color; color: #fff; }
.ss-card { background: #fff; border-radius: 10px; padding: 10px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.ss-card-title { font-size: 12px; font-weight: 700; color: $text-primary; margin-bottom: 6px; }
.ss-summary-title { font-size: 13px; font-weight: 600; color: $text-primary; margin-bottom: 4px; }
.ss-summary-text { font-size: 11px; color: $text-secondary; line-height: 1.5; }
.ss-event { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #f3f4f6; &:last-child { border-bottom: none; } }
.ss-event-name { font-size: 11px; font-weight: 500; color: $text-primary; }
.ss-event-count { font-size: 10px; color: $primary-color; font-weight: 600; }
.na-inline-btn { width: 100%; max-width: 300px; padding: 12px; background: linear-gradient(135deg, #1A73E8, #1557B0); color: #fff; border: none; border-radius: $radius-md; font-size: 15px; font-weight: 600; cursor: pointer; }

.device-filter-bar { background: $bg-color; padding: 8px 16px; display: flex; gap: 6px; flex-shrink: 0; border-bottom: 1px solid $border-color; overflow-x: auto; }
.dev-filter-chip { flex-shrink: 0; padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 500; color: $text-secondary; background: $bg-page; border: 1px solid $border-color; cursor: pointer; transition: all 0.15s; white-space: nowrap; &.active { background: $primary-color; color: #fff; border-color: $primary-color; } }

.scroll-area { flex: 1; overflow-y: auto; padding: 16px; }
.generating-indicator { padding: 20px; }
.gen-step { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; font-size: 13px; color: $text-secondary; &.done { color: $success-color; } .gen-dot { width: 10px; height: 10px; border-radius: 50%; background: $border-color; flex-shrink: 0; } &.done .gen-dot { background: $success-color; } }

.section-card { background: $bg-card; border-radius: $radius-lg; padding: 16px; margin-bottom: 12px; box-shadow: $shadow-card; }
.section-title { font-size: 14px; font-weight: 700; color: $text-primary; margin-bottom: 12px; }
.focus-summary { margin-bottom: 12px; border-bottom: 1px solid $border-light; padding-bottom: 10px; cursor: pointer; &:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; } }
.focus-summary-other { cursor: default; opacity: 0.85; }
.focus-summary-top { display: flex; justify-content: space-between; align-items: center; }
.focus-summary-name { font-size: 13px; font-weight: 600; color: $text-primary; }
.focus-summary-count { font-size: 12px; color: $primary-color; font-weight: 600; }
.focus-timeline { margin-top: 8px; padding-left: 4px; border-left: 2px solid $border-color; }
.ft-item { display: flex; align-items: baseline; gap: 6px; margin-bottom: 6px; position: relative; &:last-child { margin-bottom: 0; } }
.ft-dot { width: 6px; height: 6px; border-radius: 50%; background: $primary-color; flex-shrink: 0; margin-left: -13px; }
.ft-dot-empty { background: transparent; border: 1.5px solid $border-color; }
.ft-time { font-size: 10px; color: $text-placeholder; width: 40px; flex-shrink: 0; }
.ft-text { font-size: 12px; color: $text-primary; }
.ft-ellipsis .ft-text { font-size: 14px; letter-spacing: 2px; color: $text-placeholder; }
.summary-text { font-size: 14px; color: $text-primary; line-height: 1.6; }
.summary-title-text { font-size: 15px; font-weight: 600; color: $text-primary; line-height: 1.4; margin-bottom: 8px; }
.summary-expand { font-size: 12px; color: $primary-color; margin-top: 8px; cursor: pointer; display: flex; align-items: center; gap: 4px; }
.summary-collapse { font-size: 12px; color: var(--text-placeholder, #9CA3AF); margin-top: 10px; cursor: pointer; display: flex; align-items: center; gap: 4px; }

.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
.empty-icon { font-size: 56px; margin-bottom: 12px; }
.empty-text { font-size: 16px; font-weight: 700; color: $text-primary; }
.empty-sub { font-size: 13px; color: $text-secondary; margin-top: 8px; }

.bottom-bar-daily { flex-shrink: 0; padding: 12px 16px; padding-bottom: calc(12px + env(safe-area-inset-bottom, 8px)); border-top: 1px solid $border-color; background: $bg-color; }
.btn-generate { width: 100%; padding: 12px; background: linear-gradient(135deg, #1A73E8, #1557B0); color: #fff; border: none; border-radius: $radius-md; font-size: 15px; font-weight: 600; cursor: pointer; }
.no-free-hint { font-size: 12px; color: $text-secondary; text-align: center; margin-bottom: 8px; }

.ai-disclaimer { text-align: center; font-size: 11px; color: $text-placeholder; padding: 8px 16px; padding-bottom: calc(8px + env(safe-area-inset-bottom, 8px)); flex-shrink: 0; }

.history-popup { padding: 20px 16px 32px; }
.popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; h3 { font-size: 16px; font-weight: 700; color: $text-primary; } }
.history-item { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid $border-light; cursor: pointer; &.active { background: $primary-bg; border-radius: $radius-sm; padding: 12px 10px; } &:last-child { border-bottom: none; } }
.history-date { font-size: 13px; font-weight: 600; color: $text-primary; width: 100px; flex-shrink: 0; }
.history-summary { flex: 1; font-size: 12px; color: $text-secondary; }
</style>
