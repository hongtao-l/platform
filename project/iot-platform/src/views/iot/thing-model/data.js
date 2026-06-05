import { reactive } from 'vue'

let _id = 100
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
  { id: nextId(), name: '安防侦测模块', identifier: 'SecurityDetectModule' },
  { id: nextId(), name: '算法能力模块', identifier: 'AlgorithmCapModule' }
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
    dataDef: { dataType:'event', eventType:'alarm', outputParams:[] } },

  // 算法能力模块
  { id: nextId(), moduleId: initialModules[6].id, capType: 'prop', name: '算法开关', identifier: 'AlgorithmSwitch', descr: '控制算法是否启用',
    dataDef: { dataType:'boolean', accessMode:'rw', trueLabel:'开启', falseLabel:'关闭', defaultVal:'1' } },
  { id: nextId(), moduleId: initialModules[6].id, capType: 'prop', name: '灵敏度', identifier: 'Sensitivity', descr: '算法侦测的灵敏度等级',
    dataDef: { dataType:'enum', accessMode:'rw', enumValues:[{name:'高',val:0},{name:'中',val:1},{name:'低',val:2}], defaultVal:'1' } },
  { id: nextId(), moduleId: initialModules[6].id, capType: 'prop', name: '侦测类型', identifier: 'DetectType', descr: '算法支持的侦测目标类型',
    dataDef: { dataType:'enum', accessMode:'rw', enumValues:[{name:'运动',val:0},{name:'人形',val:1},{name:'车辆',val:2}], defaultVal:'0' } },
  { id: nextId(), moduleId: initialModules[6].id, capType: 'prop', name: '定时侦测', identifier: 'ScheduledDetect', descr: '定时侦测时间段配置',
    dataDef: { dataType:'array', elementType:'struct', accessMode:'rw', maxLength:10,
      fields:[
        { name:'启用', identifier:'Switch', dataType:'boolean', trueLabel:'开启', falseLabel:'关闭' },
        { name:'开始时间', identifier:'StartTime', dataType:'string', maxLength:8 },
        { name:'结束时间', identifier:'EndTime', dataType:'string', maxLength:8 },
        { name:'循环周期', identifier:'WeekDays', dataType:'array', elementType:'int', maxLength:7 }
      ] } },
  { id: nextId(), moduleId: initialModules[6].id, capType: 'prop', name: '区域侦测', identifier: 'ZoneDetect', descr: '侦测区域配置',
    dataDef: { dataType:'array', elementType:'struct', accessMode:'rw', maxLength:8,
      fields:[
        { name:'区域名称', identifier:'Name', dataType:'string', maxLength:32 },
        { name:'顶点X坐标', identifier:'PointsX', dataType:'array', elementType:'int', maxLength:4 },
        { name:'顶点Y坐标', identifier:'PointsY', dataType:'array', elementType:'int', maxLength:4 }
      ] } },
  { id: nextId(), moduleId: initialModules[6].id, capType: 'prop', name: '声音告警开关', identifier: 'SoundAlarmSwitch', descr: '是否开启声音告警',
    dataDef: { dataType:'boolean', accessMode:'rw', trueLabel:'开启', falseLabel:'关闭', defaultVal:'0' } },
  { id: nextId(), moduleId: initialModules[6].id, capType: 'prop', name: '声音告警次数', identifier: 'SoundAlarmCount', descr: '声音告警触发次数阈值',
    dataDef: { dataType:'int', accessMode:'rw', min:1, max:10, step:1, unit:'次', defaultVal:'3' } },
  { id: nextId(), moduleId: initialModules[6].id, capType: 'prop', name: '自定义告警音频', identifier: 'CustomAlarmAudio', descr: '自定义告警音频内容',
    dataDef: { dataType:'string', accessMode:'rw', maxLength:255, defaultVal:'' } },
  { id: nextId(), moduleId: initialModules[6].id, capType: 'prop', name: '灯光告警开关', identifier: 'LightAlarmSwitch', descr: '是否开启灯光告警',
    dataDef: { dataType:'boolean', accessMode:'rw', trueLabel:'开启', falseLabel:'关闭', defaultVal:'0' } },
  { id: nextId(), moduleId: initialModules[6].id, capType: 'prop', name: '灯光告警时长', identifier: 'LightAlarmDuration', descr: '灯光告警持续时长',
    dataDef: { dataType:'int', accessMode:'rw', min:1, max:60, step:1, unit:'秒', defaultVal:'5' } }
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
  categoryCaps: JSON.parse(JSON.stringify(initialCategoryCaps)),
  customModules: [],       // 企业自定义模块
  customCapabilities: []   // 企业自定义能力
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

