<template>
  <div class="min-h-screen bg-background pb-20">
    <router-view />

    <nav class="md:hidden fixed bottom-0 left-0 w-full h-20 flex justify-around items-center px-4 pb-safe bg-surface-container-lowest shadow-lg border-t border-outline-variant/20 z-50 rounded-t-xl">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="flex flex-col items-center justify-center hover:bg-surface-container-low transition-colors w-16 h-16 rounded-xl"
        :class="route.path === tab.path ? 'text-primary font-bold' : 'text-on-surface-variant'"
      >
        <span class="material-symbols-outlined mb-1" :style="tabIconStyle(tab.path)">{{ tab.icon }}</span>
        <span class="font-label-sm text-label-sm mt-1">{{ tab.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { path: '/home', icon: 'home', label: 'Home' },
  { path: '/messages', icon: 'chat_bubble', label: 'Messages' },
  { path: '/profile', icon: 'person', label: 'Profile' }
]

function tabIconStyle(path) {
  return {
    fontVariationSettings: route.path === path ? "'FILL' 1" : "'FILL' 0"
  }
}
</script>
