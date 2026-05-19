<template>
  <div v-if="loading" class="loading-container">
    <el-icon class="loading-icon" :size="40">
      <Loading />
    </el-icon>
    <p class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue'

defineProps({
  // 是否显示
  loading: {
    type: Boolean,
    default: false
  },
  // 提示文字
  text: {
    type: String,
    default: '加载中...'
  }
})
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;

  .loading-icon {
    color: var(--primary-color);
    animation: rotate 1s linear infinite;
  }

  .loading-text {
    color: var(--text-secondary);
    font-size: var(--font-md);
    margin-top: 12px;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
