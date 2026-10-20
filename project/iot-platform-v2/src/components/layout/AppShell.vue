<template>
  <div
    class="h-screen flex overflow-hidden bg-slate-50 text-slate-800"
    :style="{ '--rail-w': collapsed ? '64px' : '208px' }"
  >
    <!-- ===== Global sidebar (expanded / collapsed) ===== -->
    <aside
      class="relative flex-shrink-0 bg-[#080d19] border-r border-[#151d2f] flex flex-col z-40 transition-[width] duration-200"
      :class="collapsed ? 'w-16' : 'w-52'"
    >
      <!-- Brand / collapse -->
      <div
        class="h-14 flex items-center border-b border-[#151d2f] flex-shrink-0"
        :class="collapsed ? 'justify-center' : 'justify-between px-3'"
      >
        <button
          class="flex items-center gap-2.5 min-w-0"
          :title="collapsed ? '展开菜单' : 'IoT 平台'"
          @click="collapsed && toggleCollapse()"
        >
          <div class="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-900/40 flex-shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" />
            </svg>
          </div>
          <div v-if="!collapsed" class="flex flex-col text-left min-w-0">
            <span class="text-xs font-bold text-white tracking-wide whitespace-nowrap">IoT 平台</span>
            <span class="text-[10px] text-slate-400 font-mono whitespace-nowrap">v2.8 Enterprise</span>
          </div>
        </button>
        <button
          v-if="!collapsed"
          class="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors flex-shrink-0"
          title="收起菜单"
          @click="toggleCollapse"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1" :class="collapsed ? 'p-2 overflow-visible' : 'p-2.5 overflow-y-auto'">
        <template v-for="menu in menus" :key="menu.key">
          <!-- Group item -->
          <div class="relative group">
            <button
              class="w-full h-9 flex items-center rounded-lg text-xs transition-colors"
              :class="[
                collapsed ? 'justify-center' : 'justify-between px-3',
                groupActive(menu)
                  ? 'bg-sky-600/20 text-sky-300 border border-sky-500/25'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
              ]"
              :title="collapsed ? menu.title : ''"
              @click="collapsed ? goFirst(menu) : toggleGroup(menu)"
              @mouseenter="openFlyout(menu)"
              @mouseleave="scheduleCloseFlyout"
            >
              <div class="flex items-center min-w-0" :class="collapsed ? '' : 'gap-2.5'">
                <span class="w-4 h-4 flex-shrink-0" v-html="menu.icon" />
                <span v-if="!collapsed" class="truncate font-medium">{{ menu.title }}</span>
                <span
                  v-if="!collapsed && menu.badge"
                  class="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 flex-shrink-0"
                >{{ menu.badge }}</span>
              </div>
              <svg
                v-if="!collapsed"
                class="w-3 h-3 flex-shrink-0 transition-transform duration-150"
                :class="groups[menu.key] ? 'rotate-180' : ''"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
            </button>

            <!-- Expanded inline submenu -->
            <div v-if="!collapsed && groups[menu.key]" class="pl-7 pr-1 pt-1 space-y-0.5">
              <RouterLink
                v-for="child in menu.children"
                :key="child.path"
                :to="child.path"
                class="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors"
                :class="isChildActive(child)
                  ? 'font-semibold text-sky-300 bg-white/[0.06]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'"
              >
                <span class="flex items-center gap-2 min-w-0">
                  <span
                    class="w-1 h-1 rounded-full flex-shrink-0"
                    :class="isChildActive(child) ? 'bg-sky-400' : 'bg-slate-600'"
                  />
                  <span class="truncate">{{ child.title }}</span>
                </span>
                <span v-if="child.count" class="text-[10px] font-mono text-slate-500">{{ child.count }}</span>
              </RouterLink>
            </div>

            <!-- Collapsed hover flyout -->
            <div
              v-if="collapsed && flyoutKey === menu.key"
              class="absolute left-full top-0 pl-2 z-50"
              @mouseenter="cancelCloseFlyout"
              @mouseleave="scheduleCloseFlyout"
            >
              <div class="w-60 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
                <div class="px-3.5 py-2.5 border-b border-slate-100 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-sky-600" />
                  <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{{ menu.title }}</span>
                  <span
                    v-if="menu.badge"
                    class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200"
                  >{{ menu.badge }}</span>
                </div>
                <div class="p-1.5">
                  <RouterLink
                    v-for="child in menu.children"
                    :key="child.path"
                    :to="child.path"
                    class="flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors"
                    :class="isChildActive(child)
                      ? 'font-semibold text-sky-700 bg-sky-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
                    @click="flyoutKey = null"
                  >
                    <span class="flex items-center gap-2 min-w-0">
                      <span
                        class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        :class="isChildActive(child) ? 'bg-sky-500' : 'bg-slate-300'"
                      />
                      <span class="truncate">{{ child.title }}</span>
                    </span>
                    <span v-if="child.count" class="text-[10px] font-mono text-slate-400">{{ child.count }}</span>
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </template>
      </nav>

    </aside>

    <!-- ===== Main content shell ===== -->
    <div class="relative z-10 flex-1 flex flex-col h-full min-w-0 bg-white">
      <!-- Top global header -->
      <header class="h-14 border-b border-slate-200/80 bg-white px-5 flex items-center justify-between flex-shrink-0 z-20">
        <div class="flex items-center space-x-3 text-sm min-w-0">
          <button class="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" :title="collapsed ? '展开菜单' : '收起菜单'" @click="toggleCollapse">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
          </button>
          <nav class="flex items-center space-x-2 text-slate-500 whitespace-nowrap min-w-0">
            <span class="hover:text-slate-800 transition-colors cursor-pointer" @click="goHome">首页</span>
            <span class="text-slate-300">/</span>
            <span class="hover:text-slate-800 transition-colors cursor-pointer" @click="goSection">{{ sectionLabel }}</span>
            <span class="text-slate-300">/</span>
            <span class="font-semibold text-slate-900 truncate">{{ pageTitle }}</span>
          </nav>
        </div>

        <div class="flex items-center space-x-3.5 flex-shrink-0">
          <button class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="物模型规范文档">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
          </button>
          <button class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative" title="消息通知">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>
          <div class="flex items-center space-x-2 pl-1 cursor-pointer group">
            <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-500 text-white font-medium text-[10px] flex items-center justify-center ring-2 ring-slate-100 shadow-2xs">
              AD
            </div>
            <div class="flex flex-col text-left">
              <span class="text-xs font-semibold text-slate-700 leading-none group-hover:text-sky-600 transition-colors">IoT Console</span>
              <span class="text-[10px] text-slate-400 mt-0.5">我的空间 · 根组织</span>
            </div>
            <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
          </div>
        </div>
      </header>

      <!-- Routed workspace -->
      <div class="flex-1 flex overflow-hidden min-h-0">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const collapsed = ref(localStorage.getItem('iot-v2-rail') === 'collapsed')

