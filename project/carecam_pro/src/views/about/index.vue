<template>
  <div class="about-page">
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>关于</h2>
      <div style="width:24px" />
    </div>

    <div class="about-content">
      <!-- App 信息 -->
      <div class="app-info">
        <div class="app-logo">
          <van-icon name="video-o" size="36" color="rgba(255,255,255,0.5)" />
        </div>
        <div class="app-name">CareCam Pro</div>
        <div class="app-version">当前版本 v{{ APP_VERSION }}</div>
      </div>

      <!-- 功能菜单 -->
      <div class="menu-section">
        <div class="menu-item" @click="checkUpdate">
          <div class="menu-icon" style="background-color: #F0FDF4;">
            <van-icon v-if="!isChecking" name="upgrade" size="18" color="#16A34A" />
            <van-loading v-else size="18" color="#16A34A" />
          </div>
          <span class="menu-label">版本更新</span>
          <van-icon name="arrow" class="menu-arrow" />
        </div>
        <div class="menu-item" @click="openLink('https://example.com/terms')">
          <div class="menu-icon" style="background-color: #FFF7ED;">
            <van-icon name="description-o" size="18" color="#EA580C" />
          </div>
          <span class="menu-label">用户协议</span>
          <van-icon name="arrow" class="menu-arrow" />
        </div>
        <div class="menu-item" @click="openLink('https://example.com/privacy')">
          <div class="menu-icon" style="background-color: #F0F9FF;">
            <van-icon name="shield-o" size="18" color="#0284C7" />
          </div>
          <span class="menu-label">隐私政策</span>
          <van-icon name="arrow" class="menu-arrow" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useVersionCheck } from '@/composables/useVersionCheck'

const router = useRouter()
const { APP_VERSION, isChecking, checkManual } = useVersionCheck()

function goBack() {
  router.back()
}

function checkUpdate() {
  checkManual()
}

function openLink(url) {
  window.open(url, '_blank')
}
</script>

<style lang="scss" scoped>
.about-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0D1117;
  user-select: none;
  -webkit-user-select: none;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  color: #fff;
  h2 {
    font-size: 17px;
    font-weight: 600;
    margin: 0;
  }
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
}

.about-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 24px;
}

.app-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0 32px;
}

.app-logo {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1A73E8, #4FC3F7);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.app-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
}

.app-version {
  font-size: 13px;
  color: #888;
}

.menu-section {
  padding: 0 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  &:last-child { border-bottom: none; }
  &:active { opacity: 0.7; }
}

.menu-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.menu-label {
  flex: 1;
  font-size: 14px;
  color: #E6E8EA;
}

.menu-arrow {
  color: #555;
  flex-shrink: 0;
}
</style>
