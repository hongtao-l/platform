<template>
  <div class="login-page">
    <!-- Logo -->
    <div class="logo-section">
      <van-image
        width="80"
        height="80"
        src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
      />
      <div class="app-name">CareCam Pro</div>
      <div class="app-slogan">智能监控，守护安全</div>
    </div>
    
    <!-- 登录表单 -->
    <div class="login-form">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.phone"
            name="phone"
            placeholder="请输入手机号"
            type="tel"
            :rules="[{ required: true, message: '请输入手机号' }]"
          >
            <template #left-icon>
              <van-icon name="phone-o" />
            </template>
          </van-field>
          <van-field
            v-model="form.password"
            name="password"
            placeholder="请输入密码"
            type="password"
            :rules="[{ required: true, message: '请输入密码' }]"
          >
            <template #left-icon>
              <van-icon name="lock" />
            </template>
          </van-field>
        </van-cell-group>
        
        <div class="form-actions">
          <van-button block type="primary" native-type="submit" :loading="loading">
            登录
          </van-button>
        </div>
      </van-form>
      
      <!-- 其他登录方式 -->
      <div class="other-login">
        <van-divider>其他登录方式</van-divider>
        <div class="login-icons">
          <van-icon name="wechat" size="32" color="#07C160" />
          <van-icon name="alipay" size="32" color="#1677FF" />
        </div>
      </div>
      
      <!-- 协议 -->
      <div class="agreement">
        <van-checkbox v-model="agreed" shape="square" icon-size="14px">
          我已阅读并同意
          <span class="link">《用户协议》</span>
          和
          <span class="link">《隐私政策》</span>
        </van-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

// 表单数据
const form = reactive({
  phone: '',
  password: ''
})

// 加载状态
const loading = ref(false)

// 协议同意
const agreed = ref(false)

// 提交登录
const onSubmit = () => {
  if (!agreed.value) {
    showToast('请先同意用户协议和隐私政策')
    return
  }
  
  loading.value = true
  
  // 模拟登录
  setTimeout(() => {
    loading.value = false
    showToast('登录成功')
    router.replace('/home')
  }, 1500)
}
</script>

<style lang="scss" scoped>
.login-page {
  height: 100%;
  background-color: $bg-color;
  overflow-y: auto;
  padding: 60px 24px 24px;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  
  .app-name {
    font-size: 24px;
    font-weight: 600;
    color: $text-primary;
    margin-top: 16px;
  }
  
  .app-slogan {
    font-size: 14px;
    color: $text-secondary;
    margin-top: 8px;
  }
}

.login-form {
  .van-cell-group {
    margin: 0;
    border-radius: $radius-lg;
    overflow: hidden;
  }
  
  .form-actions {
    margin-top: 24px;
    padding: 0 16px;
  }
}

.other-login {
  margin-top: 40px;
  
  .login-icons {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 16px;
    
    .van-icon {
      cursor: pointer;
    }
  }
}

.agreement {
  margin-top: 24px;
  padding: 0 16px;
  font-size: 12px;
  
  .link {
    color: $primary-color;
  }
}
</style>
