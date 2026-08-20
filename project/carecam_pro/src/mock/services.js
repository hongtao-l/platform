/**
 * Mock: 我的服务 — 已购套餐数据
 */
export function fetchMyServices() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: [
          {
            id: 'srv001',
            name: '云存储 7 天循环',
            type: 'single',
            category: 'storage',
            expireDate: '2026-12-31',
            features: ['15天事件录像', '运动人形侦测'],
            boundDevice: { id: 'cam001', deviceId: 'DEV-2024-A001', name: '标准摄像机' }
          },
          {
            id: 'srv002',
            name: 'AI 全能侦测 Pro',
            type: 'multi',
            category: 'ai',
            maxDevices: 4,
            expireDate: '2027-06-15',
            features: ['15天事件录像', '运动人形侦测', '声音侦测', '宠物侦测', '烟火侦测'],
            boundDevices: [
              { id: 'cam002', deviceId: 'DEV-2024-A002', name: '广角摄像机' }
            ]
          },
          {
            id: 'srv003',
            name: '云存储 30 天循环',
            type: 'single',
            category: 'storage',
            expireDate: '2026-08-20',
            features: ['30天事件录像', '运动人形侦测'],
            boundDevice: null
          },
          {
            id: 'srv-nvr-001',
            name: 'NVR云存 4路',
            type: 'nvr',
            category: 'storage_nvr',
            maxChannels: 4,
            expireDate: '2026-09-13',
            features: ['支持4个通道', '15天事件录像', '运动人形侦测'],
            nvrDevice: { id: 'nvr001', deviceId: 'NVR-2024-A001', name: '8路NVR', channelCount: 8 },
            boundChannels: [
              { chNo: 1, name: '正门', online: true },
              { chNo: 2, name: '车库', online: true }
            ]
          }
        ]
      })
    }, 300)
  })
}

/** 计算待绑定套餐数：单设备未绑定 或 多设备有剩余槽位 或 NVR 有剩余通道额度 */
export function calcUnboundCount(services) {
  return services.filter((s) => {
    if (s.type === 'single') return !s.boundDevice
    if (s.type === 'nvr') return s.boundChannels.length < s.maxChannels
    return s.boundDevices.length < s.maxDevices
  }).length
}

/** 根据所有已购服务，计算每个设备已开通的服务类型集合 */
export function buildDeviceServiceMap(services) {
  const map = {}
  services.forEach((srv) => {
    const devices = srv.type === 'multi' ? srv.boundDevices : (srv.boundDevice ? [srv.boundDevice] : [])
    devices.forEach((d) => {
      if (!map[d.id]) map[d.id] = new Set()
      map[d.id].add(srv.category)
    })
  })
  return map
}

/** Mock: 可绑定设备列表 */
export function fetchAvailableDevices() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: [
          { id: 'cam001', deviceId: 'DEV-2024-A001', name: '标准摄像机', status: 'online', supportedCategories: ['storage'] },
          { id: 'cam002', deviceId: 'DEV-2024-A002', name: '广角摄像机', status: 'online', supportedCategories: ['ai'] },
          { id: 'cam003', deviceId: 'DEV-2024-A003', name: '多目摄像机', status: 'offline', supportedCategories: ['ai'] },
          { id: 'cam004', deviceId: 'DEV-2024-B001', name: '门口摄像机', status: 'online', supportedCategories: ['storage', 'ai'] },
          { id: 'nvr001', deviceId: 'NVR-2024-A001', name: '8路NVR', type: 'nvr', channelCount: 8, status: 'online', supportedCategories: ['storage_nvr'] }
        ]
      })
    }, 200)
  })
}

/** Mock: NVR 通道列表 */
export function fetchNvrChannels(nvrId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: {
          id: nvrId,
          deviceId: 'NVR-2024-A001',
          name: '8路NVR',
          type: 'nvr',
          status: 'online',
          channelCount: 8,
          channels: [
            { chNo: 1, name: '正门', online: true },
            { chNo: 2, name: '车库', online: true },
            { chNo: 3, name: '后院', online: true },
            { chNo: 4, name: '客厅', online: true },
            { chNo: 5, name: '厨房', online: false },
            { chNo: 6, name: '阳台', online: true },
            { chNo: 7, name: '侧门', online: true },
            { chNo: 8, name: '储藏室', online: false }
          ]
        }
      })
    }, 200)
  })
}
