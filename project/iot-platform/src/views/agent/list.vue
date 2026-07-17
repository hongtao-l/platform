<template>
  <div class="page-container">
    <!-- 操作 -->
    <div class="top-bar">
      <div class="top-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          创建应用
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索应用名称"
        :prefix-icon="Search"
        size="default"
        style="width: 280px"
        clearable
        @clear="filters.keyword = ''"
      />
      <el-button text @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>

    <!-- 卡片网格 -->
    <div class="card-grid" v-loading="loading">
      <div
        v-for="agent in filteredList"
        :key="agent.id"
        class="agent-card"
      >
        <!-- 卡片头部：图标 + 名称 + 状态 -->
        <div class="card-header">
          <div class="card-icon">
            <el-icon :size="24"><Cpu /></el-icon>
          </div>
          <div class="card-title-area">
            <span class="card-name">{{ agent.name }}</span>
            <span v-if="agent.type === 'workflow'" :class="['status-tag', agent.draft ? 'draft' : 'published']">
              {{ agent.draft ? '草稿' : '已发布' }}
            </span>
            <span v-else :class="['status-tag', agent.enabled ? 'published' : 'unpublished']">
              {{ agent.enabled ? '已发布' : '未发布' }}
            </span>
          </div>
        </div>

        <!-- 应用 ID -->
        <div class="card-id">
          <span class="id-label">智能体ID:</span>
          <span class="id-value">{{ agent.appId }}</span>
          <el-button text size="small" class="copy-btn" @click="copyAppId(agent.appId)">
            <el-icon :size="14"><DocumentCopy /></el-icon>
          </el-button>
        </div>

        <!-- 模型/类型信息 -->
        <div v-if="agent.type === 'workflow'" class="card-type-tag">
          <span class="type-badge workflow">工作流</span>
        </div>
        <div v-else-if="agent.modelId" class="card-model">
          <span class="model-label">模型:</span>
          <span class="model-value">{{ modelLabel(agent.modelId) }}</span>
        </div>

        <!-- 更新时间 -->
        <div class="card-time">更新于 {{ agent.updatedAt }}</div>

        <!-- 操作按钮 -->
        <div class="card-actions">
          <el-button size="small" @click="goToConfig(agent)">配置</el-button>
          <template v-if="agent.type === 'workflow'">
            <el-button
              size="small"
              :type="agent.enabled ? 'default' : 'primary'"
              :disabled="!agent.enabled"
              @click="agent.enabled && handleUnpublish(agent)"
            >
              {{ agent.enabled ? '下线' : '发布' }}
            </el-button>
          </template>
          <template v-else>
            <el-button
              size="small"
              :type="agent.enabled ? 'default' : 'primary'"
              :disabled="!agent.enabled"
              @click="agent.enabled && handleUnpublish(agent)"
            >
              {{ agent.enabled ? '下线' : '发布' }}
            </el-button>
          </template>
          <el-dropdown trigger="click" @command="(cmd) => handleCardAction(cmd, agent)">
            <el-button size="small" text class="more-btn">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-item command="debug">在线调试</el-dropdown-item>
              <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 空态 -->
      <div v-if="filteredList.length === 0 && !loading" class="empty-state">
        <el-icon :size="48" class="empty-icon"><FolderOpened /></el-icon>
        <p>暂无应用，点击右上角「创建应用」开始</p>
      </div>
    </div>

    <!-- 创建应用弹窗 — 左右分栏 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建应用"
      width="720px"
      :close-on-click-modal="false"
      @closed="handleCreateClosed"
    >
      <div class="create-body">
        <!-- 左侧类型选择 -->
        <div class="create-left">
          <div class="type-section-label">低代码</div>
          <div
            :class="['type-radio-card', { selected: createForm.type === 'agent' }]"
            @click="createForm.type = 'agent'"
          >
            <div class="type-icon">
              <el-icon :size="22"><Cpu /></el-icon>
            </div>
            <div class="type-info">
              <div class="type-title">智能体应用</div>
              <div class="type-desc">构建智能体应用，连接知识、插件等</div>
            </div>
            <el-radio v-model="createForm.type" value="agent" class="type-radio" />
          </div>
          <div
            :class="['type-radio-card', { selected: createForm.type === 'workflow' }]"
            @click="createForm.type = 'workflow'"
          >
            <div class="type-icon">
              <el-icon :size="22"><Share /></el-icon>
            </div>
            <div class="type-info">
              <div class="type-title">工作流应用</div>
              <div class="type-desc">通过画布自定义编排工作流</div>
            </div>
            <el-radio v-model="createForm.type" value="workflow" class="type-radio" />
          </div>

          <el-divider style="margin: 16px 0" />

          <div class="type-section-label">高代码</div>
          <div
            :class="['type-radio-card', { selected: createForm.type === 'highcode' }]"
            @click="createForm.type = 'highcode'"
          >
            <div class="type-icon">
              <el-icon :size="22"><Monitor /></el-icon>
            </div>
            <div class="type-info">
              <div class="type-title">高代码应用</div>
              <div class="type-desc">高代码开发和云上托管的应用</div>
            </div>
            <el-radio v-model="createForm.type" value="highcode" class="type-radio" />
          </div>
        </div>

        <!-- 右侧表单 -->
        <div class="create-right">
          <div v-if="createForm.type === 'agent'" class="form-section">
            <h4>创建智能体应用</h4>
            <p class="form-desc">构建智能体应用，连接知识、数据与插件等能力</p>

            <el-form label-width="80px" label-position="right" class="create-form">
              <el-form-item label="类型" required>
                <el-radio-group v-model="createForm.agentVersion">
                  <el-radio value="2.0" size="large">Agent 2.0 (推荐)</el-radio>
                  <el-radio value="1.0" size="large">Agent 1.0</el-radio>
                </el-radio-group>
                <p class="radio-desc" v-if="createForm.agentVersion === '2.0'">
                  基于AgentScope开发框架构建，全新Agent模式，强化React与Function Call能力
                </p>
                <p class="radio-desc" v-else>
                  结合Prompt与多种业务规则控制的Agent模式，在知识库检索增强任务上更具稳定性
                </p>
              </el-form-item>
              <el-form-item label="应用名称" required>
                <el-input
                  v-model="createForm.name"
                  placeholder="请输入应用名称"
                  :maxlength="50"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="描述信息">
                <el-input v-model="createForm.descr" placeholder="请输入描述信息" />
              </el-form-item>
              <el-form-item label="应用头像">
                <div class="avatar-uploader" @click="handleAvatarUpload">
                  <el-avatar :size="56" shape="square">
                    <el-icon :size="24"><Plus /></el-icon>
                  </el-avatar>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div v-else-if="createForm.type === 'workflow'" class="form-section">
            <h4>创建工作流应用</h4>
            <p class="form-desc">通过画布自定义编排工作流，实现复杂的业务逻辑处理，支持多种节点类型和条件分支，适用于自动化任务处理场景。</p>

            <el-form label-width="80px" label-position="right" class="create-form">
              <el-form-item label="应用名称" required>
                <el-input
                  v-model="createForm.name"
                  placeholder="请输入应用名称"
                  :maxlength="50"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="描述信息">
                <el-input v-model="createForm.descr" placeholder="请输入描述信息" />
              </el-form-item>
              <el-form-item label="应用头像">
                <div class="avatar-uploader" @click="handleAvatarUpload">
                  <el-avatar :size="56" shape="square">
                    <el-icon :size="24"><Plus /></el-icon>
                  </el-avatar>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div v-else class="form-placeholder">
            <el-icon :size="48"><Clock /></el-icon>
            <p>高代码应用功能即将上线</p>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createAgent" :disabled="!createForm.name.trim() || createForm.type === 'highcode'">
          立即创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 使用指南弹窗 -->
    <el-dialog v-model="showGuideDialog" title="使用指南" width="680px">
      <div class="guide-body">
        <div class="guide-section">
          <h4>智能体应用</h4>
          <p>构建 AI 智能体，连接知识库、工具和插件，实现复杂对话和任务处理能力。</p>
          <ul>
            <li>支持多种大模型（通义千问、文心一言、GLM-4 等）</li>
            <li>可配置知识库、连接器、MCP 工具等扩展能力</li>
            <li>支持 Agent 2.0 框架，强化 ReAct 与 Function Call 能力</li>
          </ul>
        </div>
        <div class="guide-section">
          <h4>工作流应用</h4>
          <p>通过可视化画布自定义编排工作流，实现复杂的业务逻辑处理。</p>
          <ul>
            <li>拖拽式节点编排，支持大模型、API、逻辑判断等 30+ 节点类型</li>
            <li>支持条件分支、意图分类、循环和批处理等流程控制</li>
            <li>发布为 API/SDK 调用，或接入钉钉、微信等平台</li>
          </ul>
        </div>
        <div class="guide-section">
          <h4>高代码应用</h4>
          <p>高代码开发和云上托管的应用，适用于需要深度定制开发的高级场景。</p>
        </div>
        <el-alert type="info" :closable="false" show-icon style="margin-top: 16px;">
          <template #title>详细开发文档请参考平台帮助中心或联系技术支持</template>
        </el-alert>
      </div>
    </el-dialog>

    <!-- 在线调试抽屉 -->
    <el-drawer
      v-model="debugVisible"
      :title="'智能体调试 - ' + (debugAgent?.name || '')"
      size="600px"
      :close-on-click-modal="false"
    >
      <div class="debug-container">
        <div class="debug-toolbar">
          <el-button size="small" text @click="clearDebugMessages">清空对话</el-button>
          <el-select v-model="debugOverrideModel" size="small" style="width:180px" placeholder="跟随智能体配置">
            <el-option label="跟随智能体配置" value="" />
            <el-option v-for="m in enabledModels" :key="m.id" :label="m.label" :value="m.id" />
          </el-select>
          <div class="debug-temp">
            <span class="debug-label">温度</span>
            <el-slider v-model="debugOverrideTemp" :min="0" :max="2" :step="0.1" size="small" style="width:100px" :show-input="false" />
            <span class="debug-temp-val">{{ debugOverrideTemp }}</span>
          </div>
        </div>

        <div class="debug-messages" ref="debugMsgRef">
          <div v-if="debugMessages.length === 0" class="debug-empty">发送消息开始调试</div>
          <div
            v-for="(msg, i) in debugMessages"
            :key="i"
            :class="['msg-bubble', msg.role === 'user' ? 'msg-user' : 'msg-agent']"
          >
            <div class="msg-content">{{ msg.content }}</div>
            <div v-if="msg.role === 'agent' && msg.metrics" class="msg-metrics">
              耗时 {{ msg.metrics.latency }} · Token {{ msg.metrics.tokens }}
            </div>
          </div>
          <div v-if="debugLoading" class="msg-bubble msg-agent">
            <div class="msg-typing"><span></span><span></span><span></span></div>
          </div>
        </div>

        <div class="debug-input-area">
          <el-input
            v-model="debugInput"
            type="textarea"
            :rows="3"
            placeholder="输入调试消息..."
            @keydown.enter.exact.prevent="sendDebugMessage"
          />
          <el-button type="primary" :disabled="!debugInput.trim() || debugLoading" @click="sendDebugMessage">
            发送
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Cpu, DocumentCopy, MoreFilled, FolderOpened, Share, Monitor, Clock } from '@element-plus/icons-vue'
import { modelList, agentList, modelLabel } from './data'

