<template>
  <div class="wf-config-page">
    <!-- 顶部导航 -->
    <div class="wf-topbar">
      <div class="topbar-left">
        <el-button text @click="$router.push('/agent')" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="wf-info">
          <span class="wf-name">{{ workflow?.name || '加载中...' }}</span>
          <span class="draft-badge">
            <el-icon><Document /></el-icon>
            草稿
          </span>
          <span class="update-time">更新于：{{ workflow?.updatedAt || '' }}</span>
        </div>
      </div>
    </div>

    <!-- 子 tabs + 操作按钮 -->
    <div class="wf-toolbar">
      <div class="wf-subtabs">
        <button :class="['subtab', { active: activeTab === 'canvas' }]" @click="activeTab = 'canvas'">画布配置</button>
        <button :class="['subtab', { active: activeTab === 'channel' }]" @click="activeTab = 'channel'">发布渠道</button>
      </div>
      <div class="wf-actions">
        <el-button text @click="handleTest">
          <el-icon><VideoPlay /></el-icon>
        </el-button>
        <el-button text @click="handleObserve">观测</el-button>
        <el-button text @click="handleSave">
          <el-icon><FolderChecked /></el-icon>
        </el-button>
        <el-button @click="showVersionDialog = true">版本管理</el-button>
        <el-button type="primary" @click="handlePublish">发布</el-button>
      </div>
    </div>

    <div class="wf-body" v-if="workflow">
      <!-- 画布配置 Tab -->
      <div v-if="activeTab === 'canvas'" class="canvas-layout">
        <!-- 左侧节点管理 -->
        <div class="node-sidebar" :class="{ collapsed: sidebarCollapsed }">
          <div class="node-sidebar-header">
            <span v-if="!sidebarCollapsed" class="sidebar-title">节点管理</span>
            <el-button text size="small" @click="sidebarCollapsed = !sidebarCollapsed">
              <el-icon><DArrowLeft v-if="!sidebarCollapsed" /><DArrowRight v-else /></el-icon>
            </el-button>
          </div>
          <template v-if="!sidebarCollapsed">
            <div class="node-tabs">
              <button :class="['node-tab', { active: nodeTab === 'library' }]" @click="nodeTab = 'library'">节点库</button>
              <button :class="['node-tab', { active: nodeTab === 'current' }]" @click="nodeTab = 'current'">当前</button>
            </div>
            <div class="node-search" v-if="nodeTab === 'library'">
              <el-input v-model="nodeSearch" placeholder="搜索节点名称" size="small" :prefix-icon="Search" clearable />
            </div>
            <div class="node-categories" v-if="nodeTab === 'library'">
              <div v-for="cat in filteredNodeCategories" :key="cat.name" class="node-cat-group">
                <div class="cat-name">{{ cat.name }}</div>
                <div
                  v-for="node in cat.nodes"
                  :key="node.name"
                  class="node-item"
                  draggable="true"
                  @dragstart="onDragStart($event, node)"
                >
                  <el-icon :size="18"><component :is="node.icon" /></el-icon>
                  <span class="node-item-name">{{ node.name }}</span>
                </div>
              </div>
            </div>
            <div class="node-current" v-else>
              <div v-if="workflow.nodes.length === 0" class="node-empty">画布为空，从节点库拖入节点</div>
              <div v-for="node in workflow.nodes" :key="node.id" class="current-node-item">
                <span class="current-node-name">{{ node.name }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- 中间画布 -->
        <div class="canvas-main" ref="canvasRef">
          <div class="canvas-toolbar">
            <div class="canvas-tb-left">
              <el-button text size="small" @click="handleUndo" :disabled="undoStack.length === 0">
                <el-icon><RefreshLeft /></el-icon>
              </el-button>
              <el-button text size="small" @click="handleRedo" :disabled="redoStack.length === 0">
                <el-icon><RefreshRight /></el-icon>
              </el-button>
            </div>
            <div class="canvas-tb-right">
              <div class="zoom-control">
                <el-button text size="small" @click="zoomOut">
                  <el-icon><ZoomOut /></el-icon>
                </el-button>
                <span class="zoom-val">{{ Math.round(zoom * 100) }}%</span>
                <el-button text size="small" @click="zoomIn">
                  <el-icon><ZoomIn /></el-icon>
                </el-button>
                <el-button text size="small" @click="zoomFit">
                  <el-icon><FullScreen /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <div
            class="canvas-area"
            :class="{ 'connecting-mode': connectingFrom !== null }"
            @drop="onDrop"
            @dragover.prevent
            @click.self="deselectNode"
            @keydown.escape="cancelConnecting"
            tabindex="0"
          >
            <!-- 画布背景网格 -->
            <div class="canvas-grid"></div>

            <!-- SVG 连接线层 -->
            <svg class="edges-svg" v-if="workflow.edges.length > 0">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#8c8c8c" />
                </marker>
              </defs>
              <g v-for="edge in workflow.edges" :key="edge.id">
                <line
                  :x1="getPortPos(edge.sourceNodeId, edge.sourcePort).x"
                  :y1="getPortPos(edge.sourceNodeId, edge.sourcePort).y"
                  :x2="getPortPos(edge.targetNodeId, edge.targetPort).x"
                  :y2="getPortPos(edge.targetNodeId, edge.targetPort).y"
                  stroke="#8c8c8c"
                  stroke-width="2"
                  marker-end="url(#arrowhead)"
                  class="edge-line"
                  @click.stop="selectEdge(edge.id)"
                />
                <!-- 删除边按钮 -->
                <circle
                  v-if="selectedEdgeId === edge.id"
                  :cx="(getPortPos(edge.sourceNodeId, edge.sourcePort).x + getPortPos(edge.targetNodeId, edge.targetPort).x) / 2"
                  :cy="(getPortPos(edge.sourceNodeId, edge.sourcePort).y + getPortPos(edge.targetNodeId, edge.targetPort).y) / 2"
                  r="10"
                  fill="#ff4d4f"
                  stroke="#fff"
                  stroke-width="2"
                  class="edge-del-btn"
                  @click.stop="removeEdge(edge.id)"
                />
                <text
                  v-if="selectedEdgeId === edge.id"
                  :x="(getPortPos(edge.sourceNodeId, edge.sourcePort).x + getPortPos(edge.targetNodeId, edge.targetPort).x) / 2"
                  :y="(getPortPos(edge.sourceNodeId, edge.sourcePort).y + getPortPos(edge.targetNodeId, edge.targetPort).y) / 2 + 4"
                  text-anchor="middle"
                  fill="#fff"
                  font-size="10"
                  class="edge-del-icon"
                  @click.stop="removeEdge(edge.id)"
                >✕</text>
              </g>
            </svg>

            <!-- 临时连接线（拖拽中） -->
            <svg class="edges-svg" v-if="connectingFrom && tempLineEnd">
              <line
                :x1="getPortPos(connectingFrom.nodeId, connectingFrom.port).x"
                :y1="getPortPos(connectingFrom.nodeId, connectingFrom.port).y"
                :x2="tempLineEnd.x"
                :y2="tempLineEnd.y"
                stroke="#409eff"
                stroke-width="2"
                stroke-dasharray="6,3"
              />
            </svg>

            <!-- Start 节点 -->
            <div
              class="flow-node start-node"
              :style="{ left: startNode.x + 'px', top: startNode.y + 'px' }"
              @click.stop="selectStartNode"
            >
              <div class="node-content">
                <el-icon :size="18"><VideoPlay /></el-icon>
                <span class="node-label">开始</span>
                <el-icon :size="14" class="node-more"><MoreFilled /></el-icon>
              </div>
              <div
                class="node-port node-port-bottom"
                :class="{ 'port-active': connectingFrom && connectingFrom.nodeId === 'start' }"
                @click.stop="startConnection('start', 'bottom')"
                title="拖出连接线"
              ></div>
            </div>

            <!-- End 节点 -->
            <div
              class="flow-node end-node"
              :style="{ left: endNode.x + 'px', top: endNode.y + 'px' }"
              @click.stop="selectEndNode"
            >
              <div class="node-content">
                <el-icon :size="18"><Flag /></el-icon>
                <span class="node-label">结束</span>
                <el-icon :size="14" class="node-more"><MoreFilled /></el-icon>
              </div>
              <div
                class="node-port node-port-top"
                :class="{ 'port-active': connectingFrom && connectingFrom.nodeId !== 'end' }"
                @click.stop="completeConnection('end', 'top')"
                title="连接到此处"
              ></div>
            </div>

            <!-- 动态节点 -->
            <div
              v-for="node in workflow.nodes"
              :key="node.id"
              :class="['flow-node', 'custom-node', { selected: selectedNodeId === node.id }]"
              :style="{ left: node.x + 'px', top: node.y + 'px' }"
              @click.stop="selectNode(node.id)"
              draggable="true"
              @dragstart.stop="onCanvasNodeDragStart($event, node)"
              @dragend="onCanvasNodeDragEnd($event, node)"
            >
              <div class="node-content">
                <el-icon :size="18"><component :is="node.icon" /></el-icon>
                <span class="node-label">{{ node.name }}</span>
                <el-button text size="small" class="node-del-btn" @click.stop="removeNode(node.id)">
                  <el-icon :size="14"><Close /></el-icon>
                </el-button>
              </div>
              <div
                class="node-port node-port-top"
                :class="{ 'port-active': connectingFrom && connectingFrom.nodeId !== node.id }"
                @click.stop="completeConnection(node.id, 'top')"
                title="连接到此处"
              ></div>
              <div
                class="node-port node-port-bottom"
                :class="{ 'port-active': connectingFrom && connectingFrom.nodeId === node.id }"
                @click.stop="startConnection(node.id, 'bottom')"
                title="拖出连接线"
              ></div>
            </div>

            <!-- 空画布提示 -->
            <div v-if="workflow.nodes.length === 0" class="canvas-hint">
              <p>从左侧节点库中拖入节点到画布中</p>
            </div>
          </div>
        </div>

        <!-- 节点配置侧边栏 -->
        <div v-if="selectedNodeConfig" class="node-config-panel">
          <div class="ncp-header">
            <span class="ncp-title">
              <el-icon :size="16"><Setting /></el-icon>
              {{ selectedNodeConfig.title }}
            </span>
            <el-button text size="small" @click="deselectNode">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="ncp-body">
            <!-- 通用字段 -->
            <div class="ncp-field">
              <label class="ncp-label">节点名称</label>
              <el-input v-model="selectedNodeConfig.data.name" size="small" />
            </div>
            <div class="ncp-field">
              <label class="ncp-label">描述</label>
              <el-input v-model="selectedNodeConfig.data.description" type="textarea" :rows="2" size="small" placeholder="节点描述（可选）" />
            </div>

            <el-divider />

            <!-- 大模型（百炼真实字段） -->
            <template v-if="selectedNodeConfig.type === 'llm'">
              <div class="ncp-field">
                <label class="ncp-label">模式</label>
                <el-select v-model="selectedNodeConfig.data.mode" size="small" style="width:100%">
                  <el-option label="单次处理模式" value="single" />
                  <el-option label="批次处理模式" value="batch" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">模型选择</label>
                <el-select v-model="selectedNodeConfig.data.model" size="small" style="width:100%">
                  <el-option label="千问-Max" value="qwen-max" />
                  <el-option label="千问-Plus" value="qwen-plus" />
                  <el-option label="千问-Turbo" value="qwen-turbo" />
                  <el-option label="千问-VL-Max" value="qwen-vl-max" />
                  <el-option label="DeepSeek-R1" value="deepseek-r1" />
                  <el-option label="QVQ-Max" value="qvq-max" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">温度系数</label>
                <div class="ncp-slider-row">
                  <el-slider v-model="selectedNodeConfig.data.temperature" :min="0" :max="2" :step="0.1" size="small" style="flex:1" />
                  <span class="ncp-slider-val">{{ selectedNodeConfig.data.temperature.toFixed(1) }}</span>
                </div>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">最长回复长度</label>
                <el-input-number v-model="selectedNodeConfig.data.maxTokens" size="small" :min="1" :max="128000" :step="256" style="width:100%" />
              </div>
              <div class="ncp-field" v-if="['deepseek-r1','qvq-max'].includes(selectedNodeConfig.data.model)">
                <label class="ncp-label">思考模式</label>
                <el-switch v-model="selectedNodeConfig.data.thinking" size="small" />
              </div>
              <div class="ncp-field" v-if="['qwen-vl-max','qwen-vl-plus'].includes(selectedNodeConfig.data.model)">
                <label class="ncp-label">图片输入</label>
                <el-input v-model="selectedNodeConfig.data.vlImageUrl" size="small" placeholder="${sys.imageList} 或图片URL" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">系统提示词</label>
                <el-input v-model="selectedNodeConfig.data.systemPrompt" type="textarea" :rows="4" size="small" placeholder="定义角色身份、行为准则、输出风格和能力边界，最大6000字符&#10;输入 / 引用变量" class="ncp-code-input" />
                <span class="ncp-char-count">{{ (selectedNodeConfig.data.systemPrompt || '').length }}/6000</span>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">用户提示词</label>
                <el-input v-model="selectedNodeConfig.data.userPrompt" type="textarea" :rows="3" size="small" placeholder="配置用户指令，通过 / 或 ${变量名} 引用变量&#10;如 ${sys.query}" class="ncp-code-input" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输入变量（引用上游节点输出）</label>
                <div v-for="(v, vi) in selectedNodeConfig.data.inputVars" :key="vi" class="ncp-var-row">
                  <el-input v-model="v.name" size="small" placeholder="变量名" style="width:100px" />
                  <el-input v-model="v.ref" size="small" placeholder="如 ${Start_xxx.title}" style="flex:1" />
                  <el-button text size="small" @click="selectedNodeConfig.data.inputVars.splice(vi,1)"><el-icon><Close /></el-icon></el-button>
                </div>
                <el-button text size="small" type="primary" @click="selectedNodeConfig.data.inputVars.push({name:'',ref:''})">
                  + 添加输入变量
                </el-button>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输出变量</label>
                <el-tag size="small" type="info" style="margin-right:4px">result</el-tag>
                <el-tag size="small" type="info" v-if="['deepseek-r1','qvq-max'].includes(selectedNodeConfig.data.model)">reasoningContent</el-tag>
                <p class="ncp-hint">后续节点通过 ${节点别名.result} 引用</p>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">记忆</label>
                <el-select v-model="selectedNodeConfig.data.memoryType" size="small" style="width:100%">
                  <el-option label="本节点缓存" value="local" />
                  <el-option label="自定义缓存" value="custom" />
                </el-select>
              </div>
              <div class="ncp-field" v-if="selectedNodeConfig.data.memoryType === 'local'">
                <label class="ncp-label">记忆轮次</label>
                <el-input-number v-model="selectedNodeConfig.data.memoryRounds" size="small" :min="0" :max="30" style="width:100%" />
              </div>
              <div class="ncp-field" v-if="selectedNodeConfig.data.memoryType === 'custom'">
                <label class="ncp-label">上下文变量</label>
                <el-input v-model="selectedNodeConfig.data.memoryVar" size="small" placeholder="${会话变量名}" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">异常处理</label>
                <div class="ncp-row">
                  <span class="ncp-mini-label">重试次数</span>
                  <el-input-number v-model="selectedNodeConfig.data.retryCount" size="small" :min="0" :max="10" style="width:80px" />
                  <span class="ncp-mini-label" style="margin-left:12px">重试间隔(ms)</span>
                  <el-input-number v-model="selectedNodeConfig.data.retryInterval" size="small" :min="100" :max="60000" :step="500" style="width:100px" />
                </div>
              </div>
            </template>

            <!-- 多模态生成 -->
            <template v-if="selectedNodeConfig.type === 'multimodal'">
              <div class="ncp-field">
                <label class="ncp-label">模态类型</label>
                <el-select v-model="selectedNodeConfig.data.modality" size="small" style="width:100%">
                  <el-option label="文本生成图像" value="text2img" />
                  <el-option label="文本生成视频" value="text2video" />
                  <el-option label="文本生成音频" value="text2audio" />
                  <el-option label="图像理解" value="img2text" />
                  <el-option label="视频理解" value="video2text" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">模型</label>
                <el-select v-model="selectedNodeConfig.data.model" size="small" style="width:100%">
                  <el-option label="DALL-E 3" value="dalle3" />
                  <el-option label="Stable Diffusion XL" value="sdxl" />
                  <el-option label="Sora" value="sora" />
                  <el-option label="Claude Vision" value="claude-vision" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">提示词</label>
                <el-input v-model="selectedNodeConfig.data.prompt" type="textarea" :rows="3" size="small" />
              </div>
            </template>

            <!-- 知识库（百炼真实字段） -->
            <template v-if="selectedNodeConfig.type === 'knowledge'">
              <div class="ncp-field">
                <label class="ncp-label">知识库</label>
                <el-select v-model="selectedNodeConfig.data.kbId" size="small" style="width:100%">
                  <el-option label="产品文档库" value="kb-prod" />
                  <el-option label="技术手册库" value="kb-tech" />
                  <el-option label="FAQ库" value="kb-faq" />
                  <el-option label="工单知识库" value="kb-ticket" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">内容输入</label>
                <el-input v-model="selectedNodeConfig.data.kbContent" size="small" placeholder="引用变量，如 ${sys.query}" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">图片列表（可选）</label>
                <el-input v-model="selectedNodeConfig.data.kbImageList" size="small" placeholder="如 ${sys.imageList}" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">检索策略</label>
                <el-select v-model="selectedNodeConfig.data.kbStrategy" size="small" style="width:100%">
                  <el-option label="语义检索" value="embeddings" />
                  <el-option label="关键字检索" value="bm25" />
                  <el-option label="混合检索" value="hybrid" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">检索 Top-K</label>
                <el-input-number v-model="selectedNodeConfig.data.topK" size="small" :min="1" :max="50" style="width:100%" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">相似度阈值</label>
                <div class="ncp-slider-row">
                  <el-slider v-model="selectedNodeConfig.data.scoreThreshold" :min="0" :max="1" :step="0.05" size="small" style="flex:1" />
                  <span class="ncp-slider-val">{{ selectedNodeConfig.data.scoreThreshold }}</span>
                </div>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">FAQ 直出阈值</label>
                <div class="ncp-slider-row">
                  <el-slider v-model="selectedNodeConfig.data.faqThreshold" :min="0" :max="1" :step="0.05" size="small" style="flex:1" />
                  <span class="ncp-slider-val">{{ selectedNodeConfig.data.faqThreshold }}</span>
                </div>
                <p class="ncp-hint">当FAQ匹配得分高于此阈值时，直接返回FAQ答案，不经过大模型</p>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输出变量</label>
                <div style="display:flex;flex-direction:column;gap:3px;margin-top:4px">
                  <el-tag size="small" type="info">chunkId</el-tag>
                  <el-tag size="small" type="info">chunk</el-tag>
                  <el-tag size="small" type="info">score</el-tag>
                  <el-tag size="small" type="info">title</el-tag>
                  <el-tag size="small" type="info">url</el-tag>
                </div>
                <p class="ncp-hint">后续节点通过 ${节点别名.chunkList[x].chunk} 引用</p>
              </div>
            </template>

            <!-- API（百炼真实字段） -->
            <template v-if="selectedNodeConfig.type === 'api'">
              <div class="ncp-field">
                <label class="ncp-label">请求方式</label>
                <el-select v-model="selectedNodeConfig.data.method" size="small" style="width:100%">
                  <el-option label="GET" value="GET" />
                  <el-option label="POST" value="POST" />
                  <el-option label="PUT" value="PUT" />
                  <el-option label="DELETE" value="DELETE" />
                  <el-option label="PATCH" value="PATCH" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">URL</label>
                <el-input v-model="selectedNodeConfig.data.url" size="small" placeholder="https://api.example.com/endpoint，支持 ${变量名}" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">Headers</label>
                <el-input v-model="selectedNodeConfig.data.headers" type="textarea" :rows="3" size="small" placeholder='{"Content-Type":"application/json","Authorization":"Bearer ${api_key}"}' class="ncp-code-input" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">Body 类型</label>
                <el-select v-model="selectedNodeConfig.data.bodyType" size="small" style="width:100%">
                  <el-option label="无" value="none" />
                  <el-option label="form-data" value="form-data" />
                  <el-option label="x-www-form-urlencoded" value="x-www-form-urlencoded" />
                  <el-option label="raw JSON" value="raw" />
                </el-select>
              </div>
              <div class="ncp-field" v-if="selectedNodeConfig.data.bodyType && selectedNodeConfig.data.bodyType !== 'none'">
                <label class="ncp-label">请求体 (Body)</label>
                <el-input v-model="selectedNodeConfig.data.body" type="textarea" :rows="4" size="small" placeholder='{"key":"${变量名}"}' class="ncp-code-input" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输出变量名</label>
                <el-input v-model="selectedNodeConfig.data.outputVar" size="small" placeholder="如 api_result（引用方式：${api_result}）" />
              </div>
            </template>

            <!-- MCP（百炼真实字段） -->
            <template v-if="selectedNodeConfig.type === 'mcp'">
              <div class="ncp-field">
                <label class="ncp-label">MCP Server</label>
                <el-select v-model="selectedNodeConfig.data.serverUrl" size="small" style="width:100%">
                  <el-option label="GitHub MCP Server" value="https://mcp.github.com" />
                  <el-option label="Slack MCP Server" value="https://mcp.slack.com" />
                  <el-option label="Notion MCP Server" value="https://mcp.notion.com" />
                  <el-option label="自定义..." value="custom" />
                </el-select>
              </div>
              <div class="ncp-field" v-if="selectedNodeConfig.data.serverUrl === 'custom'">
                <label class="ncp-label">自定义 URL</label>
                <el-input v-model="selectedNodeConfig.data.customServerUrl" size="small" placeholder="https://your-mcp-server.example.com" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">工具</label>
                <el-select v-model="selectedNodeConfig.data.toolName" size="small" style="width:100%" filterable allow-create>
                  <el-option label="create_issue" value="create_issue" />
                  <el-option label="search_repo" value="search_repo" />
                  <el-option label="list_files" value="list_files" />
                  <el-option label="send_message" value="send_message" />
                  <el-option label="query_database" value="query_database" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">参数 (JSON)</label>
                <el-input v-model="selectedNodeConfig.data.arguments" type="textarea" :rows="4" size="small" placeholder='{"param1":"${变量引用}","param2":"value"}' class="ncp-code-input" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输出变量名</label>
                <el-input v-model="selectedNodeConfig.data.outputVar" size="small" placeholder="如 mcp_result" />
              </div>
            </template>

            <!-- 数据连接器 -->
            <template v-if="selectedNodeConfig.type === 'connector'">
              <div class="ncp-field">
                <label class="ncp-label">连接类型</label>
                <el-select v-model="selectedNodeConfig.data.connType" size="small" style="width:100%">
                  <el-option label="MySQL" value="mysql" />
                  <el-option label="PostgreSQL" value="postgres" />
                  <el-option label="MongoDB" value="mongodb" />
                  <el-option label="Redis" value="redis" />
                  <el-option label="Elasticsearch" value="elasticsearch" />
                  <el-option label="REST API" value="rest" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">连接配置 (JSON)</label>
                <el-input v-model="selectedNodeConfig.data.connConfig" type="textarea" :rows="4" size="small" placeholder='{"host":"localhost","port":3306,"database":"mydb"}' />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">查询语句 / 操作</label>
                <el-input v-model="selectedNodeConfig.data.query" type="textarea" :rows="3" size="small" placeholder="SELECT * FROM table WHERE ..." />
              </div>
            </template>

            <!-- 插件 -->
            <template v-if="selectedNodeConfig.type === 'plugin'">
              <div class="ncp-field">
                <label class="ncp-label">插件 ID</label>
                <el-input v-model="selectedNodeConfig.data.pluginId" size="small" placeholder="输入插件 ID 或名称" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">插件配置 (JSON)</label>
                <el-input v-model="selectedNodeConfig.data.pluginConfig" type="textarea" :rows="4" size="small" />
              </div>
            </template>

            <!-- 应用组件 -->
            <template v-if="selectedNodeConfig.type === 'component'">
              <div class="ncp-field">
                <label class="ncp-label">组件类型</label>
                <el-select v-model="selectedNodeConfig.data.compType" size="small" style="width:100%">
                  <el-option label="卡片组件" value="card" />
                  <el-option label="表单组件" value="form" />
                  <el-option label="表格组件" value="table" />
                  <el-option label="图表组件" value="chart" />
                  <el-option label="地图组件" value="map" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">组件配置 (JSON)</label>
                <el-input v-model="selectedNodeConfig.data.compConfig" type="textarea" :rows="4" size="small" />
              </div>
            </template>

            <!-- 流程输出（百炼真实字段） -->
            <template v-if="selectedNodeConfig.type === 'output'">
              <div class="ncp-field">
                <label class="ncp-label">输出格式</label>
                <el-select v-model="selectedNodeConfig.data.format" size="small" style="width:100%">
                  <el-option label="JSON" value="json" />
                  <el-option label="纯文本" value="text" />
                  <el-option label="Markdown" value="markdown" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输出变量</label>
                <div v-for="(ov, ovi) in selectedNodeConfig.data.outputVars" :key="ovi" class="ncp-var-row">
                  <el-input v-model="ov.name" size="small" placeholder="变量名" style="width:100px" />
                  <el-input v-model="ov.ref" size="small" placeholder="如 ${前置节点.result}" style="flex:1" />
                  <el-button text size="small" @click="selectedNodeConfig.data.outputVars.splice(ovi,1)"><el-icon><Close /></el-icon></el-button>
                </div>
                <el-button text size="small" type="primary" @click="selectedNodeConfig.data.outputVars.push({name:'',ref:''})">
                  + 添加输出变量
                </el-button>
                <p class="ncp-hint">定义最终输出的字段名及其引用的上游变量</p>
              </div>
            </template>

            <!-- 记忆库 -->
            <template v-if="selectedNodeConfig.type === 'memory'">
              <div class="ncp-field">
                <label class="ncp-label">记忆类型</label>
                <el-select v-model="selectedNodeConfig.data.memType" size="small" style="width:100%">
                  <el-option label="对话历史" value="conversation" />
                  <el-option label="用户偏好" value="preference" />
                  <el-option label="关键事实" value="fact" />
                  <el-option label="向量记忆" value="vector" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">最大记忆条目</label>
                <el-input-number v-model="selectedNodeConfig.data.maxItems" size="small" :min="10" :max="10000" :step="100" style="width:100%" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">存储 Key</label>
                <el-input v-model="selectedNodeConfig.data.storeKey" size="small" placeholder="如 user_${user_id}_memory" />
              </div>
            </template>

            <!-- 脚本（百炼真实字段） -->
            <template v-if="selectedNodeConfig.type === 'script'">
              <div class="ncp-field">
                <label class="ncp-label">脚本语言</label>
                <el-select v-model="selectedNodeConfig.data.scriptLang" size="small" style="width:100%">
                  <el-option label="Python" value="python" />
                  <el-option label="JavaScript" value="javascript" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输入参数</label>
                <div v-for="(param, pi) in selectedNodeConfig.data.scriptParams" :key="pi" class="ncp-var-row">
                  <el-input v-model="param.name" size="small" placeholder="参数名" style="width:100px" />
                  <el-input v-model="param.ref" size="small" placeholder="如 ${前置节点.output}" style="flex:1" />
                  <el-button text size="small" @click="selectedNodeConfig.data.scriptParams.splice(pi,1)"><el-icon><Close /></el-icon></el-button>
                </div>
                <el-button text size="small" type="primary" @click="selectedNodeConfig.data.scriptParams.push({name:'',ref:''})">
                  + 添加参数
                </el-button>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">脚本代码</label>
                <el-input v-model="selectedNodeConfig.data.scriptCode" type="textarea" :rows="6" size="small" placeholder="def main(args):&#10;    # 处理逻辑&#10;    return {'result': 'ok'}" class="ncp-code-input" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输出变量名</label>
                <el-input v-model="selectedNodeConfig.data.scriptOutput" size="small" placeholder="如 script_result（引用方式：${节点别名.script_result}）" />
              </div>
            </template>

            <!-- 条件判断（百炼真实字段） -->
            <template v-if="selectedNodeConfig.type === 'condition'">
              <div class="ncp-field">
                <label class="ncp-label">逻辑组合</label>
                <el-select v-model="selectedNodeConfig.data.condLogic" size="small" style="width:100%">
                  <el-option label="所有条件满足 (AND)" value="and" />
                  <el-option label="任一条件满足 (OR)" value="or" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">判断条件</label>
                <div v-for="(item, ci) in selectedNodeConfig.data.conditions" :key="ci" class="ncp-cond-item">
                  <div class="ncp-cond-row">
                    <span class="ncp-cond-idx">{{ ci + 1 }}</span>
                    <el-select v-model="item.var" size="small" style="width:100%" placeholder="引用变量">
                      <el-option label="${sys.query}" value="${sys.query}" />
                      <el-option label="${Start_xxx.result}" value="${Start_xxx.result}" />
                    </el-select>
                  </div>
                  <div class="ncp-cond-row">
                    <el-select v-model="item.op" size="small" style="width:100%">
                      <el-option label="等于 ==" value="eq" />
                      <el-option label="不等于 !=" value="neq" />
                      <el-option label="大于 >" value="gt" />
                      <el-option label="小于 <" value="lt" />
                      <el-option label="大于等于 >=" value="gte" />
                      <el-option label="小于等于 <=" value="lte" />
                      <el-option label="包含" value="contains" />
                      <el-option label="不包含" value="notContains" />
                      <el-option label="为空" value="empty" />
                      <el-option label="非空" value="notEmpty" />
                    </el-select>
                  </div>
                  <div class="ncp-cond-row" v-if="!['empty','notEmpty'].includes(item.op)">
                    <el-input v-model="item.val" size="small" placeholder="比较值" />
                  </div>
                  <el-button text size="small" type="danger" @click="selectedNodeConfig.data.conditions.splice(ci,1)" class="ncp-cond-del">
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
                <el-button text size="small" type="primary" @click="selectedNodeConfig.data.conditions.push({var:'',op:'eq',val:''})">
                  + 添加条件
                </el-button>
              </div>
              <div v-for="(branch, bi) in selectedNodeConfig.data.branches" :key="bi" class="ncp-field">
                <label class="ncp-label">{{ bi === 0 ? '满足条件的分支' : `分支 ${bi + 1}` }}</label>
                <el-input v-model="branch.name" size="small" :placeholder="bi === 0 ? '如 是/成功' : '如 否/失败'" />
              </div>
            </template>

            <!-- 意图分类（百炼真实字段） -->
            <template v-if="selectedNodeConfig.type === 'intent'">
              <div class="ncp-field">
                <label class="ncp-label">输入变量</label>
                <el-input v-model="selectedNodeConfig.data.intentInput" size="small" placeholder="如 ${sys.query}" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">分类列表（一行一个）</label>
                <el-input v-model="selectedNodeConfig.data.intentCategories" type="textarea" :rows="5" size="small" placeholder="售后咨询&#10;产品购买&#10;技术支持&#10;投诉建议" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输出变量名</label>
                <el-input v-model="selectedNodeConfig.data.intentOutput" size="small" placeholder="如 intent_result（引用方式：${节点别名.intent_result}）" />
              </div>
            </template>

            <!-- 循环（百炼真实字段） -->
            <template v-if="selectedNodeConfig.type === 'loop'">
              <div class="ncp-field">
                <label class="ncp-label">循环类型</label>
                <el-select v-model="selectedNodeConfig.data.loopType" size="small" style="width:100%">
                  <el-option label="固定次数" value="count" />
                  <el-option label="条件循环" value="condition" />
                  <el-option label="遍历数组" value="iterate" />
                </el-select>
              </div>
              <div class="ncp-field" v-if="selectedNodeConfig.data.loopType === 'count'">
                <label class="ncp-label">循环次数</label>
                <el-input-number v-model="selectedNodeConfig.data.loopCount" size="small" :min="1" :max="1000" style="width:100%" />
              </div>
              <div class="ncp-field" v-if="selectedNodeConfig.data.loopType === 'iterate'">
                <label class="ncp-label">数据源（数组变量）</label>
                <el-input v-model="selectedNodeConfig.data.loopArray" size="small" placeholder="如 ${前置节点.result.list}" />
              </div>
              <div class="ncp-field" v-if="selectedNodeConfig.data.loopType === 'iterate'">
                <label class="ncp-label">中间变量名</label>
                <el-input v-model="selectedNodeConfig.data.loopItemVar" size="small" placeholder="如 item，循环体内通过 ${item.xxx} 引用" />
              </div>
              <div class="ncp-field" v-if="selectedNodeConfig.data.loopType === 'condition'">
                <label class="ncp-label">终止条件</label>
                <el-input v-model="selectedNodeConfig.data.loopCondition" size="small" placeholder="如 ${loop_count} > 10" />
              </div>
              <div class="ncp-field" v-if="selectedNodeConfig.data.loopType !== 'condition'">
                <label class="ncp-label">终止条件（可选）</label>
                <el-input v-model="selectedNodeConfig.data.loopCondition" size="small" placeholder="如 ${item.status} != 'done'，满足时提前结束循环" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输出变量名</label>
                <el-input v-model="selectedNodeConfig.data.loopOutput" size="small" placeholder="如 loop_result（引用方式：${节点别名.loop_result}）" />
              </div>
            </template>

            <!-- 批处理（百炼真实字段） -->
            <template v-if="selectedNodeConfig.type === 'batch'">
              <div class="ncp-field">
                <label class="ncp-label">数据源（数组变量）</label>
                <el-input v-model="selectedNodeConfig.data.batchSource" size="small" placeholder="如 ${前置节点.result.list}" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">中间变量名</label>
                <el-input v-model="selectedNodeConfig.data.batchItemVar" size="small" placeholder="如 batch_item，子流程中通过 ${batch_item.xxx} 引用" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">批处理大小</label>
                <el-input-number v-model="selectedNodeConfig.data.batchSize" size="small" :min="1" :max="100" style="width:100%" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输出变量名</label>
                <el-input v-model="selectedNodeConfig.data.batchOutput" size="small" placeholder="如 batch_result" />
              </div>
            </template>

            <!-- 变量处理（百炼真实字段） -->
            <template v-if="selectedNodeConfig.type === 'varProcess'">
              <div class="ncp-field">
                <label class="ncp-label">输入变量</label>
                <el-input v-model="selectedNodeConfig.data.varInput" size="small" placeholder="如 ${前置节点.result}" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">操作类型</label>
                <el-select v-model="selectedNodeConfig.data.varOperation" size="small" style="width:100%">
                  <el-option label="JSON 解析" value="jsonParse" />
                  <el-option label="字符串截取" value="substring" />
                  <el-option label="正则提取" value="regex" />
                  <el-option label="类型转换" value="typeCast" />
                  <el-option label="模板渲染" value="template" />
                  <el-option label="列表聚合" value="aggregate" />
                  <el-option label="列表过滤" value="filter" />
                  <el-option label="列表排序" value="sort" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">操作参数</label>
                <el-input v-model="selectedNodeConfig.data.varParam" size="small" placeholder="JSONPath、正则表达式或模板" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输出变量名</label>
                <el-input v-model="selectedNodeConfig.data.varOutput" size="small" placeholder="如 processed_data" />
              </div>
            </template>

            <!-- 变量赋值（百炼真实字段） -->
            <template v-if="selectedNodeConfig.type === 'varAssign'">
              <div class="ncp-field">
                <label class="ncp-label">变量名</label>
                <el-input v-model="selectedNodeConfig.data.assignVarName" size="small" placeholder="如 my_variable" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">变量值</label>
                <el-input v-model="selectedNodeConfig.data.assignValue" type="textarea" :rows="3" size="small" placeholder="支持引用 ${前置节点.result}，或输入固定值" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输出变量名（可选）</label>
                <el-input v-model="selectedNodeConfig.data.assignOutput" size="small" placeholder="如 my_var（引用方式：${节点别名.my_var}）" />
              </div>
            </template>

            <!-- 参数提取 -->
            <template v-if="selectedNodeConfig.type === 'paramExtract'">
              <div class="ncp-field">
                <label class="ncp-label">输入文本变量</label>
                <el-input v-model="selectedNodeConfig.data.peInput" size="small" placeholder="如 ${llm_output}" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">提取方式</label>
                <el-select v-model="selectedNodeConfig.data.peMethod" size="small" style="width:100%">
                  <el-option label="正则表达式" value="regex" />
                  <el-option label="JSON Path" value="jsonpath" />
                  <el-option label="LLM 提取" value="llm" />
                  <el-option label="关键字匹配" value="keyword" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">提取规则</label>
                <el-input v-model="selectedNodeConfig.data.peRule" type="textarea" :rows="3" size="small" placeholder="正则表达式、JSON Path 或提取指令" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输出变量名</label>
                <el-input v-model="selectedNodeConfig.data.peOutputVar" size="small" placeholder="如 extracted_param（引用方式：${节点别名.extracted_param}）" />
              </div>
            </template>

            <!-- 文档解析 -->
            <template v-if="selectedNodeConfig.type === 'docParse'">
              <div class="ncp-field">
                <label class="ncp-label">文件输入</label>
                <el-input v-model="selectedNodeConfig.data.docInput" size="small" placeholder="文件 URL 或变量 ${file_url}" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">文档格式</label>
                <el-select v-model="selectedNodeConfig.data.docFormat" size="small" style="width:100%">
                  <el-option label="PDF" value="pdf" />
                  <el-option label="Word (docx)" value="docx" />
                  <el-option label="Excel (xlsx)" value="xlsx" />
                  <el-option label="PPT (pptx)" value="pptx" />
                  <el-option label="Markdown" value="md" />
                  <el-option label="TXT" value="txt" />
                </el-select>
              </div>
            </template>

            <!-- 图片解析 -->
            <template v-if="selectedNodeConfig.type === 'imgParse'">
              <div class="ncp-field">
                <label class="ncp-label">图片输入</label>
                <el-input v-model="selectedNodeConfig.data.imgInput" size="small" placeholder="图片 URL 或 Base64 变量" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">解析模式</label>
                <el-select v-model="selectedNodeConfig.data.imgMode" size="small" style="width:100%">
                  <el-option label="OCR 文字识别" value="ocr" />
                  <el-option label="视觉理解" value="vision" />
                  <el-option label="物体检测" value="detection" />
                  <el-option label="场景分类" value="scene" />
                </el-select>
              </div>
            </template>

            <!-- 视频解析 -->
            <template v-if="selectedNodeConfig.type === 'videoParse'">
              <div class="ncp-field">
                <label class="ncp-label">视频输入</label>
                <el-input v-model="selectedNodeConfig.data.videoInput" size="small" placeholder="视频 URL 或文件路径" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">解析模式</label>
                <el-select v-model="selectedNodeConfig.data.videoMode" size="small" style="width:100%">
                  <el-option label="关键帧提取" value="keyframe" />
                  <el-option label="视频理解" value="understanding" />
                  <el-option label="语音转文字" value="asr" />
                  <el-option label="动作识别" value="action" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">采样间隔（秒）</label>
                <el-input-number v-model="selectedNodeConfig.data.videoInterval" size="small" :min="1" :max="60" style="width:100%" />
              </div>
            </template>

            <!-- 音频解析 -->
            <template v-if="selectedNodeConfig.type === 'audioParse'">
              <div class="ncp-field">
                <label class="ncp-label">音频输入</label>
                <el-input v-model="selectedNodeConfig.data.audioInput" size="small" placeholder="音频 URL 或文件路径" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">解析模式</label>
                <el-select v-model="selectedNodeConfig.data.audioMode" size="small" style="width:100%">
                  <el-option label="语音转文字 (ASR)" value="asr" />
                  <el-option label="情感分析" value="emotion" />
                  <el-option label="声纹识别" value="voiceprint" />
                  <el-option label="音频分类" value="classify" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">语言</label>
                <el-select v-model="selectedNodeConfig.data.audioLang" size="small" style="width:100%">
                  <el-option label="中文" value="zh" />
                  <el-option label="英文" value="en" />
                  <el-option label="自动检测" value="auto" />
                </el-select>
              </div>
            </template>

            <!-- 智能体创建 -->
            <template v-if="selectedNodeConfig.type === 'agentCreate'">
              <div class="ncp-field">
                <label class="ncp-label">子智能体名称</label>
                <el-input v-model="selectedNodeConfig.data.subAgentName" size="small" placeholder="输入子智能体名称" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">模型</label>
                <el-select v-model="selectedNodeConfig.data.subAgentModel" size="small" style="width:100%">
                  <el-option label="GPT-4o" value="gpt-4o" />
                  <el-option label="Claude 4 Sonnet" value="claude-4-sonnet" />
                  <el-option label="Qwen-Max" value="qwen-max" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">System Prompt</label>
                <el-input v-model="selectedNodeConfig.data.subAgentPrompt" type="textarea" :rows="3" size="small" />
              </div>
            </template>

            <!-- 智能体群组 -->
            <template v-if="selectedNodeConfig.type === 'agentGroup'">
              <div class="ncp-field">
                <label class="ncp-label">群组名称</label>
                <el-input v-model="selectedNodeConfig.data.groupName" size="small" placeholder="输入群组名称" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">智能体列表（一行一个ID）</label>
                <el-input v-model="selectedNodeConfig.data.groupAgents" type="textarea" :rows="4" size="small" placeholder="agent_001&#10;agent_002" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">协作模式</label>
                <el-select v-model="selectedNodeConfig.data.groupMode" size="small" style="width:100%">
                  <el-option label="顺序执行" value="sequential" />
                  <el-option label="并行执行" value="parallel" />
                  <el-option label="投票表决" value="voting" />
                  <el-option label="辩论模式" value="debate" />
                </el-select>
              </div>
            </template>

            <!-- 函数计算 -->
            <template v-if="selectedNodeConfig.type === 'fc'">
              <div class="ncp-field">
                <label class="ncp-label">函数名称</label>
                <el-input v-model="selectedNodeConfig.data.fcName" size="small" placeholder="如 my-function" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">地域</label>
                <el-select v-model="selectedNodeConfig.data.fcRegion" size="small" style="width:100%">
                  <el-option label="华东1（杭州）" value="cn-hangzhou" />
                  <el-option label="华东2（上海）" value="cn-shanghai" />
                  <el-option label="华北2（北京）" value="cn-beijing" />
                  <el-option label="华南1（深圳）" value="cn-shenzhen" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">调用参数 (JSON)</label>
                <el-input v-model="selectedNodeConfig.data.fcPayload" type="textarea" :rows="3" size="small" placeholder='{"key":"value"}' />
              </div>
            </template>

            <!-- AppFlow -->
            <template v-if="selectedNodeConfig.type === 'appflow'">
              <div class="ncp-field">
                <label class="ncp-label">Flow ID</label>
                <el-input v-model="selectedNodeConfig.data.flowId" size="small" placeholder="输入 AppFlow ID" />
              </div>
              <div class="ncp-field">
                <label class="ncp-label">触发方式</label>
                <el-select v-model="selectedNodeConfig.data.flowTrigger" size="small" style="width:100%">
                  <el-option label="手动触发" value="manual" />
                  <el-option label="事件触发" value="event" />
                  <el-option label="定时触发" value="schedule" />
                </el-select>
              </div>
              <div class="ncp-field">
                <label class="ncp-label">输入参数 (JSON)</label>
                <el-input v-model="selectedNodeConfig.data.flowInput" type="textarea" :rows="3" size="small" />
              </div>
            </template>

            <!-- 连接提示 -->
            <div class="ncp-connect-hint" v-if="selectedNodeConfig.nodeId !== 'start' && selectedNodeConfig.nodeId !== 'end'">
              <el-icon><Connection /></el-icon>
              <span>点击节点端口可创建/断开连接线</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 发布渠道 Tab -->
      <div v-else class="channel-layout">
        <div class="channel-alert" v-if="showChannelAlert">
          基于已创建的应用 API 您还可以进行"发布到平台"或"集成其他能力继续开发"的操作！
          <el-button text size="small" class="alert-close" @click="showChannelAlert = false"><el-icon><Close /></el-icon></el-button>
        </div>

        <div class="channel-section">
          <div class="channel-section-header">
            <h3>调用方式</h3>
            <p>适用于通过 API/SDK 调用当前应用，灵活集成到业务场景中。</p>
            <div class="appid-row">
              <span>智能体ID：{{ workflow.appId }}</span>
              <el-button text size="small" @click="copyAppId">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="channel-cards">
            <div class="channel-card">
              <div class="cc-icon api-icon">
                <el-icon :size="28"><Connection /></el-icon>
              </div>
              <div class="cc-body">
                <div class="cc-header">
                  <span class="cc-title">API</span>
                  <span class="cc-status created">已创建</span>
                </div>
                <p class="cc-desc">以API的形式调用当前应用，需要传入智能体ID、API Key等参数值。</p>
                <div class="cc-actions">
                  <el-button size="small" @click="showApiKeyDialog = true">API KEY</el-button>
                  <el-button size="small" disabled>API 调试</el-button>
                </div>
              </div>
            </div>
            <div class="channel-card">
              <div class="cc-icon sdk-icon">
                <el-icon :size="28"><Document /></el-icon>
              </div>
              <div class="cc-body">
                <div class="cc-header">
                  <span class="cc-title">SDK</span>
                </div>
                <p class="cc-desc">使用百炼应用开发SDK进行调用，支持复杂业务开发需求。</p>
                <div class="cc-actions">
                  <el-button size="small" text type="primary" @click="handleSdkDoc">使用文档</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="channel-section">
          <div class="channel-section-header">
            <h3>发布平台</h3>
            <p>适用于多渠道打通，支持一键发布到平台，快捷创建可交互的 Agent。</p>
          </div>
          <div class="platform-cards">
            <div class="platform-card">
              <div class="pc-icon">钉</div>
              <div class="pc-body">
                <div class="pc-title">钉钉机器人</div>
                <span class="pc-auth" @click="handlePlatformAuth('钉钉')">请先授权 <el-icon><TopRight /></el-icon></span>
              </div>
              <p class="pc-desc">简单配置，即可为您的组织在钉钉平台上创建一个有大模型能力加成的AI机器人。</p>
            </div>
            <div class="platform-card">
              <div class="pc-icon wx">微</div>
              <div class="pc-body">
                <div class="pc-title">微信公众号</div>
                <span class="pc-auth" @click="handlePlatformAuth('微信')">请先授权 <el-icon><TopRight /></el-icon></span>
              </div>
              <p class="pc-desc">简单配置，即可将您的微信公众号（订阅号）接入AI机器人，全天候回应客户咨询。</p>
            </div>
          </div>
        </div>

        <div class="channel-section">
          <div class="channel-section-header">
            <h3>集成开发</h3>
            <p>适用于 Agent 继续开发，把当前 Agent 集成到其他业务流程中</p>
          </div>
          <div class="platform-cards">
            <div class="platform-card">
              <div class="pc-body">
                <div class="pc-title">组件</div>
                <span class="pc-status-none">未创建</span>
              </div>
              <p class="pc-desc">以组件的形式发布智能体/工作流应用，需要配置入参，发布后用户可以通过组件的方式在其他应用中黑盒的引用这个智能体/工作流的内容。</p>
              <el-button text size="small" type="primary" @click="ElMessage.info('组件发布功能即将上线')">说明文档</el-button>
            </div>
            <div class="platform-card">
              <div class="pc-body">
                <div class="pc-title">UI 应用</div>
                <span class="pc-status-none">未创建</span>
              </div>
              <p class="pc-desc">通过阿里云多端低代码平台魔笔将百炼智能体发布为生产级 Web/H5 应用，或嵌入已有的 Web/H5/App/小程序中。</p>
            </div>
          </div>
        </div>

        <div class="channel-section">
          <div class="channel-section-header">
            <h3>AI实时互动</h3>
          </div>
          <div class="interact-cards">
            <div class="interact-card">
              <span class="ic-title">语音互动</span>
              <p>创建超拟人化的语音通话智能体，10分钟可完成本地部署。</p>
            </div>
            <div class="interact-card">
              <span class="ic-title">视频互动</span>
              <p>创建超拟人化的视频通话智能体，AI将结合摄像头画面给出响应，10分钟可完成本地部署。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 版本管理弹窗 -->
    <el-dialog v-model="showVersionDialog" title="版本管理" width="560px">
      <div class="version-list">
        <div v-if="versionList.length === 0" class="version-empty">暂无历史版本</div>
        <div v-for="v in versionList" :key="v.id" class="version-item">
          <div class="version-info">
            <span class="version-tag">{{ v.tag }}</span>
            <span class="version-time">{{ v.time }}</span>
            <span v-if="v.current" class="version-current">当前版本</span>
          </div>
          <el-button text size="small" type="primary" @click="restoreVersion(v)">恢复</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- API Key 弹窗 -->
    <el-dialog v-model="showApiKeyDialog" title="API Key" width="500px">
      <div class="apikey-body">
        <p class="apikey-desc">使用此 API Key 调用当前工作流应用</p>
        <div class="apikey-row">
          <el-input :value="'sk-' + workflow?.appId" readonly />
          <el-button type="primary" size="small" @click="copyApiKey">复制</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 观测弹窗 -->
    <el-dialog v-model="showObserveDialog" title="运行观测" width="780px">
      <div class="observe-body">
        <div class="observe-metrics">
          <div class="observe-metric">
            <span class="observe-metric-val">{{ observeData.callCount }}</span>
            <span class="observe-metric-label">近 7 天调用次数</span>
          </div>
          <div class="observe-metric">
            <span class="observe-metric-val">{{ observeData.successRate }}%</span>
            <span class="observe-metric-label">成功率</span>
          </div>
          <div class="observe-metric">
            <span class="observe-metric-val">{{ observeData.avgLatency }}ms</span>
            <span class="observe-metric-label">平均延迟</span>
          </div>
        </div>
        <h4 class="observe-section-title">最近调用日志</h4>
        <el-table :data="observeData.logs" size="small" max-height="300">
          <el-table-column prop="time" label="时间" width="160" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <span :class="['status-tag', row.status === '成功' ? 'status-success' : 'status-fail']">
                {{ row.status }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="latency" label="耗时" width="80" />
          <el-table-column prop="input" label="输入" show-overflow-tooltip />
          <el-table-column prop="traceId" label="Trace ID" width="140" show-overflow-tooltip />
        </el-table>
      </div>
    </el-dialog>

    <!-- SDK 文档弹窗 -->
    <el-dialog v-model="showSdkDocDialog" title="SDK 使用文档" width="680px">
      <div class="sdk-doc-body">
        <h4>快速接入</h4>
        <p>通过百炼 SDK 调用当前工作流应用，支持 Java / Python / Node.js 等主流语言。</p>
        <div class="code-block">
          <pre><code># Python 示例
from bailian import WorkflowClient

client = WorkflowClient(api_key="sk-{{ workflow?.appId }}")
result = client.execute(
    workflow_id="{{ workflow?.appId }}",
    input={"message": "你好"}
)
print(result)</code></pre>
        </div>
        <el-alert type="info" :closable="false" show-icon style="margin-top: 12px;">
          <template #title>完整 SDK 文档请参考百炼开放平台 → 开发指南 → SDK 参考</template>
        </el-alert>
      </div>
    </el-dialog>

    <!-- 平台授权弹窗 -->
    <el-dialog v-model="showPlatformAuthDialog" :title="platformAuthTitle" width="520px">
      <div class="platform-auth-body">
        <p class="auth-desc">请在下方配置 {{ platformAuthName }} 的授权信息，完成后即可将工作流应用接入该平台。</p>
        <el-form label-width="100px">
          <el-form-item label="App ID">
            <el-input v-model="platformAuthForm.appId" placeholder="请输入 App ID" />
          </el-form-item>
          <el-form-item label="App Secret">
            <el-input v-model="platformAuthForm.appSecret" type="password" placeholder="请输入 App Secret" show-password />
          </el-form-item>
          <el-form-item label="回调地址">
            <el-input v-model="platformAuthForm.callbackUrl" placeholder="请输入回调地址" />
          </el-form-item>
        </el-form>
        <div class="auth-actions">
          <el-button @click="showPlatformAuthDialog = false">取消</el-button>
          <el-button type="primary" @click="handlePlatformAuthConfirm">授权并绑定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Document, VideoPlay, FolderChecked, DArrowLeft, DArrowRight,
  Search, RefreshLeft, RefreshRight, ZoomIn, ZoomOut, FullScreen,
  MoreFilled, Flag, Close, Connection, DocumentCopy, TopRight, Setting
} from '@element-plus/icons-vue'
import { agentList } from './data'

const route = useRoute()
const router = useRouter()

// ===== 工作流数据 =====
const workflow = computed(() => agentList.find(a => a.id === Number(route.params.id) && a.type === 'workflow'))

onMounted(() => {
  if (!workflow.value) {
    ElMessage.warning('工作流不存在')
    router.replace('/agent')
  }
  // 初始化 edges 数组
  if (workflow.value && !workflow.value.edges) {
    workflow.value.edges = []
  }
})

// ===== Tab 状态 =====
const activeTab = ref('canvas')
const sidebarCollapsed = ref(false)
const nodeTab = ref('library')
const nodeSearch = ref('')
const zoom = ref(1)
const selectedNodeId = ref(null)
const selectedEdgeId = ref(null)

// ===== Start/End 节点位置 =====
const startNode = reactive({ x: 80, y: 200 })
const endNode = reactive({ x: 80, y: 360 })

// ===== 节点默认配置数据 =====
const defaultNodeConfigs = {
  llm: { name: '大模型', description: '', mode: 'single', model: 'qwen-max', temperature: 0.7, maxTokens: 4096, thinking: false, vlImageUrl: '', systemPrompt: '', userPrompt: '', inputVars: [], memoryType: 'local', memoryRounds: 0, memoryVar: '', retryCount: 0, retryInterval: 1000 },
  multimodal: { name: '多模态生成', description: '', modality: 'text2img', model: 'dalle3', prompt: '' },
  knowledge: { name: '知识库', description: '', kbId: '', kbContent: '${sys.query}', kbImageList: '', kbStrategy: 'embeddings', topK: 3, scoreThreshold: 0.7, faqThreshold: 0.85 },
  api: { name: 'API', description: '', url: '', method: 'POST', headers: '', bodyType: 'raw', body: '', outputVar: '' },
  mcp: { name: 'MCP', description: '', serverUrl: '', customServerUrl: '', toolName: '', arguments: '', outputVar: '' },
  connector: { name: '数据连接器', description: '', connType: 'mysql', connConfig: '', query: '' },
  plugin: { name: '插件', description: '', pluginId: '', pluginConfig: '' },
  component: { name: '应用组件', description: '', compType: 'card', compConfig: '' },
  output: { name: '流程输出', description: '', format: 'json', outputVars: [{ name: '', ref: '' }] },
  memory: { name: '记忆库', description: '', memType: 'conversation', maxItems: 100, storeKey: '' },
  script: { name: '脚本', description: '', scriptLang: 'python', scriptParams: [], scriptCode: '', scriptOutput: '' },
  condition: { name: '条件判断', description: '', condLogic: 'and', conditions: [{ var: '', op: 'eq', val: '' }], branches: [{ name: '是' }, { name: '否' }] },
  intent: { name: '意图分类', description: '', intentInput: '', intentCategories: '', intentOutput: '' },
  loop: { name: '循环', description: '', loopType: 'count', loopCount: 10, loopCondition: '', loopArray: '', loopItemVar: 'item', loopOutput: '' },
  batch: { name: '批处理', description: '', batchSource: '', batchItemVar: 'batch_item', batchSize: 10, batchOutput: '' },
  varProcess: { name: '变量处理', description: '', varInput: '', varOperation: 'jsonParse', varParam: '', varOutput: '' },
  varAssign: { name: '变量赋值', description: '', assignVarName: '', assignValue: '', assignOutput: '' },
  paramExtract: { name: '参数提取', description: '', peInput: '', peMethod: 'regex', peRule: '', peOutputVar: '' },
  docParse: { name: '文档解析', description: '', docInput: '', docFormat: 'pdf' },
  imgParse: { name: '图片解析', description: '', imgInput: '', imgMode: 'ocr' },
  videoParse: { name: '视频解析', description: '', videoInput: '', videoMode: 'keyframe', videoInterval: 5 },
  audioParse: { name: '音频解析', description: '', audioInput: '', audioMode: 'asr', audioLang: 'zh' },
  agentCreate: { name: '智能体创建', description: '', subAgentName: '', subAgentModel: 'gpt-4o', subAgentPrompt: '' },
  agentGroup: { name: '智能体群组', description: '', groupName: '', groupAgents: '', groupMode: 'sequential' },
  fc: { name: '函数计算', description: '', fcName: '', fcRegion: 'cn-hangzhou', fcPayload: '' },
  appflow: { name: 'AppFlow', description: '', flowId: '', flowTrigger: 'manual', flowInput: '' }
}

// ===== 节点配置侧边栏 =====
const selectedNodeConfig = computed(() => {
  if (!selectedNodeId.value) return null

  if (selectedNodeId.value === 'start') {
    return {
      nodeId: 'start',
      title: '开始节点',
      type: 'start',
      data: { name: '开始', description: '工作流入口节点' }
    }
  }
  if (selectedNodeId.value === 'end') {
    return {
      nodeId: 'end',
      title: '结束节点',
      type: 'end',
      data: { name: '结束', description: '工作流出口节点' }
    }
  }

  const node = workflow.value?.nodes?.find(n => n.id === selectedNodeId.value)
  if (!node) return null

  // 初始化配置数据
  if (!node.config) {
    node.config = { ...defaultNodeConfigs[node.type] || {} }
    node.config.name = node.name
  }

  return {
    nodeId: node.id,
    title: `${node.name} - 配置`,
    type: node.type,
    data: node.config
  }
})

const selectNode = (id) => {
  selectedNodeId.value = id
  selectedEdgeId.value = null
}

const selectStartNode = () => {
  selectedNodeId.value = 'start'
  selectedEdgeId.value = null
}

const selectEndNode = () => {
  selectedNodeId.value = 'end'
  selectedEdgeId.value = null
}

const deselectNode = () => {
  selectedNodeId.value = null
  selectedEdgeId.value = null
}

const selectEdge = (id) => {
  selectedEdgeId.value = id
  selectedNodeId.value = null
}

// ===== 连接线（边）管理 =====
const connectingFrom = ref(null)
const tempLineEnd = ref(null)

const getNodeById = (id) => {
  if (id === 'start') return { x: startNode.x, y: startNode.y }
  if (id === 'end') return { x: endNode.x, y: endNode.y }
  return workflow.value?.nodes?.find(n => n.id === id)
}

const getPortPos = (nodeId, port) => {
  const node = getNodeById(nodeId)
  if (!node) return { x: 0, y: 0 }
  // node.x/y 是节点左上角，port 在中间
  const cx = node.x + 75 // approx center of 150px wide node
  const cy = port === 'bottom' ? node.y + 48 : node.y // bottom or top
  return { x: cx, y: cy }
}

const startConnection = (nodeId, port) => {
  // Can only start from bottom ports (output)
  if (port !== 'bottom') return
  connectingFrom.value = { nodeId, port }
  // Add mousemove listener
  document.addEventListener('mousemove', onCanvasMouseMove)
  ElMessage.info('请点击目标节点的上方端口完成连接，按 Esc 取消')
}

const completeConnection = (targetNodeId, targetPort) => {
  // Can only complete on top ports (input)
  if (targetPort !== 'top') return
  if (!connectingFrom.value) return
  if (connectingFrom.value.nodeId === targetNodeId) {
    ElMessage.warning('不能连接到自身')
    return
  }
  // Check if edge already exists
  const exists = workflow.value.edges.some(
    e => e.sourceNodeId === connectingFrom.value.nodeId &&
         e.sourcePort === connectingFrom.value.port &&
         e.targetNodeId === targetNodeId &&
         e.targetPort === targetPort
  )
  if (exists) {
    cancelConnecting()
    return
  }

  workflow.value.edges.push({
    id: Date.now(),
    sourceNodeId: connectingFrom.value.nodeId,
    sourcePort: connectingFrom.value.port,
    targetNodeId,
    targetPort
  })
  ElMessage.success('连接已创建')
  cancelConnecting()
}

const onCanvasMouseMove = (e) => {
  if (!connectingFrom.value) return
  const canvasArea = document.querySelector('.canvas-area')
  if (!canvasArea) return
  const rect = canvasArea.getBoundingClientRect()
  tempLineEnd.value = {
    x: e.clientX - rect.left + canvasArea.scrollLeft,
    y: e.clientY - rect.top + canvasArea.scrollTop
  }
}

const cancelConnecting = () => {
  connectingFrom.value = null
  tempLineEnd.value = null
  document.removeEventListener('mousemove', onCanvasMouseMove)
}

const removeEdge = (id) => {
  const idx = workflow.value.edges.findIndex(e => e.id === id)
  if (idx >= 0) workflow.value.edges.splice(idx, 1)
  selectedEdgeId.value = null
}

// ===== 节点库 =====
const nodeCategories = [
  {
    name: '基础',
    nodes: [
      { name: '大模型', icon: 'Cpu', type: 'llm' },
      { name: '多模态生成', icon: 'Picture', type: 'multimodal' },
      { name: '知识库', icon: 'Reading', type: 'knowledge' }
    ]
  },
  {
    name: '工具',
    nodes: [
      { name: 'API', icon: 'Connection', type: 'api' },
      { name: 'MCP', icon: 'Link', type: 'mcp' },
      { name: '数据连接器', icon: 'Coin', type: 'connector' },
      { name: '插件', icon: 'Grid', type: 'plugin' },
      { name: '应用组件', icon: 'Box', type: 'component' },
      { name: '流程输出', icon: 'Promotion', type: 'output' },
      { name: '记忆库', icon: 'Collection', type: 'memory' }
    ]
  },
  {
    name: '逻辑',
    nodes: [
      { name: '脚本', icon: 'Document', type: 'script' },
      { name: '条件判断', icon: 'Switch', type: 'condition' },
      { name: '意图分类', icon: 'Guide', type: 'intent' },
      { name: '循环', icon: 'Refresh', type: 'loop' },
      { name: '批处理', icon: 'List', type: 'batch' }
    ]
  },
  {
    name: '变量',
    nodes: [
      { name: '变量处理', icon: 'Operation', type: 'varProcess' },
      { name: '变量赋值', icon: 'Edit', type: 'varAssign' },
      { name: '参数提取', icon: 'Setting', type: 'paramExtract' }
    ]
  },
  {
    name: '数据',
    nodes: [
      { name: '文档解析', icon: 'Document', type: 'docParse' },
      { name: '图片解析', icon: 'Picture', type: 'imgParse' },
      { name: '视频解析', icon: 'VideoCamera', type: 'videoParse' },
      { name: '音频解析', icon: 'Headset', type: 'audioParse' }
    ]
  },
  {
    name: '智能体',
    nodes: [
      { name: '智能体创建', icon: 'Cpu', type: 'agentCreate' },
      { name: '智能体群组', icon: 'UserFilled', type: 'agentGroup' }
    ]
  },
  {
    name: '云资源',
    nodes: [
      { name: '函数计算', icon: 'Monitor', type: 'fc', auth: true },
      { name: 'AppFlow', icon: 'Share', type: 'appflow', auth: true }
    ]
  }
]

const filteredNodeCategories = computed(() => {
  if (!nodeSearch.value) return nodeCategories
  const kw = nodeSearch.value.toLowerCase()
  return nodeCategories.map(cat => ({
    ...cat,
    nodes: cat.nodes.filter(n => n.name.toLowerCase().includes(kw))
  })).filter(cat => cat.nodes.length > 0)
})

// ===== 拖拽 =====
let dragNode = null

const onDragStart = (e, node) => {
  dragNode = node
  e.dataTransfer.effectAllowed = 'copy'
}

const onDrop = (e) => {
  if (!dragNode) return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left - 60
  const y = e.clientY - rect.top - 20
  addNodeToCanvas(dragNode, x, y)
  dragNode = null
}

const addNodeToCanvas = (nodeType, x, y) => {
  pushUndo()
  const id = Date.now()
  const node = {
    id,
    name: nodeType.name,
    icon: nodeType.icon,
    type: nodeType.type,
    x: Math.max(0, x),
    y: Math.max(0, y),
    config: { ...(defaultNodeConfigs[nodeType.type] || {}) }
  }
  node.config.name = nodeType.name
  workflow.value.nodes.push(node)
}

const onCanvasNodeDragStart = (e, node) => {
  e.dataTransfer.setData('text/plain', node.id)
}

const onCanvasNodeDragEnd = (e, node) => {
  // Update node position after drag within canvas
  const canvasArea = document.querySelector('.canvas-area')
  if (!canvasArea) return
  const rect = canvasArea.getBoundingClientRect()
  node.x = Math.max(0, e.clientX - rect.left - 75 + canvasArea.scrollLeft)
  node.y = Math.max(0, e.clientY - rect.top - 24 + canvasArea.scrollTop)
}

const removeNode = (id) => {
  pushUndo()
  const idx = workflow.value.nodes.findIndex(n => n.id === id)
  if (idx >= 0) workflow.value.nodes.splice(idx, 1)
  // Remove related edges
  workflow.value.edges = workflow.value.edges.filter(
    e => e.sourceNodeId !== id && e.targetNodeId !== id
  )
  if (selectedNodeId.value === id) deselectNode()
}

// ===== 撤销/重做 =====
const undoStack = ref([])
const redoStack = ref([])

const pushUndo = () => {
  undoStack.value.push(JSON.stringify({ nodes: workflow.value.nodes, edges: workflow.value.edges }))
  redoStack.value = []
}

const handleUndo = () => {
  if (undoStack.value.length === 0) return
  redoStack.value.push(JSON.stringify({ nodes: workflow.value.nodes, edges: workflow.value.edges }))
  const state = JSON.parse(undoStack.value.pop())
  workflow.value.nodes = state.nodes
  workflow.value.edges = state.edges || []
}

const handleRedo = () => {
  if (redoStack.value.length === 0) return
  undoStack.value.push(JSON.stringify({ nodes: workflow.value.nodes, edges: workflow.value.edges }))
  const state = JSON.parse(redoStack.value.pop())
  workflow.value.nodes = state.nodes
  workflow.value.edges = state.edges || []
}

// ===== 缩放 =====
const zoomIn = () => { zoom.value = Math.min(2, zoom.value + 0.1) }
const zoomOut = () => { zoom.value = Math.max(0.3, zoom.value - 0.1) }
const zoomFit = () => { zoom.value = 1 }

// ===== 操作按钮 =====
const handleTest = () => {
  ElMessage.info('测试功能：点击画布中的节点查看运行结果')
}

const showObserveDialog = ref(false)
const observeData = reactive({
  callCount: 1847,
  successRate: 98.4,
  avgLatency: 320,
  logs: [
    { time: '2026-07-15 13:30:22', status: '成功', latency: '285ms', input: '用户提问：摄像头状态查询', traceId: 'trace-a1b2c3d4' },
    { time: '2026-07-15 13:28:15', status: '成功', latency: '412ms', input: '用户提问：厨房烟雾检测', traceId: 'trace-e5f6g7h8' },
    { time: '2026-07-15 13:25:09', status: '成功', latency: '198ms', input: '用户提问：门锁状态', traceId: 'trace-i9j0k1l2' },
    { time: '2026-07-15 13:20:44', status: '失败', latency: '503ms', input: '用户提问：设备列表', traceId: 'trace-m3n4o5p6' },
    { time: '2026-07-15 13:15:30', status: '成功', latency: '356ms', input: '用户提问：老人活动检测', traceId: 'trace-q7r8s9t0' }
  ]
})

const handleObserve = () => {
  showObserveDialog.value = true
}

const handleSave = () => {
  if (workflow.value) {
    workflow.value.updatedAt = new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  ElMessage.success('工作流配置已保存')
}

const showVersionDialog = ref(false)
const showApiKeyDialog = ref(false)
const showChannelAlert = ref(true)

const versionList = reactive([
  { id: 1, tag: 'v1.0', time: '2026-07-15 09:44:30', current: false },
  { id: 2, tag: '草稿', time: new Date().toLocaleString('zh-CN'), current: true }
])

const restoreVersion = (v) => {
  ElMessage.success(`已恢复至版本 ${v.tag}`)
  showVersionDialog.value = false
}

const handlePublish = () => {
  if (!workflow.value) return
  ElMessageBox.confirm('发布后该工作流将对用户可用，确定发布？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'info'
  }).then(() => {
    workflow.value.enabled = true
    workflow.value.draft = false
    workflow.value.updatedAt = new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    ElMessage.success('工作流已发布')
  }).catch(() => {})
}

const copyAppId = () => {
  if (workflow.value) {
    navigator.clipboard.writeText(workflow.value.appId).then(() => {
      ElMessage.success('智能体ID已复制')
    })
  }
}

const copyApiKey = () => {
  if (workflow.value) {
    navigator.clipboard.writeText('sk-' + workflow.value.appId).then(() => {
      ElMessage.success('API Key 已复制')
    })
  }
}

const handleSdkDoc = () => {
  showSdkDocDialog.value = true
}

const showSdkDocDialog = ref(false)

const handlePlatformAuth = (platform) => {
  platformAuthName.value = platform
  platformAuthTitle.value = platform + ' 授权配置'
  showPlatformAuthDialog.value = true
}

const showPlatformAuthDialog = ref(false)
const platformAuthName = ref('')
const platformAuthTitle = ref('')
const platformAuthForm = reactive({ appId: '', appSecret: '', callbackUrl: '' })

const handlePlatformAuthConfirm = () => {
  if (!platformAuthForm.appId || !platformAuthForm.appSecret) {
    ElMessage.warning('请填写必填项')
    return
  }
  ElMessage.success(`${platformAuthName.value} 授权绑定成功`)
  showPlatformAuthDialog.value = false
  platformAuthForm.appId = ''
  platformAuthForm.appSecret = ''
  platformAuthForm.callbackUrl = ''
}
</script>

<style lang="scss" scoped>
// ===== 整体布局 =====
.wf-config-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
  background: var(--bg-page);
}

