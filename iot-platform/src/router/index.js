import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      title: '工作台'
    }
  },
  {
    path: '/product',
    name: 'Product',
    component: () => import('@/views/product/index.vue'),
    meta: {
      title: '产品管理'
    }
  },
  {
    path: '/product/config',
    name: 'ProductConfig',
    component: () => import('@/views/product/config.vue'),
    meta: {
      title: '产品功能配置'
    }
  },
  {
    path: '/abtest',
    name: 'AbTest',
    component: () => import('@/views/abtest/list.vue'),
    meta: {
      title: 'A/B Test'
    }
  },
  {
    path: '/abtest/:id',
    name: 'AbTestDashboard',
    component: () => import('@/views/abtest/dashboard.vue'),
    meta: {
      title: '实验数据看板'
    }
  },
  {
    path: '/ops/mall',
    name: 'OpsMall',
    component: () => import('@/views/ops/mall.vue'),
    meta: { title: '商城位运营' }
  },
  {
    path: '/ops/recommend',
    name: 'OpsRecommend',
    component: () => import('@/views/ops/recommend.vue'),
    meta: { title: '推荐位运营' }
  },
  {
    path: '/ops/usergroup',
    name: 'OpsUsergroup',
    component: () => import('@/views/ops/usergroup.vue'),
    meta: { title: '用户分群' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - IoT管理平台` : 'IoT管理平台'
  next()
})

export default router
