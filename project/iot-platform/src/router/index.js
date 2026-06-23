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
    meta: { title: '产品管理' }
  },
  {
    path: '/product/development',
    name: 'ProductDevelopment',
    component: () => import('@/views/product/development.vue'),
    meta: { title: '产品开发' }
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
    path: '/product/audit',
    name: 'ProductAudit',
    component: () => import('@/views/product/audit.vue'),
    meta: { title: '产品审核' }
  },
  {
    path: '/product/audit/detail',
    name: 'ProductAuditDetail',
    component: () => import('@/views/product/audit/detail.vue'),
    meta: { title: '产品详情' }
  },
  {
    path: '/product/app',
    name: 'ProductAppConfig',
    component: () => import('@/views/product/app.vue'),
    meta: { title: 'App功能配置' }
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
    path: '/ops/activity',
    name: 'OpsActivity',
    component: () => import('@/views/ops/activity.vue'),
    meta: { title: '活动位运营' }
  },
  {
    path: '/ops/usergroup',
    name: 'OpsUsergroup',
    component: () => import('@/views/ops/usergroup.vue'),
    meta: { title: '用户分群' }
  },
  {
    path: '/thing-model/capability',
    name: 'ThingModelCapability',
    component: () => import('@/views/iot/thing-model/capability.vue'),
    meta: { title: '能力库' }
  },
  {
    path: '/thing-model/category',
    name: 'ThingModelCategory',
    component: () => import('@/views/iot/thing-model/category.vue'),
    meta: { title: 'IOT类目' }
  },
  {
    path: '/thing-model/category/:id/capabilities',
    name: 'ThingModelCategoryCapabilities',
    component: () => import('@/views/iot/thing-model/category-capability.vue'),
    meta: { title: '类目能力详情' }
  },
  {
    path: '/thing-model/algorithm',
    name: 'ThingModelAlgorithm',
    component: () => import('@/views/iot/thing-model/algorithm.vue'),
    meta: { title: '算法库' }
  },
  {
    path: '/thing-model/algorithm/:id/capabilities',
    name: 'ThingModelAlgorithmCapabilities',
    component: () => import('@/views/iot/thing-model/algorithm-capability.vue'),
    meta: { title: '算法关联能力' }
  },
  {
    path: '/thing-model/event',
    name: 'ThingModelEvent',
    component: () => import('@/views/iot/thing-model/EventPanel.vue'),
    meta: { title: '事件库' }
  },
  {
    path: '/pkg',
    name: 'PkgList',
    component: () => import('@/views/pkg/list.vue'),
    meta: { title: '套餐管理' }
  },
  {
    path: '/pkg/config',
    name: 'PkgConfig',
    component: () => import('@/views/pkg/config.vue'),
    meta: { title: '套餐配置' }
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
