<template>
  <div class="min-h-screen bg-background flex flex-col items-center px-margin-page">
    <!-- Back -->
    <div class="w-full pt-stack-md mb-stack-lg">
      <button @click="$router.back()" class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors">
        <span class="material-symbols-outlined text-on-surface-variant">arrow_back</span>
      </button>
    </div>

    <!-- Header -->
    <div class="w-full mb-stack-lg">
      <h1 class="font-headline-xl text-headline-xl text-on-background mb-stack-sm">Add Device</h1>
      <p class="font-body-md text-body-md text-on-surface-variant">Scan the QR code on your device or enter the SN manually</p>
    </div>

    <!-- Step 1: Scan QR or Enter SN -->
    <div v-if="step === 1" class="w-full max-w-sm flex flex-col gap-stack-md">
      <div class="aspect-square w-full bg-surface-container rounded-2xl flex items-center justify-center border-2 border-dashed border-outline-variant/30">
        <div class="flex flex-col items-center gap-3 p-6 text-center">
          <div class="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
            <span class="material-symbols-outlined text-4xl text-primary">qr_code_scanner</span>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant">Tap to scan QR code</p>
          <p class="font-label-sm text-label-sm text-on-surface-variant/60">Position the QR code within the frame</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex-1 h-px bg-outline-variant/30"></div>
        <span class="font-label-sm text-label-sm text-on-surface-variant">or</span>
        <div class="flex-1 h-px bg-outline-variant/30"></div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-label-sm text-label-sm text-on-surface-variant">Device SN Code</label>
        <input v-model="snCode" type="text" placeholder="Enter the SN code from your device"
          class="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
          @keyup.enter="step = 2" />
      </div>

      <button @click="step = 2" :disabled="!snCode.trim()"
        class="w-full h-12 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 mt-stack-sm">
        Continue
      </button>
    </div>

    <!-- Step 2: Name Device -->
    <form v-else class="w-full max-w-sm flex flex-col gap-stack-md" @submit.prevent="handleBind">
      <div class="flex flex-col items-center mb-4">
        <div class="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center mb-stack-md">
          <span class="material-symbols-outlined text-5xl text-on-primary-container" style="font-variation-settings: 'FILL' 1;">pets</span>
        </div>
        <p class="font-label-sm text-label-sm text-on-surface-variant">SN: {{ snCode }}</p>
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-label-sm text-label-sm text-on-surface-variant">Device Name</label>
        <input v-model="deviceName" type="text" placeholder="e.g. Kitchen Feeder"
          class="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors" />
      </div>

      <button type="submit" :disabled="!deviceName.trim() || binding"
        class="w-full h-12 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 mt-stack-sm">
        <span v-if="binding" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
        {{ binding ? 'Binding...' : 'Bind Device' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { bindDevice } from '@/store/feeder.js'

const router = useRouter()
const step = ref(1)
const snCode = ref('')
const deviceName = ref('Kitchen Feeder')
const binding = ref(false)

function handleBind() {
  binding.value = true
  setTimeout(() => {
    bindDevice(deviceName.value, snCode.value || 'SM2024FEED001')
    binding.value = false
    router.replace('/home')
  }, 1000)
}
</script>
