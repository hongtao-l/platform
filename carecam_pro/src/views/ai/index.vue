<template>
  <div class="ai-page">
    <div class="ai-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>{{ isActivated ? '全能AI配置' : '全能AI' }}</h2>
      <div v-if="isActivated" class="header-right" @click="showPay = true">
        <van-icon name="shopping-cart-o" size="18" />
      </div>
    </div>

    <!-- ===== 未开通态 ===== -->
    <template v-if="!isActivated">
      <div class="scroll-content">
        <div class="hero-banner">
          <div class="hero-icon">🤖</div>
          <div class="hero-text">
            <div class="title">全能AI · 智能看护管家</div>
            <div class="sub">让摄像头"看懂"画面，主动守护家人</div>
          </div>
        </div>
        <div class="cap-row">
          <div class="cap-card"><div class="cap-icon">🤖</div><div class="cap-name">AI消息</div><div class="cap-desc">关注事件推送</div></div>
          <div class="cap-card"><div class="cap-icon">📋</div><div class="cap-name">AI日报</div><div class="cap-desc">一键总结</div></div>
          <div class="cap-card"><div class="cap-icon">🔍</div><div class="cap-name">AI搜索</div><div class="cap-desc">快速查找</div></div>
        </div>

        <div class="section-title">选择套餐</div>
        <div class="plan-row">
          <div :class="['plan-card', { selected: selectedPlan === 'basic' }]" @click="selectedPlan = 'basic'">
            <div class="plan-name">全能AI</div><div class="plan-price">¥9.9 <span>/月</span></div>
            <div class="plan-feats"><div class="feat">✓ AI消息推送</div><div class="feat">✓ AI日报（5次免费/月）</div><div class="feat">✓ 关注事件管理</div></div>
          </div>
          <div :class="['plan-card', 'pro', { selected: selectedPlan === 'pro' }]" @click="selectedPlan = 'pro'">
            <div class="plan-badge">推荐</div>
            <div class="plan-name">全能AI Pro</div><div class="plan-price">¥19.9 <span>/月</span></div>
            <div class="plan-feats"><div class="feat">✓ AI消息推送</div><div class="feat">✓ AI日报（20次免费/月）</div><div class="feat">✓ AI搜索</div><div class="feat">✓ 关注事件管理</div></div>
          </div>
        </div>

        <!-- 功能介绍 -->
        <div class="intro-section">
          <div class="intro-item">
            <div class="intro-icon">🤖</div>
            <div class="intro-text">
              <div class="intro-title">AI消息推送</div>
              <div class="intro-desc">摄像头自动识别画面中的人、宠物、车辆等，只推送你关注的事件，告别无关告警打扰</div>
            </div>
          </div>
          <div class="intro-item">
            <div class="intro-icon">📋</div>
            <div class="intro-text">
              <div class="intro-title">AI日报总结</div>
              <div class="intro-desc">每日自动生成一份图文报告，汇总关注事件的完整时间线和一句话总结，一眼了解家中动态</div>
            </div>
          </div>
          <div class="intro-item">
            <div class="intro-icon">🔍</div>
            <div class="intro-text">
              <div class="intro-title">AI搜索</div>
              <div class="intro-desc">用自然语言搜索事件记录，快速定位关键片段</div>
            </div>
          </div>
          <div class="intro-item">
            <div class="intro-icon">🎯</div>
            <div class="intro-text">
              <div class="intro-title">关注事件管理</div>
              <div class="intro-desc">自定义关注的人和事物，设置关键词，AI精准识别并优先推送</div>
            </div>
          </div>
        </div>

        <div class="first-tip">🎉 首月特惠 <strong>¥3.9</strong>，限新用户</div>
        <div style="height:20px"></div>
      </div>
      <div class="bottom-bar">
        <div class="price-area"><span class="price">{{ selectedPlan === 'basic' ? '¥9.9' : '¥19.9' }}</span><span class="period">/月</span></div>
        <button class="btn-buy" @click="showPay = true">立即开通</button>
      </div>
    </template>

    <!-- ===== 已开通态 · 配置页 ===== -->
    <template v-else>
      <div class="scroll-content config">
        <div class="status-card">
          <div class="status-top">
            <div><div class="status-plan">{{ planType === 'basic' ? '全能AI' : '全能AI Pro' }}</div><div class="status-date">有效期至 {{ validUntil }}</div></div>
            <div class="remain-area"><div class="remain-num">{{ remainReports }}</div><div class="remain-label">剩余日报</div></div>
          </div>
          <div v-if="planType === 'basic'" class="upgrade-row" @click="showUpgrade = true">
            <span>升级Pro解锁AI搜索和更多日报次数</span><van-icon name="arrow" size="14" color="#1A73E8" />
          </div>
        </div>

        <div class="config-section">
          <div class="config-section-title"><span>关注事件管理</span><span class="add-btn" @click="openAddEvent">+ 添加</span></div>
          <div class="config-toggle">
            <span>智能推送</span>
            <van-switch v-model="smartPush" size="22" />
          </div>
          <div class="event-tip">开启后仅推送关注事件消息</div>
          <div v-for="(evt, i) in events" :key="i" class="event-item">
            <div class="event-left"><div class="event-name">{{ evt.name }}</div><div class="event-keywords">{{ evt.desc }}</div></div>
            <van-switch v-model="evt.enabled" size="20" />
            <van-icon name="edit" size="16" color="#6B7280" @click="openEditEvent(i)" />
            <van-icon name="delete" size="16" color="#EA4335" @click="deleteEvent(i)" />
          </div>
        </div>
        <div style="height:20px"></div>
      </div>
    </template>

    <!-- 支付弹窗 -->
    <van-popup v-model:show="showPay" position="bottom" round>
      <div class="pay-popup">
        <div class="popup-header"><h3>{{ isActivated ? '续费' : '确认开通' }}</h3><van-icon name="cross" size="20" @click="showPay = false" /></div>
        <div class="pay-amount">{{ selectedPlan === 'basic' ? '¥9.9' : '¥19.9' }}</div>
        <div class="pay-plan">/月 · {{ selectedPlan === 'basic' ? '全能AI' : '全能AI Pro' }}</div>
        <div class="pay-devices" v-if="!isActivated">已选设备：{{ selectedDevices.length }} 台</div>
        <div class="pay-options">
          <div :class="['pay-option', { selected: payMethod === 'wechat' }]" @click="payMethod = 'wechat'"><div class="pay-icon" style="background:#07C160"><van-icon name="wechat" size="18" color="#fff" /></div><span>微信支付</span><div class="radio"></div></div>
          <div :class="['pay-option', { selected: payMethod === 'alipay' }]" @click="payMethod = 'alipay'"><div class="pay-icon" style="background:#1677FF"><van-icon name="alipay" size="18" color="#fff" /></div><span>支付宝</span><div class="radio"></div></div>
        </div>
        <van-button block type="primary" @click="handlePayAndActivate">{{ isActivated ? '确认续费' : '确认支付' }}</van-button>
      </div>
    </van-popup>

    <!-- 升级弹窗 -->
    <van-popup v-model:show="showUpgrade" position="bottom" round :style="{ height: '40%' }">
      <div class="upgrade-popup">
        <div class="popup-header"><h3>升级全能AI Pro</h3><van-icon name="cross" size="20" @click="showUpgrade = false" /></div>
        <div class="upgrade-feats"><div class="ufeat">🔓 解锁 AI 搜索功能</div><div class="ufeat">📋 日报免费次数升级至 20次/月</div><div class="ufeat">📊 更详细的关注事件分析</div></div>
        <van-button block type="primary" @click="handleUpgrade">立即升级 — ¥19.9/月</van-button>
      </div>
    </van-popup>

    <!-- 添加/编辑关注弹窗 -->
    <van-dialog v-model:show="showAddDialog" title="关注事件" show-cancel-button @confirm="saveEvent">
      <div class="edit-dialog">
        <div class="edit-field"><div class="edit-label">关注名称</div><input v-model="editingName" class="edit-input" placeholder="e.g. 奶奶的活动" /></div>
        <div class="edit-field"><div class="edit-label">事件描述</div><textarea v-model="editingDesc" class="edit-textarea" rows="3" placeholder="描述你想关注的事件，例如：奶奶每天早上出门买菜的时候"></textarea></div>
        <div class="edit-hint">AI会自动分析描述内容，匹配相关事件</div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { aiStatus } from '@/store/devStatus'

