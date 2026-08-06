<template>
  <div class="agent-market-page">
    <div class="ai-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>Agent市场</h2>
    </div>

    <!-- Agent列表 -->
    <div class="scroll-content">
      <div v-if="agentConfigs.length === 0" class="empty-state">
        <div class="empty-icon">🤖</div>
        <div class="empty-text">暂无可用Agent</div>
        <div class="empty-sub">敬请期待更多智能体上线</div>
      </div>

      <div class="agent-list" v-else>
        <div
          v-for="agent in agentConfigs"
          :key="agent.id"
          class="agent-card"
          @click="goToLanding(agent)"
        >
          <div class="agent-icon" :style="{ background: agent.heroGradient }">
            <span class="agent-emoji">{{ agent.icon }}</span>
          </div>
          <div class="agent-info">
            <div class="agent-name">{{ agent.name }}</div>
            <div class="agent-slogan">{{ agent.slogan }}</div>
            <div class="agent-tags">
              <span v-for="(cap, ci) in agent.capabilities.slice(0, 3)" :key="ci" class="agent-tag">
                {{ cap.icon }} {{ cap.name }}
              </span>
            </div>
          </div>
          <div class="agent-price-col">
            <div class="agent-price">¥{{ agent.priceMonthly }}</div>
            <div class="agent-unit">/月</div>
          </div>
        </div>
      </div>

      <div class="ai-disclaimer">Agent由AI大模型提供，识别结果可能存在误差，仅供参考</div>
      <div style="height: 40px"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { agentConfigs } from '@/store/devStatus'

const router = useRouter()
const goBack = () => router.back()

function goToLanding(agent) {
  if (agent.id === 'all_in_one_v1') {
    router.push('/ai?show=activate')
  } else {
    router.push(`/agent-market/${agent.id}`)
  }
}
</script>

<style lang="scss" scoped>
.agent-market-page {
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
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-text { font-size: 15px; font-weight: 600; color: $text-primary; }
  .empty-sub { font-size: 12px; color: $text-secondary; margin-top: 4px; }
}

.agent-list {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.agent-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: $shadow-card;
  cursor: pointer;
  transition: transform 0.15s;
  &:active { transform: scale(0.98); }
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

.agent-info {
  flex: 1;
  min-width: 0;
}

.agent-name {
  font-size: 15px;
  font-weight: 700;
  color: $text-primary;
}

.agent-slogan {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 2px;
}

.agent-tags {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.agent-tag {
  font-size: 10px;
  color: $primary-color;
  background: $primary-bg;
  padding: 2px 6px;
  border-radius: 8px;
  white-space: nowrap;
}

.agent-price-col {
  flex-shrink: 0;
  text-align: right;
}

.agent-price {
  font-size: 18px;
  font-weight: 800;
  color: $primary-color;
}

.agent-unit {
  font-size: 10px;
  color: $text-secondary;
  font-weight: 500;
}

.ai-disclaimer {
  text-align: center;
  font-size: 11px;
  color: $text-placeholder;
  padding: 16px 24px 0;
  line-height: 1.5;
}
</style>
