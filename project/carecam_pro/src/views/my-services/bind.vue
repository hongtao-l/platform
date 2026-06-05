<template>
  <div class="bind-page">
    <van-nav-bar title="绑定设备" left-arrow @click-left="$router.back()" />

    <div v-if="!srv" class="bind-empty-state">
      <van-icon name="warning-o" size="40" color="#9E9E9E" />
      <p>服务不存在</p>
    </div>

    <template v-else>
      <!-- 服务摘要 -->
      <div class="bind-header-card">
        <div class="header-top">
          <span class="header-name">{{ srv.name }}</span>
          <span :class="['srv-type', srv.type === 'multi' ? 'type-multi' : 'type-single']">
            {{ srv.type === 'multi' ? '多设备' : '单设备' }}
          </span>
        </div>
        <div class="header-stats" v-if="srv.type === 'multi'">
          <span class="stat-current">{{ boundList.length }}</span>
          <span class="stat-sep">/</span>
          <span class="stat-max">{{ srv.maxDevices }}</span>
          <span class="stat-label">台</span>
        </div>
        <div class="header-count" v-else>
          {{ boundList.length ? '已绑定 1 台' : '未绑定' }}
        </div>
      </div>

      <!-- 已绑定设备 -->
      <div v-if="boundList.length" class="bound-section">
        <div class="section-title">已绑定设备</div>
        <div class="device-list">
          <div v-for="d in boundList" :key="d.id" class="device-item">
            <div class="device-avatar">
              <van-icon name="video-o" size="22" />
            </div>
            <div class="device-info">
              <span class="device-name">{{ d.name }}</span>
              <span class="device-id">{{ d.deviceId }}</span>
            </div>
            <span class="tag-bound"><van-icon name="success" size="12" /> 已绑定</span>
          </div>
        </div>
      </div>

      <!-- 添加按钮 -->
      <div
        v-if="canAddMore"
        class="add-btn"
        @click="openPopup"
      >
        <van-icon name="plus" size="16" />
        <span>添加绑定设备</span>
      </div>

      <p class="bind-hint">后续查看/管理绑定设备请前往【我的】→【我的服务】</p>

      <!-- 多选弹窗 -->
      <van-popup v-model:show="showPopup" position="bottom" round :style="{ height: '60%' }">
        <div class="popup-wrap">
          <div class="popup-header">
            <span class="popup-title">选择设备</span>
            <span class="popup-done" @click="confirmBind">确定</span>
          </div>

          <div v-if="allDevicesWithStatus.length" class="popup-list">
            <div
              v-for="d in allDevicesWithStatus"
              :key="d.id"
              :class="['popup-item', {
                'is-maxed': !selectedIds.includes(d.id) && isMaxReached,
                'is-disabled': d._disabled
              }]"
              @click="toggleSelect(d)"
            >
              <van-checkbox
                :model-value="selectedIds.includes(d.id)"
                :disabled="d._disabled || (!selectedIds.includes(d.id) && isMaxReached)"
                checked-color="#4F46E5"
              />
              <div class="device-avatar small">
                <van-icon name="video-o" size="18" />
              </div>
              <div class="device-info">
                <span class="device-name">{{ d.name }}</span>
                <span class="device-id">{{ d.deviceId }}</span>
              </div>
              <div class="device-tail">
                <span v-if="d._status === 'unsupported'" class="tag-unsupported">不支持</span>
                <span v-else-if="d._status === 'active'" class="tag-active">已开通</span>
                              </div>
            </div>
          </div>
          <div v-else class="popup-empty">暂无可选设备</div>
        </div>
      </van-popup>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchAvailableDevices, buildDeviceServiceMap } from '@/mock/services'
import { useServicesStore } from '@/composables/useServicesStore'

const route = useRoute()
const router = useRouter()
const { state } = useServicesStore()

const srv = ref(null)
const allDevices = ref([])
const showPopup = ref(false)
const selectedIds = ref([])

const boundList = computed(() => {
  if (!srv.value) return []
  if (srv.value.type === 'multi') return srv.value.boundDevices
  return srv.value.boundDevice ? [srv.value.boundDevice] : []
})