.wf-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
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

.wf-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .wf-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .draft-badge {
    font-size: 11px;
    padding: 1px 8px;
    background: var(--bg-page);
    color: var(--text-secondary);
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .update-time {
    font-size: 12px;
    color: var(--text-placeholder);
    margin-left: 8px;
  }
}

// ===== 工具栏 =====
.wf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-lighter);
  flex-shrink: 0;
  height: 40px;
}

.wf-subtabs {
  display: flex;

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
  }
}

.wf-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

// ===== 主体 =====
.wf-body {
  flex: 1;
  overflow: hidden;
}

// ===== 画布布局 =====
.canvas-layout {
  display: flex;
  height: 100%;
}

// 左侧节点栏
.node-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-right: 1px solid var(--border-lighter);
  display: flex;
  flex-direction: column;
  transition: width 0.2s;

  &.collapsed {
    width: 40px;
  }
}

.node-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-lighter);

  .sidebar-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.node-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-lighter);
  padding: 0 8px;

  .node-tab {
    flex: 1;
    padding: 8px 0;
    border: none;
    background: none;
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;

    &.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }
  }
}

.node-search {
  padding: 8px;
}

.node-categories {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.node-cat-group {
  margin-bottom: 2px;

  .cat-name {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-placeholder);
    padding: 8px 12px 4px;
    text-transform: uppercase;
  }
}

