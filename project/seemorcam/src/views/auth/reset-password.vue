<template>
  <body class="bg-surface text-on-surface antialiased min-h-screen flex flex-col items-center">
    <div class="w-full max-w-md min-h-screen flex flex-col relative overflow-hidden bg-surface-container-lowest md:rounded-[32px] md:shadow-[0_20px_50px_rgba(0,0,0,0.05)] md:my-8">
      <div class="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-surface-container-low to-transparent z-0"></div>
      <header class="w-full h-16 flex items-center justify-between px-margin-page relative z-10 pt-4 pb-2">
        <button @click="$router.back()" aria-label="Go back" class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-highest/50 backdrop-blur-md text-on-surface transition-transform active:scale-90">
          <span class="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <div class="flex-1"></div>
      </header>
      <main class="flex-1 flex flex-col px-margin-page py-stack-lg relative z-10 w-full overflow-y-auto">
        <div class="mb-stack-lg">
          <h1 class="font-headline-xl text-headline-xl text-on-surface mb-stack-sm">Reset Password</h1>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-[280px]">
            Enter the 6-digit code sent to your email and set your new password.
          </p>
        </div>
        <form class="flex flex-col gap-stack-lg w-full flex-1" @submit.prevent="handleUpdate">
          <div class="flex flex-col gap-stack-sm">
            <label class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Verification Code</label>
            <div class="flex justify-between gap-2 w-full">
              <input v-for="(_, i) in 6" :key="i" :ref="el => otpRefs[i] = el" v-model="otp[i]" type="text" inputmode="numeric" maxlength="1" placeholder="-"
                class="code-input w-12 h-14 rounded-xl bg-surface-container-highest border border-transparent text-center font-headline-lg text-headline-lg text-on-surface transition-all focus:bg-surface-container-lowest"
                @input="onOtpInput(i)" @keydown="onOtpKeydown($event, i)" @paste="onOtpPaste" />
            </div>
            <div class="flex justify-between items-center mt-2 px-1">
              <span class="font-body-md text-[14px] text-on-surface-variant">Didn't receive it?</span>
              <button type="button" :disabled="countdown > 0" :class="countdown > 0 ? 'text-tertiary-container cursor-not-allowed' : 'text-primary cursor-pointer'" class="font-label-sm text-[14px] font-semibold" @click="resendCode">
                {{ countdown > 0 ? `Resend Code (0:${String(countdown).padStart(2, '0')})` : 'Resend Code' }}
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-stack-md mt-4 bg-surface p-gutter-card rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-surface-variant/30">
            <div class="flex flex-col gap-1 w-full">
              <label class="font-label-sm text-label-sm text-on-surface-variant pl-1" for="new-password">New Password</label>
              <div class="relative w-full group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="material-symbols-outlined text-on-surface-variant/60 group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input v-model="newPassword" id="new-password" :type="showNewPwd ? 'text' : 'password'" placeholder="Enter new password"
                  class="w-full h-14 bg-surface-container-highest border border-transparent rounded-xl pl-12 pr-12 font-body-md text-body-md text-on-surface placeholder-on-surface-variant/40 focus:bg-surface-container-lowest focus:border-primary focus:ring-0 transition-all" />
                <button type="button" @click="showNewPwd = !showNewPwd" aria-label="Toggle password visibility" class="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant/60 hover:text-on-surface">
                  <span class="material-symbols-outlined">{{ showNewPwd ? 'visibility' : 'visibility_off' }}</span>
                </button>
              </div>
            </div>
            <div class="flex flex-col gap-1 w-full mt-2">
              <label class="font-label-sm text-label-sm text-on-surface-variant pl-1" for="confirm-password">Confirm New Password</label>
              <div class="relative w-full group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="material-symbols-outlined text-on-surface-variant/60 group-focus-within:text-primary transition-colors">lock_reset</span>
                </div>
                <input v-model="confirmPassword" id="confirm-password" :type="showCfmPwd ? 'text' : 'password'" placeholder="Confirm password"
                  class="w-full h-14 bg-surface-container-highest border border-transparent rounded-xl pl-12 pr-12 font-body-md text-body-md text-on-surface placeholder-on-surface-variant/40 focus:bg-surface-container-lowest focus:border-primary focus:ring-0 transition-all" />
                <button type="button" @click="showCfmPwd = !showCfmPwd" aria-label="Toggle password visibility" class="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant/60 hover:text-on-surface">
                  <span class="material-symbols-outlined">{{ showCfmPwd ? 'visibility' : 'visibility_off' }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="flex-1 min-h-[40px]"></div>
          <button type="submit"
            class="w-full h-14 bg-primary text-on-primary rounded-xl font-headline-lg-mobile text-headline-lg-mobile flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(152,70,30,0.2)] active:scale-[0.98] transition-all mb-4">
            Update Password
            <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>
      </main>
    </div>
  </body>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const otp = ref(['', '', '', '', '', ''])
const otpRefs = ref([])
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPwd = ref(false)
const showCfmPwd = ref(false)
const countdown = ref(59)
let timer = null

function startCountdown() {
  countdown.value = 59
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

function onOtpInput(index) {
  if (otp.value[index] && index < 5) {
    otpRefs.value[index + 1]?.focus()
  }
}

function onOtpKeydown(e, index) {
  if (e.key === 'Backspace' && !otp.value[index] && index > 0) {
    otpRefs.value[index - 1]?.focus()
  }
}

function onOtpPaste(e) {
  e.preventDefault()
  const data = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '')
  for (let i = 0; i < data.length; i++) {
    otp.value[i] = data[i]
  }
  if (data.length < 6) otpRefs.value[data.length]?.focus()
}

function resendCode() {
  startCountdown()
}

function handleUpdate() {
  router.push('/auth/login')
}

startCountdown()
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.code-input:focus {
  border-color: #98461e;
  outline: none;
  box-shadow: 0 0 0 2px rgba(152, 70, 30, 0.2);
}
</style>
