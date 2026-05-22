import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage } from '@/utils/index'
import config from '@/config/index'

const DISMISS_KEY = config.storageKeys.activityDismissCache

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function weekStr() {
  const d = new Date()
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return monday.toISOString().slice(0, 10)
}

// 内联 Mock 数据
const MOCK_ACTIVITIES = [
  {
    id: 'AS001',
    name: '618大促Banner活动',
    status: 'active',
    startTime: '2026-05-01T00:00:00',
    endTime: '2026-12-31T23:59:59',
    position: 'slot_banner',
    regions: ['国内'],
    apps: ['牵心PRO'],
    mediaUrl: '',
    activityUrl: '/store',
    popupFrequency: '',
    priority: 10,
    packages: []
  },
  {
    id: 'AS002',
    name: '新人专享礼包',
    status: 'active',
    startTime: '2026-05-01T00:00:00',
    endTime: '2026-12-31T23:59:59',
    position: 'slot_popup',
    regions: ['国内'],
    apps: ['牵心PRO'],
    mediaUrl: '',
    activityUrl: '/store',
    popupFrequency: 'once_daily',
    priority: 5,
    packages: []
  },
  {
    id: 'AS003',
    name: '限时抢购',
    status: 'active',
    startTime: '2026-05-01T00:00:00',
    endTime: '2026-12-31T23:59:59',
    position: 'slot_floating',
    regions: ['国内'],
    apps: ['牵心PRO'],
    mediaUrl: '',
    activityUrl: '/store',
    popupFrequency: '',
    priority: 3,
    packages: []
  }
]

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([])
  const dismissedPopups = ref({})
  const sessionDismissed = ref(false)
  const forcePopup = ref(0)

  // —— 缓存 ——
  function loadDismissCache() {
    const cached = getStorage(DISMISS_KEY)
    if (cached && typeof cached === 'object') {
      dismissedPopups.value = cached
    }
  }

  function saveDismissCache() {
    setStorage(DISMISS_KEY, dismissedPopups.value)
  }

  function dismissPopup(id) {
    dismissedPopups.value[id] = todayStr()
    saveDismissCache()
  }

  function dismissSession() {
    sessionDismissed.value = true
  }

  function isPopupDismissed(popup) {
    if (sessionDismissed.value) return true
    const freq = popup.popupFrequency || 'always'
    if (freq === 'always') return false
    const d = dismissedPopups.value[popup.id]
    if (!d) return false
    if (freq === 'once_daily') return d === todayStr()
    if (freq === 'once_weekly') return d === weekStr()
    return false
  }

  const now = () => new Date().toISOString()

  // —— Getters ——
  const bannerCount = computed(() => activeBanners.value.length)
  const popupCount = computed(() => activePopups.value.length)
  const fabCount = computed(() => activeFab.value ? 1 : 0)

  const activeBanners = computed(() =>
    activities.value
      .filter(a => a.position === 'slot_banner' && a.status === 'active'
        && a.startTime <= now() && a.endTime >= now())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
  )

  const activePopups = computed(() =>
    activities.value
      .filter(a => a.position === 'slot_popup' && a.status === 'active'
        && a.startTime <= now() && a.endTime >= now())
      .filter(a => !isPopupDismissed(a))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
  )

  const activeFab = computed(() => {
    const fabs = activities.value
      .filter(a => a.position === 'slot_floating' && a.status === 'active'
        && a.startTime <= now() && a.endTime >= now())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    if (fabs.length === 0) return null
    const fab = fabs[0]
    if (dismissedPopups.value[fab.id] === todayStr()) return null
    return fab
  })

  // —— Demo 控制方法 ——
  function initMockData() {
    if (activities.value.length === 0) {
      activities.value = MOCK_ACTIVITIES.map(a => ({ ...a, id: a.id }))
    }
  }

  // 按位置添加/移除演示活动
  function addDemo(position) {
    const templates = {
      slot_banner: { name: '演示Banner', position: 'slot_banner', activityUrl: '/store', priority: 10 },
      slot_popup: { name: '演示弹窗', position: 'slot_popup', activityUrl: '/store', popupFrequency: 'always', priority: 5 },
      slot_floating: { name: '演示悬浮', position: 'slot_floating', activityUrl: '/store', priority: 3 }
    }
    const tpl = templates[position]
    if (!tpl) return
    const id = 'demo_' + position + '_' + Date.now()
    const start = new Date()
    start.setFullYear(start.getFullYear() - 1)
    const end = new Date()
    end.setFullYear(end.getFullYear() + 1)
    activities.value.push({
      id,
      name: tpl.name,
      status: 'active',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      position: tpl.position,
      regions: ['国内'],
      apps: ['牵心PRO'],
      mediaUrl: '',
      activityUrl: tpl.activityUrl,
      popupFrequency: tpl.popupFrequency || '',
      priority: tpl.priority,
      packages: []
    })
  }

  function removeDemo(position) {
    activities.value = activities.value.filter(a => !(a.position === position && a.id.startsWith('demo_')))
  }

  function resetAll() {
    activities.value = []
    dismissedPopups.value = {}
    sessionDismissed.value = false
    forcePopup.value = 0
    saveDismissCache()
  }

  // 手动触发弹窗（演示用）
  function triggerPopupNow() {
    // 清除所有popup的dismiss状态
    const newCache = { ...dismissedPopups.value }
    activePopups.value.forEach(p => { delete newCache[p.id] })
    // 也清除还没渲染的demo popup
    Object.keys(newCache).forEach(k => { if (k.startsWith('demo_slot_popup_')) delete newCache[k] })
    dismissedPopups.value = newCache
    saveDismissCache()
    sessionDismissed.value = false
    forcePopup.value++
  }

  // 初始化
  loadDismissCache()
  initMockData()

  return {
    activities, dismissedPopups, sessionDismissed, forcePopup,
    activeBanners, activePopups, activeFab,
    bannerCount, popupCount, fabCount,
    dismissPopup, dismissSession, triggerPopupNow,
    addDemo, removeDemo, resetAll, initMockData
  }
})