.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: grab;
  color: var(--text-secondary);
  transition: all 0.15s;
  font-size: 13px;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  &:active { cursor: grabbing; }
}

.node-item-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-current {
  flex: 1;
  padding: 12px;
}

.node-empty {
  text-align: center;
  color: var(--text-placeholder);
  font-size: 13px;
  padding: 40px 0;
}

.current-node-item {
  padding: 6px 8px;
  font-size: 13px;
  color: var(--text-primary);
  background: var(--bg-page);
  border-radius: 4px;
  margin-bottom: 4px;
}

// 画布主体
.canvas-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px;
  border-bottom: 1px solid var(--border-lighter);
  background: var(--bg-card);
  flex-shrink: 0;
}

.canvas-tb-left {
  display: flex;
  align-items: center;
  gap: 2px;
}

.canvas-tb-right {
  display: flex;
  align-items: center;
}

.zoom-control {
  display: flex;
  align-items: center;
  gap: 4px;

  .zoom-val {
    font-size: 13px;
    color: var(--text-secondary);
    min-width: 42px;
    text-align: center;
  }
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: auto;
  background: #fafbfc;
  outline: none;

  &.connecting-mode {
    cursor: crosshair;
  }
}

.canvas-grid {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, #ddd 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

// ===== SVG 连接线 =====
.edges-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;

  .edge-line {
    pointer-events: stroke;
    cursor: pointer;
    transition: stroke 0.2s;

    &:hover {
      stroke: #409eff;
    }
  }

  .edge-del-btn {
    pointer-events: all;
    cursor: pointer;
  }

  .edge-del-icon {
    pointer-events: all;
    cursor: pointer;
  }
}

