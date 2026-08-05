<template>
  <main class="max-w-7xl mx-auto px-margin-page pt-stack-md md:pt-stack-lg">
    <!-- Header Actions -->
    <div class="flex justify-between items-center mb-stack-lg">
      <h1 class="font-headline-xl text-headline-xl text-on-background">My Devices</h1>
      <button @click="$router.push('/device/bind')"
        class="bg-primary text-on-primary px-4 py-2 rounded-full font-label-sm text-label-sm flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">add</span>
        Add Device
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!store.device.sn" class="flex flex-col items-center justify-center py-stack-lg">
      <div class="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-stack-md">
        <span class="material-symbols-outlined text-5xl text-on-surface-variant opacity-50">devices_other</span>
      </div>
      <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-stack-sm">No Devices Yet</h2>
      <p class="font-body-md text-body-md text-on-surface-variant text-center mb-stack-lg">
        Add your smart pet feeder to get started
      </p>
      <button @click="$router.push('/device/bind')"
        class="bg-primary text-on-primary px-6 py-3 rounded-full font-label-sm text-label-sm flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
        <span class="material-symbols-outlined">add</span>
        Add Device
      </button>
    </div>

    <!-- Devices Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-card">
      <!-- Kitchen Feeder Card — compact horizontal layout from Stitch -->
      <div @click="$router.push('/feeder/control')" class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-4 flex gap-4 items-center group cursor-pointer hover:shadow-md transition-shadow">
        <div class="w-20 h-20 bg-surface-container rounded-lg overflow-hidden flex-shrink-0">
          <img src="/feeder.svg" alt="Kitchen Feeder" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
        </div>
        <div class="flex-grow flex flex-col justify-between h-20">
          <div class="flex justify-between items-start">
            <h3 class="font-body-md text-body-md font-bold text-on-surface">{{ store.device.name }}</h3>
            <span class="text-secondary font-label-sm text-label-sm flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-secondary"></span>
              Online
            </span>
          </div>
          <div class="flex justify-between items-end">
            <p class="font-label-sm text-label-sm text-on-surface-variant">Next: {{ store.device.nextFeed.time }}</p>
            <button @click.stop="showFeedDialog = true"
              class="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm hover:bg-primary hover:text-on-primary transition-colors">
              <span class="material-symbols-outlined text-[16px]">water_drop</span>
              Dispense
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Feed Modal — exact Stitch design: centered, stepper, no speed -->
  <Teleport to="body">
    <div v-if="showFeedDialog" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" @click.self="showFeedDialog = false">
      <div class="bg-surface-container-lowest w-full max-w-[340px] rounded-3xl p-6 relative shadow-2xl flex flex-col items-center">
        <button @click="showFeedDialog = false" class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>

        <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-8">Dispense Amount</h2>

        <div class="flex items-center justify-center gap-6 mb-4 w-full">
          <button @click="portions > 1 && portions--" class="w-10 h-10 rounded-full border border-outline flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined">remove</span>
          </button>
          <div class="bg-surface-container w-32 h-16 rounded-xl flex items-center justify-center">
            <span class="font-headline-xl text-[36px] text-on-surface">{{ portions }}</span>
          </div>
          <button @click="portions < 10 && portions++" class="w-10 h-10 rounded-full border border-outline flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
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
</template>

<script setup>
import { ref } from 'vue'
import { useFeederStore, doFeed } from '@/store/feeder.js'

const store = useFeederStore
const showFeedDialog = ref(false)
const portions = ref(3)

function handleFeed() {
  doFeed(portions.value)
  showFeedDialog.value = false
}
</script>
