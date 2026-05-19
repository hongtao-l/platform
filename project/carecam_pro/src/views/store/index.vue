<template>
  <div class="store-page">
    <!-- 顶部栏 -->
    <div class="store-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>服务商城</h2>
    </div>
    
    <!-- 服务分类Tab -->
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
    
    <!-- 内容区 -->
    <div class="store-body">
      <!-- Banner -->
      <div class="cloud-banner">
        <div class="banner-text">
          <div class="title">{{ currentContent.bannerTitle }}</div>
          <div class="sub">{{ currentContent.bannerSub }}</div>
        </div>
        <div class="banner-icon">
          <van-icon name="cloud-o" size="28" color="#fff" />
        </div>
      </div>
      
      <!-- 套餐卡片 -->
      <div class="plan-scroll">
        <div 
          v-for="(plan, index) in currentContent.plans" 
          :key="index"
          :class="['plan-card', { selected: selectedPlan === index }]"
          @click="selectedPlan = index"
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
      
      <!-- 套餐详情 -->
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
      <div class="device-selector">
        <van-icon name="video" size="16" color="#6B7280" />
        <div class="dev-info">
          <div class="dev-name">Front Door</div>
          <div class="dev-plan">暂无生效套餐</div>
        </div>
        <van-icon name="arrow" size="16" color="#6B7280" />
      </div>
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
        @click="showPayModal = true"
      >
        立即购买 — {{ currentContent.plans[selectedPlan]?.price }}/月
      </van-button>
    </div>
    
    <!-- 支付弹窗 -->
    <van-popup 
      v-model:show="showPayModal" 
      position="bottom" 
      round
    >
      <div class="pay-modal">
        <h4>完成购买</h4>
        <div class="pay-amount">
          {{ currentContent.plans[selectedPlan]?.price }}
          <span>/月</span>
        </div>
        
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
        
        <van-button block type="primary" @click="confirmPay">
          确认支付
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 服务分类
const serviceTabs = ['云存储', 'AI智能服务', '离线监测', '去广告', '流量充值']
const activeTab = ref(0)

// 当前选中的套餐
const selectedPlan = ref(0)

// 支付方式
const payMethods = [
  { name: '微信支付', icon: 'wechat', color: '#07C160' },
  { name: '支付宝', icon: 'alipay', color: '#1677FF' }
]
const selectedPayMethod = ref(0)
const showPayModal = ref(false)
const agreed = ref(true)

// 服务内容配置
const serviceContent = {
  '云存储': {
    bannerTitle: '云存储 vs SD卡',
    bannerSub: '再也不丢失录像。云存储让您的录像安全保存，随时随地访问。',
    plans: [
      {
        name: 'Basic',
        price: '¥9.9',
        unit: '/月',
        tag: '最划算',
        tagClass: 'best',
        discount: '7折',
        features: ['15天事件录像', '运动人形侦测', '事件告警']
      },
      {
        name: 'Pro',
        price: '¥19.9',
        unit: '/月',
        tag: '热门',
        tagClass: 'hot',
        discount: '7折',
        features: ['30天24h录像', '万物识别AI', '优先告警']
      },
      {
        name: 'Super Pro',
        price: '¥29.9',
        unit: '/月',
        tag: '',
        tagClass: '',
        discount: '7折',
        features: ['30天24h录像', '万物识别AI', 'AI超级搜索']
      }
    ]
  },
  'AI智能服务': {
    bannerTitle: '智能AI监控',
    bannerSub: '为您的家庭量身定制的高级AI场景 — 老人看护、儿童安全、宠物监护等。',
    plans: [
      {
        name: '老人看护',
        price: '¥12.9',
        unit: '/月',
        tag: '推荐',
        tagClass: 'best',
        discount: '8折',
        features: ['跌倒检测告警', '久坐监测', '紧急通知']
      },
      {
        name: '儿童看护',
        price: '¥12.9',
        unit: '/月',
        tag: '热门',
        tagClass: 'hot',
        discount: '8折',
        features: ['区域边界告警', '陌生人检测', '安全报告']
      },
      {
        name: '宠物监护',
        price: '¥9.9',
        unit: '/月',
        tag: '',
        tagClass: '',
        discount: '8折',
        features: ['活动追踪', '异常行为告警', '每日活动摘要']
      }
    ]
  },
  '离线监测': {
    bannerTitle: '时刻掌握设备状态',
    bannerSub: '设备离线即时告警，再也不错过任何设备掉线。',
    plans: [
      {
        name: '基础告警',
        price: '¥3.9',
        unit: '/月',
        tag: '最划算',
        tagClass: 'best',
        discount: '',
        features: ['离线推送通知', '实时设备状态', '邮件告警']
      },
      {
        name: '高级告警',
        price: '¥6.9',
        unit: '/月',
        tag: '热门',
        tagClass: 'hot',
        discount: '',
        features: ['即时离线告警', '短信+推送+邮件', '重连通知', '30天告警历史']
      }
    ]
  },
  '去广告': {
    bannerTitle: '纯净无广告体验',
    bannerSub: '移除应用内所有商业广告，享受纯净专注的监控体验。',
    plans: [
      {
        name: '月度',
        price: '¥3.9',
        unit: '/月',
        tag: '',
        tagClass: '',
        discount: '',
        features: ['无横幅广告', '无视频广告', '无弹窗推广']
      },
      {
        name: '年度',
        price: '¥19.9',
        unit: '/年',
        tag: '最划算',
        tagClass: 'best',
        discount: '6折',
        features: ['无横幅广告', '无视频广告', '无弹窗推广', '比月度省40%']
      }
    ]
  },
  '流量充值': {
    bannerTitle: '保持摄像头在线',
    bannerSub: '为您的4G摄像头充值流量，随时随地保持在线。',
    plans: [
      {
        name: '1GB',
        price: '¥9.9',
        unit: '/月',
        tag: '',
        tagClass: '',
        discount: '',
        features: ['每月1GB流量', '支持自动续费', '支持4G/LTE摄像头']
      },
      {
        name: '5GB',
        price: '¥29.9',
        unit: '/月',
        tag: '热门',
        tagClass: 'hot',
        discount: '9折',
        features: ['每月5GB流量', '高清视频流', '支持自动续费']
      },
      {
        name: '20GB',
        price: '¥99.9',
        unit: '/月',
        tag: '最划算',
        tagClass: 'best',
        discount: '8折',
        features: ['每月20GB流量', '无限高清流', '优先网络接入']
      }
    ]
  }
}

