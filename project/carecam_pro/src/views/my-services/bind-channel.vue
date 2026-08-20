<template>
  <div class="bind-channel-page">
    <van-nav-bar title="绑定通道" left-arrow @click-left="$router.back()" />

    <div v-if="!srv" class="bind-empty-state">
      <van-icon name="warning-o" size="40" color="#9E9E9E" />
      <p>服务不存在</p>
    </div>

    <template v-else>
      <!-- 套餐摘要 -->
      <div class="summary-card">
        <div class="summary-top">
          <span class="summary-name">{{ srv.name }}</span>
          <span class="srv-type type-nvr">多通道</span>
        </div>
        <div class="summary-stats">
          <span class="stat-current">{{ boundList.length }}</span>
          <span class="stat-sep">/</span>
          <span class="stat-max">{{ srv.maxChannels }}</span>
          <span class="stat-label">路</span>
        </div>
      </div>

      <!-- 已绑定通道 -->
      <div v-if="boundList.length" class="bound-section">
        <div class="section-title">已绑定通道</div>
        <div class="channel-list">
          <div v-for="ch in boundList" :key="ch.chNo" class="channel-item">
            <div class="channel-avatar">
              <van-icon name="video-o" size="22" />
            </div>
            <div class="channel-info">
              <span class="channel-no">CH{{ ch.chNo }}</span>
              <span class="channel-name">{{ ch.name }}</span>
            </div>
            <span class="tag-bound"><van-icon name="success" size="12" /> 已绑定</span>
            <span class="unbind-btn" @click="confirmUnbind(ch)">解绑</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-bound">
        <van-empty description="暂未绑定通道" />
      </div>

      <!-- 添加绑定按钮 -->
      <div v-if="canAddMore" class="add-btn" @click="openPopup">
        <van-icon name="plus" size="16" />
        <span>添加绑定通道</span>
      </div>

      <p class="bind-hint">后续查看/管理绑定通道请前往【我的】→【我的服务】</p>

      <!-- 通道多选弹窗 -->
      <van-popup v-model:show="showPopup" position="bottom" round :style="{ height: '60%' }">
        <div class="popup-wrap">
          <div class="popup-header">
            <span class="popup-title">选择通道</span>
            <span class="popup-done" @click="confirmBind">确定</span>
          </div>

          <div v-if="unboundChannelsWithStatus.length" class="popup-list">
            <div
              v-for="ch in unboundChannelsWithStatus"
              :key="ch.chNo"
              :class="['popup-item', {
                'is-maxed': !selectedChNos.includes(ch.chNo) && isMaxReached,
                'is-disabled': !ch.online
              }]"
              @click="toggleSelect(ch)"
            >
              <van-checkbox
                :model-value="selectedChNos.includes(ch.chNo)"
                :disabled="!ch.online || (!selectedChNos.includes(ch.chNo) && isMaxReached)"
                checked-color="#4F46E5"
              />
              <div class="channel-avatar small">
                <van-icon name="video-o" size="18" />
              </div>
              <div class="channel-info">
                <span class="channel-no">CH{{ ch.chNo }}</span>
                <span class="channel-name">{{ ch.name }}</span>
              </div>
              <div class="channel-tail">
                <span v-if="!ch.online" class="tag-offline">离线</span>
              </div>
            </div>
          </div>
          <div v-else class="popup-empty">暂无可绑定通道</div>
        </div>
      </van-popup>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { fetchNvrChannels, fetchMyServices } from '@/mock/services'
import { useServicesStore } from '@/composables/useServicesStore'

const route = useRoute()
const router = useRouter()
const { state } = useServicesStore()

const srv = ref(null)
const nvr = ref(null)
const showPopup = ref(false)
const selectedChNos = ref([])

const boundList = computed(() => (srv.value ? srv.value.boundChannels : []))

const canAddMore = computed(() => {
  if (!srv.value) return false
  return srv.value.boundChannels.length < srv.value.maxChannels
})

// 未绑定通道（排除已绑定）
const unboundChannels = computed(() => {
  if (!nvr.value) return []
  const boundNos = new Set(boundList.value.map((ch) => ch.chNo))
  return nvr.value.channels.filter((ch) => !boundNos.has(ch.chNo))
})

const unboundChannelsWithStatus = computed(() => {
  return unboundChannels.value.map((ch) => ({ ...ch }))
})

const maxSlots = computed(() => {
  if (!srv.value) return 0
  return srv.value.maxChannels - srv.value.boundChannels.length
})

const isMaxReached = computed(() => selectedChNos.value.length >= maxSlots.value)