const router = useRouter()
const goBack = () => router.back()

// 从全局store读取调试状态
const isActivated = computed(() => aiStatus.value !== 'not_activated')
const planType = computed(() => {
  if (aiStatus.value === 'activated_pro') return 'pro'
  return 'basic'
})
const remainReports = computed(() => {
  if (aiStatus.value === 'activated_pro') return 20
  return 5
})

const selectedPlan = ref('basic')
const payMethod = ref('wechat')
const showPay = ref(false)
const showUpgrade = ref(false)
const validUntil = ref('2026-05-28')

// 智能推送
const smartPush = ref(true)

// 关注事件
const showAddDialog = ref(false)
const editingIndex = ref(-1)
const editingName = ref('')
const editingDesc = ref('')

const events = reactive([
  { name: '人员经过', desc: '关注到家门口有人经过的事件', enabled: true },
  { name: '宠物活动', desc: '猫咪和狗狗在客厅的活动', enabled: true },
  { name: '告警', desc: '检测到异常入侵或告警', enabled: true }
])

const selectedDevices = ref(['frontdoor', 'backyard', 'garage'])

const openAddEvent = () => {
  editingIndex.value = -1; editingName.value = ''; editingDesc.value = ''; showAddDialog.value = true
}
const openEditEvent = (i) => {
  editingIndex.value = i; editingName.value = events[i].name; editingDesc.value = events[i].desc || ''; showAddDialog.value = true
}
const deleteEvent = (i) => { events.splice(i, 1) }
const saveEvent = () => {
  if (!editingName.value.trim()) return
  const evt = { name: editingName.value.trim(), desc: editingDesc.value.trim(), enabled: true }
  if (editingIndex.value >= 0) events[editingIndex.value] = evt
  else events.push(evt)
  editingIndex.value = -1; editingName.value = ''; editingDesc.value = ''
}

