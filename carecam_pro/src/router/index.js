import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/layout/index.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页', showTabbar: true }
      },
      {
        path: 'message',
        name: 'Message',
        component: () => import('@/views/message/index.vue'),
        meta: { title: '消息', showTabbar: true }
      },
      {
        path: 'me',
        name: 'Me',
        component: () => import('@/views/me/index.vue'),
        meta: { title: '我的', showTabbar: true }
      }
    ]
  },
  {
    path: '/store',
    name: 'Store',
    component: () => import('@/views/store/index.vue'),
    meta: { title: '服务商城' }
  },
  {
    path: '/liveview',
    name: 'LiveView',
    component: () => import('@/views/liveview/index.vue'),
    meta: { title: '实时预览' }
  },
  {
    path: '/playback',
    name: 'Playback',
    component: () => import('@/views/playback/index.vue'),
    meta: { title: '回放' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/index.vue'),
    meta: { title: '设备设置' }
  },
  {
    path: '/settings/work-mode',
    name: 'WorkMode',
    component: () => import('@/views/settings/work-mode.vue'),
    meta: { title: '工作模式' }
  },
  {
    path: '/settings/record-mode',
    name: 'RecordMode',
    component: () => import('@/views/settings/record-mode.vue'),
    meta: { title: '录制模式' }
  },
  {
    path: '/battery',
    name: 'Battery',
    component: () => import('@/views/battery/index.vue'),
    meta: { title: '电池管理' }
  },
  {
    path: '/smart-schedule',
    name: 'SmartSchedule',
    component: () => import('@/views/battery/schedule.vue'),
    meta: { title: '智能模式' }
  },
  {
    path: '/battery-stats',
    name: 'BatteryStats',
    component: () => import('@/views/battery/stats.vue'),
    meta: { title: '运行统计' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - CareCam Pro` : 'CareCam Pro'
  next()
})

export default router
