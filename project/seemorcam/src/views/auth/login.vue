<template>
  <div class="bg-background text-on-background h-full flex flex-col font-body-md text-body-md antialiased overflow-hidden min-h-screen">
    <main class="flex-1 flex flex-col justify-center px-margin-page relative w-full max-w-md mx-auto h-full">
      <div class="absolute top-[-10%] right-[-20%] w-[120%] h-[120%] bg-surface-container-high rounded-full blur-[100px] opacity-40 -z-10 pointer-events-none"></div>
      <div class="w-full space-y-stack-lg relative z-10 glass-panel p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div class="text-center space-y-stack-sm flex flex-col items-center">
          <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <span class="material-symbols-outlined text-4xl text-primary" style="font-variation-settings: 'FILL' 1;">pets</span>
          </div>
          <h1 class="font-headline-xl text-headline-xl text-primary">seemorcam</h1>
          <p class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mt-2">Welcome Back</p>
          <p class="text-on-surface-variant font-body-md text-body-md opacity-80">Log in to check on your furry friends.</p>
        </div>
        <form class="space-y-stack-md w-full" @submit.prevent="handleLogin">
          <div class="relative input-filled">
            <input v-model="email" id="email" name="email" type="email" placeholder=" " required
              class="block w-full px-4 pt-6 pb-2 text-on-surface bg-surface-container-lowest border-0 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all peer" />
            <label for="email"
              class="absolute text-on-surface-variant font-body-md text-body-md duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Email Address</label>
          </div>
          <div class="space-y-2">
            <div class="relative input-filled">
              <input v-model="password" id="password" name="password" :type="showPwd ? 'text' : 'password'" placeholder=" " required
                class="block w-full px-4 pt-6 pb-2 text-on-surface bg-surface-container-lowest border-0 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all peer" />
              <label for="password"
                class="absolute text-on-surface-variant font-body-md text-body-md duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Password</label>
            </div>
            <div class="flex justify-end w-full">
              <router-link to="/auth/forgot" class="font-label-sm text-label-sm text-primary hover:text-on-primary-container transition-colors">Forgot Password?</router-link>
            </div>
          </div>
          <button type="submit"
            class="w-full bg-primary text-on-primary font-headline-lg-mobile text-headline-lg-mobile py-4 rounded-xl shadow-lg hover:bg-on-primary-container hover:shadow-xl transition-all duration-200 active:scale-[0.98] mt-4 flex items-center justify-center gap-2">
            Log In
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>
        <div class="text-center pt-stack-md border-t border-outline-variant/30">
          <p class="font-body-md text-body-md text-on-surface-variant">
            Don't have an account?
            <router-link to="/auth/register" class="font-headline-lg-mobile text-headline-lg-mobile text-primary hover:text-on-primary-container transition-colors ml-1">Sign Up</router-link>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPwd = ref(false)

function handleLogin() {
  localStorage.setItem('seemorcam_logged_in', 'true')
  router.replace('/home')
}
</script>

<style scoped>
.input-filled:focus-within label,
.input-filled input:not(:placeholder-shown) ~ label {
  transform: scale(0.75) translateY(-1rem) translateX(-0.1rem);
  color: #98461e;
}
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
