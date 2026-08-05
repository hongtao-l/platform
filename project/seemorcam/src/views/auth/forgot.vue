<template>
  <div class="bg-background h-full antialiased text-on-background flex flex-col md:items-center md:justify-center min-h-screen">
    <header class="md:hidden flex justify-between items-center px-margin-page h-16 w-full bg-surface">
      <button @click="$router.back()" aria-label="Go back" class="text-on-surface-variant hover:opacity-80 transition-opacity p-2 -ml-2 rounded-full active:scale-95 transition-transform" type="button">
        <span aria-hidden="true" class="material-symbols-outlined text-[24px]">arrow_back</span>
      </button>
    </header>
    <main class="flex-1 w-full max-w-[480px] px-margin-page md:px-0 flex flex-col justify-start md:justify-center pt-8 md:pt-0">
      <div class="md:bg-surface-container-lowest md:rounded-3xl md:shadow-[0_20px_40px_rgba(152,70,30,0.05)] md:p-10 relative overflow-hidden">
        <button @click="$router.push('/auth/login')" class="hidden md:inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 group active:scale-95 transition-transform duration-150" type="button">
          <span aria-hidden="true" class="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span class="font-label-sm text-label-sm">Back to Login</span>
        </button>
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-container opacity-50 md:rounded-t-3xl hidden md:block"></div>
        <div class="flex flex-col gap-stack-lg">
          <div class="flex flex-col gap-stack-sm text-center md:text-left">
            <div class="mx-auto md:mx-0 w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4 md:mb-2 shadow-sm text-primary">
              <span class="material-symbols-outlined text-[32px]" style="font-variation-settings: 'FILL' 1;">lock_reset</span>
            </div>
            <h1 class="font-headline-xl text-headline-xl text-on-background">Reset Password</h1>
            <p class="font-body-md text-body-md text-on-surface-variant">Enter your email to receive a reset link.</p>
          </div>
          <form class="flex flex-col gap-stack-md" @submit.prevent="handleSend">
            <div class="flex flex-col gap-2">
              <label class="font-label-sm text-label-sm text-on-surface-variant ml-1" for="email">Email Address</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                  <span class="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input v-model="email" id="email" name="email" type="email" placeholder="name@example.com" required
                  class="w-full bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-xl py-4 pl-12 pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors outline-none" />
              </div>
            </div>
            <button type="submit"
              class="mt-4 w-full bg-primary hover:bg-on-primary-container text-on-primary font-label-sm text-label-sm py-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 duration-150 flex items-center justify-center gap-2 group">
              Send Link
              <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </form>
        </div>
      </div>
      <div class="fixed top-1/4 -right-20 w-96 h-96 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 pointer-events-none hidden md:block"></div>
      <div class="fixed -bottom-20 -left-20 w-72 h-72 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 pointer-events-none hidden md:block"></div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')

function handleSend() {
  router.push('/auth/reset-password')
}
</script>
