<template>
  <div class="ai-page">
    <div class="ai-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>{{ isActivated ? '全能AI配置' : '全能AI' }}</h2>
    </div>

    <!-- ===== 未开通态 ===== -->
    <template v-if="!isActivated">
      <div class="scroll-content">
        <!-- 顶部 Banner -->
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

        <!-- 套餐选择 -->
        <div class="section-title">选择套餐</div>
        <div class="plan-cards">
          <div
            :class="['plan-card', { selected: selectedPlan === 'monthly' }]"
            @click="selectedPlan = 'monthly'"
          >
            <div class="plan-card-name">全能AI套餐</div>
            <div class="plan-card-price">¥9.9 <span>/月</span></div>
            <div class="plan-card-tag">连续订阅</div>
            <div class="plan-feats">
              <div class="feat">✓ AI消息推送</div>
              <div class="feat">✓ AI日报</div>
              <div class="feat">✓ AI搜索</div>
              <div class="feat">✓ 关注事件管理</div>
            </div>
          </div>
          <div
            :class="['plan-card', { selected: selectedPlan === 'yearly' }]"
            @click="selectedPlan = 'yearly'"
          >
            <div class="plan-card-name">全能AI套餐</div>
            <div class="plan-card-price">¥99 <span>/年</span></div>
            <div class="plan-card-tag yearly">买断制</div>
            <div class="plan-feats">
              <div class="feat">✓ AI消息推送</div>
              <div class="feat">✓ AI日报</div>
              <div class="feat">✓ AI搜索</div>
              <div class="feat">✓ 关注事件管理</div>
            </div>
          </div>
        </div>
        <div v-if="selectedPlan === 'monthly'" class="renew-hint">
          连续订阅套餐，到期自动按9.9元/月自动续费，可随时取消
        </div>

        <!-- 支付方式 -->
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

        <!-- 功能介绍 -->
        <div class="section-title">服务介绍</div>
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

        <div style="height:100px"></div>
      </div>

      <!-- 底部固定栏 -->
      <div class="bottom-bar">
        <div class="agreement-row" @click="agreed = !agreed">
          <div class="agreement-checkbox" :class="{ checked: agreed }">
            <van-icon v-if="agreed" name="success" size="12" color="#fff" />
          </div>
          <span class="agreement-text">
            已阅读并同意<span class="agreement-link" @click.stop>{{ agreementText }}</span>
          </span>
        </div>
        <button class="btn-buy" @click="handleBuyClick">
          立即开通 {{ selectedPlan === 'monthly' ? '¥9.9' : '¥99' }}
        </button>
      </div>
    </template>

    <!-- ===== 已开通态 · 配置页 ===== -->
    <template v-else>
      <div class="scroll-content config">
        <div class="status-card">
          <div class="status-top">
            <div><div class="status-plan">全能AI</div><div class="status-date">有效期至 {{ validUntil }}</div></div>
            <div class="remain-area"><div class="remain-num">✓</div><div class="remain-label">守护中</div></div>
          </div>
        </div>

        <div class="config-section">
          <div class="config-section-title"><span>关注事件管理</span><span class="add-btn" @click="openAddEvent">+ 添加{{ events.length }}/{{ maxEvents }}</span></div>
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

    <!-- 协议确认弹窗 -->
    <van-dialog v-model:show="showAgreementDialog" title="提示" show-cancel-button cancel-text="取消" confirm-text="同意" @confirm="agreeAndPay">
      <div class="agreement-dialog-content">请先阅读并同意{{ agreementText }}</div>
    </van-dialog>

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
import { useRouter, useRoute } from 'vue-router'
import { aiStatus } from '@/store/devStatus'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const goBack = () => router.back()

// 从全局store读取调试状态；query.show=activate 强制显示服务介绍开通页
const isActivated = computed(() => {
  if (route.query.show === 'activate') return false
  return aiStatus.value !== 'not_activated'
})

// 套餐选择：monthly | yearly
const selectedPlan = ref('monthly')

// 支付方式
const payMethod = ref('wechat')

// 协议
const agreed = ref(false)
const showAgreementDialog = ref(false)

const agreementText = computed(() => {
  return selectedPlan.value === 'monthly'
    ? '《云服务协议（含自动续费协议）》'
    : '《云服务协议》'
})

const handleBuyClick = () => {
  if (!agreed.value) {
    showAgreementDialog.value = true
    return
  }
  // 已同意 → 执行购买流程
}

