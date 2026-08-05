<template>
  <div class="bg-background text-on-background min-h-screen flex flex-col font-body-md ambient-bg relative overflow-x-hidden">
    <header class="w-full flex justify-center items-center py-stack-lg mt-stack-md z-10">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">pets</span>
        <h1 class="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">seemorcam</h1>
      </div>
    </header>
    <main class="flex-grow flex flex-col items-center justify-center px-margin-page pb-stack-lg w-full max-w-md mx-auto z-10 relative">
      <div class="text-center w-full mb-stack-lg">
        <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-stack-sm">Create Account</h2>
        <p class="font-body-md text-body-md text-on-surface-variant opacity-80">Join us to stay close to your furry friends.</p>
      </div>
      <div class="w-full bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-stack-md sm:p-stack-lg border border-outline-variant/30">
        <form class="flex flex-col gap-stack-md w-full" @submit.prevent="handleRegister">
          <div class="flex flex-col gap-2">
            <label class="font-label-sm text-label-sm text-on-surface-variant uppercase" for="email">Email Address</label>
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-4 text-outline-variant pointer-events-none">mail</span>
              <input v-model="email" id="email" name="email" type="email" placeholder="hello@example.com" required
                class="w-full pl-12 pr-4 py-4 bg-background border-none rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-outline-variant/70" />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-label-sm text-label-sm text-on-surface-variant uppercase" for="password">Password</label>
            <div class="relative flex items-center group">
              <span class="material-symbols-outlined absolute left-4 text-outline-variant pointer-events-none">lock</span>
              <input v-model="password" id="password" name="password" :type="showPwd ? 'text' : 'password'" placeholder="Create a strong password" required
                class="w-full pl-12 pr-12 py-4 bg-background border-none rounded-lg text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-outline-variant/70" />
              <button type="button" @click="showPwd = !showPwd" class="absolute right-4 text-outline-variant hover:text-primary transition-colors focus:outline-none">
                <span class="material-symbols-outlined">{{ showPwd ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>
          <button type="submit"
            class="w-full bg-primary text-on-primary font-headline-lg-mobile text-headline-lg-mobile py-4 rounded-full mt-stack-md hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(152,70,30,0.25)] flex justify-center items-center gap-2 group">
            Sign Up
            <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </form>
        <div class="mt-stack-lg text-center">
          <p class="font-body-md text-body-md text-on-surface-variant">
            Already have an account?
            <router-link to="/auth/login" class="text-primary font-semibold hover:underline decoration-2 underline-offset-4 ml-1">Log In</router-link>
          </p>
        </div>
      </div>
    </main>
    <div class="fixed top-[-10%] right-[-10%] w-64 h-64 bg-primary-fixed/20 rounded-full blur-[80px] pointer-events-none z-0"></div>
    <div class="fixed bottom-[-10%] left-[-10%] w-80 h-80 bg-secondary-fixed/30 rounded-full blur-[100px] pointer-events-none z-0"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPwd = ref(false)

function handleRegister() {
  localStorage.setItem('seemorcam_logged_in', 'true')
  router.replace('/home')
}
</script>

<style scoped>
.ambient-bg {
  background: radial-gradient(circle at 50% -20%, #efe6e2 0%, #fff8f5 70%);
}
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px #fff8f5 inset !important;
  -webkit-text-fill-color: #1f1b18 !important;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
