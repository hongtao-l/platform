<template>
  <div class="gallery-page">
    <!-- 顶部返回栏 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>时光相册</h2>
    </div>

    <!-- 内容区 -->
    <div class="content-area">
      <van-loading v-if="loading" size="32" class="loading-center" />

      <van-empty
        v-else-if="!loading && images.length === 0 && filteredVideos.length === 0"
        description="暂无设备抓拍图片"
      />

      <template v-else>
        <!-- 图片平铺区 -->
        <div v-if="images.length > 0" class="section">
          <div class="section-title">图片</div>
          <div class="image-grid">
            <div
              v-for="img in images"
              :key="img.id"
              class="image-item" @click="viewImage(img)"
            >
              <van-image :src="img.url" fit="cover" width="100%" height="100%" radius="6">
                <template #error>
                  <div class="img-placeholder"><van-icon name="photo-o" size="20" color="#ccc" /></div>
                </template>
              </van-image>
              <span class="img-time">{{ img.time }}</span>
            </div>
          </div>
        </div>

        <!-- 视频区 -->
        <div v-if="filteredVideos.length > 0" class="section">
          <div class="section-title">视频</div>
          <div class="video-list">
            <div
              v-for="vid in filteredVideos"
              :key="vid.id"
              :class="['video-card', { expired: vid.expired }]"
              @click="!vid.expired && playVideo(vid)"
            >
              <div class="video-cover">
                <van-image :src="vid.cover" fit="cover" width="100%" height="100%" radius="8">
                  <template #error><div class="cover-placeholder" /></template>
                </van-image>
                <span class="video-duration">{{ vid.duration }}</span>
                <van-icon v-if="!vid.expired" name="play-circle-o" size="32" color="rgba(255,255,255,0.85)" class="video-play" />
                <span v-if="vid.expired" class="video-expired-tag">已过期</span>
              </div>
              <div class="video-info">
                <span class="video-title">时光视频</span>
                <span class="video-meta">{{ formatDate(vid.createdAt) }}</span>
                <span :class="['video-expiry', { warn: vid.daysLeft <= 3 && vid.daysLeft >= 0 }]">
                  {{ vid.expired ? '已过期' : `剩余 ${vid.daysLeft} 天` }}
                </span>
              </div>
              <div v-if="!vid.expired" class="video-actions">
                <div class="action-item" @click.stop="handlePlay(vid)"><van-icon name="play" size="14" />播放</div>
                <div class="action-item" @click.stop="handleDownload(vid)"><van-icon name="down" size="14" />下载</div>
                <div class="action-item" @click.stop="handleShare(vid)"><van-icon name="share-o" size="14" />分享</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 底部栏 -->
    <div class="bottom-bar">
      <van-button type="primary" block @click="startGenerate">
        <van-icon name="video-o" size="16" /> 生成视频
      </van-button>
    </div>

    <!-- 确认生成弹窗 -->
    <van-dialog
      v-if="showConfirmGen"
      v-model:show="showConfirmGen"
      title="生成视频"
      :message="`将自动使用全部 ${Math.min(images.length, 20)} 张图片生成短视频。`"
      show-cancel-button
      confirm-button-text="开始生成"
      @confirm="doGenerate"
    />

    <!-- 生成等待遮罩 -->
    <van-overlay :show="generating" :duration="0">
      <div class="generating-overlay" @click.stop>
        <van-loading type="spinner" size="48" color="#fff" />
        <p class="generating-text">视频生成中...</p>
      </div>
    </van-overlay>

    <!-- 视频播放弹窗 -->
    <van-overlay :show="playing" :duration="0">
      <div class="player-overlay" @click.stop>
        <div class="player-top">
          <van-icon name="arrow-left" size="20" color="#fff" @click="stopPlay" />
        </div>
        <div class="player-body">
          <video ref="videoEl" :src="currentVideo?.url" controls autoplay class="player-video" />
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

// ===== 参数 =====
const deviceId = ref(route.query.deviceId || '')

// ===== 状态 =====
const loading = ref(false)
const generating = ref(false)
const playing = ref(false)
const showConfirmGen = ref(false)
const currentVideo = ref(null)
const videoEl = ref(null)

// ===== Mock 图片 =====
// TODO: 接入真实 API
function generateMockImages() {
  const all = []
  const now = Date.now()
  const day = 86400000
  const catKeys = ['normal', 'pet', 'elder', 'child']
  for (let i = 0; i < 200; i++) {
    const dayOffset = Math.floor(Math.random() * 14)
    const h = String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')
    const m = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    all.push({
      id: `img-${i + 1}`,
      url: `https://picsum.photos/seed/gallery${i}/300/300`,
      category: catKeys[Math.floor(Math.random() * catKeys.length)],
      timestamp: now - dayOffset * day - Math.random() * day,
      time: `${h}:${m}`,
      date: new Date(now - dayOffset * day)
    })
  }
  return all
}

const allImages = ref(generateMockImages())

const images = computed(() => {
  return [...allImages.value].sort((a, b) => b.timestamp - a.timestamp)
})

