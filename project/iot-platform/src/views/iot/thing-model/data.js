import { reactive, computed } from 'vue'

let _id = Date.now()
const nextId = () => ++_id

// ===== 初始 Mock 数据 =====
const initialCategories = [
  {
    id: nextId(), name: 'IPC摄像机', identifier: 'ipc_camera',
    descr: 'IPC摄像机设备类目，包含视频监控、事件侦测相关能力',
    modules: [
      {
        id: nextId(), name: '工作模式模块', identifier: 'work_mode_module',
        capabilities: [
          { id: nextId(), capType: 'prop', name: '工作模式', identifier: 'work_mode', descr: '设备工作模式切换（低功耗/AOV/长电/自定义）',
            dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{name:'低功耗模式',val:0},{name:'AOV模式',val:1},{name:'长电模式',val:2},{name:'自定义模式',val:3}], defaultVal: '0' } },
          { id: nextId(), capType: 'prop', name: 'AOV拍照帧率', identifier: 'aov_capture_frame_rate', descr: 'AOV模式下拍照的时间间隔',
            dataDef: { dataType: 'int', accessMode: 'rw', min: 1, max: 10, step: 1, unit: '秒/帧', defaultVal: '1' } },
          { id: nextId(), capType: 'prop', name: 'AOV切换低功耗电量', identifier: 'aov_auto_switch_power', descr: 'AOV模式下自动切换到低功耗的电量阈值',
            dataDef: { dataType: 'int', accessMode: 'rw', min: 0, max: 100, step: 1, unit: '%', defaultVal: '30' } }
        ]
      },
      {
        id: nextId(), name: '录制模式模块', identifier: 'record_mode_module',
        capabilities: [
          { id: nextId(), capType: 'prop', name: '常规录制', identifier: 'normal_record', descr: '常规录制模式设置（全天/自定义/关闭）',
            dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{name:'全天',val:0},{name:'自定义时段',val:1},{name:'关闭',val:2}], defaultVal: '0' } },
          { id: nextId(), capType: 'prop', name: '事件录制', identifier: 'event_record', descr: '是否开启事件触发录制',
            dataDef: { dataType: 'boolean', accessMode: 'rw', trueLabel: '开启', falseLabel: '关闭', defaultVal: '1' } },
          { id: nextId(), capType: 'prop', name: '录制清晰度', identifier: 'record_resolution', descr: '录制视频清晰度等级',
            dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{name:'超清',val:0},{name:'高清',val:1},{name:'标清',val:2}], defaultVal: '1' } },
          { id: nextId(), capType: 'prop', name: '抓拍间隔', identifier: 'capture_interval', descr: '事件触发时连续抓拍的时间间隔',
            dataDef: { dataType: 'int', accessMode: 'rw', min: 100, max: 10000, step: 100, unit: 'ms', defaultVal: '500' } },
          { id: nextId(), capType: 'prop', name: '事件录制时长', identifier: 'event_record_duration', descr: '事件触发后单次录制时长',
            dataDef: { dataType: 'int', accessMode: 'rw', min: 5, max: 300, step: 5, unit: '秒', defaultVal: '30' } },
          { id: nextId(), capType: 'svc', name: '格式化存储', identifier: 'format_storage', descr: '远程格式化设备存储卡',
            dataDef: { dataType: 'service', inputParams: [], outputParams: [{name:'操作结果',identifier:'result',dataType:'boolean',trueLabel:'成功',falseLabel:'失败',defaultVal:'1'}] } }
        ]
      },
      {
        id: nextId(), name: '灯光模式模块', identifier: 'light_mode_module',
        capabilities: [
          { id: nextId(), capType: 'prop', name: '灯光模式', identifier: 'light_mode', descr: '灯光模式切换（全彩/红外/智能/自定义/关闭）',
            dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{name:'全彩模式',val:0},{name:'红外模式',val:1},{name:'智能模式',val:2},{name:'自定义模式',val:3},{name:'关闭',val:4}], defaultVal: '1' } }
        ]
      },
      {
        id: nextId(), name: '事件侦测模块', identifier: 'event_detect_module',
        capabilities: [
          { id: nextId(), capType: 'evt', name: '移动侦测', identifier: 'motion_detect', descr: '设备检测到物体移动时上报告警事件',
            dataDef: { dataType: 'event', eventType: 'alarm', outputParams: [] } },
          { id: nextId(), capType: 'evt', name: '电量不足告警', identifier: 'low_battery', descr: '设备电量低于阈值时上报',
            dataDef: { dataType: 'event', eventType: 'alarm', outputParams: [{name:'当前电量',identifier:'battery',dataType:'int',min:0,max:100,step:1,unit:'%',defaultVal:'0'}] } },
          { id: nextId(), capType: 'evt', name: '设备上线通知', identifier: 'device_online', descr: '设备从离线变为在线时上报',
            dataDef: { dataType: 'event', eventType: 'info', outputParams: [] } }
        ]
      }
    ]
  },
  {
    id: nextId(), name: '智能门铃', identifier: 'smart_doorbell',
    descr: '智能门铃设备类目，包含门铃呼叫、门锁联动相关能力',
    modules: [
      { id: nextId(), name: '门铃设置模块', identifier: 'bell_setting_module',
        capabilities: [
          { id: nextId(), capType: 'prop', name: '门铃音量', identifier: 'bell_volume', descr: '门铃音量大小设置',
            dataDef: { dataType: 'int', accessMode: 'rw', min: 0, max: 100, step: 5, unit: '%', defaultVal: '50' } },
          { id: nextId(), capType: 'prop', name: '门铃铃声', identifier: 'bell_ringtone', descr: '门铃铃声选择',
            dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{name:'经典铃声',val:0},{name:'柔和铃声',val:1},{name:'轻快铃声',val:2}], defaultVal: '0' } },
          { id: nextId(), capType: 'svc', name: '远程开门', identifier: 'remote_unlock', descr: '远程控制门锁开启',
            dataDef: { dataType: 'service', inputParams: [], outputParams: [{name:'开门结果',identifier:'result',dataType:'boolean',trueLabel:'成功',falseLabel:'失败',defaultVal:'1'}] } },
          { id: nextId(), capType: 'evt', name: '门铃呼叫', identifier: 'bell_ring', descr: '访客按下门铃时上报',
            dataDef: { dataType: 'event', eventType: 'info', outputParams: [] } }
        ]
      }
    ]
  },
  {
    id: nextId(), name: '传感安防', identifier: 'sensor_security',
    descr: '传感器和安防设备类目，包含环境监测和安防告警能力',
    modules: [
      { id: nextId(), name: '安防侦测模块', identifier: 'security_detect_module',
        capabilities: [
          { id: nextId(), capType: 'prop', name: '告警灵敏度', identifier: 'alarm_sensitivity', descr: '安防告警的触发灵敏度',
            dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{name:'高',val:0},{name:'中',val:1},{name:'低',val:2}], defaultVal: '1' } },
          { id: nextId(), capType: 'evt', name: '烟雾告警', identifier: 'smoke_alarm', descr: '检测到烟雾时上报',
            dataDef: { dataType: 'event', eventType: 'alarm', outputParams: [] } },
          { id: nextId(), capType: 'evt', name: '水浸告警', identifier: 'water_leak', descr: '检测到水浸时上报',
            dataDef: { dataType: 'event', eventType: 'alarm', outputParams: [] } }
        ]
      }
    ]
  }
]

