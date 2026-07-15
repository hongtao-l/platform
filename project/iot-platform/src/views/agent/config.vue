<template>
  <div class="config-page">
    <!-- 顶部导航 -->
    <div class="config-topbar">
      <div class="topbar-left">
        <el-button text @click="$router.push('/agent')" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="agent-info">
          <span class="agent-name">{{ agent?.name || '加载中...' }}</span>
          <span class="version-badge">新版</span>
          <span :class="['status-tag', agent?.enabled ? 'published' : 'unpublished']">
            {{ agent?.enabled ? '已发布' : '未发布' }}
          </span>
        </div>
      </div>
      <div class="topbar-actions">
        <el-button>观测</el-button>
        <el-button>版本管理</el-button>
        <el-button type="primary" :disabled="!isConfigValid" @click="handlePublish">
          {{ agent?.enabled ? '更新发布' : '发布' }}
        </el-button>
      </div>
    </div>

    <!-- 子 tabs -->
    <div class="config-subtabs">
      <button :class="['subtab', { active: activeSubtab === 'config' }]" @click="activeSubtab = 'config'">
        应用配置
      </button>
      <button :class="['subtab', { active: activeSubtab === 'channel' }]" disabled>
        发布渠道
      </button>
    </div>

    <!-- 主体三栏布局 -->
    <div class="config-body" v-if="agent">
      <!-- 左侧锚点导航 -->
      <nav class="anchor-nav">
        <div
          v-for="section in anchorSections"
          :key="section.id"
          :class="['anchor-item', { active: activeAnchor === section.id }]"
          @click="scrollToSection(section.id)"
        >
          <el-icon :size="20">
            <component :is="section.icon" />
          </el-icon>
          <span class="anchor-label">{{ section.label }}</span>
        </div>
      </nav>

      <!-- 中间表单区 -->
      <div class="config-form" ref="formScrollRef" @scroll="onFormScroll">
        <!-- 规划：模型 + 提示词 -->
        <section id="sec-planning" class="config-section">
          <div class="section-header">
            <h3>规划</h3>
          </div>

          <div class="field-group">
            <label class="field-label">模型</label>
            <div class="model-select-row">
              <el-select v-model="form.modelId" style="width: 280px">
                <el-option v-for="m in enabledModelList" :key="m.id" :label="m.label" :value="m.id" />
              </el-select>
              <el-button text type="primary">
                <el-icon><Edit /></el-icon>
              </el-button>
            </div>
          </div>

          <div class="field-group">
            <div class="field-label-row">
              <label class="field-label">提示词</label>
              <el-button text size="small" type="primary" @click="showNewVar = true">新建变量</el-button>
            </div>
            <el-input
              v-model="form.systemPrompt"
              type="textarea"
              :rows="12"
              placeholder="通过提示词设定智能体的角色、任务规范和回复风格。输入「/」引用变量，Enter 换行。"
              class="prompt-textarea"
            />
            <div class="char-count">{{ form.systemPrompt.length }}/997952</div>
          </div>

          <div class="field-group">
            <div class="toggle-row">
              <span class="toggle-label">预解析文件</span>
              <el-switch v-model="form.preParseFile" size="small" />
            </div>
            <p class="toggle-desc">开启后使用预置解析器处理文档/图像/视频/音频</p>
          </div>

          <!-- 模型参数 -->
          <el-divider>模型参数</el-divider>
          <div class="field-group">
            <div class="param-label">温度</div>
            <div class="param-row">
              <el-slider v-model="form.temperature" :min="0" :max="2" :step="0.1" style="flex:1" />
              <el-input-number v-model="form.temperature" :min="0" :max="2" :step="0.1" :precision="1" size="small" style="width: 90px" />
            </div>
          </div>
          <div class="field-group">
            <div class="param-label">最大 Token</div>
            <div class="param-row">
              <el-slider v-model="form.maxTokens" :min="256" :max="128000" :step="256" style="flex:1" />
              <el-input-number v-model="form.maxTokens" :min="256" :max="128000" :step="256" size="small" style="width: 90px" />
            </div>
          </div>
          <div class="field-group">
            <div class="param-label">Top-P</div>
            <div class="param-row">
              <el-slider v-model="form.topP" :min="0" :max="1" :step="0.05" style="flex:1" />
              <el-input-number v-model="form.topP" :min="0" :max="1" :step="0.05" :precision="2" size="small" style="width: 90px" />
            </div>
          </div>
        </section>

        <!-- 工具 -->
        <section id="sec-tools" class="config-section">
          <div class="section-header">
            <h3>工具</h3>
          </div>

          <div class="tool-block">
            <div class="tool-block-header">
              <span class="tool-title">内置工具</span>
              <el-button text size="small" type="primary">设置</el-button>
            </div>
          </div>

          <div class="tool-block">
            <div class="tool-block-header">
              <span class="tool-title">知识库</span>
              <el-button text size="small" type="primary">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
            <div v-if="!form.tools.knowledge.length" class="tool-empty">
              暂无知识库，点击右上角「+」开始配置
            </div>
          </div>

          <div class="tool-block">
            <div class="tool-block-header">
              <span class="tool-title">数据连接器</span>
              <el-button text size="small" type="primary">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
            <div v-if="!form.tools.connectors.length" class="tool-empty">
              暂无数据连接器，点击右上角「+」开始配置
            </div>
          </div>

          <div class="tool-block">
            <div class="tool-block-header">
              <span class="tool-title">应用组件</span>
              <el-button text size="small" type="primary">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
            <div v-if="!form.tools.components.length" class="tool-empty">
              暂无应用组件，点击右上角「+」开始配置
            </div>
          </div>

          <div class="tool-block">
            <div class="tool-block-header">
              <span class="tool-title">MCP服务</span>
              <el-button text size="small" type="primary">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
            <div v-if="!form.tools.mcp.length" class="tool-empty">
              暂无MCP服务，点击右上角「+」开始配置
            </div>
          </div>
        </section>

        <!-- 技能 -->
        <section id="sec-skills" class="config-section">
          <div class="section-header">
            <h3>技能</h3>
            <el-button text size="small" type="primary">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
          <div v-if="!form.skills.length" class="section-empty">
            暂无 Skill，点击右上角「+」开始配置
          </div>
        </section>

        <!-- 记忆 -->
        <section id="sec-memory" class="config-section">
          <div class="section-header">
            <h3>记忆</h3>
          </div>
          <div class="field-group">
            <div class="toggle-row">
              <span class="toggle-label">短期记忆</span>
              <el-switch v-model="form.shortMemory" size="small" />
            </div>
            <p class="toggle-desc">短期记忆是会话中提供给智能体的上下文信息</p>
          </div>
          <div class="field-group" v-if="form.shortMemory">
            <label class="field-label">携带上下文轮数</label>
            <div class="param-row">
              <el-slider v-model="form.contextRounds" :min="0" :max="30" style="flex:1" />
              <el-input-number v-model="form.contextRounds" :min="0" :max="30" size="small" style="width: 90px" />
            </div>
            <p class="toggle-desc">轮数越多，对话相关性越强，输入长度也会增加</p>
          </div>
        </section>

        <!-- 环境 -->
        <section id="sec-env" class="config-section">
          <div class="section-header">
            <h3>环境</h3>
            <el-button text size="small" type="primary">
              <el-icon><Plus /></el-icon>
              添加变量
            </el-button>
          </div>
          <p class="section-desc">配置 Skill 调用时所需的鉴权密钥和环境变量信息</p>
          <div v-if="!form.envVars.length" class="section-empty">
            暂无环境变量，点击右上角「添加变量」开始配置
          </div>
        </section>

        <!-- 回复 -->
        <section id="sec-reply" class="config-section">
          <div class="section-header">
            <h3>回复</h3>
          </div>
          <div class="field-group">
            <div class="toggle-row">
              <span class="toggle-label">展示回答来源</span>
              <el-switch v-model="form.showAnswerSource" size="small" />
            </div>
            <p class="toggle-desc">以角标形式展示知识来源，并支持用户获取到源文件地址或源网页地址</p>
          </div>
        </section>
      </div>

      <!-- 右侧调试面板 -->
      <div class="debug-panel">
        <div class="debug-panel-header">
          <span class="debug-title">{{ agent.name }}</span>
          <div class="debug-panel-actions">
            <el-button text size="small" @click="handleEditDebug">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button text size="small" @click="handleDebugSettings">
              <el-icon><Setting /></el-icon>
            </el-button>
            <el-button text size="small" @click="clearDebugMessages">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="debug-messages" ref="debugMsgRef">
          <div v-if="debugMessages.length === 0" class="debug-placeholder">
            输入问题进行测试体验
          </div>
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
          <div class="debug-input-row">
            <el-button text size="small" class="attach-btn">
              <el-icon><Link /></el-icon>
            </el-button>
            <el-input
              v-model="debugInput"
              placeholder="输入问题..."
              @keydown.enter.exact.prevent="sendDebugMessage"
            />
            <el-button
              type="primary"
              :disabled="!debugInput.trim() || debugLoading"
              size="small"
              circle
              @click="sendDebugMessage"
            >
              <el-icon><Promotion /></el-icon>
            </el-button>
          </div>
          <div class="debug-disclaimer">内容由AI生成，仅供参考</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Edit, Plus, Setting, Delete, Link, Promotion,
  Cpu, Switch, Collection, MagicStick, Key, ChatDotRound
} from '@element-plus/icons-vue'
import { modelList, findAgent } from './data'