function toggleCollapse() {
  collapsed.value = !collapsed.value
  flyoutKey.value = null
  localStorage.setItem('iot-v2-rail', collapsed.value ? 'collapsed' : 'expanded')
}

const section = computed(() => route.meta.section || 'thing-model')
const sectionLabel = computed(() => (section.value === 'product' ? '产品管理' : '物模型管理'))
const pageTitle = computed(() => route.meta.title || '')

const icons = {
  beaker: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>`,
  cube: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>`,
}

const menus = [
  {
    key: 'thing-model',
    title: '物模型管理',
    icon: icons.beaker,
    children: [
      { title: '能力库', path: '/thing-model-new/capability', match: ['/thing-model-new/capability'], count: 22 },
      { title: '物模型类目', path: '/thing-model-new/category', match: ['/thing-model-new/category'], count: 6 }
    ]
  },
  {
    key: 'product',
    title: '产品管理',
    icon: icons.cube,
    children: [
      { title: '产品开发', path: '/product-new/development', match: ['/product-new/development', '/product-new/config'], count: 13 },
      { title: '产品审核', path: '/product-new/audit', match: ['/product-new/audit'], count: 9 }
    ]
  }
]

const groups = reactive({ 'thing-model': section.value === 'thing-model', product: section.value === 'product' })

// Collapsed hover flyout
const flyoutKey = ref(null)
let flyoutTimer = null

function openFlyout(menu) {
  if (!collapsed.value || !menu.children) return
  cancelCloseFlyout()
  flyoutKey.value = menu.key
}
function scheduleCloseFlyout() {
  cancelCloseFlyout()
  flyoutTimer = setTimeout(() => { flyoutKey.value = null }, 180)
}
function cancelCloseFlyout() {
  if (flyoutTimer) {
    clearTimeout(flyoutTimer)
    flyoutTimer = null
  }
}

watch(section, (s, old) => {
  if (s === 'thing-model' || s === 'product') {
    if (old && old !== s) groups[old] = false
    groups[s] = true
  }
})

watch(() => route.path, () => { flyoutKey.value = null })

function toggleGroup(menu) {
  groups[menu.key] = !groups[menu.key]
}

function isChildActive(child) {
  return child.match.some((m) => {
    if (m === '/product-new') return route.path === m
    return route.path === m || route.path.startsWith(m + '/')
  })
}

function groupActive(menu) {
  return !!menu.children?.some(isChildActive)
}

function goFirst(menu) {
  if (menu.children?.length) router.push(menu.children[0].path)
}

function goHome() {
  router.push('/thing-model-new/capability')
}
function goSection() {
  router.push(section.value === 'product' ? '/product-new/development' : '/thing-model-new/capability')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
