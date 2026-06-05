<template>
  <div class="store-page">
    <div class="store-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>服务商城</h2>
    </div>

    <div class="service-tabs">
      <div
        v-for="(tab, index) in serviceTabs"
        :key="index"
        :class="['svc-tab', { active: activeTab === index }]"
        @click="activeTab = index"
      >
        {{ tab }}
      </div>
    </div>

    <div class="store-body">
      <!-- 设备选择（顶部） -->
      <div class="device-bar" @click="showDevicePicker = true">
        <van-icon name="video-o" size="18" color="#4F46E5" />
        <div class="dev-info">
          <span class="dev-label">开通设备</span>
          <span class="dev-val">{{ selectedDeviceNames }}</span>
        </div>
        <van-icon name="arrow" size="14" color="#9CA3AF" />
      </div>

      <div class="cloud-banner">
        <div class="banner-text">
          <div class="title">{{ currentContent.bannerTitle }}</div>
          <div class="sub">{{ currentContent.bannerSub }}</div>
        </div>
        <div class="banner-icon">
          <van-icon name="cloud-o" size="28" color="#fff" />
        </div>
      </div>

      <div class="plan-scroll">
        <div
          v-for="(plan, index) in currentContent.plans"
          :key="index"
          :class="['plan-card', { selected: selectedPlan === index }]"
          @click="selectPlan(index)"
        >
          <div v-if="plan.tag" :class="['op-tag', plan.tagClass]">{{ plan.tag }}</div>
          <div class="discount" :style="{ marginTop: plan.tag ? '' : '14px' }">
            {{ plan.discount || '' }}
          </div>
          <div class="plan-name">{{ plan.name }}</div>
          <div class="plan-price">
            {{ plan.price }}
            <span>{{ plan.unit }}</span>
          </div>
          <div class="plan-features">
            <div v-for="(feature, i) in plan.features" :key="i" class="feat">
              {{ feature }}
            </div>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="pay-section">
        <div class="section-label">支付方式</div>
        <div
          v-for="(method, index) in payMethods"
          :key="index"
          :class="['pay-option', { selected: selectedPayMethod === index }]"
          @click="selectedPayMethod = index"
        >
          <div class="pay-icon" :style="{ backgroundColor: method.color }">
            <van-icon :name="method.icon" size="20" color="#fff" />
          </div>
          <span class="pay-name">{{ method.name }}</span>
          <div class="radio"></div>
        </div>
      </div>

      <div class="plan-detail">
        <h4>{{ currentPlanDetail.title }} — 包含内容</h4>
        <div v-for="(item, index) in currentPlanDetail.items" :key="index" class="detail-row">
          <van-icon :name="item.icon" size="16" color="#1A73E8" />
          <p>{{ item.text }}</p>
        </div>
      </div>

    </div>

    <!-- 底部购买栏 -->
    <div class="store-bottom">
      <div class="agree-row">
        <van-checkbox v-model="agreed" shape="square">
          我已阅读并同意
          <span class="link">《云服务协议》</span>
        </van-checkbox>
      </div>
      <van-button
        block
        type="primary"
        class="buy-btn"
        @click="openOrder"
      >
        立即开通 — {{ currentContent.plans[selectedPlan]?.price }}/月
      </van-button>
    </div>

    <!-- 设备选择弹窗 -->
    <van-popup v-model:show="showDevicePicker" position="bottom" round :style="{ height: '55%' }">
      <div class="picker-wrap">
        <div class="popup-header">
          <span class="popup-title">选择设备</span>
          <span class="popup-done" @click="showDevicePicker = false">完成</span>
        </div>
        <div v-if="curPlanType === 'multi'" class="picker-hint">该套餐最多支持绑定 {{ curMaxDevices }} 台设备</div>
        <div v-if="allDevicesWithStatus.length" class="popup-list">
          <div
            v-for="d in allDevicesWithStatus"
            :key="d.id"
            :class="['popup-item', {
              'is-maxed': !selectedDeviceIds.includes(d.id) && isMaxReached,
              'is-disabled': d._disabled
            }]"
            @click="toggleDevice(d)"
          >
            <van-checkbox
              :model-value="selectedDeviceIds.includes(d.id)"
              :disabled="d._disabled || (!selectedDeviceIds.includes(d.id) && isMaxReached)"
              checked-color="#4F46E5"
            />
            <div class="device-avatar small">
              <van-icon name="video-o" size="18" />
            </div>
            <div class="device-info">
              <span class="device-name">{{ d.name }}</span>
              <span class="device-id">{{ d.deviceId }}</span>
            </div>
            <div class="device-tail">
              <span v-if="d._status === 'unsupported'" class="tag-unsupported">不支持</span>
              <span v-else-if="d._status === 'active'" class="tag-active">已开通</span>
            </div>
          </div>
        </div>
        <div v-else class="popup-empty">暂无可选设备</div>
      </div>
    </van-popup>

    <!-- 确认订单弹窗（多设备） -->
    <van-popup v-model:show="showOrderModal" position="bottom" round :style="{ height: '65%' }">
      <div class="order-modal">
        <div class="order-header">
          <span class="order-title">确认订单</span>
          <van-icon name="cross" size="18" @click="showOrderModal = false" />
        </div>

        <!-- 套餐信息 -->
        <div class="order-plan">
          <div class="order-plan-name">{{ curPlan.name }}</div>
          <div class="order-plan-price">
            {{ curPlan.price }}<span>/月</span>
          </div>
        </div>

        <div class="order-body">
          <!-- 支付方式 -->
          <div class="order-pay">
            <div class="order-section-title">支付方式</div>
            <div
              v-for="(method, index) in payMethods"
              :key="index"
              :class="['pay-option', { selected: selectedPayMethod === index }]"
              @click="selectedPayMethod = index"
            >
              <div class="pay-icon" :style="{ backgroundColor: method.color }">
                <van-icon :name="method.icon" size="20" color="#fff" />
              </div>
              <span class="pay-name">{{ method.name }}</span>
              <div class="radio"></div>
            </div>
          </div>

          <!-- 绑定设备（多选） -->
          <div class="order-devices">
            <div class="order-section-title">
              绑定设备
              <span class="order-section-hint">最多 {{ curMaxDevices }} 台</span>
            </div>
            <div v-if="allDevicesWithStatus.length" class="order-device-list">
              <div
                v-for="d in allDevicesWithStatus"
                :key="d.id"
                :class="['order-device-item', {
                  'is-maxed': !selectedDeviceIds.includes(d.id) && isMaxReached,
                  'is-disabled': d._disabled
                }]"
                @click="toggleDevice(d)"
              >
                <van-checkbox
                  :model-value="selectedDeviceIds.includes(d.id)"
                  :disabled="d._disabled || (!selectedDeviceIds.includes(d.id) && isMaxReached)"
                  checked-color="#4F46E5"
                />
                <div class="device-avatar small">
                  <van-icon name="video-o" size="18" />
                </div>
                <div class="device-info">
                  <span class="device-name">{{ d.name }}</span>
                  <span class="device-id">{{ d.deviceId }}</span>
                </div>
                <div class="device-tail">
                  <span v-if="d._status === 'unsupported'" class="tag-unsupported">不支持</span>
                  <span v-else-if="d._status === 'active'" class="tag-active">已开通</span>
                </div>
              </div>
            </div>
            <div v-else class="no-device">暂无可选设备</div>
          </div>

          <p class="order-hint">后续查看/管理绑定设备请前往【我的】→【我的服务】</p>
        </div>

        <van-button block type="primary" @click="confirmOrder" class="order-btn">
          确认支付 {{ curPlan.price }}/月
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { fetchMyServices, fetchAvailableDevices, buildDeviceServiceMap } from '@/mock/services'
import { useServicesStore } from '@/composables/useServicesStore'

