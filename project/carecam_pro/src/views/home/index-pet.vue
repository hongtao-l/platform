<template>
  <div class="pet-home">
    <!-- Top Bar: Clean, minimal -->
    <div class="top-bar">
      <div class="tb-left">
        <div class="avatar" @click="goToMe">
          <span>J</span>
        </div>
        <div>
          <div class="greeting">Good morning</div>
          <div class="username">James</div>
        </div>
      </div>
      <div class="tb-right">
        <div class="icon-btn" @click="goToMessage">
          <van-icon name="bell" size="20" />
          <span v-if="unreadCount" class="badge">{{ unreadCount }}</span>
        </div>
      </div>
    </div>

    <!-- Camera Story Row: Circular previews, horizontal scroll -->
    <div class="story-row">
      <div
        v-for="cam in cameras"
        :key="cam.id"
        class="story-item"
        @click="goToLiveView(cam)"
      >
        <div class="story-ring" :class="{ live: cam.status === 'online' }">
          <div class="story-thumb" :style="{ background: cam.bgGradient }">
            <van-icon name="video-o" size="24" color="rgba(255,255,255,0.6)" />
          </div>
          <span v-if="cam.status === 'online'" class="live-pulse"></span>
        </div>
        <span class="story-label">{{ cam.room }}</span>
      </div>
      <div class="story-item" @click="showAddDevice = true">
        <div class="story-ring add">
          <div class="story-thumb add-thumb">
            <van-icon name="plus" size="24" color="#9CA3AF" />
          </div>
        </div>
        <span class="story-label">Add</span>
      </div>
    </div>

    <!-- Featured Event: Big hero card with the latest pet activity -->
    <div class="featured-card" @click="goToLatestEvent">
      <div class="fc-bg" :style="{ background: latestEvent.bg }"></div>
      <div class="fc-overlay"></div>
      <div class="fc-content">
        <div class="fc-tag">{{ latestEvent.type }}</div>
        <h2 class="fc-title">{{ latestEvent.title }}</h2>
        <div class="fc-meta">
          <span class="fc-camera">{{ latestEvent.camera }}</span>
          <span class="fc-time">{{ latestEvent.time }}</span>
        </div>
      </div>
      <div class="fc-pager">
        <span class="fc-dot active"></span>
        <span class="fc-dot"></span>
        <span class="fc-dot"></span>
      </div>
    </div>

    <!-- Quick Glance Stats: Big numbers -->
    <div class="glance-stats">
      <div class="glance-item" v-for="s in stats" :key="s.label">
        <div class="glance-ring">
          <span class="glance-value">{{ s.value }}</span>
        </div>
        <span class="glance-label">{{ s.label }}</span>
      </div>
    </div>

    <!-- Moments: Horizontal scroll cards with pet photos feel -->
    <div class="section-label">
      <span>Recent Moments</span>
    </div>
    <div class="moments-scroll">
      <div
        v-for="(m, i) in moments"
        :key="i"
        class="moment-card"
        @click="goToEvent(m)"
      >
        <div class="mc-media" :style="{ background: m.bg }">
          <div class="mc-icon-wrap">
            <van-icon :name="m.icon" size="28" :color="m.iconColor" />
          </div>
          <div class="mc-time-badge">{{ m.timeLabel }}</div>
        </div>
        <div class="mc-body">
          <div class="mc-pet">{{ m.pet }}</div>
          <div class="mc-desc">{{ m.desc }}</div>
        </div>
      </div>
    </div>

    <!-- Device Cards -->
    <div class="section-label">
      <span>Devices</span>
    </div>
    <div class="device-list">
      <div
        v-for="cam in cameras"
        :key="cam.id"
        class="device-card"
        @click="goToLiveView(cam)"
      >
        <div class="dc-thumb" :style="{ background: cam.bgGradient }">
          <van-icon name="video-o" size="24" color="rgba(255,255,255,0.6)" />
        </div>
        <div class="dc-info">
          <div class="dc-name">{{ cam.name }}</div>
          <div class="dc-room">{{ cam.room }}</div>
        </div>
        <div class="dc-status">
          <span :class="['dc-dot', cam.status]" />
          <span>{{ cam.status === 'online' ? 'Live' : 'Offline' }}</span>
        </div>
      </div>
    </div>

    <!-- Bento Grid: Mixed-size feature cards -->
    <div class="section-label">
      <span>Features</span>
    </div>
    <div class="bento-grid">
      <div class="bento-item tall" @click="goToAi">
        <div class="bento-inner ai-bento">
          <van-icon name="certificate" size="28" color="#fff" />
          <div class="bento-title">AI Guardian</div>
          <div class="bento-desc">Smart alerts for bark, movement, and unusual activity</div>
          <div class="bento-chip">Active</div>
        </div>
      </div>
      <div class="bento-item" @click="goToPlayback">
        <div class="bento-inner playback-bento">
          <van-icon name="clock-o" size="24" color="#fff" />
          <div class="bento-title">Playback</div>
          <div class="bento-desc">Last 7 days</div>
        </div>
      </div>
      <div class="bento-item" @click="goToSettings">
        <div class="bento-inner settings-bento">
          <van-icon name="setting-o" size="24" color="#fff" />
          <div class="bento-title">Settings</div>
          <div class="bento-desc">4 devices</div>
        </div>
      </div>
    </div>

    <div class="bottom-safe"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { resolveDeviceRoute } from '@/utils/deviceType'

