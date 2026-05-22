<template>
  <!-- 触发入口：右下角小齿轮 -->
  <div class="demo-trigger" @click="show = true">
    <van-icon name="setting-o" size="18" color="#fff" />
  </div>

  <!-- 演示控制面板 -->
  <van-popup v-model:show="show" position="bottom" round :style="{ height: '52%' }" :close-on-click-overlay="true">
    <div class="demo-panel">
      <div class="demo-header">
        <h3>活动位演示控制</h3>
        <span class="demo-hint">手动触发/隐藏各类活动位</span>
      </div>

      <div class="demo-body">
        <!-- Banner -->
        <div class="demo-card">
          <div class="demo-card-head">
            <span>🏞️ 首页Banner轮播</span>
            <van-tag :type="store.bannerCount > 0 ? 'success' : 'default'" size="small">
              {{ store.bannerCount > 0 ? store.bannerCount + '条' : '无' }}
            </van-tag>
          </div>
          <div class="demo-card-actions">
            <van-button size="small" type="primary" plain @click="store.addDemo('slot_banner')">添加演示Banner</van-button>
            <van-button size="small" type="danger" plain :disabled="store.bannerCount === 0" @click="store.removeDemo('slot_banner')">移除</van-button>
          </div>
        </div>

        <!-- Popup -->
        <div class="demo-card">
          <div class="demo-card-head">
            <span>📢 启动弹窗</span>
            <van-tag :type="store.popupCount > 0 ? 'success' : 'default'" size="small">
              {{ store.popupCount > 0 ? store.popupCount + '条' : '无' }}
            </van-tag>
          </div>
          <div class="demo-card-actions">
            <van-button size="small" type="primary" plain @click="triggerPopup">触发弹窗预览</van-button>
            <van-button size="small" type="warning" plain @click="store.addDemo('slot_popup')">添加演示弹窗</van-button>
          </div>
        </div>

        <!-- FAB -->
        <div class="demo-card">
          <div class="demo-card-head">
            <span>🔘 悬浮按钮</span>
            <van-tag :type="store.fabCount > 0 ? 'success' : 'default'" size="small">
              {{ store.fabCount > 0 ? '显示中' : '无' }}
            </van-tag>
          </div>
          <div class="demo-card-actions">
            <van-button size="small" type="primary" plain @click="store.addDemo('slot_floating')">添加演示悬浮</van-button>
            <van-button size="small" type="danger" plain :disabled="store.fabCount === 0" @click="store.removeDemo('slot_floating')">移除</van-button>
          </div>
        </div>

        <!-- 重置 -->
        <div class="demo-card reset-card">
          <van-button block round type="danger" @click="onReset">重置全部（恢复默认Mock数据）</van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref } from 'vue'
import { useActivityStore } from '@/store/activity'

const store = useActivityStore()
const show = ref(false)

// 触发弹窗预览
function triggerPopup() {
  store.addDemo('slot_popup')
  show.value = false
  setTimeout(() => {
    store.triggerPopupNow()
  }, 400)
}

function onReset() {
  store.resetAll()
  store.initMockData()
  show.value = false
}
</script>

<style lang="scss" scoped>
.demo-trigger {
  position: fixed;
  bottom: 140px;
  left: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(26, 115, 232, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
  box-shadow: 0 2px 12px rgba(26, 115, 232, 0.3);
  cursor: pointer;

  &:active {
    transform: scale(0.9);
  }
}

.demo-panel {
  padding: 20px 16px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.demo-header {
  text-align: center;
  margin-bottom: 20px;

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1A1A2E;
  }

  .demo-hint {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
    display: block;
  }
}

.demo-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-card {
  background: #F5F7FA;
  border-radius: 12px;
  padding: 14px;
}

.demo-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  span {
    font-size: 15px;
    font-weight: 600;
    color: #1A1A2E;
  }
}

.demo-card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.reset-card {
  background: #FFF5F5;
  margin-top: 8px;
  padding: 12px;
}
</style>
