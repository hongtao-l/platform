import { reactive, computed } from 'vue'

let _id = 0
const nextId = () => ++_id

// ===== 类目 =====
const initialCategories = [
  { id: nextId(), name: 'IPC摄像机', identifier: 'IpcCamera', descr: 'IPC摄像机设备类目，包含视频监控、事件侦测相关能力' },
  { id: nextId(), name: '智能门铃', identifier: 'SmartDoorbell', descr: '智能门铃设备类目，包含门铃呼叫、门锁联动相关能力' },
  { id: nextId(), name: '传感安防', identifier: 'SensorSecurity', descr: '传感器和安防设备类目，包含环境监测和安防告警能力' }
]

// ===== 能力模块（独立池） =====
const initialModules = [
  { id: nextId(), name: '工作模式模块', identifier: 'WorkModeModule' },
  { id: nextId(), name: '录制模式模块', identifier: 'RecordModeModule' },
  { id: nextId(), name: '灯光模式模块', identifier: 'LightModeModule' },
  { id: nextId(), name: '事件侦测模块', identifier: 'EventDetectModule' },
  { id: nextId(), name: '门铃设置模块', identifier: 'BellSettingModule' },
  { id: nextId(), name: '安防侦测模块', identifier: 'SecurityDetectModule' }
]

