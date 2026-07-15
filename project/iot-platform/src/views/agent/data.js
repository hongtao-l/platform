// TODO: 接入真实 API — 当前为 Mock 数据，list.vue 和 config.vue 共享

import { reactive } from 'vue'

// 模型列表
export const modelList = reactive([
  { id: 1, provider: '阿里云', label: '通义千问 Qwen-Max', identifier: 'qwen-max', apiKey: 'sk-xxxx1234', enabled: true },
  { id: 2, provider: '百度智能云', label: '文心一言 ERNIE-4.0', identifier: 'ernie-4', apiKey: 'sk-xxxxabcd', enabled: true },
  { id: 3, provider: '智谱 AI', label: 'GLM-4', identifier: 'glm-4', apiKey: 'sk-xxxx5678', enabled: false }
])

// 智能体列表
export const agentList = reactive([
  {
    id: 1, appId: '552f73c8e1a24f6d', name: '全能AI助手', descr: '通用视觉分析智能体',
    modelId: 1, systemPrompt: '你是一个智能家居安全助手，负责分析摄像头画面并识别异常情况。',
    temperature: 0.7, maxTokens: 4096, topP: 0.9,
    enabled: true, linkedAlgos: ['全能AI', '智能告警-厨房监测', '智能告警-家门检测'],
    updatedAt: '2026/7/14 10:30:00',
    // 配置页额外字段
    contextRounds: 3,
    showAnswerSource: true,
    preParseFile: false,
    skills: [],
    envVars: [],
    tools: { builtin: true, knowledge: [], connectors: [], components: [], mcp: [] }
  },
  {
    id: 2, appId: 'a9ca3f12d8e04b7c', name: '厨房安全智体', descr: '专注厨房区域的火灾和烟雾检测',
    modelId: 2, systemPrompt: '你是厨房安全专家，专注检测厨房中的火灾、烟雾、燃气泄漏等危险。',
    temperature: 0.5, maxTokens: 2048, topP: 0.85,
    enabled: false, linkedAlgos: ['智能告警-厨房监测'],
    updatedAt: '2026/7/13 16:20:00',
    contextRounds: 5,
    showAnswerSource: false,
    preParseFile: true,
    skills: [],
    envVars: [],
    tools: { builtin: true, knowledge: [], connectors: [], components: [], mcp: [] }
  },
  {
    id: 3, appId: '064ec4a9b2f04d8e', name: '老人看护助手', descr: '老年人异常行为检测与关怀',
    modelId: 1, systemPrompt: '你是一个老人看护助手，检测跌倒、长时间不动等异常行为。',
    temperature: 0.6, maxTokens: 4096, topP: 0.9,
    enabled: false, linkedAlgos: ['智能告警-老人看护'],
    updatedAt: '2026/7/12 09:15:00',
    contextRounds: 3,
    showAnswerSource: true,
    preParseFile: false,
    skills: [],
    envVars: [],
    tools: { builtin: true, knowledge: [], connectors: [], components: [], mcp: [] }
  }
])

// 工具函数
export const enabledModels = () => modelList.filter(m => m.enabled)

export const modelLabel = (id) => {
  const m = modelList.find(m => m.id === id)
  return m ? m.label : '未知模型'
}

export const findAgent = (id) => agentList.find(a => a.id === id)
