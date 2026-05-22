/**
 * 设备类型识别和路由分发工具
 *
 * 通过设备命名关键词匹配摄像机类型，分发到对应直播页：
 *   - 标准摄像机 → /liveview（PTZ、变焦、子设备）
 *   - 多目单流广角摄像机 → /liveview/wide-angle（32:9画布、全景小地图）
 *   - 多目摄像机 → /liveview/multi（1-4屏上下排列）
 *   - 其他类型 → /liveview/other（兜底）
 *
 * 正式阶段由物模型属性（lensCount 等）驱动，当前 demo 阶段按设备名匹配。
 */

export const DeviceType = {
  WIDE_ANGLE: 'wideAngle',
  MULTI: 'multi',
  STANDARD: 'standard',
  OTHER: 'other'
}

/**
 * 根据设备名或物模型属性返回路由路径
 * @param {string} deviceName - 设备名称
 * @param {number} lensCount  - 镜头数量（物模型属性，优先级最高）
 * @returns {string} 路由路径
 */
export function resolveDeviceRoute(deviceName, lensCount) {
  // 物模型属性优先
  if (lensCount !== undefined) {
    if (lensCount >= 2) return '/liveview/multi'
    return '/liveview'
  }

  if (!deviceName || typeof deviceName !== 'string') {
    return '/liveview'
  }

  const name = deviceName.toLowerCase()

  // 多目单流广角：关键词「广角 / wide」
  if (name.includes('广角') || name.includes('wide')) {
    return '/liveview/wide-angle'
  }

  // 多目：关键词「多目 / multi / 双目 / 三目 / 四目」
  if (/多目|multi|双目|三目|四目/.test(name)) {
    return '/liveview/multi'
  }

  // 特殊设备类型 → 兜底页
  if (/门铃|doorbell|探测器|detector|按钮|button|遥控|remote|门磁|水浸|烟感|燃气|一氧化碳|co[₂2]|红外|振动|震动|玻璃破碎|跌倒|fall|emergency|gas|smoke|glass/.test(name)) {
    return '/liveview/other'
  }

  return '/liveview'
}

export function getDeviceTypeLabel(deviceType) {
  switch (deviceType) {
    case DeviceType.WIDE_ANGLE: return '多目单流广角摄像机'
    case DeviceType.MULTI: return '多目摄像机'
    case DeviceType.OTHER: return '其他摄像机'
    default: return '实时预览'
  }
}