function toggleSelect(ch) {
  if (!ch.online) return
  const idx = selectedChNos.value.indexOf(ch.chNo)
  if (idx > -1) {
    selectedChNos.value.splice(idx, 1)
  } else if (selectedChNos.value.length < maxSlots.value) {
    selectedChNos.value.push(ch.chNo)
  }
}

function openPopup() {
  const available = unboundChannelsWithStatus.value.filter((ch) => ch.online)
  selectedChNos.value = available.slice(0, maxSlots.value).map((ch) => ch.chNo)
  showPopup.value = true
}

function confirmBind() {
  if (!srv.value || !selectedChNos.value.length) return
  const toBind = nvr.value.channels.filter((ch) => selectedChNos.value.includes(ch.chNo))
  toBind.forEach((ch) => {
    srv.value.boundChannels.push({ chNo: ch.chNo, name: ch.name, online: ch.online })
  })
  showPopup.value = false
}

async function confirmUnbind(ch) {
  try {
    await showConfirmDialog({
      title: '解绑通道',
      message: `解绑通道 CH${ch.chNo} 后，该通道云存将停止，确定解绑？`,
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    srv.value.boundChannels = srv.value.boundChannels.filter((c) => c.chNo !== ch.chNo)
  } catch { /* 用户取消 */ }
}

function loadSrv() {
  const srvId = route.query.srvId
  srv.value = state.services.find((s) => s.id === srvId) || null
}

watch(() => route.query.srvId, () => loadSrv(), { immediate: true })

onMounted(async () => {
  try {
    if (!state.loaded) {
      const res = await fetchMyServices()
      if (res.code === 0) { state.services = res.data; state.loaded = true }
    }
    loadSrv()
    const nvrId = srv.value?.nvrDevice?.id
    if (nvrId) {
      const nvrRes = await fetchNvrChannels(nvrId)
      if (nvrRes.code === 0) nvr.value = nvrRes.data
    }
  } catch { /* ignore */ }
})
</script>

<style lang="scss" scoped>
.bind-channel-page {
  min-height: 100%;
  background-color: $bg-page;
  padding-bottom: 24px;
}

.bind-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
  gap: 12px;
  p { color: $text-secondary; font-size: 14px; }
}

// 摘要卡片
.summary-card {
  margin: 12px 16px;
  padding: 16px;
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.summary-name {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
}

.srv-type {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: $radius-pill;
  &.type-nvr { background-color: #EDE9FE; color: #7C3AED; }
}

.summary-stats {
  display: flex;
  align-items: baseline;
  margin-top: 6px;
}

.stat-current {
  font-size: 28px;
  font-weight: 700;
  color: $primary-color;
}

.stat-sep {
  font-size: 20px;
  color: $text-secondary;
  margin: 0 4px;
}

.stat-max {
  font-size: 20px;
  font-weight: 500;
  color: $text-secondary;
}

.stat-label {
  font-size: 12px;
  color: $text-secondary;
  margin-left: 4px;
}

// 已绑定通道
.bound-section {
  margin: 0 16px 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: $text-secondary;
  margin-bottom: 10px;
}

.channel-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
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
  &.small { width: 32px; height: 32px; border-radius: 8px; }
}

.channel-info {
  flex: 1;
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

.channel-tail {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-bound {
  font-size: 11px;
  color: #34A853;
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
  flex-shrink: 0;
}

.tag-offline {
  font-size: 10px;
  color: $text-secondary;
  padding: 1px 6px;
  border-radius: 8px;
  background: $bg-page;
  font-weight: 500;
}

.unbind-btn {
  font-size: 12px;
  color: $danger-color;
  font-weight: 500;
  flex-shrink: 0;
  &:active { opacity: 0.7; }
}

.empty-bound {
  margin: 8px 16px;
}

// 添加按钮
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0 16px;
  padding: 14px;
  border: 1px dashed $primary-color;
  border-radius: $radius-md;
  color: $primary-color;
  font-size: 14px;
  font-weight: 500;
  &:active { background-color: #EEF2FF; }
}

.bind-hint {
  text-align: center;
  font-size: 11px;
  color: $text-secondary;
  margin: 16px 16px 0;
  line-height: 1.6;
}

// 弹窗
.popup-wrap {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.popup-title {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
}

.popup-done {
  font-size: 15px;
  font-weight: 600;
  color: $primary-color;
  &:active { opacity: 0.7; }
}

.popup-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.popup-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: $bg-page;
  border-radius: $radius-md;
  &:active { background-color: #EEF2FF; }
  &.is-maxed { opacity: 0.45; }
}

.popup-empty {
  text-align: center;
  padding: 40px 0;
  color: $text-secondary;
  font-size: 14px;
}

.is-disabled { opacity: 0.5; }
</style>