const canAddMore = computed(() => {
  if (!srv.value) return false
  if (srv.value.type === 'single') return !srv.value.boundDevice
  return srv.value.boundDevices.length < srv.value.maxDevices
})

const activeCategoryMap = computed(() => buildDeviceServiceMap(state.services))

const popupDevices = computed(() => {
  const cat = serviceCategory.value
  if (!cat) return []
  return allDevices.value
    .filter((d) => {
      if (!d.supportedCategories?.includes(cat)) return false
      if (activeCategoryMap.value[d.id]?.has(cat)) return false
      return true
    })
})

// 所有设备列表（含不可选标记）
const allDevicesWithStatus = computed(() => {
  const cat = serviceCategory.value
  if (!cat) return []
  return allDevices.value.map((d) => {
    if (!d.supportedCategories?.includes(cat)) {
      return { ...d, _status: 'unsupported', _disabled: true }
    }
    if (activeCategoryMap.value[d.id]?.has(cat)) {
      return { ...d, _status: 'active', _disabled: true }
    }
    return { ...d, _status: 'available', _disabled: false }
  }).sort((a, b) => {
    const order = { available: 0, active: 1, unsupported: 2 }
    return order[a._status] - order[b._status]
  })
})

const maxSlots = computed(() => {
  if (!srv.value) return 0
  if (srv.value.type === 'single') return srv.value.boundDevice ? 0 : 1
  return srv.value.maxDevices - srv.value.boundDevices.length
})

const isMaxReached = computed(() => selectedIds.value.length >= maxSlots.value)

const serviceCategory = computed(() => srv.value?.category || '')

function toggleSelect(device) {
  if (device._disabled) return
  const idx = selectedIds.value.indexOf(device.id)
  if (idx > -1) {
    selectedIds.value.splice(idx, 1)
  } else if (selectedIds.value.length < maxSlots.value) {
    selectedIds.value.push(device.id)
  }
}

function openPopup() {
  const available = allDevicesWithStatus.value.filter((d) => !d._disabled)
  selectedIds.value = available.slice(0, maxSlots.value).map((d) => d.id)
  showPopup.value = true
}

function confirmBind() {
  if (!srv.value || !selectedIds.value.length) return
  const toBind = allDevices.value.filter((d) => selectedIds.value.includes(d.id))
  toBind.forEach((d) => {
    if (srv.value.type === 'multi') {
      srv.value.boundDevices.push({ id: d.id, deviceId: d.deviceId, name: d.name })
    } else {
      srv.value.boundDevice = { id: d.id, deviceId: d.deviceId, name: d.name }
    }
  })
  showPopup.value = false
}

function loadSrv() {
  const srvId = route.query.srvId
  srv.value = state.services.find((s) => s.id === srvId) || null
}

watch(() => route.query.srvId, () => loadSrv(), { immediate: true })

onMounted(async () => {
  try {
    const res = await fetchAvailableDevices()
    if (res.code === 0) allDevices.value = res.data
  } catch { /* ignore */ }
})
</script>

<style lang="scss" scoped>
.bind-page {
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

// 服务摘要
.bind-header-card {
  margin: 12px 16px;
  padding: 16px;
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.header-name {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
}

.srv-type {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: $radius-pill;
  &.type-multi { background-color: #EDE9FE; color: #7C3AED; }
  &.type-single { background-color: #E8F5E9; color: #34A853; }
}

.header-count {
  font-size: 13px;
  color: $primary-color;
  font-weight: 600;
}

.header-stats {
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

// 已绑定设备
.bound-section {
  margin: 0 16px 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: $text-secondary;
  margin-bottom: 10px;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
}

.device-avatar {
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

.device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-name {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
}

.device-id {
  font-size: 11px;
  color: $text-secondary;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.device-tail {
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
}

.tag-unsupported {
  font-size: 10px; color: $text-secondary; padding: 1px 6px;
  border-radius: 8px; background: $bg-page; font-weight: 500;
}

.tag-active {
  font-size: 10px; color: #7C3AED; padding: 1px 6px;
  border-radius: 8px; background: #EDE9FE; font-weight: 500;
}

.is-disabled { opacity: 0.5; }

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
</style>