const router = useRouter()

const enabledModels = computed(() => modelList.filter(m => m.enabled))

// ===== 类型筛选 tabs =====
const typeTabs = [
  { label: '全部', value: '' },
  { label: '智能体', value: 'agent' },
  { label: '工作流', value: 'workflow' }
]
const activeType = ref('')

// ===== 筛选 =====
const filters = reactive({ keyword: '', type: '' })
const loading = ref(false)

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 500)
}

const showGuideDialog = ref(false)

const handleGuide = () => {
  showGuideDialog.value = true
}

const handleAvatarUpload = () => {
  ElMessage.info('头像上传功能即将上线')
}

// ===== 列表 =====
// 数据来自 ./data.js 共享模块

const filteredList = computed(() => {
  let list = agentList
  if (activeType.value === 'agent') {
    list = list.filter(a => a.type !== 'workflow')
  } else if (activeType.value === 'workflow') {
    list = list.filter(a => a.type === 'workflow')
  }
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    list = list.filter(a => a.name.toLowerCase().includes(kw))
  }
  return list
})

const copyAppId = (appId) => {
  navigator.clipboard.writeText(appId).then(() => {
    ElMessage.success('智能体ID已复制')
  }).catch(() => {
    ElMessage.info('智能体ID: ' + appId)
  })
}

