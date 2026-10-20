import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/thing-model-new/capability' },

  // ===== 物模型管理（new）=====
  {
    path: '/thing-model-new/capability',
    name: 'ThingModelNewCapability',
    component: () => import('@/views/thing-model/Capability.vue'),
    meta: { title: '能力库 (Registry)', section: 'thing-model' }
  },
  {
    path: '/thing-model-new/category',
    name: 'ThingModelNewCategory',
    component: () => import('@/views/thing-model/Category.vue'),
    meta: { title: 'IOT 类目', section: 'thing-model' }
  },
  {
    path: '/thing-model-new/category/:id/capabilities',
    name: 'ThingModelNewCategoryCapabilities',
    component: () => import('@/views/thing-model/CategoryCapability.vue'),
    meta: { title: '类目能力详情', section: 'thing-model' }
  },

  // ===== 产品管理（new）=====
  {
    path: '/product-new',
    name: 'ProductNew',
    component: () => import('@/views/product/ProductList.vue'),
    meta: { title: '产品列表', section: 'product' }
  },
  {
    path: '/product-new/development',
    name: 'ProductNewDevelopment',
    component: () => import('@/views/product/ProductDevelopment.vue'),
    meta: { title: '产品开发', section: 'product' }
  },
  {
    path: '/product-new/config',
    name: 'ProductNewConfig',
    component: () => import('@/views/product/ProductConfig.vue'),
    meta: { title: '开发产品', section: 'product' }
  },
  {
    path: '/product-new/audit',
    name: 'ProductNewAudit',
    component: () => import('@/views/product/ProductAudit.vue'),
    meta: { title: '产品审核', section: 'product' }
  },
  {
    path: '/product-new/audit/detail',
    name: 'ProductNewAuditDetail',
    component: () => import('@/views/product/AuditDetail.vue'),
    meta: { title: '产品详情', section: 'product' }
  },

  { path: '/:pathMatch(.*)*', redirect: '/thing-model-new/capability' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  document.title = `${to.meta?.title || 'IoT Console'} · IoT 平台`
})

export default router