// 当前服务内容
const currentContent = computed(() => {
  const tabName = serviceTabs[activeTab.value]
  return serviceContent[tabName] || serviceContent['云存储']
})

// 当前套餐详情
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

// 返回
const goBack = () => {
  router.back()
}

// 确认支付
const confirmPay = () => {
  showPayModal.value = false
  // 处理支付逻辑
}
</script>

<style lang="scss" scoped>
.store-page {
  min-height: 100%;
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
  
  h2 {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
    flex: 1;
  }
}

.back-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-primary;
}

.service-tabs {
  background-color: $bg-color;
  padding: 0 16px;
  display: flex;
  gap: 0;
  overflow-x: auto;
  border-bottom: 2px solid $border-color;
  flex-shrink: 0;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.svc-tab {
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 500;
  color: $text-secondary;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: $transition;
  
  &.active {
    color: $primary-color;
    border-bottom-color: $primary-color;
    font-weight: 600;
  }
}

.store-body {
  flex: 1;
  overflow-y: auto;
}

.cloud-banner {
  margin: 16px 16px 0;
  background: linear-gradient(135deg, #0F2A5E, #1A73E8);
  border-radius: $radius-lg;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  .banner-text {
    flex: 1;
    
    .title {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
    }
    
    .sub {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.75);
      margin-top: 4px;
      line-height: 1.5;
    }
  }
  
  .banner-icon {
    width: 56px;
    height: 56px;
    flex-shrink: 0;
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.plan-scroll {
  padding: 16px 16px 0;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.plan-card {
  min-width: 130px;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 14px 12px;
  border: 2px solid $border-color;
  transition: $transition;
  position: relative;
  flex-shrink: 0;
  
  &.selected {
    border-color: $primary-color;
    background-color: $primary-bg;
  }
  
  .op-tag {
    position: absolute;
    top: -1px;
    left: 12px;
    padding: 2px 8px;
    border-radius: 0 0 8px 8px;
    font-size: 10px;
    font-weight: 700;
    
    &.best {
      background-color: $success-color;
      color: #fff;
    }
    
    &.hot {
      background-color: $danger-color;
      color: #fff;
    }
  }
  
  .discount {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 6px;
    background-color: #FEF3C7;
    color: #D97706;
    font-size: 10px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  
  .plan-name {
    font-size: 14px;
    font-weight: 700;
    color: $text-primary;
  }
  
  .plan-price {
    font-size: 18px;
    font-weight: 800;
    color: $primary-color;
    margin-top: 6px;
    
    span {
      font-size: 11px;
      font-weight: 500;
      color: $text-secondary;
    }
  }
  
  .plan-features {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .feat {
    font-size: 11px;
    color: $text-secondary;
    
    &::before {
      content: '✓';
      color: $success-color;
      font-weight: 700;
      margin-right: 4px;
    }
  }
}

.plan-detail {
  margin: 16px;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 16px;
  box-shadow: $shadow-card;
  
  h4 {
    font-size: 15px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 12px;
  }
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  
  p {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.5;
  }
}

.store-bottom {
  background-color: $bg-color;
  border-top: 1px solid $border-color;
  padding: 12px 16px 16px;
  flex-shrink: 0;
}

.device-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background-color: $bg-page;
  border-radius: $radius-md;
  
  .dev-info {
    flex: 1;
  }
  
  .dev-name {
    font-size: 13px;
    font-weight: 600;
    color: $text-primary;
  }
  
  .dev-plan {
    font-size: 11px;
    color: $success-color;
  }
}

.agree-row {
  margin-bottom: 12px;
  
  .link {
    color: $primary-color;
  }
}

.buy-btn {
  font-weight: 700;
}

.pay-modal {
  padding: 20px 16px 32px;
  
  h4 {
    font-size: 16px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 4px;
  }
  
  .pay-amount {
    font-size: 28px;
    font-weight: 800;
    color: $primary-color;
    margin-bottom: 16px;
    
    span {
      font-size: 14px;
      color: $text-secondary;
      font-weight: 500;
    }
  }
}

.pay-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  border: 2px solid $border-color;
  border-radius: $radius-md;
  margin-bottom: 10px;
  transition: border-color 0.2s;
  
  &.selected {
    border-color: $primary-color;
  }
  
  .pay-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .pay-name {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
  }
  
  .radio {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid $border-color;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &.selected .radio {
    border-color: $primary-color;
    background-color: $primary-color;
    
    &::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #fff;
    }
  }
}
</style>
