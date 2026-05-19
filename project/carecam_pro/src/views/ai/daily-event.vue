<template>
  <div class="daily-event-page">
    <div class="ai-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>{{ eventName }}</h2>
      <div class="header-right"></div>
    </div>

    <div class="scroll-content">
      <!-- 当前消息卡片 -->
      <div class="msg-card" v-if="currentMsg">
        <div class="msg-thumb-large" :style="{ background: currentMsg.bg }" @click="playRecord">
          <div class="play-overlay">
            <van-icon name="play-circle-o" size="48" color="rgba(255,255,255,0.9)" />
          </div>
        </div>
        <div class="msg-body">
          <div class="msg-body-header">
            <div class="msg-body-text">{{ eventName }}</div>
            <van-icon name="arrow" size="14" color="#9CA3AF" />
          </div>
          <div class="msg-body-meta">{{ currentMsg.device || '未知设备' }} · {{ currentMsg.time }}</div>
          <div class="msg-body-desc">{{ currentMsg.text }}</div>
        </div>
      </div>

      <!-- 其他消息列表 -->
      <div class="other-msgs">
        <div class="other-msgs-title">该事件其他消息（共 {{ eventList.length }} 条）</div>
        <div
          v-for="(m, i) in eventList"
          :key="i"
          :class="['other-msg-item', { active: i === currentIndex }]"
          @click="currentIndex = i"
        >
          <div class="other-msg-thumb" :style="{ background: m.bg }"></div>
          <div class="other-msg-info">
            <div class="other-msg-time">{{ m.time }}</div>
            <div class="other-msg-text">{{ m.text }}</div>
          </div>
          <van-icon v-if="i === currentIndex" name="success" size="16" color="#1A73E8" />
        </div>
      </div>

      <div style="height:20px"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const goBack = () => router.back()

const eventName = ref(route.query.name || '')
const currentIndex = ref(parseInt(route.query.index) || 0)

// 从 query 取完整消息列表（JSON）
const eventList = ref([])
try {
  const raw = route.query.list
  if (raw) eventList.value = JSON.parse(decodeURIComponent(raw))
} catch (e) {
  eventList.value = []
}

const currentMsg = computed(() => eventList.value[currentIndex.value] || null)

const switchEvent = (dir) => {
  const next = currentIndex.value + dir
  if (next < 0 || next >= eventList.value.length) return
  currentIndex.value = next
}

const playRecord = () => {
  // 当前页面播放（展示toast模拟）
  router.push('/playback')
}
</script>

<style lang="scss" scoped>
.daily-event-page { height: 100%; background: $bg-page; display: flex; flex-direction: column; }
.ai-header { background: $bg-color; padding: 12px 16px; border-bottom: 1px solid $border-color; display: flex; align-items: center; gap: 12px; flex-shrink: 0; h2 { font-size: 16px; font-weight: 700; color: $text-primary; flex: 1; } }
.back-btn, .header-right { width: 32px; height: 32px; border-radius: 50%; background: $bg-page; display: flex; align-items: center; justify-content: center; color: $text-secondary; flex-shrink: 0; }
.scroll-content { flex: 1; overflow-y: auto; padding: 16px; }

.msg-card { background: $bg-card; border-radius: $radius-lg; padding: 16px; margin-bottom: 16px; box-shadow: $shadow-card; }
.msg-thumb-large { width: 100%; height: 180px; border-radius: $radius-lg; margin-bottom: 12px; cursor: pointer; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.play-overlay { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.25); transition: background 0.2s; &:active { background: rgba(0,0,0,0.4); } }
.msg-body { padding: 0 4px; }
.msg-body-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.msg-body-text { font-size: 16px; font-weight: 700; color: $text-primary; }
.msg-body-meta { font-size: 12px; color: $text-secondary; margin-bottom: 8px; }
.msg-body-desc { font-size: 14px; color: $text-secondary; line-height: 1.6; }
.msg-body-desc-detail { font-size: 14px; color: $text-primary; line-height: 1.6; margin-top: 8px; padding: 10px 14px; background: $bg-page; border-radius: $radius-md; }

.other-msgs-title { font-size: 13px; font-weight: 600; color: $text-primary; margin-bottom: 10px; }
.other-msg-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: $radius-md; margin-bottom: 6px; cursor: pointer; transition: background 0.15s; &.active { background: $primary-bg; } }
.other-msg-thumb { width: 48px; height: 36px; border-radius: 6px; flex-shrink: 0; }
.other-msg-info { flex: 1; }
.other-msg-time { font-size: 11px; color: $text-placeholder; }
.other-msg-text { font-size: 13px; color: $text-primary; margin-top: 2px; }
</style>
