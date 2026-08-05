<template>
  <div class="bg-background text-on-background antialiased flex flex-col md:flex-row min-h-screen pb-24 md:pb-0">
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex flex-col w-64 bg-surface-container-lowest border-r border-outline-variant/20 h-screen sticky top-0">
      <div class="p-6">
        <h1 class="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">seemorcam</h1>
      </div>
      <nav class="flex-1 px-4 space-y-2 mt-4">
        <router-link to="/home" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors group">
          <span class="material-symbols-outlined text-outline group-hover:text-primary transition-colors">home</span>
          <span class="font-body-md text-body-md font-medium">Home</span>
        </router-link>
        <router-link to="/messages" class="flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-container text-on-primary-container font-medium group">
          <span class="material-symbols-outlined text-on-primary-container">chat_bubble</span>
          <span class="font-body-md text-body-md">Messages</span>
        </router-link>
        <router-link to="/profile" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors group">
          <span class="material-symbols-outlined text-outline group-hover:text-primary transition-colors">person</span>
          <span class="font-body-md text-body-md font-medium">Profile</span>
        </router-link>
      </nav>
    </aside>

    <main class="flex-1 max-w-4xl w-full mx-auto md:px-0 md:pb-8">
      <div class="px-margin-page md:px-0">
        <!-- Filter Bar -->
        <div class="sticky md:static bg-background/90 backdrop-blur-md z-30 mb-4 flex flex-col gap-4 py-2 top-0 pt-4">
          <div class="flex items-center justify-between px-2">
            <button class="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full text-on-surface hover:bg-surface-container-high transition-colors">
              <span class="font-label-sm text-label-sm font-semibold">Jan 16</span>
              <span class="material-symbols-outlined text-sm">expand_more</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full text-on-surface hover:bg-surface-container-high transition-colors">
              <span class="material-symbols-outlined text-sm">videocam</span>
              <span class="font-label-sm text-label-sm font-semibold">Living Room Cam</span>
              <span class="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
            <div v-for="d in dateList" :key="d.date"
              @click="selectedDate = d.date"
              class="snap-center flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 rounded-lg cursor-pointer transition-colors"
              :class="selectedDate === d.date ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container text-on-surface-variant opacity-60 hover:opacity-100'">
              <span class="text-xs">{{ d.day }}</span><span class="font-semibold">{{ d.date }}</span>
            </div>
          </div>
        </div>

        <!-- Notification List -->
        <div class="space-y-4">
          <div v-for="item in events" :key="item.id"
            class="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/10 flex gap-4 items-start hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
            <div class="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
              <img v-if="item.image" class="w-full h-full object-cover" :src="item.image" :alt="item.title">
              <div v-else class="w-full h-full flex items-center justify-center bg-surface-container-high">
                <span class="material-symbols-outlined text-3xl text-on-surface-variant/30">{{ item.tagIcon }}</span>
              </div>
              <div class="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white font-medium">{{ item.duration }}</div>
            </div>
            <div class="flex-1 min-w-0 py-1">
              <div class="flex justify-between items-start mb-1">
                <h3 class="font-label-sm text-label-sm text-on-surface text-base">{{ item.title }}</h3>
                <span class="text-xs text-on-surface-variant">{{ item.time }}</span>
              </div>
              <p class="font-body-md text-body-md text-sm text-on-surface-variant line-clamp-2">{{ item.desc }}</p>
              <div class="mt-2 flex gap-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="item.tagClass">
                  <span class="material-symbols-outlined text-[12px] mr-1">{{ item.tagIcon }}</span> {{ item.tag }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4 py-2">
            <div class="h-px bg-outline-variant/30 flex-1"></div>
            <span class="text-xs font-medium text-outline">Yesterday</span>
            <div class="h-px bg-outline-variant/30 flex-1"></div>
          </div>

          <div v-for="item in yesterdayEvents" :key="item.id"
            class="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/10 flex gap-4 items-start hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
            <div class="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
              <img v-if="item.image" class="w-full h-full object-cover" :src="item.image" :alt="item.title">
              <div v-else class="w-full h-full flex items-center justify-center bg-surface-container-high">
                <span class="material-symbols-outlined text-3xl text-on-surface-variant/30">{{ item.tagIcon }}</span>
              </div>
              <div class="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white font-medium">{{ item.duration }}</div>
            </div>
            <div class="flex-1 min-w-0 py-1">
              <div class="flex justify-between items-start mb-1">
                <h3 class="font-label-sm text-label-sm text-on-surface text-base">{{ item.title }}</h3>
                <span class="text-xs text-on-surface-variant">{{ item.time }}</span>
              </div>
              <p class="font-body-md text-body-md text-sm text-on-surface-variant line-clamp-2">{{ item.desc }}</p>
              <div class="mt-2 flex gap-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="item.tagClass">
                  <span class="material-symbols-outlined text-[12px] mr-1">{{ item.tagIcon }}</span> {{ item.tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedDate = ref(16)

const dateList = [
  { day: 'Mon', date: 14 },
  { day: 'Tue', date: 15 },
  { day: 'Wed', date: 16 },
  { day: 'Thu', date: 17 },
  { day: 'Fri', date: 18 },
  { day: 'Sat', date: 19 },
]

const events = [
  {
    id: 1,
    title: 'Motion Detected',
    time: '10:45 AM',
    desc: 'Activity spotted in the Living Room.',
    duration: '0:12',
    image: '',
    tag: 'Motion', tagIcon: 'directions_run', tagClass: 'bg-secondary-container text-on-secondary-container'
  },
  {
    id: 2,
    title: 'Pet Detected',
    time: '09:12 AM',
    desc: 'Bella was seen near the feeder.',
    duration: '0:45',
    image: '',
    tag: 'Pet', tagIcon: 'pets', tagClass: 'bg-primary-container text-on-primary-container'
  }
]

const yesterdayEvents = [
  {
    id: 3,
    title: 'Person Detected',
    time: '04:30 PM',
    desc: 'Someone walked through the hallway.',
    duration: '1:20',
    image: '',
    tag: 'Human', tagIcon: 'person', tagClass: 'bg-tertiary-container text-on-tertiary-container'
  }
]
</script>
