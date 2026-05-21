/**
 * 设备类型识别和路由分发工具
 *
 * 注意：设备名仅作演示标识，实际设备能力由物模型属性决定。
 * 这里的路由分发用于 demo 阶段按设备名快速跳转到对应演示页面。
 */

export const DeviceType = {
  WIDE_ANGLE: 'wideAngle',
  MULTI: 'multi',
  STANDARD: 'standard'
}

/**
 * 根据物模型属性或设备名获取路由路径
 *
 * Demo 阶段：按设备名关键词匹配
 * 正式阶段：由物模型 lensCount + 其他属性驱动
 *
 * @param {string} deviceName - 设备名称
 * @param {number} lensCount  - 镜头数量（物模型属性）
 * @returns {string} 路由路径
 */
export function resolveDeviceRoute(deviceName, lensCount) {
  // 正式逻辑：物模型驱动
  if (lensCount !== undefined) {
    if (lensCount >= 2) return '/liveview/multi'
    return '/liveview'
  }

  // Demo 阶段：设备名关键词匹配
  if (!deviceName || typeof deviceName !== 'string') {
    return '/liveview'
  }

  const name = deviceName.toLowerCase()

  if (name.includes('广角') || name.includes('wide')) {
    return '/liveview/wide-angle'
  }
  if (name.includes('多目') || name.includes('multi')) {
    return '/liveview/multi'
  }

  return '/liveview'
}

export function getDeviceTypeLabel(deviceType) {
  switch (deviceType) {
    case DeviceType.WIDE_ANGLE: return '广角摄像机'
    case DeviceType.MULTI: return '多目摄像机'
    default: return '实时预览'
  }
}
