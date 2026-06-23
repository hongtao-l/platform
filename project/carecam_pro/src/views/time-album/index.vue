<template>
  <div class="time-album-page">
    <!-- 顶部返回栏 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>时光相册</h2>
    </div>

    <!-- 分类 Tab 栏 -->
    <div class="category-tabs">
      <div
        v-for="cat in categories"
        :key="cat.key"
        :class="['cat-chip', { active: activeCategory === cat.key }]"
        @click="switchCategory(cat.key)"
      >{{ cat.label }}</div>
    </div>

    <!-- 日期筛选栏 -->
    <div class="date-filter-bar" @click="showDatePicker = true">
      <div class="date-range-text">{{ dateRangeText }}</div>
      <van-icon name="filter-o" size="16" color="#6B7280" />
    </div>

    <!-- 内容区 — 按日期分组 -->
    <div class="content-area">
      <van-loading v-if="loading" size="32" class="loading-center" />

      <van-empty
        v-else-if="!loading && dailyGroups.length === 0"
        description="暂无设备抓拍图片"
      />

      <template v-else>
        <div v-for="day in dailyGroups" :key="day.label" class="day-group">
          <!-- 日期标签 -->
          <div class="day-label">{{ day.label }}</div>

          <!-- 该日图片 — 一行固定展示 4~5 张 + 箭头 -->
          <div v-if="day.images.length > 0" class="day-images" @click="goGallery(day.date)">
            <div
              v-for="img in day.images.slice(0, 4)"
              :key="img.id"
              class="day-img-thumb"
            >
              <van-image :src="img.url" fit="cover" width="100%" height="100%" radius="6">
                <template #error>
                  <div class="img-placeholder"><van-icon name="photo-o" size="18" color="#ccc" /></div>
                </template>
              </van-image>
            </div>
            <div class="day-img-arrow">
              <van-icon name="arrow" size="20" color="#999" />
            </div>
          </div>

          <!-- 该日视频 — 大卡片 -->
          <div v-if="day.videos.length > 0" class="day-videos">
            <div
              v-for="vid in day.videos"
              :key="vid.id"
              :class="['day-video-item', { expired: vid.expired }]"
              @click="!vid.expired && playVideo(vid)"
            >
              <div class="dv-cover">
                <van-image :src="vid.cover" fit="cover" width="100%" height="100%" radius="6">
                  <template #error><div class="cover-placeholder" /></template>
                </van-image>
                <span class="dv-duration">{{ vid.duration }}</span>
                <van-icon v-if="!vid.expired" name="play-circle-o" size="22" color="rgba(255,255,255,0.85)" class="dv-play" />
                <span v-if="vid.expired" class="dv-expired">已过期</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 日期选择弹窗 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round :style="{ height: '40%' }">
      <div class="picker-header">
        <span @click="showDatePicker = false">取消</span>
        <span class="picker-title">选择日期范围</span>
        <span class="picker-confirm" @click="confirmDateFilter">确定</span>
      </div>
      <van-date-picker
        v-model="datePickerValues"
        type="year-month-day"
        :min-date="minDate"
        :max-date="maxDate"
        title=""
      />
    </van-popup>

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
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const deviceId = ref(route.query.deviceId || '')
const deviceName = ref(route.query.deviceName || '')

// ===== 分类 =====
const categories = reactive([
  { key: 'normal', label: '常规' },
  { key: 'pet', label: '宠物' },
  { key: 'elder', label: '老人' },
  { key: 'child', label: '儿童' }
])
const activeCategory = ref('normal')

// ===== 日期筛选 =====
const dateRange = reactive({ start: null, end: null })
const showDatePicker = ref(false)
const minDate = new Date(2025, 0, 1)
const maxDate = new Date()
const datePickerValues = ref([new Date(Date.now() - 7 * 86400000), new Date()])
const dateRangeText = computed(() => {
  if (!dateRange.start) return '全部时间'
  const fmt = d => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  if (dateRange.end && dateRange.start.getTime() !== dateRange.end.getTime()) {
    return `${fmt(dateRange.start)} - ${fmt(dateRange.end)}`
  }
  return fmt(dateRange.start)
})

// ===== 状态 =====
const loading = ref(false)
const playing = ref(false)
const currentVideo = ref(null)
const videoEl = ref(null)

// ===== Mock 图片数据 =====
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
      url: `https://picsum.photos/seed/a${i}/300/300`,
      category: catKeys[Math.floor(Math.random() * catKeys.length)],
      timestamp: now - dayOffset * day - Math.random() * day,
      time: `${h}:${m}`
    })
  }
  return all
}

const allImages = ref(generateMockImages())

const filteredImages = computed(() => {
  let list = allImages.value.filter(img => img.category === activeCategory.value)
  if (dateRange.start) {
    const s = new Date(dateRange.start); s.setHours(0, 0, 0, 0)
    const e = dateRange.end ? new Date(dateRange.end) : new Date()
    e.setHours(23, 59, 59, 999)
    list = list.filter(img => img.timestamp >= s.getTime() && img.timestamp <= e.getTime())
  }
  return list.sort((a, b) => b.timestamp - a.timestamp)
})

