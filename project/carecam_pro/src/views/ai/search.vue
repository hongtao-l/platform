<template>
  <div class="ai-search-page">
    <div class="ai-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>AI搜索</h2>
    </div>

    <!-- 设备筛选 — 始终可见 -->
    <div class="device-filter-bar">
      <span
        v-for="(d, i) in deviceOptions"
        :key="i"
        :class="['dev-filter-chip', { active: selectedDevice === d }]"
        @click="onDeviceChange(d)"
      >{{ d }}</span>
    </div>

    <!-- 搜索输入区 — 始终可见 -->
    <div class="search-input-area">
      <div class="search-input-box">
        <input
          v-model="queryText"
          class="search-input"
          placeholder="描述你想搜索的事件…"
          @keyup.enter="doSearch"
        />
        <van-icon
          v-if="queryText"
          name="close"
          size="16"
          color="#9CA3AF"
          class="search-clear"
          @click="clearSearch"
        />
        <button class="search-btn" @click="doSearch">搜索</button>
      </div>
      <div class="search-examples">
        👉 试试："奶奶今天出门了吗" "猫咪上午在干嘛"
      </div>
    </div>

    <!-- 当前设备未开通 → 内联引导提示 -->
    <template v-if="!isActivated">
      <div class="not-activated-inline">
        <div class="na-inline-icon">🔍</div>
        <div class="na-inline-title">AI搜索</div>
        <div class="na-inline-desc">用自然语言搜索事件记录，快速定位关键片段</div>
        <button class="na-inline-btn" @click="goToAiHome">立即开通全能AI</button>
      </div>
    </template>

    <!-- 已开通 → 搜索结果 / 猜你想搜 / 空态 -->
    <template v-else>
      <div class="guess-section" v-if="!hasSearched">
        <div class="guess-title">猜你想搜</div>
        <div class="guess-tags">
          <span
            v-for="(g, i) in guessList"
            :key="i"
            class="guess-tag"
            @click="selectGuess(g)"
          >{{ g }}</span>
        </div>
      </div>

      <div class="result-list" v-if="hasSearched">
        <div class="result-count">共找到 {{ searchResults.length }} 条相关事件</div>
        <div
          v-for="(r, i) in searchResults"
          :key="i"
          class="result-item"
          @click="openDetail(r)"
        >
          <div class="result-thumb" :style="{ background: r.bg }"></div>
          <div class="result-info">
            <div class="result-summary">{{ r.summary }}</div>
            <div class="result-meta">
              <span class="result-event-name">{{ r.eventName }}</span>
              <span class="result-time">{{ r.time }}</span>
            </div>
          </div>
        </div>
        <div style="height:20px"></div>
      </div>

      <div class="empty-hint" v-if="!hasSearched">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">输入描述，AI帮你快速找到相关事件</div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { aiStatus, deviceAiStatus, defaultActivatedDevice, isDeviceActivated } from '@/store/devStatus'

const router = useRouter()
const goBack = () => router.back()

// 全局已开通 + 当前设备已开通 → true
const isActivated = computed(() =>
  aiStatus.value !== 'not_activated' && isDeviceActivated(selectedDevice.value)
)

const goToAiHome = () => router.push('/ai?show=activate')

// 设备选择
const deviceOptions = Object.keys(deviceAiStatus.value)
const selectedDevice = ref(defaultActivatedDevice.value)

const onDeviceChange = (device) => {
  selectedDevice.value = device
}

// 搜索
const queryText = ref('')
const hasSearched = ref(false)

const searchResults = ref([
  {
    summary: '奶奶从后门走出，身穿蓝色外套，手拿拐杖，状态正常',
    eventName: '老人看护',
    time: '今天 09:20',
    bg: 'linear-gradient(135deg, #0d2e1a, #1a5c34)'
  },
  {
    summary: '奶奶回到家中，手里提着菜袋，看起来精神不错',
    eventName: '老人看护',
    time: '今天 11:05',
    bg: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)'
  }
])

// 猜你想搜
const guessList = ['奶奶今天出门了吗', '猫咪上午在干嘛', '门口有快递', '晚上有人经过']

const selectGuess = (g) => {
  queryText.value = g
  doSearch()
}

const doSearch = () => {
  if (!queryText.value.trim()) return
  hasSearched.value = true
  // 演示数据
}

