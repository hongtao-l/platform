<template>
  <div class="bg-surface text-on-surface h-screen w-screen overflow-hidden flex flex-col items-center justify-center font-body-md antialiased" :class="{ 'splash-fade-out': leaving }">
    <main class="flex flex-col items-center justify-center h-full w-full relative z-10 px-margin-page animate-splash">
      <div class="relative flex flex-col items-center justify-center pulse-effect mb-stack-lg">
        <div class="w-32 h-32 md:w-48 md:h-48 rounded-full bg-surface-container-lowest shadow-lg flex items-center justify-center overflow-hidden border-4 border-surface p-2">
          <img alt="seemorcam logo" class="w-full h-full object-contain" src="/logo.svg">
        </div>
      </div>
      <div class="text-center mt-stack-md flex flex-col items-center space-y-stack-sm fade-in-delayed">
        <h1 class="font-headline-xl text-headline-xl text-primary flex items-center gap-2">seemorcam</h1>
        <p class="font-body-md text-on-surface-variant max-w-[280px]">Nurturing connection, anywhere.</p>
      </div>
      <div class="absolute bottom-12 w-full flex justify-center fade-in-delayed-2">
        <div class="flex space-x-2">
          <div class="w-2 h-2 rounded-full bg-primary animate-pulse" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style="animation-delay: 150ms"></div>
          <div class="w-2 h-2 rounded-full bg-primary/30 animate-pulse" style="animation-delay: 300ms"></div>
        </div>
      </div>
    </main>
    <div class="absolute inset-0 pointer-events-none z-0">
      <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-surface-container-low/50 to-transparent"></div>
      <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-surface-container-highest/20 to-transparent"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const leaving = ref(false)

onMounted(() => {
  setTimeout(() => {
    leaving.value = true
    setTimeout(() => {
      const isLoggedIn = localStorage.getItem('seemorcam_logged_in') === 'true'
      router.replace(isLoggedIn ? '/home' : '/auth/login')
    }, 800)
  }, 3500)
})
</script>

<style scoped>
.splash-fade-out {
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}
@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-splash {
  animation: fade-in-up 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
.fade-in-delayed {
  opacity: 0;
  animation: fade-in-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.4s forwards;
}
.fade-in-delayed-2 {
  opacity: 0;
  animation: fade-in-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.8s forwards;
}
@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}
.pulse-effect::before {
  content: '';
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background-color: #f28c5e;
  z-index: -1;
  animation: pulse-ring 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}
</style>
