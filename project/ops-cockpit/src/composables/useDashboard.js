import { reactive, ref, computed, watch } from 'vue'
import {
  REGIONS,
  TIME_RANGES,
  APPS,
  FUNNEL_TABS,
  fetchDashboard
} from '../data/dashboard.js'

// ============================================================
// 运营驾驶舱 — 响应式状态与数据编排
// 筛选条件（区域/时间/APP/同比环比/漏斗Tab）驱动派生数据。
// ============================================================

const pad = (n) => String(n).padStart(2, '0')
function nowStamp() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function useDashboard() {
  // ---- 筛选状态 ----
  const filters = reactive({
    region: 'all',
    time: 'month',
    app: 'qx',
    funnelTab: 'mall'
  })
  // 同比 / 环比 视角（KPI 卡片副指标切换）
  const compareMode = ref('yoy') // 'yoy' | 'mom'

  // ---- 数据状态 ----
  const data = ref(null)
  const loading = ref(false)
  const updatedAt = ref(nowStamp())

  async function load() {
    loading.value = true
    const res = await fetchDashboard({ ...filters })
    data.value = res
    updatedAt.value = nowStamp()
    loading.value = false
  }

  // 首次加载
  load()

  // 筛选变化即重新计算
  watch(
    () => ({ ...filters }),
    () => load(),
    { deep: false }
  )

  // ---- 交互动作 ----
  const setRegion = (k) => (filters.region = k)
  const setTime = (k) => (filters.time = k)
  const setApp = (k) => (filters.app = k)
  const setFunnelTab = (k) => (filters.funnelTab = k)
  const setCompareMode = (m) => (compareMode.value = m)
  const refresh = () => load()

  // ---- 便捷派生 ----
  const kpi = computed(() => data.value?.kpi ?? null)
  // 当前视角下的 KPI 副指标（同比 or 环比）
  const kpiCompare = computed(() => {
    if (!kpi.value) return null
    return compareMode.value === 'yoy' ? kpi.value.yoy : kpi.value.mom
  })
  const compareLabel = computed(() => (compareMode.value === 'yoy' ? '同比' : '环比'))

  return {
    // enums
    REGIONS,
    TIME_RANGES,
    APPS,
    FUNNEL_TABS,
    // state
    filters,
    compareMode,
    compareLabel,
    data,
    loading,
    updatedAt,
    kpi,
    kpiCompare,
    // actions
    setRegion,
    setTime,
    setApp,
    setFunnelTab,
    setCompareMode,
    refresh
  }
}