const router = useRouter()
const { state } = useServicesStore()

const serviceTabs = ['云存储', 'AI智能服务', '离线监测', '去广告', '流量充值']
const activeTab = ref(0)
const selectedPlan = ref(0)
const agreed = ref(true)

const payMethods = [
  { name: '微信支付', icon: 'wechat', color: '#07C160' },
  { name: '支付宝', icon: 'alipay', color: '#1677FF' }
]
const selectedPayMethod = ref(0)
const showOrderModal = ref(false)
const showDevicePicker = ref(false)

// 设备选择
const allDevices = ref([])
const selectedDeviceIds = ref([])

const curPlan = computed(() => currentContent.value.plans[selectedPlan.value] || {})
const curCategory = computed(() => currentContent.value.category || '')
const curPlanType = computed(() => curPlan.value.type || 'single')
const curMaxDevices = computed(() => curPlan.value.maxDevices || 1)

const activeCategoryMap = computed(() => buildDeviceServiceMap(state.services))

const eligibleDevices = computed(() => {
  const cat = curCategory.value
  if (!cat) return []
  return allDevices.value.filter((d) => {
    if (!d.supportedCategories?.includes(cat)) return false
    if (activeCategoryMap.value[d.id]?.has(cat)) return false
    return true
  })
})

// 所有设备列表（含不可选标记）
const allDevicesWithStatus = computed(() => {
  const cat = curCategory.value
  if (!cat) return []
  return allDevices.value.map((d) => {
    if (!d.supportedCategories?.includes(cat)) {
      return { ...d, _status: 'unsupported', _disabled: true }
    }
    if (activeCategoryMap.value[d.id]?.has(cat)) {
      return { ...d, _status: 'active', _disabled: true }
    }
    return { ...d, _status: 'available', _disabled: false }
  }).sort((a, b) => {
    const order = { available: 0, active: 1, unsupported: 2 }
    return order[a._status] - order[b._status]
  })
})

