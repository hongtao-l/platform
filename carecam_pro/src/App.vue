<template>
  <div class="app-wrapper">
    <div class="app-container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss">
/* 开发环境 - 模拟手机屏幕 */
.app-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1a1a1a;
  overflow: hidden;
}

.app-container {
  width: 375px;
  height: 812px;
  background-color: #F5F7FA;
  overflow: hidden;
  position: relative;
  border-radius: 40px;
  box-shadow: 
    0 0 0 12px #333,
    0 0 0 14px #1a1a1a,
    0 30px 80px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  
  /* 缩放比例，让整个APP在浏览器中间显示 */
  transform: scale(0.2);
  transform-origin: center center;
  
  /* 模拟手机顶部刘海 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 30px;
    background-color: #1a1a1a;
    border-radius: 0 0 20px 20px;
    z-index: 9999;
  }
}

#app {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
