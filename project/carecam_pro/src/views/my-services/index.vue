<template>
  <div class="ms-page">
    <van-nav-bar title="我的服务" left-arrow @click-left="$router.back()" />

    <div v-if="loading" class="ms-loading">
      <van-skeleton title :row="3" v-for="i in 3" :key="i" style="margin-bottom:12px" />
    </div>

    <div v-else class="ms-list">
      <div v-for="srv in state.services" :key="srv.id" class="service-card">
        <div class="srv-header">
          <span class="srv-name">{{ srv.name }}</span>
          <span :class="['srv-type', srv.type === 'multi' ? 'type-multi' : 'type-single']">
            {{ srv.type === 'multi' ? '多设备' : '单设备' }}
          </span>
        </div>

        <div class="srv-expire">
          <van-icon name="clock-o" size="14" />
          <span>有效期至 {{ srv.expireDate }}</span>
        </div>

        <div class="srv-features">
          <span v-for="(f, i) in srv.features" :key="i" class="feature-item">
            <van-icon name="success" size="12" color="#34A853" />
            {{ f }}
          </span>
        </div>

        <div class="srv-devices">
          <div class="devices-label">
            绑定设备
            <span class="devices-count">
              <template v-if="srv.type === 'multi'">{{ srv.boundDevices.length }}/{{ srv.maxDevices }} 台</template>
              <template v-else>{{ srv.boundDevice ? '已绑定' : '未绑定' }}</template>
            </span>
          </div>
          <div
            v-if="srv.type === 'multi' && srv.boundDevices.length < srv.maxDevices"
            class="bind-btn"
            @click="goBind(srv.id)"
          >
            去绑定 <van-icon name="arrow" size="14" />
          </div>
          <div
            v-else-if="srv.type === 'single' && !srv.boundDevice"
            class="bind-btn"
            @click="goBind(srv.id)"
          >
            去绑定 <van-icon name="arrow" size="14" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMyServices } from '@/mock/services'
import { useServicesStore } from '@/composables/useServicesStore'

const router = useRouter()
const { state } = useServicesStore()
const loading = ref(true)

async function loadServices() {
  if (state.loaded) {
    loading.value = false
    return
  }
  try {
    const res = await fetchMyServices()
    if (res.code === 0) {
      state.services = res.data
      state.loaded = true
    }
  } finally {
    loading.value = false
  }
}

function goBind(srvId) {
  router.push(`/my-services/bind?srvId=${srvId}`)
}

onMounted(() => { loadServices() })
</script>

<style lang="scss" scoped>
.ms-page {
  min-height: 100%;
  background-color: $bg-page;
  padding-bottom: 24px;
}

.ms-loading {
  padding: 16px;
}

.ms-list {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 16px;
  box-shadow: $shadow-card;
}

.srv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.srv-name {
  font-size: 15px;
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

.srv-expire {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: $text-secondary;
  margin-bottom: 12px;
}

.srv-features {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-bottom: 14px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: $text-secondary;
  white-space: nowrap;
}

.srv-devices {
  padding-top: 12px;
  border-top: 1px solid $border-color;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.devices-label {
  font-size: 12px;
  color: $text-secondary;
}

.devices-count {
  color: $primary-color;
  font-weight: 600;
}

.bind-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: $radius-pill;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  &:active { opacity: 0.85; }
}
</style>