const router = useRouter()
const unreadCount = ref(3)

const cameras = ref([
  { id: 'cam001', name: 'Living Room Cam', room: 'Living Room', status: 'online', bgGradient: 'linear-gradient(135deg, #1a3a2a, #2d5a3d)' },
  { id: 'cam002', name: 'Backyard Cam', room: 'Backyard', status: 'online', bgGradient: 'linear-gradient(135deg, #5a7a3a, #8aaa4d)' },
  { id: 'cam003', name: 'Entrance Cam', room: 'Entrance', status: 'online', bgGradient: 'linear-gradient(135deg, #1a2a3d, #2d3d5a)' },
  { id: 'cam004', name: 'Kitchen Cam', room: 'Kitchen', status: 'offline', bgGradient: 'linear-gradient(135deg, #3d2a1a, #5a3d2d)' },
])

const latestEvent = ref({
  type: 'Pet Activity',
  title: 'Max is playing with his new toy in the living room',
  camera: 'Living Room Cam',
  time: 'Just now',
  bg: 'linear-gradient(160deg, #2d5a3d 0%, #4a8a5a 50%, #6aaa70 100%)'
})

const stats = ref([
  { value: '4', label: 'Cameras' },
  { value: '3', label: 'Online' },
  { value: '12', label: 'Events' },
  { value: '7d', label: 'History' },
])

const moments = ref([
  { pet: 'Max', desc: 'Running in the backyard', timeLabel: '10m ago', icon: 'flower-o', iconColor: '#FBBC04', bg: 'linear-gradient(135deg, #fef9e7, #fdebd0)' },
  { pet: 'Bella', desc: 'Sleeping on the couch', timeLabel: '28m ago', icon: 'home-o', iconColor: '#8E6FAD', bg: 'linear-gradient(135deg, #f3eef9, #e8daf0)' },
  { pet: 'Max', desc: 'Eating lunch by the bowl', timeLabel: '1h ago', icon: 'orders-o', iconColor: '#34A853', bg: 'linear-gradient(135deg, #e8f5e9, #d0e8d0)' },
  { pet: 'Buddy', desc: 'Barking at the door', timeLabel: '2h ago', icon: 'audio', iconColor: '#EA4335', bg: 'linear-gradient(135deg, #ffebee, #ffcdd2)' },
])

const goToLiveView = (cam) => {
  const route = resolveDeviceRoute(cam.name)
  router.push({ path: route, query: { deviceId: cam.id, deviceName: cam.name } })
}
const goToMe = () => router.push('/me')
const goToMessage = () => router.push('/message')
const goToAi = () => router.push('/ai')
const goToPlayback = () => router.push('/playback')
const goToSettings = () => router.push('/settings')
const goToLatestEvent = () => router.push('/message')
const goToEvent = (m) => router.push('/message')
</script>

<style lang="scss" scoped>
.pet-home {
  min-height: 100%;
  background: #FAFAF8;
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

/* ===== Top Bar ===== */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #FAFAF8;
}
.tb-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5A623, #F7C948);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.greeting { font-size: 12px; color: #9CA3AF; line-height: 1.3; }
.username { font-size: 16px; font-weight: 700; color: #1A1A2E; line-height: 1.3; }
.tb-right { display: flex; gap: 8px; }
.icon-btn {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #1A1A2E;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: transform 0.15s ease;
  &:active { transform: scale(0.94); }
}
.badge {
  position: absolute;
  top: 6px; right: 6px;
  min-width: 18px; height: 18px;
  border-radius: 9px;
  background: #EA4335;
  color: #fff;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff;
}

/* ===== Story Row ===== */
.story-row {
  display: flex;
  gap: 16px;
  padding: 8px 20px 20px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
}
.story-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.15s ease;
  &:active { transform: scale(0.94); }
}
.story-ring {
  width: 70px; height: 70px;
  border-radius: 50%;
  padding: 3px;
  border: 2px solid #E5E7EB;
  &.live { border-color: #34A853; }
  &.add { border-style: dashed; border-color: #D1D5DB; }
}
.story-thumb {
  width: 100%; height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.add-thumb { background: #F3F4F6; }
.live-pulse {
  position: absolute;
  bottom: -2px; right: -2px;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #34A853;
  border: 2px solid #fff;
  animation: pulse-ring 2s ease-in-out infinite;
}
@keyframes pulse-ring {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52,168,83,0.4); }
  50% { box-shadow: 0 0 0 6px rgba(52,168,83,0); }
}
.story-label {
  font-size: 11px;
  font-weight: 600;
  color: #1A1A2E;
  max-width: 70px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Featured Card ===== */
.featured-card {
  margin: 0 20px 20px;
  border-radius: 24px;
  height: 220px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  &:active { transform: scale(0.97); }
}
.fc-bg {
  position: absolute; inset: 0;
}
.fc-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%);
}
.fc-content {
  position: absolute;
  bottom: 32px; left: 20px; right: 20px;
  z-index: 1;
}
.fc-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 100px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  font-size: 10px; font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}
.fc-title {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 6px;
  letter-spacing: -0.3px;
}
.fc-meta {
  display: flex; gap: 10px;
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  font-weight: 500;
}
.fc-pager {
  position: absolute;
  bottom: 12px; left: 50%;
  transform: translateX(-50%);
  display: flex; gap: 6px;
  z-index: 1;
}
.fc-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  &.active { background: #fff; width: 20px; border-radius: 3px; }
}

