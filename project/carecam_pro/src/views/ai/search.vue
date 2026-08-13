<template>
  <div class="ai-search-page">
    <div class="ai-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>AI搜索</h2>
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

    <!-- Agent选择器（多Agent时显示） -->
    <div class="agent-selector-bar" v-if="deviceAgents.length > 1">
      <span
        v-for="a in deviceAgents"
        :key="a.agentId"
        :class="['agent-selector-chip', { active: (selectedAgentId || deviceAgents[0]?.agentId) === a.agentId }]"
        @click="selectedAgentId = a.agentId"
      >{{ a.agentIcon }} {{ a.agentName }}</span>
    </div>

    <!-- 搜索输入区 -->
    <div class="search-input-area">
      <div class="search-input-box">
        <input
          v-model="queryText"
          class="search-input"
          :placeholder="searchPlaceholder"
          @keyup.enter="doSearch"
        />
        <van-icon
          v-if="queryText"
          name="close"
          size="16"
          color="#9CA3AF"
          class="search-clear"
          @click="clearSearch"
        />
        <button class="search-btn" @click="doSearch">搜索</button>
      </div>
      <div class="search-examples">{{ searchExample }}</div>
    </div>

    <!-- 当前设备未开通 → 截图预览 + 开通引导 -->
    <template v-if="!isActivated">
      <div class="not-activated-area">
        <div class="screenshot-phone">
          <div class="phone-notch"></div>
          <div class="screenshot-content">
            <div class="ss-badge">开通后</div>
            <div class="ss-search-box">
              <van-icon name="search" size="14" color="#9CA3AF" />
              <span class="ss-query-text">{{ previewQuery }}</span>
            </div>
            <div class="ss-section-title">猜你想搜</div>
            <div class="ss-tags">
              <span class="ss-tag" v-for="(g, i) in guessList.slice(0, 4)" :key="i">{{ g }}</span>
            </div>
            <div class="ss-results">
              <div class="ss-result-item" v-for="(r, i) in previewResults" :key="i">
                <div class="ss-thumb" :style="{ background: r.bg }"></div>
                <div class="ss-info">
                  <div class="ss-summary">{{ r.summary }}</div>
                  <div class="ss-meta">
                    <span class="ss-tag-label">{{ r.eventName }}</span>
                    <span class="ss-time">{{ r.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="na-inline-btn" @click="goToAgentPage">立即开通{{ agentConfig?.name || '智能体' }}</button>
      </div>
    </template>

    <!-- 已开通 → 搜索结果 / 猜你想搜 -->
    <template v-else>
      <div class="guess-section" v-if="!hasSearched">
        <div class="guess-title">猜你想搜</div>
        <div class="guess-tags">
          <span
            v-for="(g, i) in guessList"
            :key="i"
            class="guess-tag"
            @click="selectGuess(g)"
          >{{ g }}</span>
        </div>
      </div>

      <div class="result-list" v-if="hasSearched">
        <div class="result-count">共找到 {{ searchResults.length }} 条相关事件</div>
        <div
          v-for="(r, i) in searchResults"
          :key="i"
          class="result-item"
          @click="openDetail(r)"
        >
          <div class="result-thumb" :style="{ background: r.bg }"></div>
          <div class="result-info">
            <div class="result-summary">{{ r.summary }}</div>
            <div class="result-meta">
              <span class="result-event-name">{{ r.eventName }}</span>
              <span class="result-time">{{ r.time }}</span>
            </div>
          </div>
        </div>
        <div style="height:20px"></div>
      </div>

      <div class="empty-hint" v-if="!hasSearched">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">输入描述，AI帮你快速找到相关事件</div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { deviceAgent, agentConfigs, isDeviceAgentActive, getDeviceAgents, getAgentConfig } from '@/store/devStatus'

const router = useRouter()
const goBack = () => router.back()

const deviceOptions = Object.keys(deviceAgent.value)

function getDefaultDevice() {
  for (const [dev, agents] of Object.entries(deviceAgent.value)) {
    if (agents.some(a => a.status === 'active')) return dev
  }
  return deviceOptions[0] || '标准摄像机'
}
const selectedDevice = ref(getDefaultDevice())

// 当前设备的所有Agent
const deviceAgents = computed(() => getDeviceAgents(selectedDevice.value).filter(a => a.status === 'active'))
const isActivated = computed(() => isDeviceAgentActive(selectedDevice.value))

// 当前选中的Agent类型
const selectedAgentId = ref('')
const agentConfig = computed(() => {
  const id = selectedAgentId.value || deviceAgents.value[0]?.agentId
  return id ? getAgentConfig(id) : null
})

// 初始化/切换设备时选中第一个
function syncSelectedAgent() {
  if (deviceAgents.value.length > 0 && !deviceAgents.value.find(a => a.agentId === selectedAgentId.value)) {
    selectedAgentId.value = deviceAgents.value[0].agentId
  }
}
syncSelectedAgent()

const goToAgentPage = () => router.push('/agent-market')

const onDeviceChange = (device) => {
  selectedDevice.value = device
  syncSelectedAgent()
}

// 搜索
const queryText = ref('')
const hasSearched = ref(false)

// Agent特定的搜索建议
const searchPlaceholder = computed(() => {
  const id = agentConfig.value?.id
  if (id === 'pet_guardian_v1') return '描述宠物相关事件，如：猫咪吃饭、狗狗玩耍…'
  if (id === 'door_guardian_v1') return '描述门口事件，如：快递送达、访客到访…'
  return '描述你想搜索的事件…'
})

const searchExample = computed(() => {
  const id = agentConfig.value?.id
  if (id === 'pet_guardian_v1') return '👉 试试："今天猫咪吃了几次饭" "狗狗有没有呕吐"'
  if (id === 'door_guardian_v1') return '👉 试试："今天有几个包裹送达" "有没有陌生人到访"'
  return '👉 试试："奶奶今天出门了吗" "猫咪上午在干嘛"'
})

const guessList = computed(() => {
  const id = agentConfig.value?.id
  if (id === 'pet_guardian_v1') return ['今天猫咪吃了几次饭', '狗狗有没有呕吐', '猫咪在客厅干嘛', '宠物今天喝了多少水']
  if (id === 'door_guardian_v1') return ['今天有几个包裹送达', '有没有陌生人到访', '快递员几点来的', '家人几点出门']
  return ['奶奶今天出门了吗', '猫咪上午在干嘛', '门口有快递', '晚上有人经过']
})

const previewQuery = computed(() => {
  const id = agentConfig.value?.id
  if (id === 'pet_guardian_v1') return '今天猫咪吃了几次饭'
  if (id === 'door_guardian_v1') return '今天有几个包裹送达'
  return '奶奶今天出门了吗'
})

// Agent特定的搜索结果
const searchResults = computed(() => {
  const id = agentConfig.value?.id
  const name = agentConfig.value?.name || ''
  if (id === 'pet_guardian_v1') return [
    { summary: '金毛犬在厨房食盆旁进食，吃了约5分钟', eventName: '宠物进食', time: '今天 08:15', bg: 'linear-gradient(135deg, #FEF9E7, #FDEBD0)' },
    { summary: '灰猫在卫生间使用猫砂盆，蹲姿排泄', eventName: '宠物排泄', time: '今天 10:30', bg: 'linear-gradient(135deg, #F3EEF9, #E8DAF0)' }
  ]
  if (id === 'door_guardian_v1') return [
    { summary: '快递员在门口放置包裹，棕色纸箱', eventName: '包裹送达', time: '今天 14:32', bg: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)' },
    { summary: '家人开门进入家中，女性从门外进入', eventName: '家人出入', time: '今天 16:45', bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' }
  ]
  return [
    { summary: '奶奶从后门走出，身穿蓝色外套，手拿拐杖', eventName: '老人看护', time: '今天 09:20', bg: 'linear-gradient(135deg, #0d2e1a, #1a5c34)' },
    { summary: '奶奶回到家中，手里提着菜袋', eventName: '老人看护', time: '今天 11:05', bg: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)' }
  ]
})

const previewResults = computed(() => searchResults.value)

const selectGuess = (g) => { queryText.value = g; doSearch() }

const doSearch = () => {
  if (!queryText.value.trim()) return
  hasSearched.value = true
}

const clearSearch = () => { queryText.value = ''; hasSearched.value = false }

const openDetail = (r) => {
  const msgs = [{ time: r.time, text: r.summary, eventName: r.eventName, bg: r.bg }]
  const listStr = encodeURIComponent(JSON.stringify(msgs))
  router.push('/ai/daily-event?name=' + encodeURIComponent(r.eventName) + '&list=' + listStr + '&index=0')
}
</script>

<style lang="scss" scoped>
.ai-search-page { height: 100%; background: $bg-page; display: flex; flex-direction: column; }
.ai-header { background: $bg-color; padding: 12px 16px; border-bottom: 1px solid $border-color; display: flex; align-items: center; gap: 12px; flex-shrink: 0; h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; } }
.back-btn { width: 32px; height: 32px; border-radius: 50%; background: $bg-page; display: flex; align-items: center; justify-content: center; color: $text-secondary; flex-shrink: 0; }

.not-activated-area { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 16px 20px; overflow-y: auto; }
.screenshot-phone { width: 100%; max-width: 360px; border: 3px solid #1f2937; border-radius: 28px; overflow: hidden; background: $bg-page; box-shadow: 0 8px 30px rgba(0,0,0,0.15); margin-bottom: 20px; position: relative; }
.phone-notch { width: 70px; height: 7px; background: #1f2937; border-radius: 4px; margin: 12px auto 8px; }
.screenshot-content { padding: 10px 14px 16px; display: flex; flex-direction: column; gap: 8px; }
.ss-badge { align-self: flex-start; font-size: 10px; color: $primary-color; background: $primary-bg; padding: 2px 8px; border-radius: 4px; margin-bottom: 2px; }
.ss-search-box { display: flex; align-items: center; gap: 6px; padding: 7px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
.ss-query-text { font-size: 12px; color: $text-primary; }
.ss-section-title { font-size: 12px; font-weight: 600; color: $text-primary; }
.ss-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.ss-tag { font-size: 10px; padding: 4px 10px; border: 1px solid #e5e7eb; border-radius: 12px; color: $text-secondary; background: #fff; }
.ss-results { display: flex; flex-direction: column; gap: 6px; }
.ss-result-item { display: flex; gap: 8px; padding: 8px; border-radius: 10px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.ss-thumb { width: 56px; height: 42px; border-radius: 6px; flex-shrink: 0; }
.ss-info { flex: 1; min-width: 0; }
.ss-summary { font-size: 11px; font-weight: 500; color: $text-primary; line-height: 1.4; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ss-meta { display: flex; justify-content: space-between; align-items: center; }
.ss-tag-label { font-size: 9px; color: $primary-color; background: $primary-bg; padding: 2px 6px; border-radius: 6px; }
.ss-time { font-size: 9px; color: $text-placeholder; }
.na-inline-btn { width: 100%; max-width: 300px; padding: 12px; background: linear-gradient(135deg, #1A73E8, #1557B0); color: #fff; border: none; border-radius: $radius-md; font-size: 15px; font-weight: 600; cursor: pointer; }

.device-filter-bar { background: $bg-color; padding: 8px 16px; display: flex; gap: 6px; flex-shrink: 0; border-bottom: 1px solid $border-color; overflow-x: auto; }
.dev-filter-chip { flex-shrink: 0; padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 500; color: $text-secondary; background: $bg-page; border: 1px solid $border-color; cursor: pointer; transition: all 0.15s; white-space: nowrap; &.active { background: $primary-color; color: #fff; border-color: $primary-color; } }

.agent-selector-bar { background: $bg-color; padding: 6px 16px 8px; display: flex; gap: 8px; flex-shrink: 0; }
.agent-selector-chip { flex-shrink: 0; padding: 5px 14px; border-radius: 16px; font-size: 12px; font-weight: 500; color: $text-secondary; background: $bg-page; border: 1px solid $border-color; cursor: pointer; transition: all 0.15s; white-space: nowrap; &.active { background: $primary-bg; color: $primary-color; border-color: $primary-color; font-weight: 600; } }

.search-input-area { padding: 16px; flex-shrink: 0; }
.search-input-box { display: flex; gap: 8px; align-items: center; }
.search-input { flex: 1; padding: 11px 14px; border: 1.5px solid $border-color; border-radius: $radius-md; font-size: 14px; color: $text-primary; outline: none; background: $bg-card; &:focus { border-color: $primary-color; } }
.search-clear { cursor: pointer; flex-shrink: 0; }
.search-btn { padding: 0 20px; background: linear-gradient(135deg, #1A73E8, #1557B0); color: #fff; border: none; border-radius: $radius-md; font-size: 14px; font-weight: 600; cursor: pointer; }
.search-examples { font-size: 11px; color: $text-secondary; margin-top: 8px; }

.guess-section { padding: 0 16px 16px; }
.guess-title { font-size: 13px; font-weight: 600; color: $text-primary; margin-bottom: 10px; }
.guess-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.guess-tag { padding: 6px 14px; background: $bg-card; border: 1.5px solid $border-color; border-radius: $radius-pill; font-size: 12px; color: $text-secondary; cursor: pointer; transition: all 0.15s; &:active { background: $primary-bg; border-color: $primary-color; color: $primary-color; } }

.result-list { flex: 1; padding: 0 16px; overflow-y: auto; }
.result-count { font-size: 12px; color: $text-secondary; margin-bottom: 10px; }
.result-item { background: $bg-card; border-radius: $radius-lg; padding: 12px; display: flex; gap: 12px; margin-bottom: 10px; box-shadow: $shadow-card; cursor: pointer; &:active { transform: scale(0.98); } }
.result-thumb { width: 72px; height: 54px; border-radius: 10px; flex-shrink: 0; }
.result-info { flex: 1; }
.result-summary { font-size: 13px; font-weight: 500; color: $text-primary; line-height: 1.4; margin-bottom: 6px; }
.result-meta { display: flex; justify-content: space-between; align-items: center; }
.result-event-name { font-size: 11px; color: $primary-color; background: $primary-bg; padding: 2px 8px; border-radius: 10px; }
.result-time { font-size: 11px; color: $text-secondary; }

.empty-hint { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }
.empty-text { font-size: 14px; color: $text-secondary; }
</style>
