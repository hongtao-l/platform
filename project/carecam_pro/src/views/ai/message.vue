<template>
  <div class="ai-msg-page">
    <div class="ai-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>AI消息</h2>
      <div class="header-right" @click="showSetting = true">
        <van-icon name="setting-o" size="18" />
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

    <!-- Agent选择器（多Agent时显示） -->
    <div class="agent-selector-bar" v-if="deviceAgents.length > 1">
      <span
        v-for="a in deviceAgents"
        :key="a.agentId"
        :class="['agent-selector-chip', { active: (selectedAgentId || deviceAgents[0]?.agentId) === a.agentId }]"
        @click="selectedAgentId = a.agentId"
      >{{ a.agentIcon }} {{ a.agentName }}</span>
    </div>

    <!-- 分类Tab -->
    <div class="msg-tabs">
      <div v-for="(t, i) in tabs" :key="i" :class="['tab', { active: activeTab === i }]" @click="activeTab = i">{{ t }}</div>
    </div>

    <!-- 消息列表 -->
    <div class="msg-list" v-if="filteredList.length > 0">
      <div v-for="(group, gIdx) in groupedList" :key="gIdx">
        <div class="date-label">{{ group.date }}</div>
        <div v-for="msg in group.list" :key="msg.id" class="msg-card" @click="goToDetail(msg)">
          <div class="msg-thumb" :style="{ background: msg.bg }">
            <span class="thumb-icon">{{ msg.icon }}</span>
          </div>
          <div class="msg-body">
            <div class="msg-type">{{ msg.title }}</div>
            <div class="msg-desc">{{ msg.desc }}</div>
            <div class="msg-time">{{ msg.time }}</div>
          </div>
          <van-icon name="arrow" size="14" color="#9CA3AF" />
        </div>
      </div>
    </div>

    <!-- 空态 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">🤖</div>
      <div class="empty-text">暂无AI消息</div>
      <div class="empty-sub">当有事件发生时将展示在这里</div>
    </div>

    <!-- 设置面板 -->
    <van-popup v-model:show="showSetting" position="bottom" round :style="{ height: '50%' }">
      <div class="setting-popup">
        <div class="popup-header">
          <h3>推送设置</h3>
          <van-icon name="cross" size="20" @click="showSetting = false" />
        </div>
        <div class="setting-list">
          <div class="setting-item">
            <span>紧急推送</span>
            <van-switch v-model="pushAlert" size="22" />
          </div>
          <div class="setting-item">
            <span>普通推送</span>
            <van-switch v-model="pushNormal" size="22" />
          </div>
          <div class="setting-divider"></div>
          <div class="setting-item"><span>👤 人员经过</span><van-switch v-model="pushPerson" size="22" /></div>
          <div class="setting-item"><span>🐱 宠物活动</span><van-switch v-model="pushPet" size="22" /></div>
          <div class="setting-item"><span>👴 老人看护</span><van-switch v-model="pushElder" size="22" /></div>
          <div class="setting-divider"></div>
          <div class="setting-item">
            <span>每日最多推送</span>
            <span class="setting-value">{{ maxPush }}条</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { deviceAgent, agentConfigs, isDeviceAgentActive, getDeviceAgents, getAgentConfig } from '@/store/devStatus'

const router = useRouter()
const goBack = () => router.back()
const goToDetail = (msg) => router.push({ path: '/ai/detail', query: { id: msg.id } })

// 设备筛选
const deviceOptions = Object.keys(deviceAgent.value)
function getDefaultDevice() {
  for (const [dev, agents] of Object.entries(deviceAgent.value)) {
    if (agents.some(a => a.status === 'active')) return dev
  }
  return deviceOptions[0] || '标准摄像机'
}
const selectedDevice = ref(getDefaultDevice())

const deviceAgents = computed(() => getDeviceAgents(selectedDevice.value).filter(a => a.status === 'active'))
const isActivated = computed(() => isDeviceAgentActive(selectedDevice.value))

// Agent选择器
const selectedAgentId = ref('')
function syncAgent() {
  if (deviceAgents.value.length > 0 && !deviceAgents.value.find(a => a.agentId === selectedAgentId.value)) {
    selectedAgentId.value = deviceAgents.value[0].agentId
  }
}
syncAgent()

const onDeviceChange = (device) => {
  selectedDevice.value = device
  syncAgent()
}

const currentAgentConfig = computed(() => {
  const id = selectedAgentId.value || deviceAgents.value[0]?.agentId
  return id ? getAgentConfig(id) : null
})

// 动态Tab：根据当前Agent的focusList生成
const tabs = computed(() => {
  const cfg = currentAgentConfig.value
  if (!cfg) return ['全部']
  return ['全部', ...cfg.focusList.map(f => f.icon + ' ' + f.name)]
})
const activeTab = ref(0)
const showSetting = ref(false)

const pushAlert = ref(true)
const pushNormal = ref(true)
const pushPerson = ref(true)
const pushPet = ref(true)
const pushElder = ref(true)
const maxPush = ref(5)

