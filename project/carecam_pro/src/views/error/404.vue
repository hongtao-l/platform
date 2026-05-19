<template>
  <div class="error-page">
    <van-empty
      image="error"
      description="页面不存在"
    >
      <van-button type="primary" @click="goHome">返回首页</van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.replace('/')
}
</script>

<style lang="scss" scoped>
.error-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-page;
}
</style>
