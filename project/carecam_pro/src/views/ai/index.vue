<template>
  <div class="ai-page">
    <div class="ai-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>{{ pageTitle }}</h2>
      <div class="header-right" v-if="isActivated" @click="$router.push('/my-agent')">
        <van-icon name="user-o" size="18" />
      </div>
    </div>

    <!-- ===== 未开通态 ===== -->
    <template v-if="!isActivated">
      <div class="scroll-content">
        <!-- 设备筛选 -->
        <div class="device-filter-bar">
          <span
            v-for="(d, i) in deviceOptions"
            :key="i"
            :class="['dev-filter-chip', { active: selectedDevice === d }]"
            @click="selectedDevice = d"
          >{{ d }}</span>
        </div>

        <!-- 功能Tab切换 -->
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
                        <div class="fsp-msg-title">🚶 老人看护 · 奶奶出门</div>
                        <div class="fsp-msg-body">奶奶于 09:20 从正门走出，身穿蓝色外套，手拿拐杖，状态正常</div>
                        <div class="fsp-msg-thumb" style="background:linear-gradient(135deg,#0d2e1a,#1a5c34)"></div>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="activeFeature.key === 'daily'">
                    <div class="fsp-card"><div class="fsp-card-title">💡 AI总结</div><div class="fsp-summary-title">今日一切安好</div><div class="fsp-summary-text">今天一切正常，奶奶出门1次，猫咪很活跃…</div></div>
                    <div class="fsp-card"><div class="fsp-card-title">📊 事件汇总</div><div class="fsp-event"><span>人员经过</span><span>3 件</span></div><div class="fsp-event"><span>宠物活动</span><span>5 件</span></div></div>
                  </template>
                  <template v-else-if="activeFeature.key === 'search'">
                    <div class="fsp-search-bar"><van-icon name="search" size="12" color="#9CA3AF" /><span>奶奶今天出门了吗</span></div>
                    <div class="fsp-card fsp-result"><div class="fsp-result-thumb" style="background:linear-gradient(135deg,#0d2e1a,#1a5c34)"></div><div class="fsp-result-info"><div class="fsp-result-text">奶奶从后门走出，身穿蓝色外套，手拿拐杖</div><div class="fsp-result-meta"><span class="fsp-tag">老人看护</span><span>09:20</span></div></div></div>
                  </template>
                  <template v-else>
                    <div class="fsp-card"><div class="fsp-card-title">🎯 我的关注</div><div class="fsp-event"><span>儿童守护</span><span class="fsp-on">已开启</span></div><div class="fsp-event"><span>包裹送达</span><span class="fsp-on">已开启</span></div><div class="fsp-event"><span>厨房守护</span><span class="fsp-on">已开启</span></div><div class="fsp-event"><span>宠物守护</span><span class="fsp-on">已开启</span></div></div>
                  </template>
                </div>
              </div>
            </div>
            <div class="ft-tabs">
              <span
                v-for="(f, i) in features"
                :key="i"
                :class="['ft-tab', { active: featureTabIdx === i }]"
                @click="featureTabIdx = i"
              >{{ f.name }}</span>
            </div>
          </div>
        </div>

        <!-- 套餐选择 — 首屏可见 -->
        <div class="section plan-section">
          <div class="plan-cards">
            <div
              :class="['plan-card', { selected: selectedPlan === 'monthly' }]"
              @click="selectedPlan = 'monthly'"
            >
              <div class="plan-top">
                <div class="plan-name">月订阅</div>
                <div class="plan-price">¥9.9<span>/月</span></div>
                <div class="plan-tag">连续订阅</div>
              </div>
              <div class="plan-feats">
                <div class="feat">✓ 全部AI功能</div>
                <div class="feat">✓ 4个关注事件</div>
                <div class="feat">✓ 每日3次AI日报</div>
                <div class="feat">✓ 无限AI搜索</div>
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
                <div class="plan-price">¥99<span>/年</span></div>
                <div class="plan-tag yearly">买断制</div>
              </div>
              <div class="plan-feats">
                <div class="feat">✓ 全部AI功能</div>
                <div class="feat">✓ 4个关注事件</div>
                <div class="feat">✓ 每日3次AI日报</div>
                <div class="feat">✓ 无限AI搜索</div>
              </div>
              <div class="plan-check" v-if="selectedPlan === 'yearly'"><van-icon name="success" size="16" /></div>
            </div>
          </div>
          <div v-if="selectedPlan === 'monthly'" class="renew-hint">
            连续订阅套餐，到期自动按9.9元/月续费，可随时取消
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

        <!-- 场景故事 -->
        <div class="section">
          <div class="section-header">
            <div class="section-title">懂你所关心，守护每一个重要时刻</div>
            <div class="section-sub">AI自动分析画面，精准识别你关注的人和事</div>
          </div>
          <div class="scene-list">
            <div class="scene-card" v-for="(s, i) in scenes" :key="i">
              <div class="scene-img" :style="{ background: s.bg }">
                <span class="scene-emoji">{{ s.emoji }}</span>
              </div>
              <div class="scene-info">
                <div class="scene-name">{{ s.name }}</div>
                <div class="scene-desc">{{ s.desc }}</div>
                <div class="scene-items">
                  <span class="scene-item" v-for="(t, j) in s.tags" :key="j">{{ t }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 场景故事 -->

        <div class="ai-disclaimer">本功能由AI大模型提供，识别结果可能存在误差，仅供参考。请以实际情况为准，勿完全依赖AI判断。</div>

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
          立即开通 {{ selectedPlan === 'monthly' ? '¥9.9/月' : '¥99/年' }}
        </button>
      </div>
    </template>

    <!-- ===== 已开通态 · 配置页 ===== -->
    <template v-else>
      <div class="scroll-content config">
        <!-- Agent选择器 -->
        <div class="agent-selector-bar" v-if="deviceAgents.length > 1">
          <span
            v-for="a in deviceAgents"
            :key="a.agentId"
            :class="['agent-selector-chip', { active: (selectedAgentId || deviceAgents[0]?.agentId) === a.agentId }]"
            @click="onAgentChange(a.agentId)"
          >{{ a.agentIcon }} {{ a.agentName }}</span>
        </div>

        <div class="status-card">
          <div class="status-top">
            <div><div class="status-plan">{{ currentAgent?.agentName || '全能AI' }}</div><div class="status-date">有效期至 {{ currentAgent?.expireDate || validUntil }}</div></div>
            <div class="remain-area"><div class="remain-num">✓</div><div class="remain-label">守护中</div></div>
          </div>
        </div>

        <div class="config-section">
          <div class="config-section-title">
            <span>关注事件管理</span>
            <span v-if="canEdit" class="add-btn" @click="openAddEvent">+ 添加{{ events.length }}/{{ maxEvents }}</span>
          </div>
          <div class="event-tip">关闭后将不再识别该类型事件</div>
          <div v-for="(evt, i) in events" :key="i" class="event-item">
            <div class="event-left"><div class="event-name">{{ evt.name }}</div><div class="event-keywords">{{ evt.desc }}</div></div>
            <van-switch v-model="evt.enabled" size="20" />
            <template v-if="canEdit">
              <van-icon name="edit" size="16" color="#6B7280" @click="openEditEvent(i)" />
              <van-icon name="delete" size="16" color="#EA4335" @click="deleteEvent(i)" />
            </template>
          </div>
        </div>

        <div class="config-section">
          <div class="config-toggle">
            <span>智能推送</span>
            <van-switch v-model="smartPush" size="22" />
          </div>
          <div class="event-tip" style="margin-bottom: 0;">开启后仅推送关注事件消息</div>
        </div>

        <div class="config-note">依赖设备侦测抓图，请确保已开启运动侦测或其他侦测服务</div>

        <div class="my-agent-entry" @click="$router.push('/agent-market')">
          <div class="mae-left">
            <span class="mae-icon">🤖</span>
            <span class="mae-text">智能体市场</span>
          </div>
          <van-icon name="arrow" size="14" color="#9CA3AF" />
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
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { deviceAgent, isDeviceAgentActive, getDeviceAgents, getAgentConfig } from '@/store/devStatus'
import { showToast } from '@/utils/toast'

const router = useRouter()
const route = useRoute()
const goBack = () => router.back()

// 设备筛选
const deviceOptions = Object.keys(deviceAgent.value)

function getDefaultDevice() {
  if (route.query.device) return route.query.device
  for (const [dev, agents] of Object.entries(deviceAgent.value)) {
    if (agents.some(a => a.status === 'active')) return dev
  }
  return deviceOptions[0] || '标准摄像机'
}
const selectedDevice = ref(getDefaultDevice())

const pageTitle = computed(() => {
  if (!isActivated.value) return '全能AI'
  const agent = currentAgent.value
  if (!agent) return 'AI配置'
  return agent.agentName + '配置'
})

// 选中设备是否已开通
const isActivated = computed(() => {
  if (route.query.show === 'activate') return false
  return isDeviceAgentActive(selectedDevice.value)
})

// 当前设备的活跃Agent列表
const deviceAgents = computed(() => getDeviceAgents(selectedDevice.value).filter(a => a.status === 'active'))

// Agent选择器
const selectedAgentId = ref('')
function syncSelectedAgent() {
  if (deviceAgents.value.length > 0 && !deviceAgents.value.find(a => a.agentId === selectedAgentId.value)) {
    selectedAgentId.value = deviceAgents.value[0].agentId
  }
}
syncSelectedAgent()

// 当前选中的Agent（设备数据）
const currentAgent = computed(() => {
  const id = selectedAgentId.value || deviceAgents.value[0]?.agentId
  return deviceAgents.value.find(a => a.agentId === id) || null
})

// 当前Agent配置
const currentAgentConfig = computed(() => {
  if (!currentAgent.value) return null
  return getAgentConfig(currentAgent.value.agentId)
})

// 场景故事
const scenes = [
  {
    name: '老人看护',
    desc: '自动识别老人出入、跌倒、久坐等行为，异常情况实时推送，随时掌握长辈动态',
    emoji: '👴',
    bg: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
    tags: ['出入识别', '跌倒检测']
  },
  {
    name: '儿童守护',
    desc: '检测孩子奔跑、独自出门等场景，第一时间通知家长，让孩子安全成长',
    emoji: '👶',
    bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
    tags: ['出门检测']
  },
  {
    name: '宠物陪伴',
    desc: '记录宠物吃饭、喝水、玩耍等日常活动，自动生成萌宠日记，远程也能陪伴毛孩子',
    emoji: '🐱',
    bg: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
    tags: ['活动记录', '进食监测', '异常行为告警']
  }
]

// 四大功能
const features = [
  {
    key: 'message',
    name: 'AI消息推送',
    badge: '实时',
    icon: '🤖',
    iconBg: '#EEF5FF',
    cardBg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
    desc: '摄像头自动识别画面中的人、宠物、车辆等，只推送你关注的事件，告别无关告警打扰'
  },
  {
    key: 'daily',
    name: 'AI日报总结',
    badge: '每日',
    icon: '📋',
    iconBg: '#FFF7ED',
    cardBg: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
    desc: '每日自动生成图文报告，汇总关注事件的完整时间线，一句话总结家中动态，一目了然'
  },
  {
    key: 'search',
    name: 'AI智能搜索',
    badge: '秒搜',
    icon: '🔍',
    iconBg: '#F5F3FF',
    cardBg: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
    desc: '用自然语言搜索事件记录，快速定位关键片段。支持模糊描述，AI精准匹配'
  },
  {
    key: 'events',
    name: '关注事件管理',
    badge: '灵活',
    icon: '🎯',
    iconBg: '#FFF3E0',
    cardBg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    desc: '自定义关注目标，设置检测关键词，AI精准识别并按优先级推送，只收到你关心的消息'
  }
]

// 功能Tab切换
const featureTabIdx = ref(0)
const activeFeature = computed(() => features[featureTabIdx.value])

const selectedPlan = ref('monthly')
const payMethod = ref('wechat')
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
    agentId: 'all_in_one_v1',
    agentName: '全能AI',
    agentIcon: '🌐',
    expireDate: expireDate.toISOString().split('T')[0],
    status: 'active'
  })
  showToast('购买成功')
}