const goToConfig = (agent) => {
  if (agent.type === 'workflow') {
    router.push(`/agent/workflow/${agent.id}`)
  } else {
    router.push(`/agent/${agent.id}`)
  }
}

const handleUnpublish = (agent) => {
  ElMessageBox.confirm('确定下线该应用？下线后该应用将不可用。', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    agent.enabled = false
    ElMessage.success('已下线')
  }).catch(() => {})
}

const handleCardAction = (cmd, agent) => {
  switch (cmd) {
    case 'debug':
      openDebug(agent)
      break
    case 'delete':
      handleDelete(agent)
      break
  }
}

const handleDelete = (row) => {
  const refCount = row.linkedAlgos?.length || 0
  const msg = refCount > 0
    ? `该智能体已被 ${refCount} 个算法引用，确定删除？`
    : '确定删除该智能体？'
  ElMessageBox.confirm(msg, '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    const idx = agentList.findIndex(a => a.id === row.id)
    if (idx >= 0) agentList.splice(idx, 1)
    ElMessage.success('已删除')
  }).catch(() => {})
}

// ===== 创建弹窗 =====
const createDialogVisible = ref(false)

const defaultCreateForm = () => ({
  type: 'agent',
  agentVersion: '2.0',
  name: '',
  descr: ''
})
const createForm = reactive(defaultCreateForm())