const maxSlots = computed(() => {
  if (curPlanType.value === 'single') return 1
  return curMaxDevices.value
})

const isMaxReached = computed(() => selectedDeviceIds.value.length >= maxSlots.value)

const selectedDeviceNames = computed(() => {
  if (!selectedDeviceIds.value.length) return '点击选择'
  const names = selectedDeviceIds.value.map((id) => {
    const d = allDevices.value.find((x) => x.id === id)
    return d ? d.name : id
  })
  return names.join('、')
})

function selectPlan(index) {
  selectedPlan.value = index
  selectedDeviceIds.value = eligibleDevices.value.slice(0, 1).map((d) => d.id)
}

function toggleDevice(device) {
  if (device._disabled) return
  const idx = selectedDeviceIds.value.indexOf(device.id)
  if (idx > -1) {
    selectedDeviceIds.value.splice(idx, 1)
  } else if (selectedDeviceIds.value.length < maxSlots.value) {
    selectedDeviceIds.value.push(device.id)
  }
}

function openOrder() {
  if (!selectedDeviceIds.value.length) {
    selectedDeviceIds.value = eligibleDevices.value.slice(0, 1).map((d) => d.id)
  }
  if (curPlanType.value === 'multi') {
    showOrderModal.value = true
  } else {
    // 单设备直接购买
    showToast('购买成功')
  }
}

function confirmOrder() {
  showOrderModal.value = false
  showToast('购买成功')
}

function goBack() {
  router.back()
}

onMounted(async () => {
  try {
    const [devRes] = await Promise.all([
      fetchAvailableDevices(),
      state.loaded ? Promise.resolve() : fetchMyServices().then((res) => {
        if (res.code === 0) { state.services = res.data; state.loaded = true }
      })
    ])
    if (devRes.code === 0) {
      allDevices.value = devRes.data
      selectedDeviceIds.value = eligibleDevices.value.slice(0, 1).map((d) => d.id)
    }
  } catch { /* ignore */ }
})