const agreeAndPay = () => {
  agreed.value = true
  showAgreementDialog.value = false
  // 执行购买流程
}

const validUntil = ref('2026-05-28')

// 智能推送
const smartPush = ref(true)

// 关注事件
const showAddDialog = ref(false)
const editingIndex = ref(-1)
const editingName = ref('')
const editingDesc = ref('')

const maxEvents = 10
const events = reactive([
  { name: '儿童守护', desc: '小孩哭喊、跌倒、出门', enabled: true },
  { name: '包裹送达', desc: '快递或者外卖送达', enabled: true },
  { name: '厨房守护', desc: '厨房异常烟雾、明火', enabled: true },
  { name: '宠物守护', desc: '宠物乱拉乱尿、吃饭、喝水', enabled: true }
])

const openAddEvent = () => {
  if (events.length >= maxEvents) {
    showToast('最多添加10个关注事件')
    return
  }
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
/* 套餐卡片 */
.plan-cards { padding: 0 16px; display: flex; gap: 10px; margin-bottom: 8px; }
.plan-card { flex: 1; background: $bg-card; border-radius: $radius-lg; padding: 16px 14px; border: 2px solid $border-color; cursor: pointer; transition: all 0.2s; &.selected { border-color: $primary-color; background: $primary-bg; } }
.plan-card-name { font-size: 14px; font-weight: 700; color: $text-primary; }
.plan-card-price { font-size: 22px; font-weight: 800; color: $primary-color; margin-top: 6px; span { font-size: 11px; font-weight: 500; color: $text-secondary; } }
.plan-card-tag { display: inline-block; margin-top: 6px; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 8px; background: #DBEAFE; color: #1D4ED8; &.yearly { background: #D1FAE5; color: #065F46; } }
.plan-feats { margin-top: 12px; display: flex; flex-direction: column; gap: 4px; .feat { font-size: 11px; color: $text-secondary; } }
.plan-radio { display: none; }
.renew-hint { margin: 0 16px 8px; font-size: 11px; color: $text-secondary; line-height: 1.4; }

/* 支付方式 */
.pay-methods { padding: 0 16px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.pay-method { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: $bg-card; border: 2px solid $border-color; border-radius: $radius-md; cursor: pointer; transition: border-color 0.2s; &.selected { border-color: $primary-color; } span { flex: 1; font-size: 13px; font-weight: 600; color: $text-primary; } }
.pay-m-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pay-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid $border-color; flex-shrink: 0; &.checked { border-color: $primary-color; background: $primary-color; position: relative; &::after { content: ''; position: absolute; top: 3px; left: 5px; width: 4px; height: 8px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); } } }

/* 底部栏 */
.bottom-bar { flex-shrink: 0; background: $bg-color; padding: 10px 16px; padding-bottom: calc(10px + env(safe-area-inset-bottom, 8px)); border-top: 1px solid $border-color; .agreement-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; cursor: pointer; } .agreement-checkbox { width: 16px; height: 16px; border-radius: 3px; border: 1.5px solid #9CA3AF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; &.checked { background: $primary-color; border-color: $primary-color; } } .agreement-text { font-size: 11px; color: $text-secondary; } .agreement-link { color: $primary-color; } .btn-buy { width: 100%; padding: 12px; background: linear-gradient(135deg, #1A73E8, #1557B0); color: #fff; border: none; border-radius: $radius-md; font-size: 15px; font-weight: 700; cursor: pointer; } }
.agreement-dialog-content { padding: 20px; font-size: 14px; color: $text-primary; text-align: center; }

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

.edit-dialog { padding: 16px; }
.edit-field { margin-bottom: 14px; }
.edit-label { font-size: 13px; font-weight: 600; color: $text-primary; margin-bottom: 6px; }
.edit-input { width: 100%; padding: 10px 12px; border: 1.5px solid $border-color; border-radius: $radius-sm; font-size: 14px; color: $text-primary; outline: none; box-sizing: border-box; &:focus { border-color: $primary-color; } }
.edit-textarea { width: 100%; padding: 10px 12px; border: 1.5px solid $border-color; border-radius: $radius-sm; font-size: 14px; color: $text-primary; outline: none; box-sizing: border-box; resize: none; font-family: inherit; line-height: 1.5; &:focus { border-color: $primary-color; } }
.edit-hint { font-size: 11px; color: $text-secondary; margin-top: 4px; }
</style>