const route = useRoute()
const router = useRouter()

// ===== 智能体数据 =====
const agent = computed(() => findAgent(Number(route.params.id)))

const enabledModelList = computed(() => modelList.filter(m => m.enabled))

// 重定向到列表
onMounted(() => {
  if (!agent.value) {
    ElMessage.warning('智能体不存在')
    router.replace('/agent')
  }
})

// ===== 子 tab =====
const activeSubtab = ref('config')

// ===== 表单数据 =====
const form = reactive({
  modelId: null,
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.9,
  preParseFile: false,
  tools: { knowledge: [], connectors: [], components: [], mcp: [] },
  skills: [],
  shortMemory: true,
  contextRounds: 3,
  envVars: [],
  showAnswerSource: true
})

const showNewVar = ref(false)

// 从 agent 初始化表单
watch(agent, (a) => {
  if (!a) return
  form.modelId = a.modelId
  form.systemPrompt = a.systemPrompt || ''
  form.temperature = a.temperature ?? 0.7
  form.maxTokens = a.maxTokens ?? 4096
  form.topP = a.topP ?? 0.9
  form.preParseFile = a.preParseFile ?? false
  form.tools = a.tools || { knowledge: [], connectors: [], components: [], mcp: [] }
  form.skills = a.skills || []
  form.shortMemory = (a.contextRounds ?? 3) > 0
  form.contextRounds = a.contextRounds ?? 3
  form.envVars = a.envVars || []
  form.showAnswerSource = a.showAnswerSource ?? true
}, { immediate: true })

