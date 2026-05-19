import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import App from './App.vue'
import router from './router'
import './styles/index.scss'

const app = createApp(App)

// 使用 Pinia 状态管理
app.use(createPinia())

// 使用 Vue Router
app.use(router)

// 使用 Element Plus
app.use(ElementPlus, {
  locale: zhCn
})

app.mount('#app')