// ===== 服务内容配置 =====
const serviceContent = {
  '云存储': {
    bannerTitle: '云存储 vs SD卡',
    bannerSub: '再也不丢失录像。云存储让您的录像安全保存，随时随地访问。',
    category: 'storage',
    plans: [
      { name: 'Basic', price: '¥9.9', unit: '/月', tag: '最划算', tagClass: 'best', discount: '7折', type: 'single', features: ['15天事件录像', '运动人形侦测', '事件告警'] },
      { name: 'Pro', price: '¥19.9', unit: '/月', tag: '热门', tagClass: 'hot', discount: '7折', type: 'multi', maxDevices: 4, features: ['支持4台设备', '30天24h录像', '万物识别AI', '优先告警'] },
      { name: 'Super Pro', price: '¥29.9', unit: '/月', tag: '', tagClass: '', discount: '7折', type: 'single', features: ['30天24h录像', '万物识别AI', 'AI超级搜索'] }
    ]
  },
  'AI智能服务': {
    bannerTitle: '智能AI监控',
    bannerSub: '为您的家庭量身定制的高级AI场景 — 老人看护、儿童安全、宠物监护等。',
    category: 'ai',
    plans: [
      { name: '老人看护', price: '¥12.9', unit: '/月', tag: '推荐', tagClass: 'best', discount: '8折', type: 'single', features: ['跌倒检测告警', '久坐监测', '紧急通知'] },
      { name: '儿童看护', price: '¥12.9', unit: '/月', tag: '热门', tagClass: 'hot', discount: '8折', type: 'single', features: ['区域边界告警', '陌生人检测', '安全报告'] },
      { name: '宠物监护', price: '¥9.9', unit: '/月', tag: '', tagClass: '', discount: '8折', type: 'single', features: ['活动追踪', '异常行为告警', '每日活动摘要'] }
    ]
  },
  '离线监测': {
    bannerTitle: '时刻掌握设备状态',
    bannerSub: '设备离线即时告警，再也不错过任何设备掉线。',
    category: 'offline',
    plans: [
      { name: '基础告警', price: '¥3.9', unit: '/月', tag: '最划算', tagClass: 'best', discount: '', type: 'single', features: ['离线推送通知', '实时设备状态', '邮件告警'] },
      { name: '高级告警', price: '¥6.9', unit: '/月', tag: '热门', tagClass: 'hot', discount: '', type: 'single', features: ['即时离线告警', '短信+推送+邮件', '重连通知', '30天告警历史'] }
    ]
  },
  '去广告': {
    bannerTitle: '纯净无广告体验',
    bannerSub: '移除应用内所有商业广告，享受纯净专注的监控体验。',
    plans: [
      { name: '月度', price: '¥3.9', unit: '/月', tag: '', tagClass: '', discount: '', type: 'single', features: ['无横幅广告', '无视频广告', '无弹窗推广'] },
      { name: '年度', price: '¥19.9', unit: '/年', tag: '最划算', tagClass: 'best', discount: '6折', type: 'single', features: ['无横幅广告', '无视频广告', '无弹窗推广', '比月度省40%'] }
    ]
  },
  '流量充值': {
    bannerTitle: '保持摄像头在线',
    bannerSub: '为您的4G摄像头充值流量，随时随地保持在线。',
    plans: [
      { name: '1GB', price: '¥9.9', unit: '/月', tag: '', tagClass: '', discount: '', type: 'single', features: ['每月1GB流量', '支持自动续费', '支持4G/LTE摄像头'] },
      { name: '5GB', price: '¥29.9', unit: '/月', tag: '热门', tagClass: 'hot', discount: '9折', type: 'single', features: ['每月5GB流量', '高清视频流', '支持自动续费'] },
      { name: '20GB', price: '¥99.9', unit: '/月', tag: '最划算', tagClass: 'best', discount: '8折', type: 'single', features: ['每月20GB流量', '无限高清流', '优先网络接入'] }
    ]
  }
}

const currentContent = computed(() => {
  return serviceContent[serviceTabs[activeTab.value]] || serviceContent['云存储']
})

const currentPlanDetail = computed(() => {
  const plan = currentContent.value.plans[selectedPlan.value]
  return {
    title: plan?.name + '套餐',
    items: [
      { icon: 'cloud-o', text: '云存储安全保存您的录像，随时随地访问。' },
      { icon: 'eye-o', text: 'AI智能检测，即时推送通知到您的手机。' },
      { icon: 'bell', text: '实时事件告警，附带缩略图预览。' },
      { icon: 'tv-o', text: '任何设备访问录像 — 手机、平板、浏览器。' }
    ]
  }
})
</script>

<style lang="scss" scoped>
.store-page {
  height: 100%;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

.store-header {
  background-color: $bg-color;
  padding: 12px 16px;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; }
}