const isConfigValid = computed(() => {
  return form.modelId && form.systemPrompt.trim()
})

const handlePublish = () => {
  if (!isConfigValid.value) return ElMessage.warning('请先完成应用配置')
  if (agent.value) {
    agent.value.enabled = true
    agent.value.updatedAt = new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  ElMessage.success('应用已发布')
}

// ===== 锚点导航 =====
const anchorSections = [
  { id: 'planning', label: '规划', icon: Cpu },
  { id: 'tools', label: '工具', icon: Switch },
  { id: 'skills', label: '技能', icon: MagicStick },
  { id: 'memory', label: '记忆', icon: Collection },
  { id: 'env', label: '环境', icon: Key },
  { id: 'reply', label: '回复', icon: ChatDotRound }
]

const activeAnchor = ref('planning')
const formScrollRef = ref(null)

const scrollToSection = (secId) => {
  activeAnchor.value = secId
  const el = document.getElementById(`sec-${secId}`)
  if (el && formScrollRef.value) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const onFormScroll = () => {
  if (!formScrollRef.value) return
  const sections = anchorSections.map(s => document.getElementById(`sec-${s.id}`)).filter(Boolean)
  const scrollTop = formScrollRef.value.scrollTop + 100

  for (let i = sections.length - 1; i >= 0; i--) {
    if (sections[i].offsetTop <= scrollTop) {
      activeAnchor.value = anchorSections[i].id
      break
    }
  }
}

// ===== 调试面板 =====
const debugMessages = ref([])
const debugInput = ref('')
const debugLoading = ref(false)
const debugMsgRef = ref(null)

const handleEditDebug = () => {}
const handleDebugSettings = () => {}

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

  await new Promise(r => setTimeout(r, 1500))
  debugMessages.value.push({
    role: 'agent',
    content: `[模拟回复] 收到你的消息：「${text}」。这是配置页内嵌调试的模拟返回。`,
    metrics: { latency: '1.5s', tokens: 156 }
  })
  debugLoading.value = false

  nextTick(() => {
    const el = debugMsgRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}
</script>

<style lang="scss" scoped>
// ===== 整体布局 =====
.config-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
  background: var(--bg-page);
}

.config-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-lighter);
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  padding: 4px;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .agent-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .version-badge {
    font-size: 11px;
    padding: 1px 6px;
    background: var(--primary-bg);
    color: var(--primary-color);
    border-radius: 4px;
  }

  .status-tag {
    font-size: 12px;
    padding: 1px 8px;
    border-radius: 4px;

    &.published { color: #389e0d; background: #f6ffed; }
    &.unpublished { color: var(--text-placeholder); background: var(--bg-page); }
  }
}

.topbar-actions {
  display: flex;
  gap: 8px;
}

// ===== 子 tabs =====
.config-subtabs {
  display: flex;
  padding: 0 20px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-lighter);
  flex-shrink: 0;

  .subtab {
    padding: 10px 16px;
    border: none;
    background: none;
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;

    &:hover { color: var(--text-primary); }

    &.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    &:disabled {
      color: var(--text-placeholder);
      cursor: not-allowed;
    }
  }
}

