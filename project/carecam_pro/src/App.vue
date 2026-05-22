<template>
  <div class="app-wrapper">
    <div class="app-container" :style="{ transform: `scale(${scale})` }">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)

const PAD = 80
const scale = computed(() => Math.min((vw.value - PAD) / 375, (vh.value - PAD) / 812, 1))

const onResize = () => {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
}

onMounted(() => { window.addEventListener('resize', onResize) })
onUnmounted(() => { window.removeEventListener('resize', onResize) })
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
  transform-origin: center center;

}

#app {
  width: 100%;
  height: 100%;
}
</style>