const clearSearch = () => {
  queryText.value = ''
  hasSearched.value = false
}

const openDetail = (r) => {
  const msgs = [{
    time: r.time,
    text: r.summary,
    eventName: r.eventName,
    bg: r.bg
  }]
  const listStr = encodeURIComponent(JSON.stringify(msgs))
  router.push('/ai/daily-event?name=' + encodeURIComponent(r.eventName) + '&list=' + listStr + '&index=0')
}
</script>

<style lang="scss" scoped>
.ai-search-page { height: 100%; background: $bg-page; display: flex; flex-direction: column; }
.ai-header { background: $bg-color; padding: 12px 16px; border-bottom: 1px solid $border-color; display: flex; align-items: center; gap: 12px; flex-shrink: 0; h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; } }
.back-btn { width: 32px; height: 32px; border-radius: 50%; background: $bg-page; display: flex; align-items: center; justify-content: center; color: $text-secondary; flex-shrink: 0; }

/* 内联未开通引导 */
.not-activated-inline { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
.na-inline-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.6; }
.na-inline-title { font-size: 16px; font-weight: 700; color: $text-primary; }
.na-inline-desc { font-size: 12px; color: $text-secondary; margin-top: 6px; text-align: center; max-width: 260px; line-height: 1.5; }
.na-inline-btn { margin-top: 20px; padding: 10px 28px; background: linear-gradient(135deg, #1A73E8, #1557B0); color: #fff; border: none; border-radius: $radius-md; font-size: 14px; font-weight: 600; cursor: pointer; }

/* 设备筛选 */
.device-filter-bar { background: $bg-color; padding: 8px 16px; display: flex; gap: 6px; flex-shrink: 0; border-bottom: 1px solid $border-color; overflow-x: auto; }
.dev-filter-chip { flex-shrink: 0; padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 500; color: $text-secondary; background: $bg-page; border: 1px solid $border-color; cursor: pointer; transition: all 0.15s; white-space: nowrap; &.active { background: $primary-color; color: #fff; border-color: $primary-color; } }

/* 搜索区 */
.search-input-area { padding: 16px; flex-shrink: 0; }
.search-input-box { display: flex; gap: 8px; align-items: center; }
.search-input { flex: 1; padding: 11px 14px; border: 1.5px solid $border-color; border-radius: $radius-md; font-size: 14px; color: $text-primary; outline: none; background: $bg-card; &:focus { border-color: $primary-color; } }
.search-clear { cursor: pointer; flex-shrink: 0; }
.search-btn { padding: 0 20px; background: linear-gradient(135deg, #1A73E8, #1557B0); color: #fff; border: none; border-radius: $radius-md; font-size: 14px; font-weight: 600; cursor: pointer; }
.search-examples { font-size: 11px; color: $text-secondary; margin-top: 8px; }

/* 猜你想搜 */
.guess-section { padding: 0 16px 16px; }
.guess-title { font-size: 13px; font-weight: 600; color: $text-primary; margin-bottom: 10px; }
.guess-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.guess-tag { padding: 6px 14px; background: $bg-card; border: 1.5px solid $border-color; border-radius: $radius-pill; font-size: 12px; color: $text-secondary; cursor: pointer; transition: all 0.15s; &:active { background: $primary-bg; border-color: $primary-color; color: $primary-color; } }

/* 结果列表 */
.result-list { flex: 1; padding: 0 16px; overflow-y: auto; }
.result-count { font-size: 12px; color: $text-secondary; margin-bottom: 10px; }
.result-item { background: $bg-card; border-radius: $radius-lg; padding: 12px; display: flex; gap: 12px; margin-bottom: 10px; box-shadow: $shadow-card; cursor: pointer; &:active { transform: scale(0.98); } }
.result-thumb { width: 72px; height: 54px; border-radius: 10px; flex-shrink: 0; }
.result-info { flex: 1; }
.result-summary { font-size: 13px; font-weight: 500; color: $text-primary; line-height: 1.4; margin-bottom: 6px; }
.result-meta { display: flex; justify-content: space-between; align-items: center; }
.result-event-name { font-size: 11px; color: $primary-color; background: $primary-bg; padding: 2px 8px; border-radius: 10px; }
.result-time { font-size: 11px; color: $text-secondary; }

/* 空态 */
.empty-hint { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }
.empty-text { font-size: 14px; color: $text-secondary; }
</style>
