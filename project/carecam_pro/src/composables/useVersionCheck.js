import { ref } from 'vue'
import { showToast } from 'vant'
import { checkAppVersion } from '@/api/app'

// 当前 App 版本
const APP_VERSION = '1.0.0'

// 模块级状态（单例，所有组件共享）
const showUpgrade = ref(false)
const upgradeInfo = ref(null)
const isChecking = ref(false)
const hasUpgraded = ref(false)

/** 比较两个 semver 版本号，返回 true 表示 v1 < v2 */
function isNewer(v1, v2) {
  const a = v1.split('.').map(Number)
  const b = v2.split('.').map(Number)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const av = a[i] || 0
    const bv = b[i] || 0
    if (av < bv) return true
    if (av > bv) return false
  }
  return false
}

export function useVersionCheck() {
  /** 自动检测：每次启动都弹（演示用，后续改为每日限制） */
  async function checkAuto() {
    if (hasUpgraded.value) return
    try {
      const res = await checkAppVersion()
      if (res.code !== 0) return
      const { version, downloadUrl, releaseNotes } = res.data
      if (!version || !isNewer(APP_VERSION, version)) return
      upgradeInfo.value = { version, downloadUrl, releaseNotes }
      showUpgrade.value = true
    } catch {
      // 自动检测静默失败
    }
  }

  /** 手动检测（有反馈） */
  async function checkManual() {
    isChecking.value = true
    try {
      if (hasUpgraded.value) {
        showToast('当前已是最新版本')
        return
      }
      const res = await checkAppVersion()
      if (res.code !== 0) {
        showToast('检测失败，请稍后重试')
        return
      }
      const { version, downloadUrl, releaseNotes } = res.data
      if (!version || !isNewer(APP_VERSION, version)) {
        showToast('当前已是最新版本')
        return
      }
      upgradeInfo.value = { version, downloadUrl, releaseNotes }
      showUpgrade.value = true
    } catch {
      showToast('网络异常，请稍后重试')
    } finally {
      isChecking.value = false
    }
  }

  function onUpgrade() {
    const url = upgradeInfo.value?.downloadUrl
    if (url) {
      window.open(url, '_blank')
    }
    showUpgrade.value = false
    hasUpgraded.value = true
  }

  function onDismiss() {
    showUpgrade.value = false
  }

  return {
    APP_VERSION,
    showUpgrade,
    upgradeInfo,
    isChecking,
    checkAuto,
    checkManual,
    onUpgrade,
    onDismiss
  }
}