.back-btn {
  width: 32px; height: 32px; border-radius: 50%;
  background-color: $bg-page;
  display: flex; align-items: center; justify-content: center;
  color: $text-primary;
}

.service-tabs {
  background-color: $bg-color;
  padding: 0 16px;
  display: flex; gap: 0; overflow-x: auto;
  border-bottom: 2px solid $border-color;
  flex-shrink: 0;
  &::-webkit-scrollbar { display: none; }
}

.svc-tab {
  padding: 12px 14px; font-size: 13px; font-weight: 500;
  color: $text-secondary; white-space: nowrap;
  border-bottom: 2px solid transparent; margin-bottom: -2px; transition: $transition;
  &.active { color: $primary-color; border-bottom-color: $primary-color; font-weight: 600; }
}

.store-body { flex: 1; overflow-y: auto; }

// 顶部设备选择栏
.device-bar {
  display: flex; align-items: center; gap: 10px;
  margin: 12px 16px 0; padding: 12px 14px;
  background: $bg-card; border-radius: $radius-md;
  box-shadow: $shadow-card;
  .dev-info { flex: 1; display: flex; align-items: center; gap: 8px; }
  .dev-label { font-size: 12px; color: $text-secondary; flex-shrink: 0; }
  .dev-val { font-size: 13px; font-weight: 500; color: $text-primary; }
}