// ===== 标准能力（独立池） =====
const initialCapabilities = [
  // 工作模式模块
  { id: nextId(), moduleId: initialModules[0].id, capType: 'prop', name: '工作模式', identifier: 'WorkMode', descr: '设备工作模式切换（低功耗/AOV/长电/自定义）',
    dataDef: { dataType:'enum', accessMode:'rw', enumValues:[{name:'低功耗模式',val:0},{name:'AOV模式',val:1},{name:'长电模式',val:2},{name:'自定义模式',val:3}], defaultVal:'0' } },
  { id: nextId(), moduleId: initialModules[0].id, capType: 'prop', name: 'AOV拍照帧率', identifier: 'AovCaptureFrameRate', descr: 'AOV模式下拍照的时间间隔',
    dataDef: { dataType:'int', accessMode:'rw', min:1, max:10, step:1, unit:'秒/帧', defaultVal:'1' } },
  { id: nextId(), moduleId: initialModules[0].id, capType: 'prop', name: 'AOV切换低功耗电量', identifier: 'AovAutoSwitchPower', descr: 'AOV模式下自动切换到低功耗的电量阈值',
    dataDef: { dataType:'int', accessMode:'rw', min:0, max:100, step:1, unit:'%', defaultVal:'30' } },

  // 录制模式模块
  { id: nextId(), moduleId: initialModules[1].id, capType: 'prop', name: '常规录制', identifier: 'NormalRecord', descr: '常规录制模式设置（全天/自定义/关闭）',
    dataDef: { dataType:'enum', accessMode:'rw', enumValues:[{name:'全天',val:0},{name:'自定义时段',val:1},{name:'关闭',val:2}], defaultVal:'0' } },
  { id: nextId(), moduleId: initialModules[1].id, capType: 'prop', name: '事件录制', identifier: 'EventRecord', descr: '是否开启事件触发录制',
    dataDef: { dataType:'boolean', accessMode:'rw', trueLabel:'开启', falseLabel:'关闭', defaultVal:'1' } },
  { id: nextId(), moduleId: initialModules[1].id, capType: 'prop', name: '录制清晰度', identifier: 'RecordResolution', descr: '录制视频清晰度等级',
    dataDef: { dataType:'enum', accessMode:'rw', enumValues:[{name:'超清',val:0},{name:'高清',val:1},{name:'标清',val:2}], defaultVal:'1' } },
  { id: nextId(), moduleId: initialModules[1].id, capType: 'prop', name: '抓拍间隔', identifier: 'CaptureInterval', descr: '事件触发时连续抓拍的时间间隔',
    dataDef: { dataType:'int', accessMode:'rw', min:100, max:10000, step:100, unit:'ms', defaultVal:'500' } },
  { id: nextId(), moduleId: initialModules[1].id, capType: 'prop', name: '事件录制时长', identifier: 'EventRecordDuration', descr: '事件触发后单次录制时长',
    dataDef: { dataType:'int', accessMode:'rw', min:5, max:300, step:5, unit:'秒', defaultVal:'30' } },
  { id: nextId(), moduleId: initialModules[1].id, capType: 'svc', name: '格式化存储', identifier: 'FormatStorage', descr: '远程格式化设备存储卡',
    dataDef: { dataType:'service', inputParams:[], outputParams:[{name:'操作结果',identifier:'result',dataType:'boolean',trueLabel:'成功',falseLabel:'失败',defaultVal:'1'}] } },

  // 灯光模式模块
  { id: nextId(), moduleId: initialModules[2].id, capType: 'prop', name: '灯光模式', identifier: 'LightMode', descr: '灯光模式切换（全彩/红外/智能/自定义/关闭）',
    dataDef: { dataType:'enum', accessMode:'rw', enumValues:[{name:'全彩模式',val:0},{name:'红外模式',val:1},{name:'智能模式',val:2},{name:'自定义模式',val:3},{name:'关闭',val:4}], defaultVal:'1' } },

  // 事件侦测模块
  { id: nextId(), moduleId: initialModules[3].id, capType: 'evt', name: '移动侦测', identifier: 'MotionDetect', descr: '设备检测到物体移动时上报告警事件',
    dataDef: { dataType:'event', eventType:'alarm', outputParams:[] } },
  { id: nextId(), moduleId: initialModules[3].id, capType: 'evt', name: '电量不足告警', identifier: 'LowBattery', descr: '设备电量低于阈值时上报',
    dataDef: { dataType:'event', eventType:'alarm', outputParams:[{name:'当前电量',identifier:'battery',dataType:'int',min:0,max:100,step:1,unit:'%',defaultVal:'0'}] } },
  { id: nextId(), moduleId: initialModules[3].id, capType: 'evt', name: '设备上线通知', identifier: 'DeviceOnline', descr: '设备从离线变为在线时上报',
    dataDef: { dataType:'event', eventType:'info', outputParams:[] } },

  // 门铃设置模块
  { id: nextId(), moduleId: initialModules[4].id, capType: 'prop', name: '门铃音量', identifier: 'BellVolume', descr: '门铃音量大小设置',
    dataDef: { dataType:'int', accessMode:'rw', min:0, max:100, step:5, unit:'%', defaultVal:'50' } },
  { id: nextId(), moduleId: initialModules[4].id, capType: 'prop', name: '门铃铃声', identifier: 'BellRingtone', descr: '门铃铃声选择',
    dataDef: { dataType:'enum', accessMode:'rw', enumValues:[{name:'经典铃声',val:0},{name:'柔和铃声',val:1},{name:'轻快铃声',val:2}], defaultVal:'0' } },
  { id: nextId(), moduleId: initialModules[4].id, capType: 'svc', name: '远程开门', identifier: 'RemoteUnlock', descr: '远程控制门锁开启',
    dataDef: { dataType:'service', inputParams:[], outputParams:[{name:'开门结果',identifier:'result',dataType:'boolean',trueLabel:'成功',falseLabel:'失败',defaultVal:'1'}] } },
  { id: nextId(), moduleId: initialModules[4].id, capType: 'evt', name: '门铃呼叫', identifier: 'BellRing', descr: '访客按下门铃时上报',
    dataDef: { dataType:'event', eventType:'info', outputParams:[] } },

  // 安防侦测模块
  { id: nextId(), moduleId: initialModules[5].id, capType: 'prop', name: '告警灵敏度', identifier: 'AlarmSensitivity', descr: '安防告警的触发灵敏度',
    dataDef: { dataType:'enum', accessMode:'rw', enumValues:[{name:'高',val:0},{name:'中',val:1},{name:'低',val:2}], defaultVal:'1' } },
  { id: nextId(), moduleId: initialModules[5].id, capType: 'evt', name: '烟雾告警', identifier: 'SmokeAlarm', descr: '检测到烟雾时上报',
    dataDef: { dataType:'event', eventType:'alarm', outputParams:[] } },
  { id: nextId(), moduleId: initialModules[5].id, capType: 'evt', name: '水浸告警', identifier: 'WaterLeak', descr: '检测到水浸时上报',
    dataDef: { dataType:'event', eventType:'alarm', outputParams:[] } }
]