// ===== 三栏主体 =====
.config-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

// ===== 锚点导航 =====
.anchor-nav {
  width: 64px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-right: 1px solid var(--border-lighter);
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.anchor-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 4px;
  width: 52px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;

  &:hover {
    color: var(--primary-color);
    background: var(--bg-hover);
  }

  &.active {
    color: var(--primary-color);
    background: var(--primary-bg);
  }

  .anchor-label {
    font-size: 11px;
    white-space: nowrap;
  }
}

// ===== 中间表单 =====
.config-form {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 32px;
}

.config-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-lighter);

  &:last-child { border-bottom: none; }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.section-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 12px;
}

.section-empty {
  text-align: center;
  color: var(--text-placeholder);
  padding: 40px 0;
  font-size: 14px;
}

// ===== 字段组 =====
.field-group {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.model-select-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.prompt-textarea {
  :deep(textarea) {
    font-size: 13px;
    line-height: 1.7;
  }
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: var(--text-placeholder);
  margin-top: 4px;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }
}

.toggle-desc {
  font-size: 12px;
  color: var(--text-placeholder);
  margin: 4px 0 0;
}

// ===== 模型参数 =====
.param-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.param-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

// ===== 工具块 =====
.tool-block {
  border: 1px solid var(--border-lighter);
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 10px;
}

.tool-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .tool-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }
}

.tool-empty {
  text-align: center;
  color: var(--text-placeholder);
  font-size: 13px;
  padding: 20px 0 4px;
}

// ===== 右侧调试面板 =====
.debug-panel {
  width: 380px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-left: 1px solid var(--border-lighter);
  display: flex;
  flex-direction: column;
}

.debug-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-lighter);

  .debug-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .debug-panel-actions {
    display: flex;
    gap: 2px;
  }
}

.debug-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.debug-placeholder {
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
  background: var(--bg-elevated);
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
    width: 6px; height: 6px;
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
  padding: 12px 16px;
  border-top: 1px solid var(--border-lighter);
}

.debug-input-row {
  display: flex;
  align-items: center;
  gap: 6px;

  .el-input { flex: 1; }

  .attach-btn {
    padding: 4px;
    color: var(--text-secondary);
  }
}

.debug-disclaimer {
  text-align: center;
  font-size: 11px;
  color: var(--text-placeholder);
  margin-top: 8px;
}
</style>