// ===== Mock 视频数据 =====
const videoList = ref([
  { id: 'vid-1', url: '', cover: 'https://picsum.photos/seed/v1/320/180',
    createdAt: new Date(Date.now() - 1 * 86400000), duration: '00:12',
    expiresAt: new Date(Date.now() + 28 * 86400000), expired: false },
  { id: 'vid-2', url: '', cover: 'https://picsum.photos/seed/v2/320/180',
    createdAt: new Date(Date.now() - 2 * 86400000), duration: '00:18',
    expiresAt: new Date(Date.now() + 25 * 86400000), expired: false },
  { id: 'vid-3', url: '', cover: 'https://picsum.photos/seed/v3/320/180',
    createdAt: new Date(Date.now() - 5 * 86400000), duration: '00:20',
    expiresAt: new Date(Date.now() - 5 * 86400000), expired: true }
])

// ===== 按日期分组（图片 + 视频合在一起） =====
const dailyGroups = computed(() => {
  const groups = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 86400000

  // 图片分组
  for (const img of filteredImages.value) {
    const d = new Date(img.timestamp)
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    let label, dateKey
    if (dStart === today) {
      label = '今天'
      dateKey = formatDateKey(d)
    } else if (dStart === yesterday) {
      label = '昨天'
      dateKey = formatDateKey(d)
    } else {
      label = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
      dateKey = label
    }
    if (!groups[dateKey]) groups[dateKey] = { label, date: d, images: [], videos: [] }
    groups[dateKey].images.push(img)
  }

  // 仅最新一个视频（按生成日期归入对应日）
  const latestVideo = videoList.value[0]
  if (latestVideo) {
    const d = new Date(latestVideo.createdAt)
    const dateKey = formatDateKey(d)
    if (!groups[dateKey]) {
      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      let label
      if (dStart === today) label = '今天'
      else if (dStart === yesterday) label = '昨天'
      else label = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
      groups[dateKey] = { label, date: d, images: [], videos: [] }
    }
    groups[dateKey].videos.push(latestVideo)
  }

  return Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([, val]) => val)
})

function formatDateKey(d) {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

// ===== 操作 =====
function goBack() { router.back() }

function switchCategory(key) { activeCategory.value = key }

function confirmDateFilter() {
  const [s, e] = datePickerValues.value
  dateRange.start = s
  dateRange.end = e
  showDatePicker.value = false
}

function goGallery(date) {
  router.push({
    path: '/time-album/gallery',
    query: { deviceId: deviceId.value }
  })
}

function playVideo(vid) {
  currentVideo.value = { ...vid, url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
  playing.value = true
}

function stopPlay() { playing.value = false; if (videoEl.value) videoEl.value.pause() }
</script>

<style lang="scss" scoped>
.time-album-page {
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

// ===== 分类 Tab =====
.category-tabs {
  background-color: $bg-color; padding: 10px 16px;
  display: flex; gap: 8px; overflow-x: auto; flex-shrink: 0;
  &::-webkit-scrollbar { display: none; }
}

.cat-chip {
  padding: 6px 14px; border-radius: $radius-pill;
  background: $bg-page; font-size: 13px; color: $text-regular;
  white-space: nowrap; flex-shrink: 0; transition: $transition;
  &.active { background: $primary-color; color: #fff; }
}

// ===== 日期筛选 =====
.date-filter-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; background: $bg-color;
  border-top: 1px solid $border-light; flex-shrink: 0; cursor: pointer;
}
.date-range-text { font-size: 12px; color: $text-secondary; }

// ===== 内容区 =====
.content-area { flex: 1; overflow-y: auto; padding: 12px 16px; }
.loading-center { display: flex; justify-content: center; padding-top: 120px; }

.day-group { margin-bottom: 24px; }

.day-label {
  font-size: 14px; font-weight: 600; color: $text-primary;
  margin-bottom: 10px; padding-bottom: 6px;
  border-bottom: 1px solid $border-light;
}

// ===== 每日图片行 =====
.day-images {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px;
  margin-bottom: 12px; cursor: pointer;
}

.day-img-thumb {
  aspect-ratio: 1; border-radius: 6px;
  overflow: hidden; background: $bg-disabled;
}

.day-img-arrow {
  aspect-ratio: 1; display: flex;
  align-items: center; justify-content: center; color: #999;
}

.img-placeholder {
  width: 100%; height: 100%; display: flex;
  align-items: center; justify-content: center; background: $bg-disabled;
}

// ===== 每日视频 =====
.day-videos { display: flex; flex-direction: column; }

.day-video-item {
  cursor: pointer; background: $bg-color; border-radius: $radius-md;
  overflow: hidden; box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  &.expired .dv-cover { opacity: 0.5; }
}

.dv-cover {
  position: relative; aspect-ratio: 16 / 9; overflow: hidden; background: $bg-disabled;
}

.cover-placeholder { width: 100%; height: 100%; background: $bg-disabled; }

.dv-duration {
  position: absolute; bottom: 6px; right: 6px;
  background: rgba(0,0,0,0.6); color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 3px;
}

.dv-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); }

.dv-expired {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  background: rgba(0,0,0,0.6); color: #fff; font-size: 13px; padding: 4px 12px; border-radius: $radius-pill;
}


// ===== 弹窗 =====
.picker-header {
  display: flex; justify-content: space-between; padding: 14px 16px;
  font-size: 14px; color: $text-primary;
}
.picker-title { font-weight: 600; }
.picker-confirm { color: $primary-color; font-weight: 500; }

// ===== 播放器 =====
.player-overlay {
  display: flex; flex-direction: column; height: 100%; background: rgba(0,0,0,0.95);
}
.player-top { padding: 12px 16px; padding-top: calc(12px + env(safe-area-inset-top, 0px)); }
.player-body { flex: 1; display: flex; align-items: center; justify-content: center; }
.player-video { width: 100%; max-height: 60vh; }
</style>
