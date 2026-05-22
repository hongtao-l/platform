<template>
  <div v-if="store.activeBanners.length > 0" class="activity-banner-section">
    <van-swipe :autoplay="3000" indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#fff" :loop="store.activeBanners.length > 1" lazy-render>
      <van-swipe-item v-for="item in store.activeBanners" :key="item.id" @click="onClick(item)">
        <div class="banner-card">
          <img v-if="item.mediaUrl" :src="item.mediaUrl" class="banner-img" @error="onImgError($event, item)" />
          <div v-else class="banner-placeholder">
            <span class="banner-icon">🎉</span>
            <span class="banner-title">{{ item.name }}</span>
          </div>
          <!-- 位置标签 -->
          <span class="banner-tag">活动</span>
        </div>
      </van-swipe-item>
    </van-swipe>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useActivityStore } from '@/store/activity'

const router = useRouter()
const store = useActivityStore()

function onClick(item) {
  const url = item.activityUrl
  if (!url) return
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank')
  } else {
    router.push(url)
  }
}

function onImgError(e, item) {
  e.target.style.display = 'none'
}
</script>

<style lang="scss" scoped>
.activity-banner-section {
  padding: 12px 16px 0;
  background: $bg-page;
}

.banner-card {
  width: 100%;
  aspect-ratio: 343 / 120;
  border-radius: $radius-md;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #1A73E8 0%, #4A90E2 50%, #7C3AED 100%);
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.banner-icon {
  font-size: 32px;
}

.banner-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.banner-tag {
  position: absolute;
  bottom: 6px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  font-weight: 500;
}
</style>