// ===== 类目-能力关联 =====
// IPC摄像机: WorkMode, AovCaptureFrameRate, AovAutoSwitchPower, NormalRecord, EventRecord, RecordResolution, CaptureInterval, EventRecordDuration, FormatStorage, LightMode, MotionDetect, LowBattery, DeviceOnline
// 智能门铃: BellVolume, BellRingtone, RemoteUnlock, BellRing, MotionDetect, LowBattery, DeviceOnline
// 传感安防: AlarmSensitivity, MotionDetect, SmokeAlarm, WaterLeak, LowBattery, DeviceOnline

const initialCategoryCaps = [
  // IPC摄像机 — 工作模式模块
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[0].id },
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[1].id },
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[2].id },
  // IPC摄像机 — 录制模式模块
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[3].id },
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[4].id },
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[5].id },
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[6].id },
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[7].id },
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[8].id },
  // IPC摄像机 — 灯光模式模块
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[9].id },
  // IPC摄像机 — 事件侦测模块
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[10].id },
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[11].id },
  { categoryId: initialCategories[0].id, capabilityId: initialCapabilities[12].id },

  // 智能门铃 — 门铃设置模块
  { categoryId: initialCategories[1].id, capabilityId: initialCapabilities[13].id },
  { categoryId: initialCategories[1].id, capabilityId: initialCapabilities[14].id },
  { categoryId: initialCategories[1].id, capabilityId: initialCapabilities[15].id },
  { categoryId: initialCategories[1].id, capabilityId: initialCapabilities[16].id },
  // 智能门铃 — 事件侦测模块（共享）
  { categoryId: initialCategories[1].id, capabilityId: initialCapabilities[10].id }, // motion_detect
  { categoryId: initialCategories[1].id, capabilityId: initialCapabilities[11].id }, // low_battery
  { categoryId: initialCategories[1].id, capabilityId: initialCapabilities[12].id }, // device_online

  // 传感安防 — 安防侦测模块
  { categoryId: initialCategories[2].id, capabilityId: initialCapabilities[17].id },
  { categoryId: initialCategories[2].id, capabilityId: initialCapabilities[18].id },
  { categoryId: initialCategories[2].id, capabilityId: initialCapabilities[19].id },
  // 传感安防 — 事件侦测模块（共享）
  { categoryId: initialCategories[2].id, capabilityId: initialCapabilities[10].id }, // motion_detect
  { categoryId: initialCategories[2].id, capabilityId: initialCapabilities[11].id }, // low_battery
  { categoryId: initialCategories[2].id, capabilityId: initialCapabilities[12].id }  // device_online
]

// ===== Reactive 存储 =====
export const store = reactive({
  categories: JSON.parse(JSON.stringify(initialCategories)),
  modules: JSON.parse(JSON.stringify(initialModules)),
  capabilities: JSON.parse(JSON.stringify(initialCapabilities)),
  categoryCaps: JSON.parse(JSON.stringify(initialCategoryCaps))
})

// ===== 类目操作 =====
export function addCategory(item) {
  store.categories.push({ id: nextId(), name: item.name, identifier: item.identifier, descr: item.descr })
}

export function updateCategory(id, item) {
  const cat = store.categories.find(c => c.id === id)
  if (cat) { cat.name = item.name; cat.identifier = item.identifier; cat.descr = item.descr }
}