// 模拟多Agent消息（同一事件可能来自不同Agent）
const messages = computed(() => {
  const cfg = currentAgentConfig.value
  if (!cfg) return []
  const list = cfg.focusList || []
  return [
    { id: 1, type: list[0]?.name || '', icon: list[0]?.icon || '📋', title: cfg.name + ' · ' + (list[0]?.name || ''), desc: (cfg.sampleMessages?.[0]?.desc || ''), time: '今天 14:32', bg: '#0d1b3e', agentName: cfg.name, agentIcon: cfg.icon },
    { id: 2, type: list[1]?.name || '', icon: list[1]?.icon || '📋', title: cfg.name + ' · ' + (list[1]?.name || ''), desc: (cfg.sampleMessages?.[1]?.desc || ''), time: '今天 10:15', bg: '#0d2e1a', agentName: cfg.name, agentIcon: cfg.icon },
    { id: 3, type: list[2]?.name || '', icon: list[2]?.icon || '📋', title: cfg.name + ' · ' + (list[2]?.name || ''), desc: (cfg.sampleMessages?.[2]?.desc || ''), time: '今天 08:20', bg: '#1a1a3e', agentName: cfg.name, agentIcon: cfg.icon },
    { id: 4, type: list[0]?.name || '', icon: list[0]?.icon || '📋', title: cfg.name + ' · ' + (list[0]?.name || ''), desc: (cfg.sampleMessages?.[0]?.desc || ''), time: '昨天 22:10', bg: '#0d1b3e', agentName: cfg.name, agentIcon: cfg.icon },
    { id: 5, type: list[3]?.name || '', icon: list[3]?.icon || '📋', title: cfg.name + ' · ' + (list[1]?.name || ''), desc: (cfg.sampleMessages?.[1]?.desc || ''), time: '昨天 18:30', bg: '#1a1a3e', agentName: cfg.name, agentIcon: cfg.icon },
    { id: 6, type: list[1]?.name || '', icon: list[1]?.icon || '📋', title: cfg.name + ' · ' + (list[1]?.name || ''), desc: '事件检测正常', time: '昨天 07:30', bg: '#0d2e1a', agentName: cfg.name, agentIcon: cfg.icon }
  ]
})

const filteredList = computed(() => {
  const tabName = tabs.value[activeTab.value]
  if (activeTab.value === 0) return messages.value
  const typeName = currentAgentConfig.value?.focusList?.[activeTab.value - 1]?.name
  return messages.value.filter(m => m.type === typeName)
})

const groupedList = computed(() => {
  const groups = []
  let current = null
  for (const msg of filteredList.value) {
    const dateLabel = msg.time.includes('今天') ? '今天' : msg.time.includes('昨天') ? '昨天' : '更早'
    if (!current || current.date !== dateLabel) {
      current = { date: dateLabel, list: [] }
      groups.push(current)
    }
    current.list.push(msg)
  }
  return groups
})
</script>

<style lang="scss" scoped>
.ai-msg-page {
  height: 100%;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}

.ai-header {
  background: $bg-color; padding: 12px 16px; border-bottom: 1px solid $border-color;
  display: flex; align-items: center; gap: 12px; flex-shrink: 0;
  h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; }
}

.back-btn, .header-right {
  width: 32px; height: 32px; border-radius: 50%; background: $bg-page;
  display: flex; align-items: center; justify-content: center; color: $text-secondary; flex-shrink: 0;
}

.device-filter-bar { background: $bg-color; padding: 8px 16px; display: flex; gap: 6px; flex-shrink: 0; border-bottom: 1px solid $border-color; overflow-x: auto; }
.dev-filter-chip { flex-shrink: 0; padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 500; color: $text-secondary; background: $bg-page; border: 1px solid $border-color; cursor: pointer; transition: all 0.15s; white-space: nowrap; &.active { background: $primary-color; color: #fff; border-color: $primary-color; } }

.agent-selector-bar { background: $bg-color; padding: 6px 16px 8px; display: flex; gap: 8px; flex-shrink: 0; }
.agent-selector-chip { flex-shrink: 0; padding: 5px 14px; border-radius: 16px; font-size: 12px; font-weight: 500; color: $text-secondary; background: $bg-page; border: 1px solid $border-color; cursor: pointer; transition: all 0.15s; white-space: nowrap; &.active { background: $primary-bg; color: $primary-color; border-color: $primary-color; font-weight: 600; } }

.msg-tabs {
  background: $bg-color; padding: 0 16px; display: flex; gap: 0;
  border-bottom: 2px solid $border-color; flex-shrink: 0;
  .tab {
    padding: 12px 14px; font-size: 13px; font-weight: 500; color: $text-secondary;
    border-bottom: 2px solid transparent; margin-bottom: -2px; transition: $transition;
    &.active { color: $primary-color; border-bottom-color: $primary-color; font-weight: 600; }
  }
}

.msg-list { flex: 1; padding: 12px 16px; overflow-y: auto; }
.date-label { font-size: 12px; font-weight: 600; color: $text-secondary; margin: 8px 0; }

.msg-card {
  background: $bg-card; border-radius: $radius-lg; padding: 12px; margin-bottom: 10px;
  display: flex; gap: 12px; align-items: center; box-shadow: $shadow-card;
  .msg-thumb {
    width: 48px; height: 48px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    .thumb-icon { font-size: 20px; }
  }
  .msg-body { flex: 1; }
  .msg-type { font-size: 13px; font-weight: 600; color: $text-primary; }
  .msg-desc { font-size: 12px; color: $text-secondary; margin-top: 2px; }
  .msg-time { font-size: 11px; color: $text-placeholder; margin-top: 4px; }
}

.empty-state {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-bottom: 60px;
  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-text { font-size: 15px; font-weight: 600; color: $text-primary; }
  .empty-sub { font-size: 12px; color: $text-secondary; margin-top: 4px; }
}

.setting-popup { padding: 20px 16px 32px; }
.popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; h3 { font-size: 16px; font-weight: 700; color: $text-primary; } }

.setting-list { }
.setting-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; font-size: 14px; color: $text-primary; }
.setting-value { color: $text-secondary; font-size: 13px; }
.setting-divider { height: 1px; background: $border-color; margin: 4px 0; }
</style>