// ===== 视频 =====
const videoList = ref([
  { id: 'vid-1', url: '', cover: 'https://picsum.photos/seed/video1/320/180',
    createdAt: new Date(Date.now() - 2 * 86400000), duration: '00:12',
    expiresAt: new Date(Date.now() + 28 * 86400000), expired: false, daysLeft: 28 },
  { id: 'vid-2', url: '', cover: 'https://picsum.photos/seed/video2/320/180',
    createdAt: new Date(Date.now() - 5 * 86400000), duration: '00:18',
    expiresAt: new Date(Date.now() + 25 * 86400000), expired: false, daysLeft: 25 },
  { id: 'vid-3', url: '', cover: 'https://picsum.photos/seed/video3/320/180',
    createdAt: new Date(Date.now() - 35 * 86400000), duration: '00:20',
    expiresAt: new Date(Date.now() - 5 * 86400000), expired: true, daysLeft: -5 }
])

const filteredVideos = computed(() => videoList.value.slice(0, 1))

function formatDate(d) { return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}` }

// ===== 操作 =====
function goBack() { router.back() }

function viewImage() { /* TODO: 全屏大图 */ }

// ===== 生成视频 =====
function startGenerate() {
  if (images.value.length < 3) {
    showToast('至少需要 3 张图片才能生成视频')
    return
  }
  showConfirmGen.value = true
}

function doGenerate() {
  showConfirmGen.value = false
  generating.value = true

  // TODO: 接入真实的视频生成 API，自动使用全部图片
  setTimeout(() => {
    generating.value = false
    const newVid = {
      id: `vid-${Date.now()}`,
      url: '',
      cover: images.value[0]?.url || '',
      createdAt: new Date(), duration: '00:15',
      expiresAt: new Date(Date.now() + 30 * 86400000), expired: false, daysLeft: 30
    }
    videoList.value.unshift(newVid)
    showToast('视频生成成功')
    playVideo(newVid)
  }, 3000)
}

// ===== 视频操作 =====
function playVideo(vid) {
  currentVideo.value = { ...vid, url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
  playing.value = true
}

function stopPlay() { playing.value = false; if (videoEl.value) videoEl.value.pause() }

function handlePlay(vid) { playVideo(vid) }
function handleDownload() { showToast('下载中...') }
function handleShare() { showToast('分享功能开发中') }
</script>

<style lang="scss" scoped>
.gallery-page {
  height: 100%;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

.page-header {
  background-color: $bg-color;
  padding: 12px 16px;
  border-bottom: 1px solid $border-color;
  display: flex; align-items: center; gap: 12px; flex-shrink: 0;
  h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; }
}

.back-btn {
  width: 32px; height: 32px; border-radius: 50%;
  background-color: $bg-page; display: flex;
  align-items: center; justify-content: center; color: $text-primary;
}

// ===== 内容区 =====
.content-area { flex: 1; overflow-y: auto; padding: 8px 16px 100px; }
.loading-center { display: flex; justify-content: center; padding-top: 120px; }

.section { margin-bottom: 24px; }
.section-title { font-size: 15px; font-weight: 600; color: $text-primary; margin-bottom: 10px; }

.image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }

.image-item {
  aspect-ratio: 1; position: relative; border-radius: 6px;
  overflow: hidden; background: $bg-disabled; cursor: pointer;
}

.img-time {
  position: absolute; bottom: 4px; right: 4px;
  background: rgba(0,0,0,0.5); color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 3px;
}

.img-placeholder {
  width: 100%; height: 100%; display: flex;
  align-items: center; justify-content: center; background: $bg-disabled;
}

// ===== 视频卡片 =====
.video-list { display: flex; flex-direction: column; gap: 10px; }

.video-card {
  background: $bg-color; border-radius: $radius-md;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06); overflow: hidden;
  &.expired { opacity: 0.5; }
}

.video-cover {
  position: relative; aspect-ratio: 16 / 9; background: $bg-disabled;
}

.cover-placeholder { width: 100%; height: 100%; background: $bg-disabled; }

.video-duration {
  position: absolute; bottom: 6px; right: 6px;
  background: rgba(0,0,0,0.6); color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 3px;
}

.video-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); }

.video-expired-tag {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  background: rgba(0,0,0,0.6); color: #fff; font-size: 13px; padding: 4px 12px; border-radius: $radius-pill;
}

.video-info { padding: 10px 12px 6px; display: flex; align-items: center; gap: 8px; }
.video-title { font-size: 14px; font-weight: 600; color: $text-primary; }
.video-meta { font-size: 12px; color: $text-secondary; flex: 1; }
.video-expiry { font-size: 12px; color: $text-secondary; &.warn { color: $danger-color; font-weight: 500; } }

.video-actions { display: flex; gap: 16px; padding: 6px 12px 10px; border-top: 1px solid $border-light; }
.action-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: $text-secondary; }

// ===== 底部栏 =====
.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; background: $bg-color;
  padding: 10px 16px; padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid $border-color; z-index: 10;
}

// ===== 生成遮罩 =====
.generating-overlay {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; gap: 16px;
}
.generating-text { color: #fff; font-size: 15px; font-weight: 500; }

// ===== 播放器 =====
.player-overlay {
  display: flex; flex-direction: column; height: 100%; background: rgba(0,0,0,0.95);
}
.player-top { padding: 12px 16px; padding-top: calc(12px + env(safe-area-inset-top, 0px)); }
.player-body { flex: 1; display: flex; align-items: center; justify-content: center; }
.player-video { width: 100%; max-height: 60vh; }
</style>
