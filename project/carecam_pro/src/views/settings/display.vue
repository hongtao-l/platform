<template>
  <div class="display-page">
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>画面设置</h2>
    </div>

    <div class="setting-list">
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">人形画框</span>
          <span class="setting-desc">开启后实时视频中检测到人形时显示框标记</span>
        </div>
        <van-switch v-model="humanFrameboxEnabled" size="24px" />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const humanFrameboxEnabled = ref(false)

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.display-page {
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

.setting-list {
  background-color: $bg-color;
  margin: 12px 16px;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-card;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.setting-info {
  flex: 1;
  margin-right: 12px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  display: block;
}

.setting-desc {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
  display: block;
}
</style>
