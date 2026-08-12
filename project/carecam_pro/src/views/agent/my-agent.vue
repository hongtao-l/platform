<template>
  <div class="my-agent-page">
    <div class="ai-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>我的Agent</h2>
    </div>

    <div class="scroll-content">
      <!-- 当前Agent -->
      <div class="section-label">当前Agent</div>
      <template v-if="currentDeviceAgent && currentDeviceAgent.status === 'active'">
        <div class="agent-status-card">
          <div class="status-top">
            <div class="status-left">
              <div class="agent-icon" :style="{ background: agentConfig?.heroGradient || 'linear-gradient(135deg, #1A73E8, #7C3AED)' }">
                <span class="agent-emoji">{{ currentDeviceAgent.agentIcon }}</span>
              </div>
              <div class="status-info">
                <div class="status-name">{{ currentDeviceAgent.agentName }}</div>
                <div class="status-expire">有效期至 {{ currentDeviceAgent.expireDate }}</div>
              </div>
            </div>
            <span :class="['status-badge', statusClass]">{{ statusText }}</span>
          </div>
          <div class="status-actions" v-if="currentDeviceAgent.status === 'active' && daysLeft <= 7">
            <button class="btn-renew" @click="handleRenew">续费</button>
          </div>
        </div>
      </template>
      <div v-else class="empty-card">
        <div class="empty-icon">🤖</div>
        <div class="empty-text">暂未开通Agent</div>
      </div>

      <!-- 历史购买 -->
      <div class="section-label" style="margin-top: 20px;">历史购买</div>
      <template v-if="historyList.length > 0">
        <div
          v-for="(h, i) in historyList"
          :key="i"
          class="history-card"
        >
          <div class="history-left">
            <div class="history-icon" :style="{ background: getHistoryAgentConfig(h.agentId)?.heroGradient || 'linear-gradient(135deg, #9CA3AF, #D1D5DB)' }">
              <span class="history-emoji">{{ h.agentIcon }}</span>
            </div>
            <div class="history-info">
              <div class="history-name">{{ h.agentName }}</div>
              <div class="history-date">{{ h.startDate }} ~ {{ h.expireDate }}</div>
            </div>
          </div>
          <div class="history-right">
            <span class="expired-badge">已到期</span>
          </div>
        </div>
      </template>
      <div v-else class="empty-history">
        <span>暂无购买记录</span>
      </div>

      <div style="height: 40px"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { deviceAgent, agentHistory, agentConfigs } from '@/store/devStatus'
import { showToast } from '@/utils/toast'

const router = useRouter()
const goBack = () => router.back()

const deviceOptions = Object.keys(deviceAgent.value)
const selectedDevice = ref(deviceOptions[0] || '标准摄像机')

const currentDeviceAgent = computed(() => deviceAgent.value[selectedDevice.value])
const agentConfig = computed(() => {
  if (!currentDeviceAgent.value) return null
  return agentConfigs.value.find(a => a.id === currentDeviceAgent.value.agentId)
})

const daysLeft = computed(() => {
  if (!currentDeviceAgent.value) return 0
  const now = new Date()
  const exp = new Date(currentDeviceAgent.value.expireDate)
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
})

const statusClass = computed(() => {
  if (!currentDeviceAgent.value) return ''
  if (currentDeviceAgent.value.status === 'active' && daysLeft.value <= 7) return 'expiring'
  if (currentDeviceAgent.value.status === 'expired') return 'expired'
  return 'active'
})

const statusText = computed(() => {
  if (currentDeviceAgent.value?.status === 'expired') return '已到期'
  if (daysLeft.value <= 7 && daysLeft.value > 0) return `${daysLeft.value}天后到期`
  return '生效中'
})

const historyList = computed(() => agentHistory.value)

function getHistoryAgentConfig(agentId) {
  return agentConfigs.value.find(a => a.id === agentId)
}

function goToMarket() {
  router.push('/agent-market')
}

function goToLanding(agentId) {
  router.push(`/agent-market/${agentId}`)
}

function handleRenew() {
  showToast('续费成功')
  const exp = new Date(currentDeviceAgent.value.expireDate)
  exp.setDate(exp.getDate() + 30)
  currentDeviceAgent.value.expireDate = exp.toISOString().split('T')[0]
}
</script>

<style lang="scss" scoped>
.my-agent-page {
  height: 100%;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}

.ai-header {
  background: $bg-color;
  padding: 12px 16px;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; }
}

.back-btn {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  flex-shrink: 0;
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
}

.section-label {
  font-size: 14px;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 10px;
}

/* 状态卡片 */
.agent-status-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 16px;
  box-shadow: $shadow-card;
}

.status-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.agent-emoji { font-size: 24px; }

.status-info {}

.status-name {
  font-size: 15px;
  font-weight: 700;
  color: $text-primary;
}

.status-expire {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 2px;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
  flex-shrink: 0;
  &.active { background: $success-bg; color: $success-color; }
  &.expiring { background: $warning-bg; color: #D97706; }
  &.expired { background: $danger-bg; color: $danger-color; }
}

.empty-card .van-icon { display: none; }

.status-actions {
  display: flex;
  gap: 8px;
}

.btn-renew {
  flex: 1;
  padding: 8px;
  background: $primary-color;
  color: #fff;
  border: none;
  border-radius: $radius-sm;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:active { opacity: 0.85; }
}


/* 空态卡片 */
.empty-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: $shadow-card;
  cursor: pointer;
  position: relative;
  .van-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); }
  .empty-icon { font-size: 36px; }
  .empty-text { font-size: 15px; font-weight: 600; color: $text-primary; }
  .empty-sub { font-size: 12px; color: $primary-color; }
}

/* 历史购买 */
.history-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  box-shadow: $shadow-card;
  opacity: 0.7;
}

.history-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.history-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-emoji { font-size: 20px; }

.history-name {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.history-date {
  font-size: 11px;
  color: $text-secondary;
  margin-top: 2px;
}

.history-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.expired-badge {
  font-size: 10px;
  font-weight: 600;
  color: $text-secondary;
  background: $bg-page;
  padding: 2px 8px;
  border-radius: 8px;
}


.empty-history {
  text-align: center;
  padding: 20px;
  font-size: 12px;
  color: $text-secondary;
}
</style>
