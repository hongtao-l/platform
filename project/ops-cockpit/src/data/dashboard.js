// ============================================================
// 运营驾驶舱 — 模拟数据层
// TODO: 接入真实 API。当前所有数据为前端模拟数据兜底。
// 海外三区域（北美/欧洲/亚太）为模拟数据，界面上标 SIM。
// 真实接入时，只需把 fetchDashboard() 换成后端请求，返回结构保持一致即可。
// ============================================================

// ---- 维度枚举 ----
export const REGIONS = [
  { key: 'all', label: '全部区域', sim: false },
  { key: 'domestic', label: '国内', sim: false },
  { key: 'na', label: '北美', sim: true },
  { key: 'eu', label: '欧洲', sim: true },
  { key: 'apac', label: '亚太', sim: true }
]

export const TIME_RANGES = [
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季' },
  { key: 'year', label: '本年' },
  { key: 'custom', label: '自定义' }
]

export const APPS = [
  { key: 'qx', label: '牵心PRO' },
  { key: 'hm', label: '鹤梦之家' }
]

export const FUNNEL_TABS = [
  { key: 'mall', label: '商城位' },
  { key: 'recommend', label: '推荐位' },
  { key: 'activity', label: '活动位' },
  { key: 'total', label: '汇总' }
]

// 区域主色（与设计 Token 对齐）
export const REGION_COLORS = {
  domestic: 'primary',
  na: 'secondary',
  eu: 'tertiary',
  apac: 'warning'
}

// 时间粒度对基准值的缩放系数（模拟：季≈3月，年≈12月）
const TIME_MULTIPLIER = { month: 1, quarter: 3.05, year: 11.6, custom: 1.4 }
// APP 对基准值的占比（模拟：牵心PRO 为主力）
const APP_MULTIPLIER = { qx: 1, hm: 0.42 }

// ---- 各区域基准数据（本月 / 牵心PRO 口径）----
// revenue 单位：元；users：人
const REGION_BASE = {
  domestic: {
    revenue: 7960000,
    users: 52400,
    conversion: 5.1,
    yoy: { revenue: 14.2, users: 9.6, arp: 4.1, conversion: 0.4 },
    mom: { revenue: 3.8, users: 2.1, arp: 1.2, conversion: -0.2 },
    // 漏斗：点击 -> 曝光 -> 支付 -> 转化（用户口径）
    funnel: {
      mall: [72000, 52000, 24000, 20800],
      recommend: [38000, 27000, 12500, 10600],
      activity: [18500, 13800, 6000, 5200]
    },
    // 服务营收（元）
    services: { cloud: 4300000, ai: 2100000, album: 1000000 },
    // 运营位营收（元）
    slots: { mall: 3600000, recommend: 2600000, activity: 1400000 },
    // 服务收入趋势（近 6 个周期）
    trend: {
      cloud: [3.2, 3.5, 3.8, 4.0, 4.1, 4.3],
      ai: [1.4, 1.5, 1.7, 1.9, 2.0, 2.1],
      album: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    }
  },
  na: {
    revenue: 2310000,
    users: 15200,
    conversion: 4.2,
    yoy: { revenue: 22.5, users: 15.1, arp: 6.4, conversion: 0.9 },
    mom: { revenue: 5.2, users: 3.4, arp: 1.8, conversion: 0.3 },
    funnel: {
      mall: [21000, 15200, 6800, 5900],
      recommend: [11000, 7900, 3400, 2900],
      activity: [5200, 3800, 1600, 1350]
    },
    services: { cloud: 1200000, ai: 800000, album: 310000 },
    slots: { mall: 980000, recommend: 760000, activity: 570000 },
    trend: {
      cloud: [0.8, 0.9, 1.0, 1.05, 1.1, 1.2],
      ai: [0.4, 0.45, 0.55, 0.65, 0.72, 0.8],
      album: [0.12, 0.15, 0.2, 0.24, 0.28, 0.31]
    }
  },
  eu: {
    revenue: 1500000,
    users: 10800,
    conversion: 3.8,
    yoy: { revenue: 18.9, users: 12.7, arp: 5.2, conversion: -0.3 },
    mom: { revenue: 4.1, users: 2.8, arp: 1.1, conversion: -0.4 },
    funnel: {
      mall: [14000, 9900, 4200, 3600],
      recommend: [7300, 5100, 2100, 1800],
      activity: [3400, 2400, 980, 820]
    },
    services: { cloud: 820000, ai: 460000, album: 220000 },
    slots: { mall: 640000, recommend: 520000, activity: 340000 },
    trend: {
      cloud: [0.55, 0.6, 0.68, 0.72, 0.78, 0.82],
      ai: [0.28, 0.32, 0.38, 0.42, 0.45, 0.46],
      album: [0.1, 0.12, 0.15, 0.18, 0.2, 0.22]
    }
  },
  apac: {
    revenue: 1000000,
    users: 8020,
    conversion: 4.0,
    yoy: { revenue: 16.4, users: 11.2, arp: 3.7, conversion: 0.2 },
    mom: { revenue: 2.9, users: 1.9, arp: 0.8, conversion: 0.1 },
    funnel: {
      mall: [9800, 7000, 3000, 2600],
      recommend: [5100, 3600, 1500, 1280],
      activity: [2400, 1700, 700, 590]
    },
    services: { cloud: 560000, ai: 300000, album: 150000 },
    slots: { mall: 430000, recommend: 350000, activity: 220000 },
    trend: {
      cloud: [0.38, 0.42, 0.48, 0.52, 0.55, 0.56],
      ai: [0.2, 0.22, 0.26, 0.28, 0.3, 0.3],
      album: [0.08, 0.1, 0.12, 0.13, 0.14, 0.15]
    }
  }
}

