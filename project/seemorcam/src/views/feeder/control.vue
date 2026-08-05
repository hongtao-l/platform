<template>
  <div class="bg-surface text-on-surface antialiased font-body-md min-h-screen pb-12">
    <!-- Header -->
    <header class="flex justify-between items-center px-margin-page h-16 w-full pt-4 sticky top-0 z-10 bg-surface/80 backdrop-blur-md">
      <button @click="$router.back()" aria-label="Go back" class="w-10 h-10 flex items-center justify-start hover:opacity-70 transition-opacity">
        <span class="material-symbols-outlined text-[28px]">arrow_back</span>
      </button>
      <h1 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{{ store.device.name }}</h1>
      <button aria-label="Settings" class="w-10 h-10 flex items-center justify-end hover:opacity-70 transition-opacity">
        <span class="material-symbols-outlined text-[28px]">settings</span>
      </button>
    </header>

    <main class="flex flex-col items-center">
      <!-- Status Indicator -->
      <div class="flex items-center gap-2 mt-4 bg-surface-container-low px-3 py-1 rounded-full">
        <div class="w-2 h-2 rounded-full bg-secondary"></div>
        <span class="text-secondary font-label-sm text-label-sm">Online</span>
      </div>

      <!-- Product Hero Image -->
      <div class="w-full max-w-sm px-margin-page mt-2 mb-4 relative flex justify-center bg-transparent" style="mask-image: radial-gradient(circle, black 40%, transparent 95%);">
        <img alt="Smart pet feeder device" class="w-full h-auto object-contain" src="/feeder.svg">
      </div>

      <!-- Feeding Information -->
      <div class="text-center mb-8">
        <h2 class="font-headline-lg-mobile text-[16px] text-on-surface mb-1">Next Feed</h2>
        <p class="font-body-md text-on-surface-variant">5 Portions / 2025.01.25 18:00</p>
      </div>

      <!-- Control Cards -->
      <div class="w-full max-w-md px-margin-page flex flex-col gap-4">
        <!-- Manual Feeding -->
        <button @click="showFeedDialog = true"
          class="w-full bg-surface-container-lowest rounded-[16px] p-4 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:scale-[0.98] transition-transform duration-200 border border-outline-variant/10">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">restaurant</span>
            </div>
            <span class="font-headline-lg-mobile text-[16px] font-semibold text-on-surface tracking-tight">Manual Feeding</span>
          </div>
          <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        </button>

        <!-- Scheduled Feeding -->
        <button @click="showSchedule = !showSchedule"
          class="w-full bg-surface-container-lowest rounded-[16px] p-4 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:scale-[0.98] transition-transform duration-200 border border-outline-variant/10">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">schedule</span>
            </div>
            <span class="font-headline-lg-mobile text-[16px] font-semibold text-on-surface tracking-tight">Scheduled Feeding</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-body-md text-on-surface-variant">Off</span>
            <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </div>
        </button>

        <!-- Schedule List (expandable) -->
        <div v-if="showSchedule" class="flex flex-col gap-2">
          <div v-for="s in store.schedules" :key="s.id"
            class="bg-surface-container-lowest rounded-xl p-3 flex items-center justify-between border border-outline-variant/10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <span class="material-symbols-outlined text-on-surface-variant text-lg">schedule</span>
              </div>
              <div>
                <p class="font-body-md text-body-md font-semibold text-on-surface">{{ s.time }}</p>
                <p class="font-label-sm text-label-sm text-on-surface-variant">{{ s.portions }} portions &middot; {{ s.label }}</p>
              </div>
            </div>
            <button @click="toggleSchedule(s.id)"
              class="w-12 h-8 rounded-full transition-colors flex items-center"
              :class="s.enabled ? 'bg-secondary justify-end' : 'bg-surface-container-high justify-start'">
              <div class="w-6 h-6 rounded-full bg-white shadow-sm mx-0.5"></div>
            </button>
          </div>
          <button @click="addNewSchedule"
            class="w-full py-3 rounded-xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors">
            <span class="material-symbols-outlined text-lg">add</span>
            Add Schedule
          </button>
        </div>

        <!-- Feeding Speed -->
        <div class="w-full bg-surface-container-lowest rounded-[16px] p-4 pt-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/10 flex flex-col gap-5">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-[#f0ecff] flex items-center justify-center text-[#6355ff]">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">bolt</span>
            </div>
            <span class="font-headline-lg-mobile text-[16px] font-semibold text-on-surface tracking-tight">Feeding Speed</span>
          </div>
          <div class="px-2 pb-2">
            <input class="w-full appearance-none bg-transparent speed-slider" type="range" min="1" max="5" :value="speedVal" @input="onSpeedChange" />
            <div class="flex justify-between font-label-sm text-[10px] text-on-surface-variant mt-3 px-1 uppercase tracking-wider">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Feed Modal -->
    <Teleport to="body">
      <div v-if="showFeedDialog" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" @click.self="showFeedDialog = false">
        <div class="bg-surface-container-lowest w-full max-w-[340px] rounded-3xl p-6 relative shadow-2xl flex flex-col items-center">
          <button @click="showFeedDialog = false" class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
          <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-8">Dispense Amount</h2>
          <div class="flex items-center justify-center gap-6 mb-4 w-full">
            <button @click="feedPortions > 1 && feedPortions--" class="w-10 h-10 rounded-full border border-outline flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
              <span class="material-symbols-outlined">remove</span>
            </button>
            <div class="bg-surface-container w-32 h-16 rounded-xl flex items-center justify-center">
              <span class="font-headline-xl text-[36px] text-on-surface">{{ feedPortions }}</span>
            </div>
            <button @click="feedPortions < 10 && feedPortions++" class="w-10 h-10 rounded-full border border-outline flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
              <span class="material-symbols-outlined">add</span>
            </button>
          </div>
          <p class="font-label-sm text-label-sm text-on-surface-variant/70 mb-10">Set the number of portions to dispense</p>
          <button @click="handleFeed"
            class="w-full bg-primary-container text-on-primary-container py-3.5 rounded-full font-body-md font-bold hover:bg-primary hover:text-on-primary transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFeederStore, doFeed, toggleSchedule, setFeedingSpeed, addSchedule } from '@/store/feeder.js'

const store = useFeederStore
const showFeedDialog = ref(false)
const showSchedule = ref(false)
const feedPortions = ref(3)

const speedVal = computed(() => {
  return { slow: 1, medium: 3, fast: 5 }[store.device.feedingSpeed] || 3
})

function onSpeedChange(e) {
  const v = parseInt(e.target.value)
  if (v <= 2) setFeedingSpeed('slow')
  else if (v >= 4) setFeedingSpeed('fast')
  else setFeedingSpeed('medium')
}

function handleFeed() {
  doFeed(feedPortions.value)
  showFeedDialog.value = false
}

function addNewSchedule() {
  addSchedule({ time: '12:00', portions: 2, days: ['Mon','Tue','Wed','Thu','Fri'], label: 'New Schedule' })
}
</script>

<style scoped>
.speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #98461e;
  cursor: pointer;
  margin-top: -6px;
  box-shadow: 0 2px 6px rgba(152, 70, 30, 0.3);
}
.speed-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: #eae1dc;
  border-radius: 4px;
}
</style>
