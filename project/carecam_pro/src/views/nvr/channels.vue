<template>
  <div class="nvr-channels-page">
    <van-nav-bar
      :title="nvr?.name || 'NVR'"
      left-arrow
      @click-left="$router.back()"
    >
      <template #right>
        <van-icon name="setting-o" size="20" @click="goSettings" />
      </template>
    </van-nav-bar>

    <div v-if="loading" class="page-loading">
      <van-skeleton title :row="4" />
    </div>

    <template v-else-if="nvr">
      <!-- NVR 摘要卡片 -->
      <div class="nvr-summary">
        <div class="nvr-icon">
          <van-icon name="apps-o" size="26" />
        </div>
        <div class="nvr-info">
          <div class="nvr-name-row">
            <span class="nvr-name">{{ nvr.name }}</span>
            <span class="channel-count-tag">{{ nvr.channelCount }}路</span>
          </div>
          <div class="nvr-sub">
            <span :class="['online-dot', nvr.status === 'online' ? 'is-online' : '']"></span>
            {{ nvr.status === 'online' ? '在线' : '离线' }}
            <span class="nvr-id">{{ nvr.deviceId }}</span>
          </div>
        </div>
      </div>

      <!-- 通道列表 -->
      <div v-if="nvr.channels.length" class="channel-list">
        <div v-for="ch in channelsWithStatus" :key="ch.chNo" class="channel-card">
          <div class="channel-main">
            <div class="channel-avatar">
              <van-icon name="video-o" size="20" />
            </div>
            <div class="channel-info">
              <span class="channel-no">CH{{ ch.chNo }}</span>
              <span class="channel-name">{{ ch.name }}</span>
              <span v-if="!ch.online" class="channel-offline">离线</span>
            </div>
          </div>

          <div class="channel-tail">
            <template v-if="ch.cloudStatus.status === 'unbound'">
              <van-button
                size="small"
                type="primary"
                round
                class="open-btn"
                @click="goStore"
              >
                开通云存
              </van-button>
            </template>
            <template v-else>
              <span :class="['cloud-tag', 'cloud-' + ch.cloudStatus.status]">
                {{ ch.cloudStatus.label }}
              </span>
              <span class="expire-text">{{ ch.cloudStatus.expireDate }} 到期</span>
              <span class="unbind-btn" @click="goBindChannel(ch.cloudStatus.srvId)">解绑</span>
            </template>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <van-empty description="暂未接入摄像机" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchNvrChannels, fetchMyServices } from '@/mock/services'
import { useServicesStore } from '@/composables/useServicesStore'

const route = useRoute()
const router = useRouter()
const { state } = useServicesStore()

const nvrId = route.params.deviceId
const nvr = ref(null)
const loading = ref(true)

// 该 NVR 下所有云存套餐的通道绑定关系：chNo -> { expireDate, srvId }
const boundMap = computed(() => {
  const map = {}
  state.services
    .filter((s) => s.type === 'nvr' && s.nvrDevice?.id === nvrId)
    .forEach((s) => {
      s.boundChannels.forEach((ch) => {
        map[ch.chNo] = { expireDate: s.expireDate, srvId: s.id }
      })
    })
  return map
})

function daysUntil(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const now = new Date()
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

const channelsWithStatus = computed(() => {
  if (!nvr.value) return []
  return nvr.value.channels.map((ch) => {
    const bound = boundMap.value[ch.chNo]
    let cloudStatus
    if (!bound) {
      cloudStatus = { status: 'unbound', label: '未绑定' }
    } else {
      const days = daysUntil(bound.expireDate)
      if (days <= 0) {
        cloudStatus = { status: 'expired', label: '已到期', expireDate: bound.expireDate, srvId: bound.srvId }
      } else if (days <= 7) {
        cloudStatus = { status: 'expiring', label: `${days}天后到期`, expireDate: bound.expireDate, srvId: bound.srvId }
      } else {
        cloudStatus = { status: 'active', label: '云存生效中', expireDate: bound.expireDate, srvId: bound.srvId }
      }
    }
    return { ...ch, cloudStatus }
  })
})

function goStore() {
  router.push(`/store?tab=cloud&device=${nvrId}`)
}

function goBindChannel(srvId) {
  router.push(`/my-services/bind-channel?srvId=${srvId}`)
}

function goSettings() {
  router.push({ path: '/settings', query: { deviceId: nvr.value?.id, deviceName: nvr.value?.name } })
}

onMounted(async () => {
  try {
    const [nvrRes] = await Promise.all([
      fetchNvrChannels(nvrId),
      state.loaded ? Promise.resolve() : fetchMyServices().then((res) => {
        if (res.code === 0) { state.services = res.data; state.loaded = true }
      })
    ])
    if (nvrRes.code === 0) nvr.value = nvrRes.data
  } catch { /* ignore */ } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.nvr-channels-page {
  min-height: 100%;
  background-color: $bg-page;
  padding-bottom: 24px;
}

.page-loading {
  padding: 16px;
}

// 摘要卡片
.nvr-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 12px 16px;
  padding: 16px;
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
}

.nvr-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.nvr-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nvr-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nvr-name {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
}

.channel-count-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: $radius-pill;
  background: #EDE9FE;
  color: #7C3AED;
}

.nvr-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: $text-secondary;
}

.online-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #9E9E9E;
  &.is-online { background: $success-color; }
}

.nvr-id {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11px;
  color: $text-secondary;
  margin-left: auto;
}

// 通道列表
.channel-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.channel-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
}

.channel-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.channel-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #EEF2FF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4F46E5;
  flex-shrink: 0;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.channel-no {
  font-size: 13px;
  font-weight: 700;
  color: $text-primary;
  flex-shrink: 0;
}

.channel-name {
  font-size: 13px;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.channel-offline {
  font-size: 10px;
  color: $text-secondary;
  padding: 1px 6px;
  border-radius: 8px;
  background: $bg-page;
  flex-shrink: 0;
}

.channel-tail {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.open-btn {
  height: 30px;
  padding: 0 14px;
  font-size: 12px;
}

.cloud-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: $radius-pill;
  &.cloud-active { background: #E8F5E9; color: #34A853; }
  &.cloud-expiring { background: #FFF3E0; color: #F57C00; }
  &.cloud-expired { background: #FFEBEE; color: #E53935; }
}

.expire-text {
  font-size: 11px;
  color: $text-secondary;
  white-space: nowrap;
}

.unbind-btn {
  font-size: 12px;
  color: $danger-color;
  font-weight: 500;
  &:active { opacity: 0.7; }
}

.empty-state {
  padding: 40px 0;
}
</style>