const TREND_LABELS = {
  month: ['第1周', '第2周', '第3周', '第4周', '第5周', '本周'],
  quarter: ['1月', '2月', '3月', '4月', '5月', '本月'],
  year: ['1月', '3月', '5月', '7月', '9月', '11月'],
  custom: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']
}

const SERVICE_META = [
  { key: 'cloud', label: '云存储', color: 'primary' },
  { key: 'ai', label: '全能AI', color: 'secondary' },
  { key: 'album', label: '时光相册', color: 'tertiary' }
]

const SLOT_META = [
  { key: 'mall', label: '商城位', color: 'primary' },
  { key: 'recommend', label: '推荐位', color: 'secondary' },
  { key: 'activity', label: '活动位', color: 'tertiary' }
]

const FUNNEL_STAGE_META = [
  { key: 'click', label: '点击', color: 'primary' },
  { key: 'expose', label: '曝光', color: 'secondary' },
  { key: 'pay', label: '支付', color: 'tertiary' },
  { key: 'convert', label: '转化', color: 'success' }
]

// ---- 工具 ----
const activeRegions = (regionKey) =>
  regionKey === 'all' ? ['domestic', 'na', 'eu', 'apac'] : [regionKey]

const scale = (v, timeKey, appKey) => v * TIME_MULTIPLIER[timeKey] * APP_MULTIPLIER[appKey]

function sumFunnel(regions, tab) {
  // 返回 4 层数组
  const acc = [0, 0, 0, 0]
  for (const r of regions) {
    const base = REGION_BASE[r].funnel
    const rows = tab === 'total' ? ['mall', 'recommend', 'activity'] : [tab]
    for (const row of rows) {
      base[row].forEach((v, i) => (acc[i] += v))
    }
  }
  return acc
}