// ===== Reactive 存储 =====
export const store = reactive({
  categories: JSON.parse(JSON.stringify(initialCategories))
})

// ===== 类目操作 =====
export function addCategory(item) {
  store.categories.push({ id: nextId(), name: item.name, identifier: item.identifier, descr: item.descr, modules: [] })
}

export function updateCategory(id, item) {
  const cat = store.categories.find(c => c.id === id)
  if (cat) {
    cat.name = item.name
    cat.identifier = item.identifier
    cat.descr = item.descr
  }
}

export function removeCategory(id) {
  store.categories = store.categories.filter(c => c.id !== id)
}

// ===== 模块操作 =====
export function addModule(categoryId, item) {
  const cat = store.categories.find(c => c.id === categoryId)
  if (cat) {
    cat.modules.push({ id: nextId(), name: item.name, identifier: item.identifier, capabilities: [] })
  }
}

export function updateModule(categoryId, moduleId, item) {
  const cat = store.categories.find(c => c.id === categoryId)
  if (cat) {
    const mod = cat.modules.find(m => m.id === moduleId)
    if (mod) {
      mod.name = item.name
      mod.identifier = item.identifier
    }
  }
}

export function removeModule(categoryId, moduleId) {
  const cat = store.categories.find(c => c.id === categoryId)
  if (cat) cat.modules = cat.modules.filter(m => m.id !== moduleId)
}

// ===== 能力操作 =====
export function addCapability(categoryId, moduleId, item) {
  const cat = store.categories.find(c => c.id === categoryId)
  if (!cat) return
  const mod = cat.modules.find(m => m.id === moduleId)
  if (!mod) return
  mod.capabilities.push({ id: nextId(), ...item })
}

export function updateCapability(categoryId, moduleId, capId, item) {
  const cat = store.categories.find(c => c.id === categoryId)
  if (!cat) return
  const mod = cat.modules.find(m => m.id === moduleId)
  if (!mod) return
  const cap = mod.capabilities.find(c => c.id === capId)
  if (cap) {
    cap.capType = item.capType
    cap.name = item.name
    cap.identifier = item.identifier
    cap.descr = item.descr
    cap.dataDef = item.dataDef
  }
}

export function removeCapability(categoryId, capId) {
  const cat = store.categories.find(c => c.id === categoryId)
  if (!cat) return
  cat.modules.forEach(mod => {
    mod.capabilities = mod.capabilities.filter(c => c.id !== capId)
  })
}

// ===== 查找 =====
export function findCapability(capId) {
  for (const cat of store.categories) {
    for (const mod of cat.modules) {
      const cap = mod.capabilities.find(c => c.id === capId)
      if (cap) return { category: cat, module: mod, capability: cap }
    }
  }
  return null
}

// ===== 统计 =====
export function getCategoryStats(categoryId) {
  const cat = store.categories.find(c => c.id === categoryId)
  if (!cat) return { moduleCount: 0, capabilityCount: 0 }
  let total = 0
  cat.modules.forEach(m => { total += m.capabilities.length })
  return { moduleCount: cat.modules.length, capabilityCount: total }
}

// ===== 标识符唯一性校验 =====
export function isIdentifierUnique(identifier, excludeCategoryId) {
  return !store.categories.some(c => {
    if (excludeCategoryId && c.id === excludeCategoryId) return false
    return c.identifier === identifier
  })
}

export function isModuleIdentifierUnique(categoryId, identifier, excludeModuleId) {
  const cat = store.categories.find(c => c.id === categoryId)
  if (!cat) return true
  return !cat.modules.some(m => {
    if (excludeModuleId && m.id === excludeModuleId) return false
    return m.identifier === identifier
  })
}

export function isCapIdentifierUnique(categoryId, identifier, excludeCapId) {
  const cat = store.categories.find(c => c.id === categoryId)
  if (!cat) return true
  for (const mod of cat.modules) {
    for (const cap of mod.capabilities) {
      if (excludeCapId && cap.id === excludeCapId) continue
      if (cap.identifier === identifier) return false
    }
  }
  return true
}