// 流程节点
.flow-node {
  position: absolute;
  min-width: 120px;
  z-index: 2;

  .node-content {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: var(--bg-card);
    border: 2px solid var(--border-lighter);
    border-radius: 10px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    .node-label {
      font-weight: 500;
      color: var(--text-primary);
    }

    .node-more {
      color: var(--text-placeholder);
      margin-left: 4px;
    }
  }

  .node-port {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--primary-color);
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px var(--border-lighter);
    cursor: crosshair;
    z-index: 3;
    transition: all 0.2s;

    &:hover {
      transform: translateX(-50%) scale(1.3);
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.4);
    }

    &.port-active {
      background: #52c41a;
      box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.4);
      animation: pulse-port 0.8s infinite;
    }
  }

  .node-port-top { top: -7px; }
  .node-port-bottom { bottom: -7px; }
}

@keyframes pulse-port {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.3); }
}

.start-node .node-content {
  border-color: #52c41a;
  background: #f6ffed;
}

.end-node .node-content {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.custom-node {
  &.selected .node-content {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  .node-del-btn {
    padding: 0;
    color: var(--text-placeholder);
    &:hover { color: #ff4d4f; }
  }
}

.canvas-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-placeholder);
  font-size: 14px;
  pointer-events: none;
}

// ===== 节点配置侧边栏 =====
.node-config-panel {
  width: 320px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-left: 1px solid var(--border-lighter);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ncp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-lighter);
  flex-shrink: 0;

  .ncp-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.ncp-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.ncp-field {
  margin-bottom: 14px;

  .ncp-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }
}

