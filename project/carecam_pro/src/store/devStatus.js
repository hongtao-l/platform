import { ref, computed } from 'vue'

// 全局 AI 开通状态: 'not_activated' | 'activated'
export const aiStatus = ref('activated')

// 各设备 AI 开通状态映射 (deviceName → true/false)
export const deviceAiStatus = ref({
  '标准摄像机': true,
  '广角摄像机': false,
  '多目摄像机': false,
  '360°全景摄像机': false,
  '门铃': false,
  '一氧化碳探测器': false,
  '烟雾探测器': false,
  '水浸探测器': false
})

// ===== Agent 工厂相关 =====

// Agent 配置（模拟后台数据）
export const agentConfigs = ref([
  {
    id: 'pet_guardian_v1',
    serviceId: 'agent_factory',
    name: '宠物看护',
    slogan: '不在家，也能知道它好不好',
    icon: '🐱',
    priceMonthly: 9.9,
    priceYearly: 99,
    heroGradient: 'linear-gradient(135deg, #F5A623, #E8734A)',
    capabilities: [
      { icon: '🍽', name: '进食记录', desc: '每餐自动记录，吃饭规律一目了然' },
      { icon: '⚠', name: '异常预警', desc: '呕吐、抓挠、跛行等异常及时发现' },
      { icon: '🏃', name: '活动追踪', desc: '玩耍、奔跑、休息全场景掌握' },
      { icon: '📊', name: '每日报告', desc: '宠物一天行为汇总，一句话总结' }
    ],
    sampleMessages: [
      { time: '08:15', title: '金毛犬在厨房食盆旁进食', desc: '一只金毛犬正在厨房低头吃银色食盆里的食物。', bg: 'linear-gradient(135deg, #FEF9E7, #FDEBD0)' },
      { time: '10:30', title: '灰猫在卫生间使用猫砂盆', desc: '一只灰色猫咪在卫生间角落的猫砂盆内蹲姿排泄。', bg: 'linear-gradient(135deg, #F3EEF9, #E8DAF0)' },
      { time: '14:20', title: '棕色犬在客厅沙发旁呕吐 ⚠', desc: '一只棕色狗在客厅沙发旁身体弓起呕吐，地面可见呕吐物。', bg: 'linear-gradient(135deg, #FFEBEE, #FFCDD2)' }
    ],
    sampleReport: {
      summary: 'Max今天整体状态良好，进食两次、活动适量，未发现异常行为。',
      sections: [
        { icon: '🍽', label: '进食', count: 2 },
        { icon: '🏃', label: '活动', count: 2 },
        { icon: '😴', label: '休息', count: 1 },
        { icon: '💩', label: '排泄', count: 1 }
      ]
    },
    focusList: [
      { id: 500001, name: '宠物进食', icon: '🍽' },
      { id: 500002, name: '宠物排泄', icon: '💩' },
      { id: 500003, name: '呕吐/异常', icon: '⚠' },
      { id: 500004, name: '宠物玩耍', icon: '🏃' },
      { id: 500005, name: '宠物睡眠', icon: '😴' }
    ]
  },
  {
    id: 'door_guardian_v1',
    serviceId: 'agent_factory',
    name: '家门看护',
    slogan: '门口无小事，一眼看全程',
    icon: '🚪',
    priceMonthly: 9.9,
    priceYearly: 99,
    heroGradient: 'linear-gradient(135deg, #1A2A3D, #2D4A6E)',
    capabilities: [
      { icon: '📦', name: '包裹全追踪', desc: '送达→在门口→被取走，全程记录' },
      { icon: '👤', name: '访客分类', desc: '快递/外卖/家人/陌生人自动识别' },
      { icon: '🔒', name: '安全监测', desc: '异常徘徊、多人聚集及时发现' },
      { icon: '🚪', name: '出入记录', desc: '人员进出自动记录' }
    ],
    sampleMessages: [
      { time: '14:32', title: '快递员在门口放置包裹', desc: '一名穿红色制服的快递员正在门口地面放置一个棕色纸箱包裹。', bg: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)' },
      { time: '16:45', title: '有人开门进入家中', desc: '一名女性从门外用钥匙开门并进入屋内。', bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' },
      { time: '21:10', title: '陌生男子在门口徘徊张望 ⚠', desc: '一名穿深色卫衣的男子站在家门口附近四处张望。', bg: 'linear-gradient(135deg, #FFEBEE, #FFCDD2)' }
    ],
    sampleReport: {
      summary: '今日家门口一切正常，1件包裹送达，无可疑事件。',
      sections: [
        { icon: '📦', label: '包裹动态', count: 1 },
        { icon: '👤', label: '访客记录', count: 2 },
        { icon: '🚪', label: '人员出入', count: 2 }
      ]
    },
    focusList: [
      { id: 400310, name: '包裹动态', icon: '📦' },
      { id: 400311, name: '访客到访', icon: '👤' },
      { id: 400312, name: '人员出入', icon: '🚪' },
      { id: 400313, name: '安全异常', icon: '⚠' }
    ]
  },
  {
    id: 'all_in_one_v1',
    serviceId: 'all_in_one',
    name: '全能AI',
    slogan: '一机守护全家安全',
    icon: '🌐',
    priceMonthly: 9.9,
    priceYearly: 99,
    heroGradient: 'linear-gradient(135deg, #1A73E8, #7C3AED)',
    capabilities: [
      { icon: '👶', name: '儿童看护', desc: '识别儿童活动与安全状况' },
      { icon: '📦', name: '包裹送达', desc: '快递包裹自动提醒' },
      { icon: '🍳', name: '厨房安全', desc: '烟雾明火异常检测' },
      { icon: '🐱', name: '宠物监测', desc: '宠物活动随时掌握' }
    ],
    sampleMessages: [
      { time: '09:20', title: '奶奶从正门走出', desc: '奶奶于09:20从正门走出，身穿蓝色外套，手拿拐杖，状态正常。', bg: 'linear-gradient(135deg, #0d2e1a, #1a5c34)' },
      { time: '12:30', title: '快递员放置包裹', desc: '快递员将包裹放于门口。', bg: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)' },
      { time: '15:00', title: '猫咪在客厅玩耍', desc: '猫咪追逐玩具球从沙发跳到茶几。', bg: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)' }
    ],
    sampleReport: {
      summary: '今天一切正常，奶奶出门1次，猫咪很活跃。',
      sections: [
        { icon: '👤', label: '人员经过', count: 3 },
        { icon: '🐱', label: '宠物活动', count: 5 },
        { icon: '📦', label: '包裹送达', count: 2 }
      ]
    },
    focusList: [
      { id: 100001, name: '儿童守护', icon: '👶' },
      { id: 100002, name: '包裹送达', icon: '📦' },
      { id: 100003, name: '厨房守护', icon: '🍳' },
      { id: 100004, name: '动物看护', icon: '🐱' }
    ]
  }
])

// 设备-Agent绑定（支持多Agent并存）
export const deviceAgent = ref({
  '标准摄像机': [
    { agentId: 'all_in_one_v1', agentName: '全能AI', agentIcon: '🌐', expireDate: '2026-09-06', status: 'active' },
    { agentId: 'pet_guardian_v1', agentName: '宠物看护', agentIcon: '🐱', expireDate: '2026-09-06', status: 'active' }
  ],
  '广角摄像机': [
    { agentId: 'pet_guardian_v1', agentName: '宠物看护', agentIcon: '🐱', expireDate: '2026-09-06', status: 'active' }
  ],
  '多目摄像机': [
    { agentId: 'door_guardian_v1', agentName: '家门看护', agentIcon: '🚪', expireDate: '2026-09-06', status: 'active' }
  ],
  '360°全景摄像机': []
})

// 购买历史
export const agentHistory = ref([
  {
    agentId: 'all_in_one_v1',
    agentName: '全能AI',
    agentIcon: '🌐',
    deviceName: '标准摄像机',
    startDate: '2026-05-01',
    expireDate: '2026-06-01',
    status: 'expired'
  }
])

// 获取指定设备的所有Agent
export function getDeviceAgents(deviceName) {
  return deviceAgent.value[deviceName] || []
}

// 获取指定设备的首个Agent（兼容旧逻辑）
export function getDeviceAgent(deviceName) {
  const agents = getDeviceAgents(deviceName)
  return agents.length > 0 ? agents[0] : null
}

// 设备是否已开通任意Agent
export function isDeviceAgentActive(deviceName) {
  const agents = getDeviceAgents(deviceName)
  return agents.some(a => a.status === 'active')
}

// 设备是否已有指定serviceId的生效Agent
export function hasActiveAgentServiceId(deviceName, serviceId) {
  const agents = getDeviceAgents(deviceName)
  return agents.some(a => a.status === 'active' && getAgentConfig(a.agentId)?.serviceId === serviceId)
}

// 根据agentId获取配置
export function getAgentConfig(agentId) {
  return agentConfigs.value.find(a => a.id === agentId) || null
}

// 获取当前已开通Agent的设备列表
export const agentActivatedDevices = computed(() => {
  return Object.keys(deviceAgent.value).filter(k => getDeviceAgents(k).some(a => a.status === 'active'))
})

// 默认选中的Agent设备
export const defaultAgentDevice = computed(() => {
  const list = agentActivatedDevices.value
  return list.length > 0 ? list[0] : '标准摄像机'
})

// ===== 兼容旧逻辑 =====

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
