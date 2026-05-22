<template>
  <van-popup
    v-model:show="visible"
    position="center"
    round
    :closeable="true"
    :close-on-click-overlay="false"
    :style="{ width: '300px', borderRadius: '16px', overflow: 'hidden' }"
    @click-close-icon="onSkip"
  >
    <div v-if="current" class="popup-content">
      <!-- 媒资图片 -->
      <div class="popup-media">
        <img v-if="current.mediaUrl" :src="current.mediaUrl" class="popup-img" @error="onImgError" />
        <div v-else class="popup-placeholder">
          <span class="popup-emoji">🎁</span>
        </div>
      </div>

      <!-- 活动信息 -->
      <div class="popup-body">
        <h3 class="popup-title">{{ current.name }}</h3>
        <van-button round block type="primary" @click="onConfirm">立即查看</van-button>
        <span class="popup-skip" @click="onSkip">暂不参与</span>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useActivityStore } from '@/store/activity'

const router = useRouter()
const store = useActivityStore()

const visible = ref(false)
const current = ref(null)

// 监听 activePopups 变化
watchEffect(() => {
  const popups = store.activePopups
  if (popups.length > 0 && !store.sessionDismissed) {
    setTimeout(() => {
      current.value = popups[0]
      visible.value = true
    }, 500)
  }
})

// 监听手动触发
watch(() => store.forcePopup, () => {
  const popups = store.activePopups
  if (popups.length > 0) {
    current.value = popups[0]
    visible.value = true
  }
})

function onConfirm() {
  visible.value = false
  store.dismissPopup(current.value.id)
  store.dismissSession()
  const url = current.value.activityUrl
  if (!url) return
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank')
  } else {
    router.push(url)
  }
}

function onSkip() {
  visible.value = false
  if (current.value) {
    store.dismissPopup(current.value.id)
  }
  store.dismissSession()
}

function onImgError(e) {
  e.target.style.display = 'none'
}
</script>

<style lang="scss" scoped>
.popup-content {
  background: #fff;
  overflow: hidden;
}

.popup-media {
  width: 100%;
  aspect-ratio: 300 / 200;
  overflow: hidden;
  background: linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4);
}

.popup-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popup-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.popup-emoji {
  font-size: 56px;
}

.popup-body {
  padding: 20px 16px 16px;
  text-align: center;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 16px;
}

.popup-skip {
  display: inline-block;
  margin-top: 12px;
  font-size: 12px;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
}
</style>