const validUntil = ref('2026-05-28')

const canEdit = computed(() => {
  const cfg = currentAgentConfig.value
  return cfg && cfg.id === 'all_in_one_v1'
})

const smartPush = ref(true)

const showAddDialog = ref(false)
const editingIndex = ref(-1)
const editingName = ref('')
const editingDesc = ref('')

const maxEvents = 4

const agentFocusDescMap = {
  '宠物进食': '宠物在食盆旁进食行为',
  '宠物排泄': '宠物使用猫砂盆等排泄行为',
  '呕吐/异常': '宠物呕吐、跛行、异常抓挠',
  '宠物玩耍': '宠物奔跑、追逐、跳跃',
  '宠物睡眠': '宠物在窝里或地面长时间休息',
  '包裹送达': '快递或外卖放置包裹',
  '包裹取走': '包裹从门口被取走',
  '包裹在门口': '门口有包裹停留',
  '快递/外卖': '快递员或外卖骑手到访',
  '陌生人到访': '陌生人靠近或逗留门口',
  '家人出入': '家人开门进出',
  '异常徘徊': '有人长时间在门口徘徊',
  '多人聚集': '门口多人同时出现',
  '儿童守护': '小孩哭喊、跌倒、出门',
  '厨房守护': '厨房异常烟雾、明火',
  '动物看护': '宠物乱拉乱尿、吃饭、喝水'
}

