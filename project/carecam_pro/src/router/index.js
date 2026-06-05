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
    path: '/my-services',
    name: 'MyServices',
    component: () => import('@/views/my-services/index.vue'),
    meta: { title: '我的服务' }
  },
  {
    path: '/my-services/bind',
    name: 'MyServicesBind',
    component: () => import('@/views/my-services/bind.vue'),
    meta: { title: '绑定设备' }
  },
  {
    path: '/liveview',
    name: 'LiveView',
    component: () => import('@/views/liveview/index.vue'),
    meta: { title: '实时预览' }
  },
  {
    path: '/liveview/wide-angle',
    name: 'LiveViewWideAngle',
    component: () => import('@/views/liveview/wide-angle.vue'),
    meta: { title: '广角摄像机' }
  },
  {
    path: '/liveview/multi',
    name: 'LiveViewMulti',
    component: () => import('@/views/liveview/multi.vue'),
    meta: { title: '多目摄像机' }
  },
  {
    path: '/liveview/other',
    name: 'LiveViewOther',
    component: () => import('@/views/liveview/other.vue'),
    meta: { title: '设备预览' }
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
  // ===== 子设备详情 =====
  {
    path: '/subdevice/temp-humidity',
    name: 'SubDeviceTempHumidity',
    component: () => import('@/views/subdevice/TempHumidity.vue'),
    meta: { title: '温湿度传感器' }
  },
  {
    path: '/subdevice/door',
    name: 'SubDeviceDoor',
    component: () => import('@/views/subdevice/Door.vue'),
    meta: { title: '门磁传感器' }
  },
  {
    path: '/subdevice/smoke',
    name: 'SubDeviceSmoke',
    component: () => import('@/views/subdevice/Smoke.vue'),
    meta: { title: '烟雾传感器' }
  },
  {
    path: '/subdevice/gas',
    name: 'SubDeviceGas',
    component: () => import('@/views/subdevice/Gas.vue'),
    meta: { title: '燃气传感器' }
  },
  {
    path: '/subdevice/remote',
    name: 'SubDeviceRemote',
    component: () => import('@/views/subdevice/Remote.vue'),
    meta: { title: '遥控器' }
  },
  {
    path: '/subdevice/emergency-button',
    name: 'SubDeviceEmergencyButton',
    component: () => import('@/views/subdevice/EmergencyButton.vue'),
    meta: { title: '紧急按钮' }
  },
  {
    path: '/subdevice/co-detector',
    name: 'SubDeviceCODetector',
    component: () => import('@/views/subdevice/CODetector.vue'),
    meta: { title: '一氧化碳探测器' }
  },
  {
    path: '/subdevice/water-sensor',
    name: 'SubDeviceWaterSensor',
    component: () => import('@/views/subdevice/WaterSensor.vue'),
    meta: { title: '水浸传感器' }
  },
  {
    path: '/subdevice/doorbell',
    name: 'SubDeviceDoorbell',
    component: () => import('@/views/subdevice/Doorbell.vue'),
    meta: { title: '门铃' }
  },
  {
    path: '/subdevice/env-detector',
    name: 'SubDeviceEnvDetector',
    component: () => import('@/views/subdevice/EnvDetector.vue'),
    meta: { title: '环境探测器' }
  },
  {
    path: '/subdevice/infrared-beam',
    name: 'SubDeviceInfraredBeam',
    component: () => import('@/views/subdevice/InfraredBeam.vue'),
    meta: { title: '红外对射' }
  },
  {
    path: '/subdevice/vibration',
    name: 'SubDeviceVibration',
    component: () => import('@/views/subdevice/Vibration.vue'),
    meta: { title: '震动传感器' }
  },
  {
    path: '/subdevice/glass-break',
    name: 'SubDeviceGlassBreak',
    component: () => import('@/views/subdevice/GlassBreak.vue'),
    meta: { title: '玻璃破碎探测器' }
  },
  {
    path: '/subdevice/fall-detector',
    name: 'SubDeviceFallDetector',
    component: () => import('@/views/subdevice/FallDetector.vue'),
    meta: { title: '跌倒探测器' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
    // ===== 全能AI =====
  {
    path: '/ai',
    name: 'AiHome',
    component: () => import('@/views/ai/index.vue'),
    meta: { title: '全能AI' }
  },
    {
      path: '/ai/daily',
      name: 'AiDaily',
      component: () => import('@/views/ai/daily.vue'),
      meta: { title: 'AI日报' }
    },
    {
      path: '/ai/daily-event',
      name: 'AiDailyEvent',
      component: () => import('@/views/ai/daily-event.vue'),
      meta: { title: '事件详情' }
    },
  {
    path: '/ai/search',
    name: 'AiSearch',
    component: () => import('@/views/ai/search.vue'),
    meta: { title: 'AI搜索' }
  },
  // ===== 404 =====
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