// ============================================================
// 核心：根据筛选条件计算整屏数据
// ============================================================
export function computeDashboard({ region, time, app, funnelTab }) {
  const regions = activeRegions(region)

  // --- 汇总 KPI ---
  let totalRevenue = 0
  let totalUsers = 0
  let convWeightedNum = 0
  const revenueByRegion = {}
  const yoyAgg = { revenue: 0, users: 0, arp: 0, conversion: 0 }
  const momAgg = { revenue: 0, users: 0, arp: 0, conversion: 0 }

  for (const r of regions) {
    const b = REGION_BASE[r]
    const rev = scale(b.revenue, time, app)
    const usr = scale(b.users, time, app)
    totalRevenue += rev
    totalUsers += usr
    convWeightedNum += b.conversion * usr
    revenueByRegion[r] = rev
    // 加权累积同比/环比（按收入权重）
    for (const k of Object.keys(yoyAgg)) {
      yoyAgg[k] += b.yoy[k] * rev
      momAgg[k] += b.mom[k] * rev
    }
  }
  for (const k of Object.keys(yoyAgg)) {
    yoyAgg[k] = totalRevenue ? +(yoyAgg[k] / totalRevenue).toFixed(1) : 0
    momAgg[k] = totalRevenue ? +(momAgg[k] / totalRevenue).toFixed(1) : 0
  }

  const arp = totalUsers ? totalRevenue / totalUsers : 0
  const conversion = totalUsers ? convWeightedNum / totalUsers : 0

  // --- 区域占比 ---
  const regionShare = ['domestic', 'na', 'eu', 'apac']
    .filter((r) => regions.includes(r))
    .map((r) => {
      const rev = revenueByRegion[r]
      return {
        key: r,
        label: REGIONS.find((x) => x.key === r).label,
        color: REGION_COLORS[r],
        sim: REGION_BASE[r] && REGIONS.find((x) => x.key === r).sim,
        revenue: rev,
        percent: totalRevenue ? +((rev / totalRevenue) * 100).toFixed(1) : 0
      }
    })

  // --- 区域指标表 ---
  const regionTable = ['domestic', 'na', 'eu', 'apac']
    .filter((r) => regions.includes(r))
    .map((r) => {
      const b = REGION_BASE[r]
      const rev = revenueByRegion[r]
      const usr = scale(b.users, time, app)
      return {
        key: r,
        label: REGIONS.find((x) => x.key === r).label,
        color: REGION_COLORS[r],
        sim: REGIONS.find((x) => x.key === r).sim,
        revenue: rev,
        users: usr,
        conversion: b.conversion,
        convTone: b.conversion >= 5 ? 'success' : b.conversion < 3.9 ? 'error' : 'neutral'
      }
    })
  const maxRegionRev = Math.max(...regionTable.map((x) => x.revenue), 1)
  regionTable.forEach((x) => (x.barPct = Math.round((x.revenue / maxRegionRev) * 100)))

  // --- 漏斗 ---
  const funnelVals = sumFunnel(regions, funnelTab).map((v) => scale(v, time, app))
  const funnelMax = funnelVals[0] || 1
  const funnel = FUNNEL_STAGE_META.map((m, i) => ({
    ...m,
    value: Math.round(funnelVals[i]),
    heightPct: Math.max(8, Math.round((funnelVals[i] / funnelMax) * 100))
  }))
  const stepRates = []
  for (let i = 1; i < funnelVals.length; i++) {
    stepRates.push(funnelVals[i - 1] ? +((funnelVals[i] / funnelVals[i - 1]) * 100).toFixed(1) : 0)
  }
  const overallRate = funnelVals[0]
    ? +((funnelVals[funnelVals.length - 1] / funnelVals[0]) * 100).toFixed(1)
    : 0

  // --- 运营位排行 ---
  const slotAgg = {}
  for (const r of regions) {
    for (const s of SLOT_META) {
      slotAgg[s.key] = (slotAgg[s.key] || 0) + scale(REGION_BASE[r].slots[s.key], time, app)
    }
  }
  const slotMaxRev = Math.max(...SLOT_META.map((s) => slotAgg[s.key]), 1)
  const slotRevenue = SLOT_META.map((s) => ({
    ...s,
    revenue: slotAgg[s.key],
    heightPct: Math.max(10, Math.round((slotAgg[s.key] / slotMaxRev) * 100))
  }))
  // 运营位转化率（模拟：由漏斗末层/首层估算，固定基准 + 微扰）
  const slotConvBase = { mall: 5.2, recommend: 3.1, activity: 2.4 }
  const slotConversion = SLOT_META.map((s) => ({
    ...s,
    rate: slotConvBase[s.key]
  }))

  // --- 服务营收排行 ---
  const svcAgg = {}
  for (const r of regions) {
    for (const s of SERVICE_META) {
      svcAgg[s.key] = (svcAgg[s.key] || 0) + scale(REGION_BASE[r].services[s.key], time, app)
    }
  }
  const svcMax = Math.max(...SERVICE_META.map((s) => svcAgg[s.key]), 1)
  const serviceRanking = SERVICE_META.map((s, i) => ({
    ...s,
    rank: i + 1,
    revenue: svcAgg[s.key],
    barPct: Math.round((svcAgg[s.key] / svcMax) * 100)
  })).sort((a, b) => b.revenue - a.revenue)
  serviceRanking.forEach((s, i) => (s.rank = i + 1))

  // --- 服务趋势 ---
  const trendAgg = { cloud: [], ai: [], album: [] }
  for (const key of Object.keys(trendAgg)) {
    for (let i = 0; i < 6; i++) {
      let sum = 0
      for (const r of regions) sum += REGION_BASE[r].trend[key][i]
      trendAgg[key].push(+scale(sum, time, app).toFixed(2))
    }
  }
  const serviceTrend = {
    labels: TREND_LABELS[time],
    series: SERVICE_META.map((s) => ({ ...s, points: trendAgg[s.key] }))
  }

  return {
    kpi: {
      revenue: Math.round(totalRevenue),
      arp: +arp.toFixed(2),
      users: Math.round(totalUsers),
      conversion: +conversion.toFixed(1),
      yoy: yoyAgg,
      mom: momAgg
    },
    regionShare,
    regionTable,
    funnel,
    stepRates,
    overallRate,
    slotRevenue,
    slotConversion,
    serviceRanking,
    serviceTrend
  }
}

// ============================================================
// 模拟异步获取（预留真实 API 接入口）
// TODO: 替换为 axios.get('/api/dashboard', { params }) 等真实请求
// ============================================================
export function fetchDashboard(filters) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(computeDashboard(filters)), 380)
  })
}