const events = reactive(buildEvents())

watch(() => route.query.device, (newDevice) => {
  if (newDevice) selectedDevice.value = newDevice
})

const onAgentChange = (agentId) => {
  selectedAgentId.value = agentId
  const newList = buildEvents()
  events.length = 0
  newList.forEach(e => events.push(e))
}

watch(selectedDevice, () => {
  syncSelectedAgent()
  const newList = buildEvents()
  events.length = 0
  newList.forEach(e => events.push(e))
})

function buildEvents() {
  const cfg = currentAgentConfig.value
  if (!cfg || !cfg.focusList) return defaultEvents()
  return cfg.focusList.map(f => ({
    name: f.name,
    desc: agentFocusDescMap[f.name] || `${f.name}相关事件`,
    enabled: true
  }))
}

function defaultEvents() {
  return [
    { name: '运动侦测', desc: '画面内有运动物体', enabled: true },
    { name: '人形侦测', desc: '检测到人形物体', enabled: true }
  ]
}

const openAddEvent = () => {
  if (events.length >= maxEvents) {
    showToast('最多添加4个关注事件')
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
.ai-header { background: $bg-color; padding: 12px 16px; border-bottom: 1px solid $border-color; display: flex; align-items: center; gap: 12px; flex-shrink: 0; position: relative; z-index: 1; h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; } .header-right { width: 32px; height: 32px; border-radius: 50%; background: $bg-page; display: flex; align-items: center; justify-content: center; color: $text-secondary; flex-shrink: 0; cursor: pointer; } }
.back-btn { width: 32px; height: 32px; border-radius: 50%; background: $bg-page; display: flex; align-items: center; justify-content: center; color: $text-secondary; flex-shrink: 0; }
.scroll-content { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }

/* ======== 设备筛选 ======== */
.device-filter-bar { background: $bg-color; padding: 8px 16px; display: flex; gap: 6px; flex-shrink: 0; border-bottom: 1px solid $border-color; overflow-x: auto; }
.dev-filter-chip { flex-shrink: 0; padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 500; color: $text-secondary; background: $bg-page; border: 1px solid $border-color; cursor: pointer; white-space: nowrap; &.active { background: $primary-color; color: #fff; border-color: $primary-color; } }

/* ======== 功能Tab ======== */
.feature-tabs-section { padding: 12px 16px 0; }
.ft-tabs { display: flex; gap: 0; background: $bg-page; border-radius: $radius-md; padding: 3px; margin-top: 10px; }
.ft-tab { flex: 1; padding: 7px 0; font-size: 11px; font-weight: 600; color: $text-secondary; text-align: center; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; &.active { background: $primary-color; color: #fff; } }
.ft-card { background: $bg-card; border-radius: $radius-lg; padding: 10px 12px; margin-top: 10px; box-shadow: $shadow-card; }

/* ======== Section 通用 ======== */
.section { padding: 16px 16px 0; }
.plan-section { padding-top: 10px; }
.pay-section { padding-top: 10px; }
.section-header { margin-bottom: 14px; }
.section-title { font-size: 15px; font-weight: 700; color: $text-primary; }
.section-sub { font-size: 12px; color: $text-secondary; margin-top: 4px; }

/* ======== 套餐卡片 ======== */
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

/* ======== 支付方式 ======== */
.pay-methods { display: flex; flex-direction: column; gap: 8px; }
.pay-method { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: $bg-card; border: 2px solid $border-color; border-radius: $radius-md; cursor: pointer; &.selected { border-color: $primary-color; } span { flex: 1; font-size: 13px; font-weight: 600; color: $text-primary; } }
.pay-m-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pay-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid $border-color; flex-shrink: 0; &.checked { border-color: $primary-color; background: $primary-color; position: relative; &::after { content: ''; position: absolute; top: 3px; left: 5px; width: 4px; height: 8px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); } } }

/* ======== 场景故事 ======== */
.scene-list { display: flex; flex-direction: column; gap: 10px; }
.scene-card { background: $bg-card; border-radius: $radius-lg; padding: 14px; display: flex; gap: 14px; align-items: center; box-shadow: $shadow-card; }
.scene-img { width: 60px; height: 60px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.scene-emoji { font-size: 28px; }
.scene-info { flex: 1; min-width: 0; }
.scene-name { font-size: 15px; font-weight: 700; color: $text-primary; }
.scene-desc { font-size: 12px; color: $text-secondary; margin-top: 4px; line-height: 1.5; }
.scene-items { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.scene-item { font-size: 10px; color: $primary-color; background: $primary-bg; padding: 2px 8px; border-radius: 10px; }

/* ======== 功能展示 ======== */
.fs-card { background: $bg-card; border-radius: $radius-lg; padding: 16px; box-shadow: $shadow-card; }
.fs-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.fs-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.fs-title-row { flex: 1; display: flex; align-items: center; gap: 8px; }
.fs-name { font-size: 15px; font-weight: 700; color: $text-primary; }
.fs-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 8px; background: $primary-bg; color: $primary-color; }
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
.fsp-summary-text { font-size: 9px; color: #666; line-height: 1.4; }
.fsp-event { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 10px; &:last-child { border-bottom: none; } }
.fsp-on { font-size: 9px; color: #16A34A; }
.fsp-search-bar { display: flex; align-items: center; gap: 5px; padding: 5px 8px; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 10px; color: #333; }
.fsp-result { display: flex; gap: 8px; }
.fsp-result-thumb { width: 48px; height: 36px; border-radius: 6px; flex-shrink: 0; }
.fsp-result-info { flex: 1; min-width: 0; }
.fsp-result-text { font-size: 10px; font-weight: 500; color: #333; line-height: 1.3; margin-bottom: 3px; }
.fsp-result-meta { display: flex; justify-content: space-between; align-items: center; font-size: 8px; color: #9CA3AF; }
.fsp-tag { color: $primary-color; background: $primary-bg; padding: 1px 4px; border-radius: 4px; }

/* ======== 常见问题 ======== */
.ai-disclaimer { text-align: center; font-size: 11px; color: $text-placeholder; padding: 16px 24px 0; line-height: 1.5; }

/* ======== 底部栏 ======== */
.bottom-bar { flex-shrink: 0; background: $bg-color; padding: 10px 16px; padding-bottom: calc(10px + env(safe-area-inset-bottom, 8px)); border-top: 1px solid $border-color; .agreement-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; cursor: pointer; } .agreement-checkbox { width: 16px; height: 16px; border-radius: 3px; border: 1.5px solid #9CA3AF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; &.checked { background: $primary-color; border-color: $primary-color; } } .agreement-text { font-size: 11px; color: $text-secondary; } .agreement-link { color: $primary-color; } .btn-buy { width: 100%; padding: 12px; background: linear-gradient(135deg, #1A73E8, #1557B0); color: #fff; border: none; border-radius: $radius-md; font-size: 15px; font-weight: 700; cursor: pointer; } }
.agreement-dialog-content { padding: 20px; font-size: 14px; color: $text-primary; text-align: center; }

/* ======== 已开通态 ======== */
.config { padding: 16px; }
.config-note { padding: 10px 12px; background: #EFF3FF; border: 1px solid #D6E4FD; border-radius: 8px; font-size: 12px; color: #4B5563; line-height: 1.5; }
.agent-selector-bar { background: $bg-color; padding: 6px 0 12px; display: flex; gap: 8px; flex-shrink: 0; }
.agent-selector-chip { flex-shrink: 0; padding: 5px 14px; border-radius: 16px; font-size: 12px; font-weight: 500; color: $text-secondary; background: $bg-page; border: 1px solid $border-color; cursor: pointer; transition: all 0.15s; white-space: nowrap; &.active { background: $primary-bg; color: $primary-color; border-color: $primary-color; font-weight: 600; } }
.status-card { background: $bg-card; border-radius: $radius-lg; overflow: hidden; box-shadow: $shadow-card; margin-bottom: 16px; }
.status-top { padding: 16px; display: flex; justify-content: space-between; align-items: center; }
.status-plan { font-size: 16px; font-weight: 700; color: $text-primary; }
.status-date { font-size: 11px; color: $text-secondary; margin-top: 2px; }
.remain-area { text-align: center; .remain-num { font-size: 24px; font-weight: 800; color: $primary-color; } .remain-label { font-size: 11px; color: $text-secondary; } }
.config-section { background: $bg-card; border-radius: $radius-lg; padding: 16px; margin-bottom: 12px; box-shadow: $shadow-card; }
.config-section-title { font-size: 14px; font-weight: 700; color: $text-primary; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
.add-btn { font-size: 13px; font-weight: 600; color: $primary-color; cursor: pointer; }
.event-tip { font-size: 11px; color: $text-secondary; margin-bottom: 12px; }
.config-toggle { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 13px; color: $text-primary; }
.event-item { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid $border-light; &:last-child { border-bottom: none; } }
.event-left { flex: 1; }
.event-name { font-size: 13px; font-weight: 600; color: $text-primary; }
.event-keywords { font-size: 11px; color: $text-secondary; margin-top: 2px; }

/* 我的Agent入口 */
.my-agent-entry { background: $bg-card; border-radius: $radius-lg; padding: 14px 16px; margin-top: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: $shadow-card; cursor: pointer; &:active { background: $bg-page; } }
.mae-left { display: flex; align-items: center; gap: 10px; }
.mae-icon { font-size: 20px; }
.mae-text { font-size: 13px; font-weight: 600; color: $text-primary; }

.edit-dialog { padding: 16px; }
.edit-field { margin-bottom: 14px; }
.edit-label { font-size: 13px; font-weight: 600; color: $text-primary; margin-bottom: 6px; }
.edit-input { width: 100%; padding: 10px 12px; border: 1.5px solid $border-color; border-radius: $radius-sm; font-size: 14px; color: $text-primary; outline: none; box-sizing: border-box; &:focus { border-color: $primary-color; } }
.edit-textarea { width: 100%; padding: 10px 12px; border: 1.5px solid $border-color; border-radius: $radius-sm; font-size: 14px; color: $text-primary; outline: none; box-sizing: border-box; resize: none; font-family: inherit; line-height: 1.5; &:focus { border-color: $primary-color; } }
.edit-hint { font-size: 11px; color: $text-secondary; margin-top: 4px; }
</style>