// ===== 自定义模块操作 =====
export function addCustomModule(item) {
  store.customModules.push({ id: nextId(), name: item.name, identifier: item.identifier })
}

export function updateCustomModule(id, item) {
  const mod = store.customModules.find(m => m.id === id)
  if (mod) { mod.name = item.name; mod.identifier = item.identifier }
}

export function removeCustomModule(id) {
  store.customModules = store.customModules.filter(m => m.id !== id)
  store.customCapabilities = store.customCapabilities.filter(c => c.moduleId !== id)
}

export function isCustomModuleIdentifierUnique(identifier, excludeModuleId) {
  for (const mod of store.customModules) {
    if (excludeModuleId && mod.id === excludeModuleId) continue
    if (mod.identifier === identifier) return false
  }
  return true
}

// ===== 自定义能力操作 =====
export function addCustomCapability(item) {
  const capId = nextId()
  store.customCapabilities.push({ id: capId, moduleId: item.moduleId, capType: item.capType, name: item.name, identifier: item.identifier, descr: item.descr, dataDef: item.dataDef })
  return capId
}

export function updateCustomCapability(capId, item) {
  const cap = store.customCapabilities.find(c => c.id === capId)
  if (cap) { cap.moduleId = item.moduleId; cap.capType = item.capType; cap.name = item.name; cap.identifier = item.identifier; cap.descr = item.descr; cap.dataDef = item.dataDef }
}

export function removeCustomCapability(capId) {
  store.customCapabilities = store.customCapabilities.filter(c => c.id !== capId)
}

