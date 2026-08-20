<template>
  <div class="agent-landing-page">
    <div class="ai-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>{{ agent?.name || '智能体' }}</h2>
    </div>

    <div class="scroll-content" v-if="agent">
      <!-- 设备筛选 -->
      <div class="device-filter-bar">
        <span
          v-for="(d, i) in deviceOptions"
          :key="i"
          :class="['dev-filter-chip', { active: selectedDevice === d }]"
          @click="selectedDevice = d"
        >{{ d }}</span>
      </div>

      <!-- 功能Tab预览 -->
      <div class="feature-tabs-section">
        <div class="ft-card">
          <div class="fs-desc">{{ activeFeature.desc }}</div>
          <div class="fs-preview">
            <div class="fs-phone">
              <div class="fs-notch"></div>
              <div class="fs-content">
                <template v-if="activeFeature.key === 'message'">
                  <div class="fsp-msg">
                    <div class="fsp-msg-time">刚刚</div>
                    <div class="fsp-msg-card">
                      <div class="fsp-msg-title">{{ agent.sampleMessages[0]?.title }}</div>
                      <div class="fsp-msg-body">{{ agent.sampleMessages[0]?.desc }}</div>
                      <div class="fsp-msg-thumb" :style="{ background: agent.sampleMessages[0]?.bg }"></div>
                    </div>
                  </div>
                </template>
                <template v-else-if="activeFeature.key === 'daily'">
                  <div class="fsp-card">
                    <div class="fsp-card-title">💡 AI总结</div>
                    <div class="fsp-summary-title">{{ agent.sampleReport.summary }}</div>
                  </div>
                  <div class="fsp-card">
                    <div class="fsp-card-title">📊 事件汇总</div>
                    <div class="fsp-event" v-for="(s, si) in agent.sampleReport.sections" :key="si">
                      <span>{{ s.icon }} {{ s.label }}</span>
                      <span>{{ s.count }} 件</span>
                    </div>
                  </div>
                </template>
                <template v-else-if="activeFeature.key === 'search'">
                  <div class="fsp-search-bar">
                    <van-icon name="search" size="12" color="#9CA3AF" />
                    <span>{{ searchPlaceholder }}</span>
                  </div>
                  <div class="fsp-card fsp-result">
                    <div class="fsp-result-thumb" :style="{ background: agent.sampleMessages[0]?.bg }"></div>
                    <div class="fsp-result-info">
                      <div class="fsp-result-text">{{ agent.sampleMessages[0]?.desc }}</div>
                      <div class="fsp-result-meta">
                        <span class="fsp-tag">{{ agent.focusList[0]?.name }}</span>
                        <span>{{ agent.sampleMessages[0]?.time }}</span>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="fsp-msg">
                    <div class="fsp-msg-time">今天</div>
                    <div class="fsp-msg-item">
                      <div class="fsp-msg-thumb-sm" :style="{ background: agent.sampleMessages[0]?.bg }">
                        <span>{{ agent.focusList[0]?.icon || '📷' }}</span>
                      </div>
                      <div class="fsp-msg-info">
                        <div class="fsp-msg-title">{{ agent.sampleMessages[0]?.title }}</div>
                        <div class="fsp-msg-body">{{ agent.sampleMessages[0]?.desc }}</div>
                        <div class="fsp-msg-meta">{{ agent.sampleMessages[0]?.time }}</div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div class="ft-tabs">
            <span
              v-for="(f, i) in landingFeatures"
              :key="i"
              :class="['ft-tab', { active: featureTabIdx === i }]"
              @click="featureTabIdx = i"
            >{{ f.name }}</span>
          </div>
        </div>
      </div>

      <div class="service-note">依赖设备侦测抓图，请确保已开启运动侦测或其他侦测服务</div>

      <!-- 套餐选择 -->
      <div class="section plan-section">
        <div class="plan-cards">
          <div
            :class="['plan-card', { selected: selectedPlan === 'monthly' }]"
            @click="selectedPlan = 'monthly'"
          >
            <div class="plan-top">
              <div class="plan-name">月订阅</div>
              <div class="plan-price">¥{{ agent.priceMonthly }}<span>/月</span></div>
              <div class="plan-tag">连续订阅</div>
            </div>
            <div class="plan-feats">
              <div class="feat" v-for="(f, fi) in agent.focusList.slice(0, 4)" :key="fi">✓ {{ f.name }}智能识别</div>
            </div>
            <div class="plan-check" v-if="selectedPlan === 'monthly'"><van-icon name="success" size="16" /></div>
          </div>
          <div
            :class="['plan-card', { selected: selectedPlan === 'yearly' }]"
            @click="selectedPlan = 'yearly'"
          >
            <div class="plan-save">省 ¥19.8</div>
            <div class="plan-top">
              <div class="plan-name">年订阅</div>
              <div class="plan-price">¥{{ agent.priceYearly }}<span>/年</span></div>
              <div class="plan-tag yearly">买断制</div>
            </div>
            <div class="plan-feats">
              <div class="feat" v-for="(f, fi) in agent.focusList.slice(0, 4)" :key="fi">✓ {{ f.name }}智能识别</div>
            </div>
            <div class="plan-check" v-if="selectedPlan === 'yearly'"><van-icon name="success" size="16" /></div>
          </div>
        </div>
        <div v-if="selectedPlan === 'monthly'" class="renew-hint">
          连续订阅套餐，到期自动按{{ agent.priceMonthly }}元/月续费，可随时取消
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="section pay-section">
        <div class="section-title">支付方式</div>
        <div class="pay-methods">
          <div :class="['pay-method', { selected: payMethod === 'wechat' }]" @click="payMethod = 'wechat'">
            <div class="pay-m-icon" style="background:#07C160"><van-icon name="wechat" size="18" color="#fff" /></div>
            <span>微信支付</span>
            <div class="pay-radio" :class="{ checked: payMethod === 'wechat' }"></div>
          </div>
          <div :class="['pay-method', { selected: payMethod === 'alipay' }]" @click="payMethod = 'alipay'">
            <div class="pay-m-icon" style="background:#1677FF"><van-icon name="alipay" size="18" color="#fff" /></div>
            <span>支付宝</span>
            <div class="pay-radio" :class="{ checked: payMethod === 'alipay' }"></div>
          </div>
        </div>
      </div>

      <!-- 场景介绍 -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">{{ agent.slogan }}</div>
          <div class="section-sub">AI自动分析画面，精准识别你关注的{{ agent.name }}相关事件</div>
        </div>
        <div class="scene-list">
          <div class="scene-card" v-for="(cap, ci) in agent.capabilities" :key="ci">
            <div class="scene-img" :style="{ background: agent.heroGradient }">
              <span class="scene-emoji">{{ cap.icon }}</span>
            </div>
            <div class="scene-info">
              <div class="scene-name">{{ cap.name }}</div>
              <div class="scene-desc">{{ cap.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="ai-disclaimer">本功能由AI大模型提供，识别结果可能存在误差，仅供参考。请以实际情况为准，勿完全依赖AI判断。</div>

      <div style="height:100px"></div>
    </div>

    <!-- 底部固定栏 -->
    <div class="bottom-bar" v-if="agent">
      <div class="agreement-row" @click="agreed = !agreed">
        <div class="agreement-checkbox" :class="{ checked: agreed }">
          <van-icon v-if="agreed" name="success" size="12" color="#fff" />
        </div>
        <span class="agreement-text">
          已阅读并同意<span class="agreement-link" @click.stop>{{ agreementText }}</span>
        </span>
      </div>
      <button
        class="btn-buy"
        @click="handleBuyClick"
      >
        {{ buyText }}
      </button>
    </div>

    <!-- 协议确认弹窗 -->
    <van-dialog v-model:show="showAgreementDialog" title="提示" show-cancel-button cancel-text="取消" confirm-text="同意" @confirm="agreeAndPay">
      <div class="agreement-dialog-content">请先阅读并同意{{ agreementText }}</div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { agentConfigs, deviceAgent } from '@/store/devStatus'

const router = useRouter()
const route = useRoute()
const goBack = () => router.back()

const agent = computed(() => agentConfigs.value.find(a => a.id === route.params.agentId))
const deviceOptions = Object.keys(deviceAgent.value)

function resolveDevice() {
  if (route.query.device && (deviceAgent.value[route.query.device] || []).length > 0) {
    return route.query.device
  }
  return deviceOptions[0] || '标准摄像机'
}
const selectedDevice = ref(resolveDevice())

// 订阅
const selectedPlan = ref('monthly')
const payMethod = ref('wechat')
const agreed = ref(false)
const showAgreementDialog = ref(false)

const agreementText = computed(() => {
  return selectedPlan.value === 'monthly'
    ? '《云服务协议（含自动续费协议）》'
    : '《云服务协议》'
})

const buyText = computed(() => {
  return `立即开通 ${selectedPlan.value === 'monthly' ? '¥' + agent.value.priceMonthly + '/月' : '¥' + agent.value.priceYearly + '/年'}`
})

// 功能Tab
const featureTabIdx = ref(0)
const landingFeatures = [
  { key: 'message', name: 'AI消息推送' },
  { key: 'daily', name: 'AI日报总结' },
  { key: 'search', name: 'AI智能搜索' },
  { key: 'events', name: 'AI消息摘要' }
]
const activeFeature = computed(() => {
  const key = landingFeatures[featureTabIdx.value]?.key || 'message'
  if (key === 'message') return { key: 'message', desc: '摄像头自动识别画面，只推送你关注的' + (agent.value?.name || '') + '事件，告别无关告警打扰' }
  if (key === 'daily') return { key: 'daily', desc: '每日自动生成' + (agent.value?.name || '') + '图文报告，汇总关注事件的完整时间线' }
  if (key === 'search') return { key: 'search', desc: '用自然语言搜索' + (agent.value?.name || '') + '相关事件记录，快速定位关键片段' }
  return { key: 'events', desc: 'AI智能分析画面，自动生成' + (agent.value?.name || '') + '场景的清晰描述' }
})

const searchPlaceholder = computed(() => {
  if (agent.value?.id === 'pet_guardian_v1') return '今天猫咪吃了几次饭'
  if (agent.value?.id === 'door_guardian_v1') return '今天有几个包裹送达'
  return '今天家里发生了什么'
})

const handleBuyClick = () => {
  if (!agreed.value) {
    showAgreementDialog.value = true
    return
  }
  doBuy()
}

const agreeAndPay = () => {
  agreed.value = true
  showAgreementDialog.value = false
  doBuy()
}

function doBuy() {
  const expireDate = new Date()
  expireDate.setDate(expireDate.getDate() + (selectedPlan.value === 'monthly' ? 30 : 365))
  if (!deviceAgent.value[selectedDevice.value]) {
    deviceAgent.value[selectedDevice.value] = []
  }
  deviceAgent.value[selectedDevice.value].push({
    agentId: agent.value.id,
    agentName: agent.value.name,
    agentIcon: agent.value.icon,
    expireDate: expireDate.toISOString().split('T')[0],
    status: 'active'
  })
  showToast('购买成功')
  if (agent.value?.id === 'all_in_one_v1') {
    setTimeout(() => router.replace('/ai'), 800)
  }
}
</script>

<style lang="scss" scoped>
.agent-landing-page {
  height: 100%;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}

.ai-header {
  background: $bg-color; padding: 12px 16px; border-bottom: 1px solid $border-color;
  display: flex; align-items: center; gap: 12px; flex-shrink: 0; position: relative; z-index: 1;
  h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; }
}

.back-btn {
  width: 32px; height: 32px; border-radius: 50%; background: $bg-page;
  display: flex; align-items: center; justify-content: center; color: $text-secondary; flex-shrink: 0;
}

.scroll-content { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }

.service-note { margin: 12px 16px 0; padding: 10px 12px; background: #EFF3FF; border: 1px solid #D6E4FD; border-radius: 8px; font-size: 12px; color: #4B5563; line-height: 1.5; }

/* 设备筛选 */
.device-filter-bar { background: $bg-color; padding: 8px 16px; display: flex; gap: 6px; flex-shrink: 0; border-bottom: 1px solid $border-color; overflow-x: auto; }
.dev-filter-chip { flex-shrink: 0; padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 500; color: $text-secondary; background: $bg-page; border: 1px solid $border-color; cursor: pointer; white-space: nowrap; &.active { background: $primary-color; color: #fff; border-color: $primary-color; } }

/* 功能Tab */
.feature-tabs-section { padding: 12px 16px 0; }
.ft-tabs { display: flex; gap: 0; background: $bg-page; border-radius: $radius-md; padding: 3px; margin-top: 10px; }
.ft-tab { flex: 1; padding: 7px 0; font-size: 11px; font-weight: 600; color: $text-secondary; text-align: center; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; &.active { background: $primary-color; color: #fff; } }
.ft-card { background: $bg-card; border-radius: $radius-lg; padding: 10px 12px; margin-top: 10px; box-shadow: $shadow-card; }

/* Section 通用 */
.section { padding: 16px 16px 0; }
.plan-section { padding-top: 10px; }
.pay-section { padding-top: 10px; }
.section-header { margin-bottom: 14px; }
.section-title { font-size: 15px; font-weight: 700; color: $text-primary; }
.section-sub { font-size: 12px; color: $text-secondary; margin-top: 4px; }

/* 套餐 */
.plan-cards { display: flex; gap: 10px; }
.plan-card { flex: 1; background: $bg-card; border-radius: $radius-lg; padding: 14px 12px; border: 2px solid $border-color; cursor: pointer; position: relative; overflow: hidden; &.selected { border-color: $primary-color; background: $primary-bg; } }
.plan-top { margin-bottom: 10px; }
.plan-name { font-size: 13px; font-weight: 700; color: $text-primary; }
.plan-price { font-size: 24px; font-weight: 800; color: $primary-color; margin-top: 2px; span { font-size: 11px; font-weight: 500; color: $text-secondary; } }
.plan-tag { display: inline-block; margin-top: 4px; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 6px; background: #DBEAFE; color: #1D4ED8; &.yearly { background: #D1FAE5; color: #065F46; } }
.plan-feats { display: flex; flex-direction: column; gap: 3px; .feat { font-size: 11px; color: $text-secondary; } }
.plan-check { position: absolute; top: 0; right: 0; width: 28px; height: 28px; background: $primary-color; border-radius: 0 0 0 12px; display: flex; align-items: center; justify-content: center; color: #fff; }
.plan-save { position: absolute; top: 0; right: 0; font-size: 10px; font-weight: 700; color: #fff; background: #EA4335; padding: 3px 8px; border-radius: 0 6px 0 8px; }
.renew-hint { margin-top: 8px; font-size: 11px; color: $text-secondary; line-height: 1.4; }

/* 支付 */
.pay-methods { display: flex; flex-direction: column; gap: 8px; }
.pay-method { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: $bg-card; border: 2px solid $border-color; border-radius: $radius-md; cursor: pointer; &.selected { border-color: $primary-color; } span { flex: 1; font-size: 13px; font-weight: 600; color: $text-primary; } }
.pay-m-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pay-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid $border-color; flex-shrink: 0; &.checked { border-color: $primary-color; background: $primary-color; position: relative; &::after { content: ''; position: absolute; top: 3px; left: 5px; width: 4px; height: 8px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); } } }

/* 场景 */
.scene-list { display: flex; flex-direction: column; gap: 10px; }
.scene-card { background: $bg-card; border-radius: $radius-lg; padding: 14px; display: flex; gap: 14px; align-items: center; box-shadow: $shadow-card; }
.scene-img { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.scene-emoji { font-size: 24px; }
.scene-info { flex: 1; min-width: 0; }
.scene-name { font-size: 14px; font-weight: 700; color: $text-primary; }
.scene-desc { font-size: 12px; color: $text-secondary; margin-top: 4px; line-height: 1.4; }

/* 功能预览手机框 */
.fs-desc { font-size: 12px; color: $text-secondary; line-height: 1.5; margin-bottom: 10px; }
.fs-preview { display: flex; justify-content: center; }
.fs-phone { width: 100%; max-width: 240px; border: 2px solid #e5e7eb; border-radius: 16px; overflow: hidden; background: #fafafa; }
.fs-notch { width: 40px; height: 4px; background: #d1d5db; border-radius: 2px; margin: 6px auto; }
.fs-content { padding: 4px 8px 10px; display: flex; flex-direction: column; gap: 5px; }

.fsp-msg { display: flex; flex-direction: column; gap: 5px; }
.fsp-msg-time { font-size: 9px; color: #9CA3AF; text-align: center; }
.fsp-msg-card { background: #fff; border-radius: 8px; padding: 8px 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.fsp-msg-title { font-size: 10px; font-weight: 600; color: #333; margin-bottom: 3px; }
.fsp-msg-body { font-size: 9px; color: #666; line-height: 1.4; }
.fsp-msg-thumb { width: 100%; height: 40px; border-radius: 6px; margin-top: 6px; }
.fsp-card { background: #fff; border-radius: 8px; padding: 8px 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.fsp-card-title { font-size: 10px; font-weight: 700; color: #333; margin-bottom: 5px; }
.fsp-summary-title { font-size: 11px; font-weight: 600; color: #333; margin-bottom: 3px; }
.fsp-event { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 10px; &:last-child { border-bottom: none; } }
.fsp-msg-item { display: flex; gap: 6px; background: #fff; border-radius: 8px; padding: 6px 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.fsp-msg-thumb-sm { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 15px; }
.fsp-msg-info { flex: 1; min-width: 0; }
.fsp-msg-meta { font-size: 8px; color: #9CA3AF; margin-top: 2px; }
.fsp-search-bar { display: flex; align-items: center; gap: 5px; padding: 5px 8px; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 10px; color: #333; }
.fsp-result { display: flex; gap: 8px; }
.fsp-result-thumb { width: 48px; height: 36px; border-radius: 6px; flex-shrink: 0; }
.fsp-result-info { flex: 1; min-width: 0; }
.fsp-result-text { font-size: 10px; font-weight: 500; color: #333; line-height: 1.3; margin-bottom: 3px; }
.fsp-result-meta { display: flex; justify-content: space-between; align-items: center; font-size: 8px; color: #9CA3AF; }
.fsp-tag { color: $primary-color; background: $primary-bg; padding: 1px 4px; border-radius: 4px; }

.ai-disclaimer { text-align: center; font-size: 11px; color: $text-placeholder; padding: 16px 24px 0; line-height: 1.5; }

/* 底部栏 */
.bottom-bar { flex-shrink: 0; background: $bg-color; padding: 10px 16px; padding-bottom: calc(10px + env(safe-area-inset-bottom, 8px)); border-top: 1px solid $border-color; }
.agreement-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; cursor: pointer; }
.agreement-checkbox { width: 16px; height: 16px; border-radius: 3px; border: 1.5px solid #9CA3AF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; &.checked { background: $primary-color; border-color: $primary-color; } }
.agreement-text { font-size: 11px; color: $text-secondary; }
.agreement-link { color: $primary-color; }
.btn-buy { width: 100%; padding: 12px; background: linear-gradient(135deg, #1A73E8, #1557B0); color: #fff; border: none; border-radius: $radius-md; font-size: 15px; font-weight: 700; cursor: pointer; }
.agreement-dialog-content { padding: 20px; font-size: 14px; color: $text-primary; text-align: center; }
</style>
