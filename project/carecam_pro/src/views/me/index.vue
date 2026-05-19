<template>
  <div class="me-page">
    <!-- 用户信息区 -->
    <div class="profile-hero">
      <div class="profile-avatar">{{ userInitial }}</div>
      <div class="info">
        <div class="name">{{ userName }}</div>
        <div class="account">{{ userEmail }}</div>
      </div>
      <div class="edit-btn" @click="editProfile">编辑</div>
    </div>
    
    <!-- 功能菜单 -->
    <div class="menu-section">
      <div class="menu-group">
        <div class="menu-item" @click="goToStore">
          <div class="menu-icon" style="background-color: #EEF2FF;">
            <van-icon name="shop-o" size="18" color="#4F46E5" />
          </div>
          <span class="menu-label">服务商城</span>
          <van-icon name="arrow" class="menu-arrow" />
        </div>
        <div class="menu-item">
          <div class="menu-icon" style="background-color: #FFF7ED;">
            <van-icon name="orders-o" size="18" color="#EA580C" />
          </div>
          <span class="menu-label">我的订单</span>
          <van-icon name="arrow" class="menu-arrow" />
        </div>
        <div class="menu-item">
          <div class="menu-icon" style="background-color: #FFF0F0;">
            <van-icon name="coupon-o" size="18" color="#DC2626" />
          </div>
          <span class="menu-label">我的券包</span>
          <van-icon name="arrow" class="menu-arrow" />
        </div>
      </div>
    </div>
    
    <div class="menu-section">
      <div class="menu-group">
        <div class="menu-item">
          <div class="menu-icon" style="background-color: #F0FDF4;">
            <van-icon name="question-o" size="18" color="#16A34A" />
          </div>
          <span class="menu-label">帮助与反馈</span>
          <van-icon name="arrow" class="menu-arrow" />
        </div>
        <div class="menu-item">
          <div class="menu-icon" style="background-color: #F0F9FF;">
            <van-icon name="service-o" size="18" color="#0284C7" />
          </div>
          <span class="menu-label">客服中心</span>
          <van-icon name="arrow" class="menu-arrow" />
        </div>
        <div class="menu-item">
          <div class="menu-icon" style="background-color: #F5F3FF;">
            <van-icon name="info-o" size="18" color="#7C3AED" />
          </div>
          <span class="menu-label">关于</span>
          <van-icon name="arrow" class="menu-arrow" />
        </div>
      </div>
    </div>
    
    <!-- 退出登录 -->
    <div class="logout-btn" @click="showLogoutConfirm = true">退出登录</div>
    
    <!-- 退出确认弹窗 -->
    <van-dialog 
      v-model:show="showLogoutConfirm" 
      title="确认退出" 
      message="确定要退出登录吗？"
      show-cancel-button
      @confirm="logout"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 用户信息
const userInitial = ref('J')
const userName = ref('John Smith')
const userEmail = ref('john@example.com')

// 退出确认
const showLogoutConfirm = ref(false)

// 编辑资料
const editProfile = () => {
  // 跳转编辑页
}

// 跳转服务商城
const goToStore = () => {
  router.push('/store')
}

// 退出登录
const logout = () => {
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.me-page {
  min-height: 100%;
  background-color: $bg-page;
}

.profile-hero {
  background: linear-gradient(135deg, #1A73E8, #4A90E2);
  padding: 24px 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.info {
  flex: 1;
  
  .name {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
  }
  
  .account {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 3px;
  }
}

.edit-btn {
  padding: 6px 14px;
  border-radius: $radius-pill;
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.menu-section {
  padding: 12px 16px 0;
}

.menu-group {
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-card;
  margin-bottom: 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 13px 16px;
  border-bottom: 1px solid $border-color;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background-color: $bg-page;
  }
}

.menu-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.menu-label {
  flex: 1;
  font-size: 14px;
  color: $text-primary;
  font-weight: 500;
}

.menu-arrow {
  color: $text-secondary;
}

.logout-btn {
  margin: 4px 16px 20px;
  padding: 14px;
  background-color: $bg-card;
  border-radius: $radius-lg;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: $danger-color;
  box-shadow: $shadow-card;
}
</style>
