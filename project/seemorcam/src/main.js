import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  const swPath = import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js'
  navigator.serviceWorker.register(swPath).then(reg => {
    console.log('SW registered:', reg.scope)
  }).catch(err => {
    console.warn('SW registration failed:', err)
  })
}
