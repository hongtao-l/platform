<template>
  <div class="app-panel">
    <div class="app-panel-head">APP 控制面板预览</div>
    <div class="app-panel-tip">示例：以PTZ控制能力为例；选「支持」→ PTZ 控制台显示；选「不支持」→ PTZ 控制台隐藏</div>
    <div class="phone">
      <div class="phone-screen">
        <div class="phone-device-name">
          <span class="phone-status-dot"></span>
          Camera_1 · 在线
        </div>
        <div class="phone-video">
          <img class="phone-video-img" src="/camera-feed.jpg" alt="" />
          <span class="phone-rec">● REC</span>
          <span class="phone-time">12:08:32</span>
        </div>
        <div class="phone-ptz">
          <div class="phone-ptz-title">PTZ 控制台</div>
          <div class="phone-ptz-pad">
            <span class="ptz-btn ptz-up">▲</span>
            <span class="ptz-btn ptz-left">◀</span>
            <span class="ptz-btn ptz-center">◎</span>
            <span class="ptz-btn ptz-right">▶</span>
            <span class="ptz-btn ptz-down">▼</span>
          </div>
        </div>
        <div class="phone-ctrls">
          <div class="phone-ctrl">对讲</div>
          <div class="phone-ctrl">拍照</div>
          <div class="phone-ctrl">录像</div>
          <div class="phone-ctrl">回放</div>
          <div class="phone-ctrl">设置</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-panel {
  padding: 20px 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.app-panel-head {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 12px;
}

.phone {
  width: 260px;
  margin: 0 auto;
  background: #111827;
  border-radius: 32px;
  padding: 12px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
}

.phone-screen {
  background: #f5f7fa;
  border-radius: 22px;
  padding: 16px 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.phone-device-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.phone-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #67c23a;
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
}

.phone-video {
  position: relative;
  height: 180px;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(160deg, #5b6b7a 0%, #2f3b47 55%, #1b2530 100%);
}
.phone-video::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.35) 100%);
  pointer-events: none;
}

.phone-video-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.phone-rec,
.phone-time {
  position: absolute;
  top: 8px;
  font-size: 11px;
  color: #fff;
  background: rgba(0, 0, 0, 0.42);
  padding: 2px 8px;
  border-radius: 4px;
  line-height: 1.4;
}

.phone-rec { left: 8px; font-weight: 600; }
.phone-time { right: 8px; font-variant-numeric: tabular-nums; }

.phone-ptz {
  border: 1px solid #4992FE;
  border-radius: 10px;
  padding: 10px 12px;
  background: #f5faff;
  box-shadow: 0 0 0 3px rgba(73, 146, 254, 0.08);
  animation: ptz-breathe 2.4s ease-in-out infinite;
}

@keyframes ptz-breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.phone-ptz-title {
  font-size: 12px;
  font-weight: 600;
  color: #4992FE;
  text-align: center;
  margin-bottom: 8px;
}

.phone-ptz-pad {
  display: grid;
  grid-template-columns: repeat(3, 36px);
  grid-template-rows: repeat(3, 36px);
  gap: 6px;
  justify-content: center;
  grid-template-areas:
    ". up ."
    "left center right"
    ". down .";
}

.ptz-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #409eff;
  background: #eef6ff;
  border: 1px solid #d5e8ff;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
}

.ptz-up { grid-area: up; }
.ptz-left { grid-area: left; }
.ptz-center {
  grid-area: center;
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}
.ptz-right { grid-area: right; }
.ptz-down { grid-area: down; }

.phone-ctrls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.phone-ctrl {
  height: 38px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #303133;
}

.app-panel-tip {
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>
