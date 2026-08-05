import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  /* ---- Splash ---- */
  {
    path: '/splash',
    name: 'Splash',
    component: () => import('@/views/splash.vue'),
    meta: { title: 'SeemorCam' }
  },

  /* ---- Auth ---- */
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/views/auth/login.vue'),
    meta: { title: 'Sign In — SeemorCam' }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('@/views/auth/register.vue'),
    meta: { title: 'Sign Up — SeemorCam' }
  },
  {
    path: '/auth/forgot',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/forgot.vue'),
    meta: { title: 'Reset Password — SeemorCam' }
  },
  {
    path: '/auth/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/auth/reset-password.vue'),
    meta: { title: 'Reset Password — SeemorCam' }
  },

  /* ---- Main App (with bottom tabs) ---- */
  {
    path: '/',
    component: () => import('@/views/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/splash'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home.vue'),
        meta: { title: 'My Devices — SeemorCam' }
      },
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('@/views/messages/index.vue'),
        meta: { title: 'Notifications — SeemorCam' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: 'Profile — SeemorCam' }
      }
    ]
  },

  /* ---- Sub Pages (no bottom tabs) ---- */
  {
    path: '/feeder/control',
    name: 'FeederControl',
    component: () => import('@/views/feeder/control.vue'),
    meta: { title: 'Feeder Control — SeemorCam' }
  },
  {
    path: '/device/bind',
    name: 'DeviceBind',
    component: () => import('@/views/device/bind.vue'),
    meta: { title: 'Add Device — SeemorCam' }
  },
  {
    path: '/video',
    name: 'VideoMonitor',
    component: () => import('@/views/video/index.vue'),
    meta: { title: 'Live View — SeemorCam' }
  },

  /* ---- Catch-all ---- */
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

/* ---- Auth Guard ---- */
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'SeemorCam'

  const isAuthPage = to.path.startsWith('/auth') || to.path === '/splash'
  const isLoggedIn = localStorage.getItem('seemorcam_logged_in') === 'true'

  if (!isAuthPage && !isLoggedIn) {
    // Redirect to login if not authenticated
    next('/splash')
  } else if (isAuthPage && isLoggedIn && to.path !== '/splash') {
    // Redirect to home if already logged in
    next('/home')
  } else {
    next()
  }
})

export default router
