<template>
  <div class="error-container">
    <div class="error-code">{{ code }}</div>
    <div class="error-message">{{ message }}</div>
    <el-button type="primary" @click="handleBack">
      {{ buttonText }}
    </el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  // 错误码
  code: {
    type: [String, Number],
    default: '500'
  },
  // 错误信息
  message: {
    type: String,
    default: '服务器错误'
  },
  // 按钮文字
  buttonText: {
    type: String,
    default: '返回首页'
  }
})

const router = useRouter()

const handleBack = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg-page);

  .error-code {
    font-size: 120px;
    font-weight: 600;
    color: var(--text-placeholder);
    line-height: 1;
    margin-bottom: 20px;
  }

  .error-message {
    font-size: var(--font-xl);
    color: var(--text-secondary);
    margin-bottom: 30px;
  }
}
</style>
