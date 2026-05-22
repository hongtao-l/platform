<template>
  <div v-if="store.activeFab" class="activity-fab">
    <!-- 关闭按钮 -->
    <div class="fab-close" @click.stop="onClose">
      <van-icon name="cross" size="10" color="#fff" />
    </div>

    <!-- 悬浮主按钮 -->
    <div class="fab-body" @click="onClick">
      <div class="fab-img-wrapper">
        <img v-if="store.activeFab.mediaUrl" :src="store.activeFab.mediaUrl" class="fab-img" @error="onImgError" />
        <span v-else class="fab-emoji">🔥</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useActivityStore } from '@/store/activity'

const router = useRouter()
const store = useActivityStore()

function onClick() {
  const url = store.activeFab.activityUrl
  if (!url) return
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank')
  } else {
    router.push(url)
  }
}

function onClose() {
  store.dismissPopup(store.activeFab.id)
}

function onImgError(e) {
  e.target.style.display = 'none'
}
</script>

<style lang="scss" scoped>
.activity-fab {
  position: fixed;
  bottom: 80px;
  right: 16px;
  z-index: 100;
}

.fab-close {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  cursor: pointer;
}

.fab-body {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: fab-pulse 2s ease-in-out infinite;
  cursor: pointer;

  &:active {
    transform: scale(0.92);
  }
}

.fab-img-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fab-emoji {
  font-size: 26px;
}

@keyframes fab-pulse {
  0%, 100% { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); }
  50% { box-shadow: 0 4px 24px rgba(255, 107, 107, 0.4); }
}
</style>