const openCreateDialog = () => {
  Object.assign(createForm, defaultCreateForm())
  createDialogVisible.value = true
}

const handleCreateClosed = () => {
  Object.assign(createForm, defaultCreateForm())
}

const createAgent = () => {
  if (!createForm.name.trim()) return ElMessage.warning('请输入应用名称')

  const appId = generateAppId()
  const now = new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })

  if (createForm.type === 'workflow') {
    const newWorkflow = {
      id: Date.now(),
      appId,
      name: createForm.name.trim(),
      descr: createForm.descr.trim(),
      type: 'workflow',
      enabled: false,
      draft: true,
      updatedAt: now,
      nodes: [],
      edges: []
    }
    agentList.unshift(newWorkflow)
    ElMessage.success('工作流应用已创建')
    createDialogVisible.value = false
    router.push(`/agent/workflow/${newWorkflow.id}`)
    return
  }

  const newAgent = {
    id: Date.now(),
    appId,
    name: createForm.name.trim(),
    descr: createForm.descr.trim(),
    modelId: enabledModels.value[0]?.id || null,
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    enabled: false,
    linkedAlgos: [],
    type: 'agent',
    updatedAt: now
  }
  agentList.unshift(newAgent)
  ElMessage.success('智能体已创建')
  createDialogVisible.value = false
  router.push(`/agent/${newAgent.id}`)
}

const generateAppId = () => {
  const hex = '0123456789abcdef'
  let id = ''
  for (let i = 0; i < 16; i++) id += hex[Math.floor(Math.random() * 16)]
  return id
}

// ===== 调试抽屉 =====
const debugVisible = ref(false)
const debugAgent = ref(null)
const debugMessages = ref([])
const debugInput = ref('')
const debugLoading = ref(false)
const debugOverrideModel = ref('')
const debugOverrideTemp = ref(0.7)
const debugMsgRef = ref(null)

const openDebug = (row) => {
  debugAgent.value = row
  debugMessages.value = [
    { role: 'agent', content: `你好，我是「${row.name}」。请问有什么可以帮你？`, metrics: null }
  ]
  debugInput.value = ''
  debugOverrideModel.value = ''
  debugOverrideTemp.value = row.temperature
  debugLoading.value = false
  debugVisible.value = true
}

const clearDebugMessages = () => {
  debugMessages.value = []
  debugInput.value = ''
}

const sendDebugMessage = async () => {
  const text = debugInput.value.trim()
  if (!text || debugLoading.value) return
  debugMessages.value.push({ role: 'user', content: text })
  debugInput.value = ''
  debugLoading.value = true

  await new Promise(r => setTimeout(r, 1200))
  debugMessages.value.push({
    role: 'agent',
    content: `[模拟回复] 收到你的消息：「${text}」。这是调试模式的模拟返回，接入真实 API 后将返回模型的实际输出。`,
    metrics: { latency: '1.2s', tokens: 128 }
  })
  debugLoading.value = false

  nextTick(() => {
    const el = debugMsgRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}
</script>

<style lang="scss" scoped>
// ===== 顶部操作栏 =====
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.segmented-control {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-lighter);
  border-radius: 8px;
  padding: 3px;

  .seg-item {
    padding: 6px 20px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: var(--text-primary);
    }

    &.active {
      background: var(--bg-card);
      color: var(--text-primary);
      font-weight: 500;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

// ===== 搜索栏 =====
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

// ===== 卡片网格 =====
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  min-height: 200px;
}

.agent-card {
  background: var(--bg-card);
  border: 1px solid var(--border-lighter);
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-bg);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.card-title-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 4px;
  width: fit-content;

  &.published {
    color: #389e0d;
    background: #f6ffed;
  }

  &.draft {
    color: var(--text-placeholder);
    background: var(--bg-page);
  }

  &.unpublished {
    color: var(--text-placeholder);
    background: var(--bg-page);
  }
}

.card-id {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 13px;

  .id-label {
    color: var(--text-secondary);
  }

  .id-value {
    color: var(--text-primary);
    font-family: monospace;
  }

  .copy-btn {
    padding: 0;
    height: auto;
    color: var(--text-placeholder);
    &:hover { color: var(--primary-color); }
  }
}

.card-type-tag {
  margin-bottom: 4px;

  .type-badge {
    font-size: 12px;
    padding: 1px 8px;
    border-radius: 4px;

    &.workflow {
      color: #722ed1;
      background: #f9f0ff;
    }
  }
}

.card-model {
  margin-bottom: 4px;
  font-size: 13px;

  .model-label {
    color: var(--text-secondary);
    margin-right: 4px;
  }

  .model-value {
    color: var(--text-primary);
    background: var(--primary-bg);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 12px;
  }
}

.card-time {
  font-size: 12px;
  color: var(--text-placeholder);
  margin-bottom: 14px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-lighter);

  .more-btn {
    margin-left: auto;
    padding: 0 4px;
    height: auto;
    color: var(--text-secondary);
  }
}

