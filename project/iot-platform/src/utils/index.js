/**
 * 工具函数统一导出
 */

/**
 * 防抖函数
 * @param {Function} fn - 需要防抖的函数
 * @param {Number} delay - 延迟时间（毫秒）
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn - 需要节流的函数
 * @param {Number} interval - 间隔时间（毫秒）
 */
export function throttle(fn, interval = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 深拷贝
 * @param {Object} obj - 需要拷贝的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  const clone = Array.isArray(obj) ? [] : {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key])
    }
  }
  return clone
}

/**
 * 格式化日期
 * @param {Date|String|Number} date - 日期
 * @param {String} format - 格式化模板
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 生成唯一 ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 存储到 localStorage
 * @param {String} key - 键名
 * @param {Any} value - 值
 */
export function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * 从 localStorage 获取
 * @param {String} key - 键名
 */
export function getStorage(key) {
  const value = localStorage.getItem(key)
  try {
    return value ? JSON.parse(value) : null
  } catch {
    return value
  }
}

/**
 * 从 localStorage 删除
 * @param {String} key - 键名
 */
export function removeStorage(key) {
  localStorage.removeItem(key)
}
