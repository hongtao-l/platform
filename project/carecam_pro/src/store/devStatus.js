import { ref, computed } from 'vue'

// 全局 AI 开通状态: 'not_activated' | 'activated'
export const aiStatus = ref('activated')

// 各设备 AI 开通状态映射 (deviceName → true/false)
export const deviceAiStatus = ref({
  '标准摄像机': true,
  '广角摄像机': false,
  '多目摄像机': false,
  '门铃': false,
  '一氧化碳探测器': false,
  '烟雾探测器': false,
  '水浸探测器': false
})

// 检查指定设备是否已开通全能AI
export function isDeviceActivated(deviceName) {
  return deviceAiStatus.value[deviceName] || false
}

// 获取已开通的设备列表
export const activatedDevices = computed(() => {
  return Object.keys(deviceAiStatus.value).filter(k => deviceAiStatus.value[k])
})

// 获取默认选中的设备（优先已开通的第一个）
export const defaultActivatedDevice = computed(() => {
  const activated = activatedDevices.value
  return activated.length > 0 ? activated[0] : '标准摄像机'
})
