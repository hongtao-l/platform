<template>
  <div class="work-mode-page">
    <!-- 顶部栏 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>工作模式</h2>
    </div>
    
    <!-- 模式列表 -->
    <div class="mode-list">
      <div 
        class="mode-item" 
        v-for="(item, index) in modeList" 
        :key="index"
        :class="{ active: selectedMode === item.value, disabled: !item.enabled }"
        @click="selectMode(item)"
      >
        <div class="mode-left">
          <div class="mode-icon" :style="{ backgroundColor: item.bgColor }">
            <van-icon :name="item.icon" size="20" :color="item.iconColor" />
          </div>
          <div class="mode-info">
            <div class="mode-title">{{ item.label }}</div>
            <div class="mode-desc">{{ item.desc }}</div>
          </div>
        </div>
        <van-icon v-if="selectedMode === item.value" name="success" class="mode-check" color="#1A73E8" />
      </div>
    </div>
    
    <!-- AOV模式配置 -->
    <div class="config-section" v-if="selectedMode === '1'">
      <div class="section-title">AOV模式配置</div>
      <div class="config-card">
        <div class="config-item">
          <div class="config-label">低功耗模式电量阈值</div>
          <div class="config-control">
            <van-slider v-model="aovConfig.powerThreshold" :min="0" :max="100" active-color="#1A73E8" />
            <span class="config-value">{{ aovConfig.powerThreshold }}%</span>
          </div>
        </div>
        <div class="config-item">
          <div class="config-label">拍照帧率</div>
          <div class="config-control">
            <van-dropdown-menu>
              <van-dropdown-item v-model="aovConfig.frameRate" :options="frameRateOptions" />
            </van-dropdown-menu>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 长电模式配置 -->
    <div class="config-section" v-if="selectedMode === '2'">
      <div class="section-title">长电模式配置</div>
      <div class="config-card">
        <div class="config-item">
          <div class="config-label">低功耗模式电量阈值</div>
          <div class="config-control">
            <van-slider v-model="longPowerConfig.powerThreshold" :min="0" :max="100" active-color="#1A73E8" />
            <span class="config-value">{{ longPowerConfig.powerThreshold }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 保存按钮 -->
    <div class="save-section">
      <van-button type="primary" block @click="saveConfig">保存</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

// 当前选中的模式
const selectedMode = ref('1')

// AOV模式配置
const aovConfig = reactive({
  powerThreshold: 30,
  frameRate: 1
})

// 长电模式配置
const longPowerConfig = reactive({
  powerThreshold: 20
})

// 拍照帧率选项
const frameRateOptions = Array.from({ length: 10 }, (_, i) => ({
  text: `${i + 1}秒/帧`,
  value: i + 1
}))

// 模式列表
const modeList = ref([
  {
    value: '0',
    label: '低功耗模式',
    desc: '最省电，适合长期外出',
    icon: 'pause-circle-o',
    iconColor: '#607D8B',
    bgColor: '#ECEFF1',
    enabled: true
  },
  {
    value: '1',
    label: 'AOV模式',
    desc: '智能省电，平衡功耗与监控',
    icon: 'flash',
    iconColor: '#4CAF50',
    bgColor: '#E8F5E9',
    enabled: true
  },
  {
    value: '2',
    label: '长电模式',
    desc: '持续供电，全天候监控',
    icon: 'plug',
    iconColor: '#2196F3',
    bgColor: '#E3F2FD',
    enabled: true
  },
  {
    value: '3',
    label: '自定义模式',
    desc: '高级设置，自定义参数',
    icon: 'setting-o',
    iconColor: '#9C27B0',
    bgColor: '#F3E5F5',
    enabled: true
  }
])

// 返回
const goBack = () => {
  router.back()
}

// 选择模式
const selectMode = (item) => {
  if (!item.enabled) return
  selectedMode.value = item.value
}

// 保存配置
const saveConfig = () => {
  showToast('保存成功')
  router.back()
}
</script>

<style lang="scss" scoped>
.work-mode-page {
  min-height: 100%;
  background-color: $bg-page;
}

.page-header {
  background-color: $bg-color;
  padding: 12px 16px;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  gap: 12px;
  
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

.mode-list {
  background-color: $bg-color;
  margin: 12px 16px;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-card;
}

.mode-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid $border-color;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active:not(.disabled) {
    background-color: $bg-page;
  }
  
  &.active {
    background-color: rgba(26, 115, 232, 0.05);
  }
  
  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.mode-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.mode-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mode-info {
  flex: 1;
}

.mode-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
}

.mode-desc {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}

.mode-check {
  flex-shrink: 0;
}

.config-section {
  margin: 0 16px 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 8px;
  padding-left: 4px;
}

.config-card {
  background-color: $bg-color;
  border-radius: $radius-lg;
  padding: 16px;
  box-shadow: $shadow-card;
}

.config-item {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.config-label {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: 12px;
}

.config-control {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .van-slider {
    flex: 1;
  }
}

.config-value {
  font-size: 14px;
  font-weight: 600;
  color: $primary-color;
  min-width: 40px;
  text-align: right;
}

.save-section {
  padding: 16px;
}
</style>