export function removeCategory(id) {
  store.categories = store.categories.filter(c => c.id !== id)
  store.categoryCaps = store.categoryCaps.filter(cc => cc.categoryId !== id)
}

// ===== 模块操作 =====
export function addModule(item) {
  store.modules.push({ id: nextId(), name: item.name, identifier: item.identifier })
}

export function updateModule(id, item) {
  const mod = store.modules.find(m => m.id === id)
  if (mod) { mod.name = item.name; mod.identifier = item.identifier }
}

export function removeModule(id) {
  // 删除模块时，同步删除其下的能力及关联
  const capIds = store.capabilities.filter(c => c.moduleId === id).map(c => c.id)
  store.capabilities = store.capabilities.filter(c => c.moduleId !== id)
  store.categoryCaps = store.categoryCaps.filter(cc => !capIds.includes(cc.capabilityId))
  store.modules = store.modules.filter(m => m.id !== id)
}

// ===== 能力操作 =====
export function addCapability(item) {
  const capId = nextId()
  store.capabilities.push({ id: capId, moduleId: item.moduleId, capType: item.capType, name: item.name, identifier: item.identifier, descr: item.descr, dataDef: item.dataDef })
  return capId
}

export function updateCapability(capId, item) {
  const cap = store.capabilities.find(c => c.id === capId)
  if (cap) {
    cap.moduleId = item.moduleId; cap.capType = item.capType
    cap.name = item.name; cap.identifier = item.identifier
    cap.descr = item.descr; cap.dataDef = item.dataDef
  }
}

export function removeCapability(capId) {
  store.capabilities = store.capabilities.filter(c => c.id !== capId)
  store.categoryCaps = store.categoryCaps.filter(cc => cc.capabilityId !== capId)
}

// ===== 关联表操作 =====
export function linkCapToCategory(categoryId, capabilityId) {
  if (!store.categoryCaps.some(cc => cc.categoryId === categoryId && cc.capabilityId === capabilityId)) {
    store.categoryCaps.push({ categoryId, capabilityId })
  }
}

export function unlinkCapFromCategory(categoryId, capabilityId) {
  store.categoryCaps = store.categoryCaps.filter(cc => !(cc.categoryId === categoryId && cc.capabilityId === capabilityId))
}

export function getCategoryLinkedCapIds(categoryId) {
  return store.categoryCaps.filter(cc => cc.categoryId === categoryId).map(cc => cc.capabilityId)
}

export function getCapLinkedCategoryIds(capabilityId) {
  return store.categoryCaps.filter(cc => cc.capabilityId === capabilityId).map(cc => cc.categoryId)
}

// ===== 查找 =====
export function findCapability(capId) {
  const cap = store.capabilities.find(c => c.id === capId)
  if (!cap) return null
  const mod = store.modules.find(m => m.id === cap.moduleId)
  return { module: mod || null, capability: cap }
}

// ===== 统计 =====
export function getCategoryStats(categoryId) {
  const capIds = getCategoryLinkedCapIds(categoryId)
  // 模块数：从关联能力中反查其 moduleId 去重
  const moduleIds = new Set()
  capIds.forEach(cid => {
    const cap = store.capabilities.find(c => c.id === cid)
    if (cap) moduleIds.add(cap.moduleId)
  })
  return { moduleCount: moduleIds.size, capabilityCount: capIds.length }
}

// ===== 标识符唯一性校验 =====
export function isIdentifierUnique(identifier, excludeId) {
  return !store.categories.some(c => {
    if (excludeId && c.id === excludeId) return false
    return c.identifier === identifier
  })
}

export function isModuleIdentifierUnique(identifier, excludeModuleId) {
  for (const mod of store.modules) {
    if (excludeModuleId && mod.id === excludeModuleId) continue
    if (mod.identifier === identifier) return false
  }
  return true
}

export function isCapIdentifierUnique(identifier, excludeCapId) {
  for (const cap of store.capabilities) {
    if (excludeCapId && cap.id === excludeCapId) continue
    if (cap.identifier === identifier) return false
  }
  return true
}