.ncp-slider-val {
  display: inline-block;
  font-size: 12px;
  color: var(--text-primary);
  margin-left: 8px;
  min-width: 24px;
}

.ncp-code-input {
  :deep(textarea) {
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }
}

.ncp-slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ncp-var-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.ncp-hint {
  font-size: 11px;
  color: var(--text-placeholder);
  margin: 4px 0 0;
}

.ncp-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ncp-mini-label {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.ncp-char-count {
  font-size: 11px;
  color: var(--text-placeholder);
  display: block;
  text-align: right;
  margin-top: 2px;
}

.ncp-cond-item {
  border: 1px solid var(--border-lighter);
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 6px;
  position: relative;
}

.ncp-cond-row {
  margin-bottom: 4px;

  &:last-child { margin-bottom: 0; }
}

.ncp-cond-idx {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-right: 4px;
}

.ncp-cond-del {
  position: absolute;
  top: 4px;
  right: 4px;
}

.ncp-connect-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: var(--bg-page);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
}

// ===== 发布渠道 =====
.channel-layout {
  padding: 20px 32px;
  overflow-y: auto;
  height: 100%;
}

.channel-alert {
  padding: 10px 16px;
  background: var(--primary-bg);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.channel-section {
  margin-bottom: 32px;

  .channel-section-header {
    margin-bottom: 16px;

    h3 {
      margin: 0 0 6px;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .appid-row {
      margin-top: 8px;
      font-size: 13px;
      color: var(--text-primary);
      font-family: monospace;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.channel-cards {
  display: flex;
  gap: 16px;
}

.channel-card {
  flex: 1;
  border: 1px solid var(--border-lighter);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  gap: 16px;
}

.cc-icon {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.api-icon { background: #e6f7ff; color: #1890ff; }
  &.sdk-icon { background: #f6ffed; color: #52c41a; }
}

.cc-body {
  flex: 1;
}

.cc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;

  .cc-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }

  .cc-status {
    font-size: 12px;
    padding: 1px 8px;
    border-radius: 4px;
    &.created { color: #389e0d; background: #f6ffed; }
  }
}

.cc-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 12px;
}

.cc-actions {
  display: flex;
  gap: 8px;
}

.platform-cards {
  display: flex;
  gap: 16px;
}

.platform-card {
  flex: 1;
  border: 1px solid var(--border-lighter);
  border-radius: 8px;
  padding: 20px;

  .pc-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #e6f7ff;
    color: #1890ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;

    &.wx { background: #f6ffed; color: #52c41a; }
  }

  .pc-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .pc-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }

  .pc-auth {
    font-size: 12px;
    color: var(--primary-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .pc-status-none {
    font-size: 12px;
    color: var(--text-placeholder);
  }

  .pc-desc {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0 0 8px;
  }
}

.interact-cards {
  display: flex;
  gap: 16px;
}

.interact-card {
  flex: 1;
  border: 1px solid var(--border-lighter);
  border-radius: 8px;
  padding: 20px;

  .ic-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 8px 0 0;
  }
}

// ===== 版本管理 =====
.version-list {
  padding-top: 20px;
}

.version-empty {
  text-align: center;
  color: var(--text-placeholder);
  padding: 40px 0;
}

.version-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-lighter);
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.version-tag {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.version-time {
  font-size: 13px;
  color: var(--text-secondary);
}

.version-current {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 4px;
  color: var(--primary-color);
  background: var(--primary-bg);
}

// ===== API Key 弹窗 =====
.apikey-body {
  padding-top: 20px;
}

.apikey-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 12px;
}

.apikey-row {
  display: flex;
  gap: 8px;
}

// ===== 观测弹窗 =====
.observe-body {
  padding-top: 20px;
}

.observe-metrics {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.observe-metric {
  flex: 1;
  text-align: center;
  padding: 16px;
  background: var(--bg-page);
  border-radius: 8px;
}

.observe-metric-val {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
}

.observe-metric-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.observe-section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
}

.status-tag {
  display: inline-block;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 22px;
  &.status-success { color: #52c41a; background: #f6ffed; }
  &.status-fail { color: #ff4d4f; background: #fff2f0; }
}

// ===== SDK 文档弹窗 =====
.sdk-doc-body {
  padding-top: 20px;

  h4 { margin: 0 0 8px; font-size: 14px; }
  p { font-size: 13px; color: var(--text-secondary); margin: 0 0 12px; }
}

.code-block {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;

  pre {
    margin: 0;
    code {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #d4d4d4;
      white-space: pre;
    }
  }
}

// ===== 平台授权弹窗 =====
.platform-auth-body {
  padding-top: 20px;
}

.auth-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 20px;
}

.auth-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