// 注意：支付后或升级后，通过dev面板切换状态来控制
// 这里只是模拟UI交互
const handlePayAndActivate = () => { showPay.value = false }
const handleUpgrade = () => { showUpgrade.value = false }
</script>

<style lang="scss" scoped>
.ai-page { height: 100%; background: $bg-page; display: flex; flex-direction: column; }
.ai-header { background: $bg-color; padding: 12px 16px; border-bottom: 1px solid $border-color; display: flex; align-items: center; gap: 12px; flex-shrink: 0; position: relative; z-index: 1; h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; } }
.back-btn, .header-right { width: 32px; height: 32px; border-radius: 50%; background: $bg-page; display: flex; align-items: center; justify-content: center; color: $text-secondary; flex-shrink: 0; }
.scroll-content { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }

.hero-banner { margin: 16px; padding: 18px; border-radius: $radius-lg; background: linear-gradient(135deg, #0F2A5E, #1A73E8); display: flex; align-items: center; gap: 14px; .hero-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; } .hero-text { flex: 1; } .title { font-size: 16px; font-weight: 700; color: #fff; } .sub { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 4px; } }
.cap-row { margin: 0 16px 16px; display: flex; gap: 8px; }
.cap-card { flex: 1; background: $bg-card; border-radius: $radius-md; padding: 12px 8px; text-align: center; box-shadow: $shadow-card; .cap-icon { font-size: 24px; margin-bottom: 6px; } .cap-name { font-size: 13px; font-weight: 600; color: $text-primary; } .cap-desc { font-size: 11px; color: $text-secondary; margin-top: 2px; } }
.section-title { padding: 0 16px; margin-bottom: 10px; font-size: 15px; font-weight: 700; color: $text-primary; }

/* 功能介绍卡片 */
.intro-section { margin: 0 16px 20px; }
.intro-item { background: $bg-card; border-radius: $radius-lg; padding: 14px; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 8px; box-shadow: $shadow-card; }
.intro-icon { width: 36px; height: 36px; border-radius: 10px; background: $primary-bg; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.intro-text { flex: 1; }
.intro-title { font-size: 14px; font-weight: 600; color: $text-primary; }
.intro-desc { font-size: 12px; color: $text-secondary; margin-top: 3px; line-height: 1.5; }
.plan-row { padding: 0 16px; display: flex; gap: 10px; margin-bottom: 20px; }
.plan-card { flex: 1; background: $bg-card; border-radius: $radius-lg; padding: 14px 12px; border: 2px solid $border-color; position: relative; transition: border-color 0.2s; cursor: pointer; &.selected { border-color: $primary-color; background: $primary-bg; } &.pro { &.selected { border-color: #9C27B0; background: #F3E8FF; .plan-price { color: #9C27B0; } } .plan-badge { position: absolute; top: -1px; left: 12px; padding: 2px 8px; border-radius: 0 0 8px 8px; background: linear-gradient(135deg, #9C27B0, #7B1FA2); color: #fff; font-size: 10px; font-weight: 700; } .plan-price { color: #9C27B0; } } .plan-name { font-size: 14px; font-weight: 700; color: $text-primary; margin-top: 4px; } .plan-price { font-size: 20px; font-weight: 800; color: $primary-color; margin-top: 6px; span { font-size: 11px; font-weight: 500; color: $text-secondary; } } .plan-feats { margin-top: 10px; display: flex; flex-direction: column; gap: 4px; .feat { font-size: 11px; color: $text-secondary; } } }
.first-tip { margin: 0 16px; padding: 10px 14px; background: #FFF8E1; border-radius: $radius-md; font-size: 12px; color: #92400E; text-align: center; strong { font-size: 16px; } }
.bottom-bar { flex-shrink: 0; background: $bg-color; padding: 12px 16px; padding-bottom: calc(12px + env(safe-area-inset-bottom, 8px)); border-top: 1px solid $border-color; display: flex; align-items: center; gap: 12px; .price-area { .price { font-size: 22px; font-weight: 800; color: $danger-color; } .period { font-size: 13px; color: $text-secondary; } } .btn-buy { flex: 1; padding: 13px; background: linear-gradient(135deg, #1A73E8, #1557B0); color: #fff; border: none; border-radius: $radius-md; font-size: 16px; font-weight: 700; cursor: pointer; } }

.config { padding: 16px; }
.status-card { background: $bg-card; border-radius: $radius-lg; overflow: hidden; box-shadow: $shadow-card; margin-bottom: 16px; }
.status-top { padding: 16px; display: flex; justify-content: space-between; align-items: center; }
.status-plan { font-size: 16px; font-weight: 700; color: $text-primary; }
.status-date { font-size: 11px; color: $text-secondary; margin-top: 2px; }
.remain-area { text-align: center; .remain-num { font-size: 24px; font-weight: 800; color: $primary-color; } .remain-label { font-size: 11px; color: $text-secondary; } }
.upgrade-row { padding: 10px 16px; border-top: 1px solid $border-color; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: $primary-color; cursor: pointer; &:active { background: $bg-page; } }
.config-section { background: $bg-card; border-radius: $radius-lg; padding: 16px; margin-bottom: 12px; box-shadow: $shadow-card; }
.config-section-title { font-size: 14px; font-weight: 700; color: $text-primary; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
.add-btn { font-size: 13px; font-weight: 600; color: $primary-color; cursor: pointer; }
.config-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid $border-light; font-size: 13px; color: $text-primary; &:last-child { border-bottom: none; } }
.event-tip { font-size: 11px; color: $text-secondary; margin-bottom: 12px; }
.config-toggle { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid $border-light; font-size: 13px; color: $text-primary; }
.event-item { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.event-left { flex: 1; }
.event-name { font-size: 13px; font-weight: 600; color: $text-primary; }
.event-keywords { font-size: 11px; color: $text-secondary; margin-top: 2px; }

.pay-popup, .upgrade-popup { padding: 20px 16px 32px; }
.popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; h3 { font-size: 16px; font-weight: 700; color: $text-primary; } }
.pay-amount { font-size: 32px; font-weight: 800; color: $primary-color; }
.pay-plan { font-size: 13px; color: $text-secondary; margin-bottom: 4px; }
.pay-devices { font-size: 12px; color: $text-secondary; margin-bottom: 20px; }
.pay-options { margin-bottom: 16px; }
.pay-option { display: flex; align-items: center; gap: 12px; padding: 14px 12px; border: 2px solid $border-color; border-radius: $radius-md; margin-bottom: 10px; transition: border-color 0.2s; cursor: pointer; &.selected { border-color: $primary-color; } .pay-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; } span { flex: 1; font-size: 14px; font-weight: 600; color: $text-primary; } .radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid $border-color; display: flex; align-items: center; justify-content: center; } &.selected .radio { border-color: $primary-color; background: $primary-color; &::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #fff; } } }
.upgrade-feats { margin-bottom: 20px; }
.ufeat { padding: 10px 0; font-size: 14px; color: $text-primary; border-bottom: 1px solid $border-color; }
.edit-dialog { padding: 16px; }
.edit-field { margin-bottom: 14px; }
.edit-label { font-size: 13px; font-weight: 600; color: $text-primary; margin-bottom: 6px; }
.edit-input { width: 100%; padding: 10px 12px; border: 1.5px solid $border-color; border-radius: $radius-sm; font-size: 14px; color: $text-primary; outline: none; box-sizing: border-box; &:focus { border-color: $primary-color; } }
.edit-textarea { width: 100%; padding: 10px 12px; border: 1.5px solid $border-color; border-radius: $radius-sm; font-size: 14px; color: $text-primary; outline: none; box-sizing: border-box; resize: none; font-family: inherit; line-height: 1.5; &:focus { border-color: $primary-color; } }
.edit-hint { font-size: 11px; color: $text-secondary; margin-top: 4px; }
</style>