// ===== 空态 =====
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--text-placeholder);

  .empty-icon {
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
  }
}

// ===== 创建弹窗 =====
.create-body {
  display: flex;
  gap: 0;
  min-height: 400px;
  padding-top: 20px;
}

.create-left {
  width: 220px;
  flex-shrink: 0;
  padding-right: 20px;
  border-right: 1px solid var(--border-lighter);
}

.type-section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-placeholder);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.type-radio-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;

  &:hover {
    border-color: var(--primary-color);
  }

  &.selected {
    border-color: var(--primary-color);
    background: var(--primary-bg);
  }

  .type-icon {
    width: 36px;
    height: 36px;
    background: var(--bg-page);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    flex-shrink: 0;
  }

  .type-info {
    flex: 1;
    min-width: 0;

    .type-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .type-desc {
      font-size: 11px;
      color: var(--text-placeholder);
      margin-top: 2px;
    }
  }

  .type-radio {
    flex-shrink: 0;
  }
}

.create-right {
  flex: 1;
  padding-left: 24px;
  min-width: 0;

  h4 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .form-desc {
    margin: 0 0 20px;
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.create-form {
  .el-radio {
    margin-right: 24px;
  }

  .radio-desc {
    margin: 6px 0 0 0;
    font-size: 12px;
    color: var(--text-placeholder);
    line-height: 1.5;
  }
}

.form-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-placeholder);
  gap: 12px;

  p {
    font-size: 14px;
  }
}

.avatar-uploader {
  cursor: pointer;
  .el-avatar {
    background: var(--bg-page);
    border: 1px dashed var(--border-lighter);
    color: var(--text-placeholder);
    cursor: pointer;
    &:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
  }
}

// ===== 调试面板 =====
.debug-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.debug-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-lighter);
  flex-shrink: 0;
}

.debug-temp {
  display: flex;
  align-items: center;
  gap: 6px;
}

.debug-label {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.debug-temp-val {
  font-size: 12px;
  color: var(--text-primary);
  width: 28px;
  text-align: center;
}

.debug-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.debug-empty {
  text-align: center;
  color: var(--text-placeholder);
  padding: 80px 0;
  font-size: 14px;
}

.msg-bubble {
  max-width: 85%;
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
}

.msg-user {
  margin-left: auto;
  background: var(--primary-bg);
  color: var(--text-primary);
  border: 1px solid var(--primary-color);
}

.msg-agent {
  margin-right: auto;
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-lighter);
}

.msg-metrics {
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-placeholder);
}

.msg-typing {
  display: flex;
  gap: 4px;
  padding: 4px 0;
  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-placeholder);
    animation: typing 1.4s infinite;
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}

.debug-input-area {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-lighter);
  flex-shrink: 0;
  .el-textarea { flex: 1; }
  .el-button { align-self: flex-end; height: 40px; }
}
</style>

<style lang="scss">
.create-form .el-radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ===== 使用指南弹窗 =====
.guide-body {
  padding-top: 20px;
}

.guide-section {
  margin-bottom: 20px;

  h4 {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 600;
  }

  p {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0 0 8px;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      font-size: 13px;
      color: var(--text-regular);
      line-height: 1.8;
    }
  }
}
</style>
