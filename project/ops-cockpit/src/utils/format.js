// ============================================================
// 数值格式化工具
// ============================================================

// ¥12.8M / ¥7.9M / ¥980K 等紧凑金额（元 -> 带单位）
export function money(v) {
  if (v == null) return '—'
  const n = Math.abs(v)
  if (n >= 1e8) return `¥${(v / 1e8).toFixed(1)}亿`
  if (n >= 1e6) return `¥${(v / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `¥${(v / 1e3).toFixed(1)}K`
  return `¥${Math.round(v)}`
}

// 千分位整数：86,420
export function int(v) {
  if (v == null) return '—'
  return Math.round(v).toLocaleString('en-US')
}

// 保留 n 位小数
export function fixed(v, n = 1) {
  if (v == null) return '—'
  return Number(v).toFixed(n)
}

// 百分比：4.8%
export function pct(v, n = 1) {
  if (v == null) return '—'
  return `${Number(v).toFixed(n)}%`
}

// 金额（元）保留两位：¥38.50
export function money2(v) {
  if (v == null) return '—'
  return `¥${Number(v).toFixed(2)}`
}