.cloud-banner {
  margin: 12px 16px 0;
  background: linear-gradient(135deg, #0F2A5E, #1A73E8);
  border-radius: $radius-lg; padding: 16px;
  display: flex; align-items: center; gap: 12px;
  .banner-text { flex: 1; }
  .title { font-size: 14px; font-weight: 700; color: #fff; }
  .sub { font-size: 11px; color: rgba(255,255,255,0.75); margin-top: 4px; line-height: 1.5; }
  .banner-icon {
    width: 56px; height: 56px; flex-shrink: 0;
    background-color: rgba(255,255,255,0.15); border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
  }
}

.plan-scroll {
  padding: 16px 16px 0; display: flex; gap: 10px; overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
}

.plan-card {
  min-width: 130px; background-color: $bg-card; border-radius: $radius-lg;
  padding: 14px 12px; border: 2px solid $border-color; transition: $transition;
  position: relative; flex-shrink: 0;
  &.selected { border-color: $primary-color; background-color: $primary-bg; }
  .op-tag {
    position: absolute; top: -1px; left: 12px;
    padding: 2px 8px; border-radius: 0 0 8px 8px; font-size: 10px; font-weight: 700;
    &.best { background-color: $success-color; color: #fff; }
    &.hot { background-color: $danger-color; color: #fff; }
  }
  .discount {
    display: inline-block; padding: 2px 6px; border-radius: 6px;
    background-color: #FEF3C7; color: #D97706; font-size: 10px; font-weight: 700; margin-bottom: 6px;
  }
  .plan-name { font-size: 14px; font-weight: 700; color: $text-primary; }
  .plan-price { font-size: 18px; font-weight: 800; color: $primary-color; margin-top: 6px;
    span { font-size: 11px; font-weight: 500; color: $text-secondary; }
  }
  .plan-features { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
  .feat { font-size: 11px; color: $text-secondary;
    &::before { content: '✓'; color: $success-color; font-weight: 700; margin-right: 4px; }
  }
}

.plan-detail {
  margin: 16px; background-color: $bg-card; border-radius: $radius-lg;
  padding: 16px; box-shadow: $shadow-card;
  h4 { font-size: 15px; font-weight: 700; color: $text-primary; margin-bottom: 12px; }
}

.detail-row {
  display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;
  p { font-size: 13px; color: $text-secondary; line-height: 1.5; }
}

.store-bottom {
  background-color: $bg-color; border-top: 1px solid $border-color;
  padding: 12px 16px 16px; flex-shrink: 0;
}

.agree-row { margin-bottom: 12px; .link { color: $primary-color; } }
.buy-btn { font-weight: 700; }

// 支付方式（主页面）
.pay-section {
  margin: 0 16px 12px;
}

.section-label {
  font-size: 13px; font-weight: 600; color: $text-primary;
  margin-bottom: 8px;
}

.pay-option {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 12px; border: 2px solid $border-color; border-radius: $radius-md;
  margin-bottom: 10px; transition: border-color 0.2s;
  background: $bg-card;
  &.selected { border-color: $primary-color; }
  .pay-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }
  .pay-name { flex: 1; font-size: 14px; font-weight: 600; color: $text-primary; }
  .radio {
    width: 18px; height: 18px; border-radius: 50%; border: 2px solid $border-color;
    display: flex; align-items: center; justify-content: center;
  }
  &.selected .radio {
    border-color: $primary-color; background-color: $primary-color;
    &::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background-color: #fff; }
  }
}

// 确认订单弹窗
.order-modal {
  padding: 20px 16px 16px;
  display: flex; flex-direction: column; height: 100%;
}

.order-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; flex-shrink: 0;
}

.order-title { font-size: 18px; font-weight: 700; color: $text-primary; }

.order-plan {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 12px 14px; background: $bg-page; border-radius: $radius-md;
  margin-bottom: 16px; flex-shrink: 0;
  .order-plan-name { font-size: 14px; font-weight: 600; color: $text-primary; }
  .order-plan-price { font-size: 18px; font-weight: 700; color: $primary-color;
    span { font-size: 11px; font-weight: 500; color: $text-secondary; }
  }
}

.order-body { flex: 1; overflow-y: auto; }

.order-devices { margin-bottom: 16px; }

.order-section-title {
  font-size: 13px; font-weight: 600; color: $text-primary; margin-bottom: 8px;
  display: flex; align-items: center; gap: 8px;
}

.order-section-hint { font-size: 11px; color: $text-secondary; font-weight: 400; }

.order-device-list {
  display: flex; flex-direction: column; gap: 6px;
}

.order-device-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: $bg-page; border-radius: $radius-md;
  &:active { background-color: #EEF2FF; }
  &.is-maxed { opacity: 0.45; }
}

.order-pay { margin-bottom: 12px; }

.order-hint {
  text-align: center; font-size: 11px; color: $text-secondary;
  margin: 8px 0 12px; flex-shrink: 0;
}

.order-btn { flex-shrink: 0; }

.no-device { text-align: center; padding: 16px 0; color: $text-secondary; font-size: 13px; }

// 设备选择弹窗
.picker-wrap {
  padding: 20px 16px;
  display: flex; flex-direction: column; height: 100%;
}

.picker-hint {
  font-size: 12px; color: $text-secondary;
  margin-bottom: 12px; flex-shrink: 0;
}

.popup-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; flex-shrink: 0;
}

.popup-title { font-size: 18px; font-weight: 700; color: $text-primary; }

.popup-done {
  font-size: 15px; font-weight: 600; color: $primary-color;
  &:active { opacity: 0.7; }
}

.popup-list {
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column; gap: 8px;
}

.popup-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; background: $bg-page; border-radius: $radius-md;
  &:active { background-color: #EEF2FF; }
  &.is-maxed { opacity: 0.45; }
}

.popup-empty {
  text-align: center; padding: 40px 0;
  color: $text-secondary; font-size: 14px;
}

// 共用
.device-avatar {
  width: 40px; height: 40px; border-radius: 10px; background: #EEF2FF;
  display: flex; align-items: center; justify-content: center;
  color: #4F46E5; flex-shrink: 0;
  &.small { width: 32px; height: 32px; border-radius: 8px; }
}

.device-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }

.device-name { font-size: 14px; font-weight: 500; color: $text-primary; }

.device-id { font-size: 11px; color: $text-secondary; font-family: 'SF Mono','Menlo',monospace; }

.tag-unsupported {
  font-size: 10px; color: $text-secondary; padding: 1px 6px;
  border-radius: 8px; background: $bg-page; font-weight: 500;
}

.tag-active {
  font-size: 10px; color: #7C3AED; padding: 1px 6px;
  border-radius: 8px; background: #EDE9FE; font-weight: 500;
}

.is-disabled { opacity: 0.5; }

.device-tail {
  flex-shrink: 0;
  display: flex; align-items: center; gap: 4px;
}

</style>
