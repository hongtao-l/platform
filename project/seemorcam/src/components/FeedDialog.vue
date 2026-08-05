<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" @click.self="$emit('update:show', false)">
      <div class="bg-surface-container-lowest w-full max-w-[340px] rounded-3xl p-6 relative shadow-2xl flex flex-col items-center">
        <button @click="$emit('update:show', false)" class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors">
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
import { doFeed } from '@/store/feeder.js'

defineProps({ show: Boolean })
const emit = defineEmits(['update:show'])

const portions = ref(1)

function handleFeed() {
  doFeed(portions.value)
  portions.value = 1
  emit('update:show', false)
}
</script>