export function isCustomCapIdentifierUnique(identifier, excludeCapId) {
  for (const cap of store.customCapabilities) {
    if (excludeCapId && cap.id === excludeCapId) continue
    if (cap.identifier === identifier) return false
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

// ========================================================================
// 算法 & 事件 Mock 数据
// ========================================================================

const initialAlgorithms = [
  {
    id: nextId(), algorithmId: 'motion_detection', algorithmIcon: '🔍',
    algorithmName: JSON.stringify({ '1': '移动侦测算法', '2': 'Motion Detection' }),
    capabilities: JSON.stringify({ MotionDetect: true, AlgorithmSwitch: true, Sensitivity: true, DetectType: true, ScheduledDetect: true, ZoneDetect: true, __detectTypes: { motion: '运动', person: '人形', vehicle: '车辆' } }),
    capabilityIds: JSON.stringify(['MotionDetect', 'AlgorithmSwitch', 'Sensitivity', 'DetectType', 'ScheduledDetect', 'ZoneDetect']),
    eventIds: JSON.stringify([100001, 100002]),
    referencedCount: 3
  },
  {
    id: nextId(), algorithmId: 'sound_detection', algorithmIcon: '🔊',
    algorithmName: JSON.stringify({ '1': '声音侦测算法', '2': 'Sound Detection' }),
    capabilities: JSON.stringify({ SoundAlarm: true, AlgorithmSwitch: true, SoundAlarmSwitch: true, SoundAlarmCount: true, CustomAlarmAudio: true, LightAlarmSwitch: true, LightAlarmDuration: true }),
    capabilityIds: JSON.stringify(['SoundAlarm', 'AlgorithmSwitch', 'SoundAlarmSwitch', 'SoundAlarmCount', 'CustomAlarmAudio', 'LightAlarmSwitch', 'LightAlarmDuration']),
    eventIds: JSON.stringify([100003]),
    referencedCount: 0
  }
]

const initialEvents = [
  { id: nextId(), eventId: 100001, eventName: JSON.stringify({ '1': '移动侦测告警', '2': 'Motion Alert' }), eventRemark: 'PIR传感器检测到移动物体时触发', pushCopy: JSON.stringify({ '1': '检测到移动物体', '2': 'Motion detected' }), referencedCount: 2 },
  { id: nextId(), eventId: 100002, eventName: JSON.stringify({ '1': '人形识别告警', '2': 'Person Alert' }), eventRemark: 'AI人形识别到有人出现时触发', pushCopy: JSON.stringify({ '1': '发现有人活动', '2': 'Person detected' }), referencedCount: 1 },
  { id: nextId(), eventId: 100003, eventName: JSON.stringify({ '1': '异常声音告警', '2': 'Abnormal Sound' }), eventRemark: '检测到异常声音时触发（玻璃破碎、尖叫声等）', pushCopy: JSON.stringify({ '1': '检测到异常声音', '2': 'Abnormal sound detected' }), referencedCount: 1 },
  { id: nextId(), eventId: 100004, eventName: JSON.stringify({ '1': '灯光状态变更', '2': 'Light Status Changed' }), eventRemark: '灯光模式切换时触发', pushCopy: JSON.stringify({ '1': '灯光状态已更新', '2': 'Light status updated' }), referencedCount: 1 },
  { id: nextId(), eventId: 100005, eventName: JSON.stringify({ '1': '低电量告警', '2': 'Low Battery' }), eventRemark: '设备电量低于阈值时触发', pushCopy: JSON.stringify({ '1': '设备电量不足，请及时充电', '2': 'Device battery low' }), referencedCount: 1 },
  { id: nextId(), eventId: 100006, eventName: JSON.stringify({ '1': '设备上线通知', '2': 'Device Online' }), eventRemark: '设备从离线恢复在线时触发', pushCopy: JSON.stringify({ '1': '设备已重新上线', '2': 'Device is back online' }), referencedCount: 0 },
  { id: nextId(), eventId: 100007, eventName: JSON.stringify({ '1': '门铃呼叫', '2': 'Bell Ring' }), eventRemark: '访客按下门铃时触发', pushCopy: JSON.stringify({ '1': '有人在门口', '2': 'Someone is at the door' }), referencedCount: 0 },
  { id: nextId(), eventId: 100008, eventName: JSON.stringify({ '1': '车辆识别告警', '2': 'Vehicle Alert' }), eventRemark: 'AI识别到车辆进入监控区域', pushCopy: JSON.stringify({ '1': '检测到车辆进入', '2': 'Vehicle detected' }), referencedCount: 0 }
]

store.algorithms = JSON.parse(JSON.stringify(initialAlgorithms))
store.events = JSON.parse(JSON.stringify(initialEvents))

// ---- 算法 CRUD ----

export function listAlgorithms({ page, pageSize, keyword } = {}) {
  let list = [...store.algorithms]
  if (keyword) {
    const kw = keyword.toLowerCase()
    list = list.filter(a => {
      const name = (() => { try { return JSON.parse(a.algorithmName || '{}')['1'] || '' } catch { return '' } })()
      return a.algorithmId.toLowerCase().includes(kw) || name.includes(kw)
    })
  }
  const total = list.length
  const p = page || 1
  const ps = pageSize || 20
  const start = (p - 1) * ps
  return { code: 0, data: { list: list.slice(start, start + ps), total } }
}

export function getAlgorithm(id) {
  const algo = store.algorithms.find(a => a.id === id)
  if (!algo) return { code: 1, message: '算法不存在' }
  return { code: 0, data: JSON.parse(JSON.stringify(algo)) }
}

export function addAlgorithm(data) {
  const item = {
    id: nextId(),
    algorithmId: data.algorithmId,
    algorithmIcon: data.algorithmIcon || '',
    algorithmName: data.algorithmName || '{}',
    capabilities: data.capabilities || '{}',
    capabilityIds: data.capabilityIds || '[]',
    eventIds: data.eventIds || '[]',
    referencedCount: 0
  }
  store.algorithms.push(item)
  return { code: 0 }
}

export function updateAlgorithm(data) {
  const idx = store.algorithms.findIndex(a => a.id === data.id)
  if (idx === -1) return { code: 1, message: '算法不存在' }
  const cur = store.algorithms[idx]
  if (data.algorithmId !== undefined) cur.algorithmId = data.algorithmId
  if (data.algorithmIcon !== undefined) cur.algorithmIcon = data.algorithmIcon
  if (data.algorithmName !== undefined) cur.algorithmName = data.algorithmName
  if (data.capabilities !== undefined) cur.capabilities = data.capabilities
  if (data.capabilityIds !== undefined) cur.capabilityIds = data.capabilityIds
  if (data.eventIds !== undefined) cur.eventIds = data.eventIds
  // 更新事件引用计数
  _updateEventRefCounts()
  return { code: 0 }
}

export function deleteAlgorithm(id) {
  const idx = store.algorithms.findIndex(a => a.id === id)
  if (idx === -1) return { code: 1, message: '算法不存在' }
  store.algorithms.splice(idx, 1)
  _updateEventRefCounts()
  return { code: 0 }
}

// ---- 事件 CRUD ----

export function listEvents({ page, pageSize, keyword } = {}) {
  let list = [...store.events]
  if (keyword) {
    const kw = keyword.toLowerCase()
    list = list.filter(e => {
      const name = (() => { try { return JSON.parse(e.eventName || '{}')['1'] || '' } catch { return '' } })()
      return String(e.eventId).includes(kw) || name.includes(kw)
    })
  }
  const total = list.length
  const p = page || 1
  const ps = pageSize || 20
  const start = (p - 1) * ps
  return { code: 0, data: { list: list.slice(start, start + ps), total } }
}

export function allEvents() {
  return { code: 0, data: { list: JSON.parse(JSON.stringify(store.events)) } }
}

export function getEvent(id) {
  const evt = store.events.find(e => e.id === id)
  if (!evt) return { code: 1, message: '事件不存在' }
  return { code: 0, data: JSON.parse(JSON.stringify(evt)) }
}

export function addEvent(data) {
  const item = {
    id: nextId(),
    eventId: data.eventId,
    eventName: data.eventName || '{}',
    eventRemark: data.eventRemark || '',
    pushCopy: data.pushCopy || '{}',
    referencedCount: 0
  }
  store.events.push(item)
  return { code: 0 }
}

export function updateEvent(data) {
  const idx = store.events.findIndex(e => e.id === data.id)
  if (idx === -1) return { code: 1, message: '事件不存在' }
  const cur = store.events[idx]
  if (data.eventId !== undefined) cur.eventId = data.eventId
  if (data.eventName !== undefined) cur.eventName = data.eventName
  if (data.eventRemark !== undefined) cur.eventRemark = data.eventRemark
  if (data.pushCopy !== undefined) cur.pushCopy = data.pushCopy
  return { code: 0 }
}

export function deleteEvent(id) {
  const idx = store.events.findIndex(e => e.id === id)
  if (idx === -1) return { code: 1, message: '事件不存在' }
  store.events.splice(idx, 1)
  // 清理算法中对事件的引用
  store.algorithms.forEach(a => {
    try {
      const eids = JSON.parse(a.eventIds || '[]')
      a.eventIds = JSON.stringify(eids.filter(eid => eid !== store.events[idx]?.eventId))
    } catch { /* ignore */ }
  })
  return { code: 0 }
}

function _updateEventRefCounts() {
  const counts = {}
  store.algorithms.forEach(a => {
    try {
      JSON.parse(a.eventIds || '[]').forEach(eid => {
        counts[eid] = (counts[eid] || 0) + 1
      })
    } catch { /* ignore */ }
  })
  store.events.forEach(e => { e.referencedCount = counts[e.eventId] || 0 })
  store.algorithms.forEach(a => {
    try {
      a.referencedCount = store.algorithms.filter(o => o !== a && o.capabilities === a.capabilities).length + 1
    } catch { a.referencedCount = 0 }
  })
}