/* ===== Glance Stats ===== */
.glance-stats {
  display: flex;
  justify-content: space-around;
  padding: 0 8px 24px;
}
.glance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.glance-ring {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.glance-value {
  font-size: 20px; font-weight: 800;
  color: #1A1A2E;
}
.glance-label {
  font-size: 11px;
  color: #9CA3AF;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===== Section Label ===== */
.section-label {
  padding: 0 20px 12px;
  span {
    font-size: 15px; font-weight: 700;
    color: #1A1A2E;
    letter-spacing: -0.2px;
  }
}

/* ===== Moments Scroll ===== */
.moments-scroll {
  display: flex;
  gap: 12px;
  padding: 0 20px 24px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
}
.moment-card {
  min-width: 150px;
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  flex-shrink: 0;
  transition: transform 0.15s ease;
  &:active { transform: scale(0.96); }
}
.mc-media {
  height: 110px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mc-icon-wrap {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: rgba(255,255,255,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mc-time-badge {
  position: absolute;
  top: 8px; right: 8px;
  padding: 3px 8px;
  border-radius: 8px;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  font-size: 10px; font-weight: 600;
  color: #fff;
}
.mc-body { padding: 12px; }
.mc-pet { font-size: 14px; font-weight: 700; color: #1A1A2E; margin-bottom: 2px; }
.mc-desc { font-size: 12px; color: #6B7280; }

/* ===== Device Cards ===== */
.device-list {
  padding: 0 20px 24px;
}
.device-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: transform 0.15s ease;
  margin-bottom: 8px;
  &:active { transform: scale(0.98); }
}
.dc-thumb {
  width: 52px; height: 52px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dc-info { flex: 1; min-width: 0; }
.dc-name { font-size: 14px; font-weight: 700; color: #1A1A2E; margin-bottom: 2px; }
.dc-room { font-size: 12px; color: #6B7280; }
.dc-status {
  display: flex; align-items: center;
  gap: 4px;
  font-size: 11px; font-weight: 600; color: #6B7280;
  flex-shrink: 0;
}
.dc-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  &.online { background: #34A853; }
  &.offline { background: #9CA3AF; }
}

/* ===== Bento Grid ===== */
.bento-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 160px 140px;
  gap: 12px;
  padding: 0 20px 24px;
}
.bento-item {
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease;
  &:active { transform: scale(0.96); }
  &.tall { grid-row: span 2; }
}
.bento-inner {
  width: 100%; height: 100%;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.ai-bento {
  background: linear-gradient(160deg, #2d5a3d, #4a8a5a);
  .bento-title { color: #fff; }
  .bento-desc { color: rgba(255,255,255,0.7); }
}
.playback-bento {
  background: linear-gradient(160deg, #1a2a3d, #2d4a6e);
  .bento-title { color: #fff; }
  .bento-desc { color: rgba(255,255,255,0.7); }
}
.settings-bento {
  background: linear-gradient(160deg, #3d2a1a, #6e4a2d);
  .bento-title { color: #fff; }
  .bento-desc { color: rgba(255,255,255,0.7); }
}
.bento-title {
  font-size: 16px; font-weight: 800;
  margin-top: auto;
  margin-bottom: 2px;
  letter-spacing: -0.2px;
}
.bento-desc {
  font-size: 11px; line-height: 1.4;
}
.bento-chip {
  display: inline-block;
  align-self: flex-start;
  margin-top: 10px;
  padding: 4px 10px;
  border-radius: 100px;
  background: rgba(255,255,255,0.2);
  font-size: 10px; font-weight: 700;
  color: #a8daa8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.bottom-safe { height: 24px; }
</style>
