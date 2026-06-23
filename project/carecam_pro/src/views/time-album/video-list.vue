<template>
  <div class="video-list-page">
    <!-- 顶部返回栏 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>我的视频</h2>
    </div>

    <!-- 空态 -->
    <van-empty v-if="!loading && videos.length === 0" description="暂无生成的视频" />

    <!-- 视频列表 -->
    <div v-else class="video-list-wrapper">
      <div class="video-list">
        <div
          v-for="vid in videos"
          :key="vid.id"
          :class="['video-card', { expired: vid.expired }]"
          @click="!vid.expired && playVideo(vid)"
        >
          <div class="video-cover">
            <van-image :src="vid.cover" fit="cover" width="100%" height="100%" radius="8">
              <template #error>
                <div class="cover-placeholder"><van-icon name="play-circle-o" size="32" color="#ccc" /></div>
              </template>
            </van-image>
            <span class="video-duration">{{ vid.duration }}</span>
            <div v-if="!vid.expired" class="play-btn">
              <van-icon name="play-circle-o" size="36" color="rgba(255,255,255,0.9)" />
            </div>
            <div v-if="vid.expired" class="expired-tag">已过期</div>
          </div>
          <div class="video-info">
            <div class="video-title">时光视频</div>
            <div class="video-meta">{{ formatDate(vid.createdAt) }}</div>
            <div :class="['expiry-text', { warning: vid.daysLeft <= 3 && vid.daysLeft >= 0 }]">
              {{ vid.expired ? '已过期' : `剩余 ${vid.daysLeft} 天` }}
            </div>
          </div>
          <div v-if="!vid.expired" class="video-actions">
            <div class="action-item" @click.stop="handlePlay(vid)">
              <van-icon name="play" size="16" /><span>播放</span>
            </div>
            <div class="action-item" @click.stop="handleDownload(vid)">
              <van-icon name="down" size="16" /><span>下载</span>
            </div>
            <div class="action-item" @click.stop="handleShare(vid)">
              <van-icon name="share-o" size="16" /><span>分享</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频播放弹窗 -->
    <van-overlay :show="playing" :duration="0">
      <div class="player-overlay" @click.stop>
        <div class="player-header">
          <van-icon name="arrow-left" size="20" color="#fff" @click="stopPlay" />
        </div>
        <div class="player-body">
          <video ref="videoEl" :src="currentVideo?.url" controls autoplay class="player-video" />
        </div>
        <div class="player-footer">
          <van-button round plain type="default" size="small" @click.stop="handleDownload(currentVideo)">
            <van-icon name="down" size="16" /><span>下载</span>
          </van-button>
          <van-button round plain type="default" size="small" @click.stop="handleShare(currentVideo)">
            <van-icon name="share-o" size="16" /><span>分享</span>
          </van-button>
        </div>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()

const deviceId = ref(route.query.deviceId || '')
const loading = ref(false)
const playing = ref(false)
const currentVideo = ref(null)
const videoEl = ref(null)

// TODO: 从 API 获取视频列表
const videos = ref([
  {
    id: 'vid-1',
    url: '',
    cover: 'https://picsum.photos/seed/video1/320/180',
    createdAt: new Date(Date.now() - 2 * 86400000),
    duration: '00:12',
    expiresAt: new Date(Date.now() + 28 * 86400000),
    expired: false,
    daysLeft: 28
  },
  {
    id: 'vid-2',
    url: '',
    cover: 'https://picsum.photos/seed/video2/320/180',
    createdAt: new Date(Date.now() - 5 * 86400000),
    duration: '00:18',
    expiresAt: new Date(Date.now() + 25 * 86400000),
    expired: false,
    daysLeft: 25
  },
  {
    id: 'vid-3',
    url: '',
    cover: 'https://picsum.photos/seed/video3/320/180',
    createdAt: new Date(Date.now() - 35 * 86400000),
    duration: '00:20',
    expiresAt: new Date(Date.now() - 5 * 86400000),
    expired: true,
    daysLeft: -5
  }
])

function formatDate(d) {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function goBack() { router.back() }

function playVideo(vid) {
  currentVideo.value = { ...vid, url: 'https://www.w3schools.com/html/mov_bbb.mp4' } // TODO: 真实视频 URL
  playing.value = true
}

function stopPlay() {
  playing.value = false
  if (videoEl.value) videoEl.value.pause()
}

function handlePlay(vid) { playVideo(vid) }

function handleDownload() {
  showToast('下载中...') // TODO: 真实下载
}

function handleShare() {
  showToast('分享功能开发中') // TODO: 真实分享
}
</script>

<style lang="scss" scoped>
.video-list-page {
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

.video-list-wrapper {
  padding: 12px 16px;
  padding-bottom: 40px;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-card {
  background: $bg-color;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
  overflow: hidden;
  &.expired { opacity: 0.5; }
}

.video-cover {
  position: relative;
  aspect-ratio: 16 / 9;
  background: $bg-disabled;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-disabled;
}

.video-duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
}

.play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.expired-tag {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: $radius-pill;
}

.video-info {
  padding: 10px 12px 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.video-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.video-meta {
  font-size: 12px;
  color: $text-secondary;
  flex: 1;
}

.expiry-text {
  font-size: 12px;
  color: $text-secondary;
  &.warning {
    color: $danger-color;
    font-weight: 500;
  }
}

.video-actions {
  display: flex;
  gap: 16px;
  padding: 6px 12px 10px;
  border-top: 1px solid $border-light;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: $text-secondary;
  padding: 4px 8px;
  &:active { color: $primary-color; }
}

// ===== 播放器 =====
.player-overlay {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0,0,0,0.95);
}

.player-header {
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
  display: flex;
  align-items: center;
}

.player-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-video {
  width: 100%;
  max-height: 60vh;
}

.player-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));

  .van-button--default {
    color: #fff;
    border-color: rgba(255,255,255,0.4);
    background: transparent;
  }
}
</style>
