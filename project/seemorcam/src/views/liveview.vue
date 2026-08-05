<template>
  <div class="liveview-page">
    <div class="lv-header">
      <button class="lv-back" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
      <div class="lv-info">
        <p class="lv-name">{{ camName }}</p>
        <div class="lv-status">
          <span class="lv-dot"></span>
          <span>LIVE</span>
        </div>
      </div>
      <div class="lv-actions">
        <button class="lv-btn" aria-label="Screenshot">
          <van-icon name="photograph" size="20" />
        </button>
        <button class="lv-btn" aria-label="Talk">
          <van-icon name="volume-o" size="20" />
        </button>
      </div>
    </div>

    <div class="lv-feed">
      <div class="lv-placeholder">
        <van-icon name="video-o" size="64" color="rgba(255,255,255,0.2)" />
        <p>Camera feed loading...</p>
      </div>
      <div class="lv-overlay-info">
        <span class="lv-timestamp">{{ currentTime }}</span>
        <span class="lv-resolution">1080p HD</span>
      </div>
    </div>

    <div class="lv-controls">
      <button class="lvc-item" aria-label="Screenshot">
        <div class="lvc-icon"><van-icon name="photograph" size="22" /></div>
        <span>Screenshot</span>
      </button>
      <button class="lvc-item lvc-talk" aria-label="Talk">
        <div class="lvc-icon"><van-icon name="volume-o" size="22" /></div>
        <span>Talk</span>
      </button>
      <button class="lvc-item" aria-label="Record">
        <div class="lvc-icon"><van-icon name="video-o" size="22" /></div>
        <span>Record</span>
      </button>
      <button class="lvc-item" aria-label="More">
        <div class="lvc-icon"><van-icon name="ellipsis" size="22" /></div>
        <span>More</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const camName = ref(route.query.name || 'Camera')
const currentTime = ref('')

let timer
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}
updateTime()
timer = setInterval(updateTime, 1000)
onUnmounted(() => clearInterval(timer))

const goBack = () => router.back()
</script>

<style lang="scss" scoped>
.liveview-page {
  min-height: 100vh; min-height: 100dvh;
  background: #1A1006;
  display: flex; flex-direction: column;
}

.lv-header {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 16px;
  background: rgba(15, 10, 5, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: sticky; top: 0; z-index: 10;
}
.lv-back, .lv-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.10);
  display: flex; align-items: center; justify-content: center;
  color: #fff; cursor: pointer; transition: background .15s;
  &:active { background: rgba(255,255,255,0.20); }
}
.lv-info { flex: 1; }
.lv-name { font-size: 16px; font-weight: 700; color: #fff; line-height: 1.2; font-family: 'Varela Round', sans-serif; }
.lv-status { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: $success-color; }
.lv-dot { width: 6px; height: 6px; border-radius: 50%; background: $success-color; animation: pulse 1.8s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
.lv-actions { display: flex; gap: 8px; }

.lv-feed {
  flex: 1; position: relative;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 50% 40%, rgba(249,115,22,.08) 0%, transparent 60%),
              linear-gradient(180deg, #1A1006, #2D1A0A);
}
.lv-placeholder {
  text-align: center; color: rgba(255,255,255,0.2);
  p { margin-top: 12px; font-size: 13px; font-weight: 500; }
}
.lv-overlay-info {
  position: absolute; top: 12px; right: 14px;
  display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
}
.lv-timestamp {
  padding: 4px 10px; border-radius: $radius-full;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
  font-size: 12px; font-weight: 600; color: #fff;
  font-variant-numeric: tabular-nums;
}
.lv-resolution {
  padding: 3px 9px; border-radius: 8px;
  background: rgba(249,115,22,0.85);
  font-size: 10px; font-weight: 800; color: #fff;
  text-transform: uppercase; letter-spacing: .5px;
}

.lv-controls {
  display: flex; justify-content: space-around;
  padding: 18px 20px;
  padding-bottom: calc(18px + env(safe-area-inset-bottom, 8px));
  background: rgba(15, 10, 5, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.lvc-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  cursor: pointer; color: #fff; transition: opacity .15s;
  &:active { opacity: .7; }
  span { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.65); }
}
.lvc-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: rgba(255,255,255,0.10);
  display: flex; align-items: center; justify-content: center;
}
.lvc-talk .lvc-icon { background: $primary-color; }
</style>
