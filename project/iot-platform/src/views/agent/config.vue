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
        <el-button type="primary" :disabled="!isConfigValid" @click="handlePublish">
          发布
        </el-button>
      </div>
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
        <!-- ① 抓图配置 -->
        <section id="sec-capture" class="config-section">
          <div class="section-header">
            <h3>① 抓图配置</h3>
            <el-tag size="small" type="danger" effect="dark">必选</el-tag>
          </div>

          <div class="field-group">
            <label class="field-label">抓图模式</label>
            <div class="mode-selector">
              <div
                :class="['mode-card', { active: form.captureMode === 'event' }]"
                @click="form.captureMode = 'event'"
              >
                <div class="mode-icon">⚡</div>
                <div class="mode-name">事件触发</div>
                <div class="mode-desc">设备检测到事件时抓图</div>
              </div>
              <div
                :class="['mode-card', { active: form.captureMode === 'timed' }]"
                @click="form.captureMode = 'timed'"
              >
                <div class="mode-icon">⏱</div>
                <div class="mode-name">定时抓图</div>
                <div class="mode-desc">按固定时间间隔抓图</div>
              </div>
              <div
                :class="['mode-card', { active: form.captureMode === 'hybrid' }]"
                @click="form.captureMode = 'hybrid'"
              >
                <div class="mode-icon">🔀</div>
                <div class="mode-name">混合模式</div>
                <div class="mode-desc">事件 + 定时兜底</div>
              </div>
            </div>
          </div>

          <div class="field-group" v-if="['event','hybrid'].includes(form.captureMode)">
            <label class="field-label">触发事件类型</label>
            <div class="checkbox-pills">
              <el-checkbox
                v-for="evt in captureEventOptions"
                :key="evt.value"
                :model-value="form.captureEvents.includes(evt.value)"
                :label="evt.label"
                size="small"
                @change="(checked) => {
                  if (checked) { form.captureEvents.push(evt.value) }
                  else { form.captureEvents = form.captureEvents.filter(v => v !== evt.value) }
                }"
              />
            </div>
          </div>

          <div class="field-group" v-if="['timed','hybrid'].includes(form.captureMode)">
            <label class="field-label">定时抓图间隔（分钟）</label>
            <div class="param-row">
              <el-slider v-model="form.captureInterval" :min="1" :max="60" :step="1" style="flex:1" />
              <el-input-number v-model="form.captureInterval" :min="1" :max="60" :step="1" size="small" style="width:90px" />
            </div>
          </div>

          <div class="field-group" v-if="['timed','hybrid'].includes(form.captureMode)">
            <label class="field-label">每日抓图上限（张）</label>
            <el-input-number v-model="form.captureDailyLimit" :min="1" :max="288" style="width:200px" />
            <p class="toggle-desc">每天最多抓取张数，限制成本上限</p>
          </div>
        </section>

        <!-- ② 事件识别 -->
        <section id="sec-recognition" class="config-section">
          <div class="section-header">
            <h3>② 事件识别</h3>
            <div class="step-toggle">
              <span class="step-status">{{ form.enableRecognition ? '已开启' : '已关闭' }}</span>
              <el-switch v-model="form.enableRecognition" size="small" />
            </div>
          </div>

          <template v-if="form.enableRecognition">
            <div class="field-group">
              <label class="field-label">模型</label>
              <el-select v-model="form.recogModel" style="width:100%">
                <el-option label="豆包视觉 1.8" value="doubao-vision-1.8" />
                <el-option label="千问-VL-Max" value="qwen-vl-max" />
                <el-option label="千问-VL-Plus" value="qwen-vl-plus" />
              </el-select>
            </div>
            <div class="field-group">
              <div class="param-label">温度</div>
              <div class="param-row">
                <el-slider v-model="form.recogTemperature" :min="0" :max="1" :step="0.05" style="flex:1" />
                <span class="slider-val">{{ form.recogTemperature.toFixed(2) }}</span>
              </div>
              <p class="toggle-desc">事件识别建议低温度（0.1~0.3），确保结构化输出的准确性和一致性</p>
            </div>
            <div class="field-group">
              <div class="field-label-row">
                <label class="field-label">系统提示词</label>
                <el-button text size="small" type="primary" @click="openDebugDrawer('系统提示词调试', form.recogSystemPrompt)">调试 ▸</el-button>
              </div>
              <el-input v-model="form.recogSystemPrompt" type="textarea" :rows="4" placeholder="定义AI识别角色和行为准则，如：你是一个学习行为观察助手，观察图片中的儿童状态..." class="prompt-textarea" />
              <div class="char-count">{{ form.recogSystemPrompt.length }}/6000</div>
            </div>
            <div class="field-group">
              <div class="field-label-row">
                <label class="field-label">输出格式提示词</label>
                <el-button text size="small" type="primary" @click="openDebugDrawer('输出格式调试', form.recogOutputPrompt)">调试 ▸</el-button>
              </div>
              <el-input v-model="form.recogOutputPrompt" type="textarea" :rows="3" placeholder="定义输出JSON格式，如：请按以下格式输出: { &quot;atDesk&quot;: true/false, &quot;concentration&quot;: &quot;high/med/low&quot; }" class="prompt-textarea ncp-code-input" />
            </div>
          </template>
          <div v-else class="step-disabled-hint">
            <p>⚠ 关闭事件识别后，抓图将不做 AI 分析处理</p>
            <el-button text type="primary" @click="form.enableRecognition = true">开启事件识别</el-button>
          </div>
        </section>

        <!-- ③ AI 搜索 -->
        <section id="sec-search" class="config-section">
          <div class="section-header">
            <h3>③ AI 搜索</h3>
            <div class="step-toggle">
              <span class="step-status">{{ form.enableSearch ? '已开启' : '已关闭' }}</span>
              <el-switch v-model="form.enableSearch" size="small" />
            </div>
          </div>

          <template v-if="form.enableSearch">
            <div class="field-group">
              <label class="field-label">查询范围</label>
              <el-select v-model="form.searchRange" style="width:200px">
                <el-option label="近 1 天" :value="1" />
                <el-option label="近 3 天" :value="3" />
                <el-option label="近 7 天" :value="7" />
                <el-option label="近 14 天" :value="14" />
                <el-option label="近 30 天" :value="30" />
              </el-select>
              <p class="toggle-desc">阶段总结时，检索近N天内的历史识别结果作为参考上下文</p>
            </div>
            <div class="field-group">
              <label class="field-label">返回条数 (Top-K)</label>
              <el-input-number v-model="form.searchTopK" :min="1" :max="50" style="width:100%" />
            </div>
            <div class="field-group">
              <label class="field-label">相似度阈值</label>
              <div class="param-row">
                <el-slider v-model="form.searchThreshold" :min="0" :max="1" :step="0.05" style="flex:1" />
                <span class="slider-val">{{ form.searchThreshold.toFixed(2) }}</span>
              </div>
              <p class="toggle-desc">低于此阈值的结果将被过滤，值越高结果越精确但可能遗漏</p>
            </div>
          </template>
          <div v-else class="step-disabled-hint">
            <p>⚠ 关闭AI搜索后，阶段总结将无法检索历史事件，仅基于当日数据生成总结</p>
            <el-button text type="primary" @click="form.enableSearch = true">开启 AI 搜索</el-button>
          </div>
        </section>

        <!-- ④ 阶段总结 -->
        <section id="sec-summary" class="config-section">
          <div class="section-header">
            <h3>④ 阶段总结</h3>
            <div class="step-toggle">
              <span class="step-status">{{ form.enableSummary ? '已开启' : '已关闭' }}</span>
              <el-switch v-model="form.enableSummary" size="small" />
            </div>
          </div>

          <template v-if="form.enableSummary">
            <div class="field-group">
              <label class="field-label">总结周期</label>
              <el-select v-model="form.summaryCycle" style="width:200px" @change="onSummaryCycleChange">
                <el-option label="每天" value="daily" />
                <el-option label="每周一" value="weekly" />
                <el-option label="自定义 Cron" value="cron" />
              </el-select>
            </div>
            <div class="field-group" v-if="form.summaryCycle === 'cron'">
              <label class="field-label">Cron 表达式</label>
              <el-input v-model="form.summaryCron" placeholder="0 9 * * 1" />
              <p class="toggle-desc">支持标准 5 位 Cron 表达式</p>
            </div>
            <div class="field-group">
              <label class="field-label">模型</label>
              <el-select v-model="form.summaryModel" style="width:200px">
                <el-option label="豆包 1.8" value="doubao-1.8" />
                <el-option label="千问-Max" value="qwen-max" />
                <el-option label="千问-Plus" value="qwen-plus" />
              </el-select>
            </div>
            <div class="field-group">
              <div class="field-label-row">
                <label class="field-label">总结提示词</label>
                <el-button text size="small" type="primary" @click="openDebugDrawer('总结提示词调试', form.summaryPeriodPrompt)">调试 ▸</el-button>
              </div>
              <el-input v-model="form.summaryPeriodPrompt" type="textarea" :rows="4" placeholder="根据${period}内的事件记录，总结情况...&#10;可用变量：${period} ${events_list} ${previous_summary}" class="prompt-textarea" />
            </div>
            <div class="field-group">
              <div class="field-label-row">
                <label class="field-label">输出格式提示词</label>
                <el-button text size="small" type="primary" @click="openDebugDrawer('输出格式提示词调试', form.summarySuggestPrompt)">调试 ▸</el-button>
              </div>
              <el-input v-model="form.summarySuggestPrompt" type="textarea" :rows="4" placeholder="定义阶段总结的输出JSON格式，如：{ &quot;period&quot;: &quot;...&quot;, &quot;highlights&quot;: [...], &quot;suggestions&quot;: [...] }&#10;可用变量：${period} ${events_list} ${previous_summary}" class="prompt-textarea" />
            </div>
          </template>
          <div v-else class="step-disabled-hint">
            <p>⚠ 关闭阶段总结后，用户将不会收到周期性报告。可通过 AI 搜索单独查询历史事件</p>
            <el-button text type="primary" @click="form.enableSummary = true">开启阶段总结</el-button>
          </div>
        </section>

        <!-- 高级设置 -->
        <section id="sec-advanced" class="config-section">
          <div class="section-header" style="cursor:pointer" @click="showAdvanced = !showAdvanced">
            <h3>高级设置</h3>
            <el-icon :class="['collapse-icon', { rotated: showAdvanced }]"><ArrowDown /></el-icon>
          </div>

          <template v-if="showAdvanced">
            <div class="tool-block">
              <div class="tool-block-header">
                <span class="tool-title">内置工具</span>
                <el-button text size="small" type="primary" @click="handleToolSettings">设置</el-button>
              </div>
            </div>
            <div class="tool-block">
              <div class="tool-block-header">
                <span class="tool-title">知识库</span>
                <el-button text size="small" type="primary" @click="openAddDialog('knowledge')"><el-icon><Plus /></el-icon></el-button>
              </div>
              <div v-if="!form.tools.knowledge.length" class="tool-empty">暂无知识库，点击右上角「+」开始配置</div>
              <div v-else>
                <div v-for="kb in form.tools.knowledge" :key="kb.name" class="tool-added-item">
                  <el-icon><Collection /></el-icon>
                  <span>{{ kb.name }}</span>
                  <el-button text size="small" @click="form.tools.knowledge = form.tools.knowledge.filter(k => k.name !== kb.name)"><el-icon><Close /></el-icon></el-button>
                </div>
              </div>
            </div>
            <div class="tool-block">
              <div class="tool-block-header">
                <span class="tool-title">数据连接器</span>
                <el-button text size="small" type="primary" @click="openAddDialog('connector')"><el-icon><Plus /></el-icon></el-button>
              </div>
              <div v-if="!form.tools.connectors.length" class="tool-empty">暂无数据连接器，点击右上角「+」开始配置</div>
              <div v-else>
                <div v-for="c in form.tools.connectors" :key="c.name" class="tool-added-item">
                  <el-icon><Connection /></el-icon>
                  <span>{{ c.name }}</span>
                  <el-button text size="small" @click="form.tools.connectors = form.tools.connectors.filter(x => x.name !== c.name)"><el-icon><Close /></el-icon></el-button>
                </div>
              </div>
            </div>
            <div class="tool-block">
              <div class="tool-block-header">
                <span class="tool-title">应用组件</span>
                <el-button text size="small" type="primary" @click="openAddDialog('component')"><el-icon><Plus /></el-icon></el-button>
              </div>
              <div v-if="!form.tools.components.length" class="tool-empty">暂无应用组件，点击右上角「+」开始配置</div>
              <div v-else>
                <div v-for="c in form.tools.components" :key="c.name" class="tool-added-item">
                  <el-icon><Grid /></el-icon>
                  <span>{{ c.name }}</span>
                  <el-button text size="small" @click="form.tools.components = form.tools.components.filter(x => x.name !== c.name)"><el-icon><Close /></el-icon></el-button>
                </div>
              </div>
            </div>
            <div class="tool-block">
              <div class="tool-block-header">
                <span class="tool-title">MCP 服务</span>
                <el-button text size="small" type="primary" @click="openAddDialog('mcp')"><el-icon><Plus /></el-icon></el-button>
              </div>
              <div v-if="!form.tools.mcp.length" class="tool-empty">暂无MCP服务，点击右上角「+」开始配置</div>
              <div v-else>
                <div v-for="m in form.tools.mcp" :key="m.name" class="tool-added-item">
                  <el-icon><Link /></el-icon>
                  <span>{{ m.name }}</span>
                  <el-button text size="small" @click="form.tools.mcp = form.tools.mcp.filter(x => x.name !== m.name)"><el-icon><Close /></el-icon></el-button>
                </div>
              </div>
            </div>
            <div class="tool-block">
              <div class="tool-block-header">
                <span class="tool-title">技能</span>
                <el-button text size="small" type="primary" @click="openAddDialog('skill')"><el-icon><Plus /></el-icon></el-button>
              </div>
              <div v-if="!form.skills.length" class="tool-empty">暂无 Skill，点击右上角「+」开始配置</div>
              <div v-else>
                <div v-for="s in form.skills" :key="s.name" class="tool-added-item">
                  <el-icon><MagicStick /></el-icon>
                  <span>{{ s.name }}</span>
                  <el-button text size="small" @click="form.skills = form.skills.filter(x => x.name !== s.name)"><el-icon><Close /></el-icon></el-button>
                </div>
              </div>
            </div>
            <div class="field-group" style="margin-top:16px">
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
            </div>
            <div class="tool-block" style="margin-top:12px">
              <div class="tool-block-header">
                <span class="tool-title">环境变量</span>
                <el-button text size="small" type="primary" @click="openAddDialog('env')"><el-icon><Plus /></el-icon></el-button>
              </div>
              <div v-for="(env, idx) in form.envVars" :key="idx" class="env-item">
                <div class="env-key">{{ env.key }}</div>
                <div class="env-value">{{ env.value || '(未设值)' }}</div>
                <el-button text size="small" @click="form.envVars.splice(idx, 1)"><el-icon><Close /></el-icon></el-button>
              </div>
            </div>
          </template>
        </section>
      </div>

      <!-- 右侧调试面板 -->
      <div v-if="debugPanelVisible" class="debug-panel">
        <div class="debug-panel-header">
          <span class="debug-title">{{ debugPanelTitle }}</span>
          <div class="debug-panel-actions">
            <el-button text size="small" @click="debugPanelVisible = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="debug-messages" ref="debugMsgRef">
          <div class="debug-prompt-preview">
            <label class="dd-label">调试提示词</label>
            <div class="dd-prompt-box">{{ debugPanelPrompt }}</div>
          </div>

          <div v-if="debugMessages.length === 0 && !debugTestResult" class="debug-placeholder">
            输入测试内容，验证提示词效果
          </div>

          <div v-for="(msg, i) in debugMessages" :key="i"
            :class="['msg-bubble', msg.role === 'user' ? 'msg-user' : 'msg-agent']">
            <div class="msg-content">{{ msg.content }}</div>
            <div v-if="msg.role === 'agent' && msg.metrics" class="msg-metrics">
              耗时 {{ msg.metrics.latency }} · Token {{ msg.metrics.tokens }}
            </div>
          </div>
          <div v-if="debugTestResult" class="msg-bubble msg-agent">
            <div class="msg-content"><pre class="dd-result-pre">{{ debugTestResult }}</pre></div>
            <div v-if="debugTestMetrics" class="msg-metrics">
              耗时 {{ debugTestMetrics.latency }} · Token {{ debugTestMetrics.tokens }}
            </div>
          </div>
          <div v-if="debugLoading" class="msg-bubble msg-agent">
            <div class="msg-typing"><span></span><span></span><span></span></div>
          </div>
        </div>

        <div class="debug-input-area">
          <div class="debug-input-row">
            <el-input v-model="debugInput" placeholder="输入测试内容..." @keydown.enter.exact.prevent="sendDebugMessage" />
            <el-button type="primary" :disabled="!debugInput.trim() || debugLoading" size="small" circle @click="sendDebugMessage">
              <el-icon><Promotion /></el-icon>
            </el-button>
          </div>
          <div class="debug-disclaimer">内容由AI生成，仅供参考</div>
        </div>
      </div>
    </div>

    <!-- 添加知识库弹窗 -->
    <el-dialog v-model="showKnowledgeDialog" title="添加知识库" width="520px" :close-on-click-modal="false">
      <el-form label-width="100px" class="new-var-form">
        <el-form-item label="名称" required>
          <el-input v-model="kbForm.name" placeholder="请输入知识库名称" :maxlength="50" />
        </el-form-item>
        <el-form-item label="知识库类型">
          <el-select v-model="kbForm.type" style="width:100%">
            <el-option label="文档知识库" value="document" />
            <el-option label="问答知识库" value="qa" />
            <el-option label="表格知识库" value="table" />
            <el-option label="图片知识库" value="image" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="kbForm.description" type="textarea" :rows="2" placeholder="知识库描述（可选）" />
        </el-form-item>
        <el-form-item label="数据源地址">
          <el-input v-model="kbForm.sourceUrl" placeholder="文件URL或数据源地址" />
        </el-form-item>
        <el-form-item label="嵌入模型">
          <el-select v-model="kbForm.embeddingModel" style="width:100%">
            <el-option label="text-embedding-v3" value="text-embedding-v3" />
            <el-option label="text-embedding-ada-002" value="text-embedding-ada-002" />
            <el-option label="bge-large-zh" value="bge-large-zh" />
          </el-select>
        </el-form-item>
        <el-form-item label="分块大小">
          <el-input-number v-model="kbForm.chunkSize" :min="100" :max="8000" :step="100" style="width:100%" />
        </el-form-item>
        <el-form-item label="分块重叠">
          <el-input-number v-model="kbForm.chunkOverlap" :min="0" :max="1000" :step="10" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showKnowledgeDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddKnowledge">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- 添加数据连接器弹窗 -->
    <el-dialog v-model="showConnectorDialog" title="添加数据连接器" width="520px" :close-on-click-modal="false">
      <el-form label-width="100px" class="new-var-form">
        <el-form-item label="名称" required>
          <el-input v-model="connForm.name" placeholder="请输入连接器名称" :maxlength="50" />
        </el-form-item>
        <el-form-item label="连接类型">
          <el-select v-model="connForm.connType" style="width:100%">
            <el-option label="MySQL" value="mysql" />
            <el-option label="PostgreSQL" value="postgres" />
            <el-option label="MongoDB" value="mongodb" />
            <el-option label="Redis" value="redis" />
            <el-option label="Elasticsearch" value="elasticsearch" />
            <el-option label="REST API" value="rest" />
          </el-select>
        </el-form-item>
        <el-form-item label="主机地址">
          <el-input v-model="connForm.host" placeholder="如 localhost 或 IP 地址" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input-number v-model="connForm.port" :min="1" :max="65535" style="width:100%" />
        </el-form-item>
        <el-form-item label="数据库名">
          <el-input v-model="connForm.database" placeholder="数据库名称" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="connForm.username" placeholder="数据库用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="connForm.password" type="password" placeholder="数据库密码" show-password />
        </el-form-item>
        <el-form-item label="数据表/集合">
          <el-input v-model="connForm.tableName" placeholder="要连接的表或集合名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConnectorDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddConnector">测试连接并添加</el-button>
      </template>
    </el-dialog>

    <!-- 添加应用组件弹窗 -->
    <el-dialog v-model="showComponentDialog" title="添加应用组件" width="520px" :close-on-click-modal="false">
      <el-form label-width="100px" class="new-var-form">
        <el-form-item label="组件名称" required>
          <el-input v-model="compForm.name" placeholder="请输入组件名称" :maxlength="50" />
        </el-form-item>
        <el-form-item label="组件类型">
          <el-select v-model="compForm.compType" style="width:100%">
            <el-option label="卡片组件" value="card" />
            <el-option label="表单组件" value="form" />
            <el-option label="表格组件" value="table" />
            <el-option label="图表组件" value="chart" />
            <el-option label="地图组件" value="map" />
            <el-option label="自定义组件" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="compForm.description" type="textarea" :rows="2" placeholder="组件功能描述" />
        </el-form-item>
        <el-form-item label="组件配置">
          <el-input v-model="compForm.config" type="textarea" :rows="4" placeholder='{"key": "value"}' class="ncp-code-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showComponentDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddComponent">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- 添加MCP服务弹窗 -->
    <el-dialog v-model="showMcpDialog" title="添加MCP服务" width="520px" :close-on-click-modal="false">
      <el-form label-width="100px" class="new-var-form">
        <el-form-item label="服务名称" required>
          <el-input v-model="mcpForm.name" placeholder="请输入MCP服务名称" :maxlength="50" />
        </el-form-item>
        <el-form-item label="Server URL">
          <el-input v-model="mcpForm.serverUrl" placeholder="https://mcp-server.example.com" />
        </el-form-item>
        <el-form-item label="传输协议">
          <el-select v-model="mcpForm.transport" style="width:100%">
            <el-option label="stdio" value="stdio" />
            <el-option label="HTTP (streamable)" value="http" />
            <el-option label="SSE" value="sse" />
          </el-select>
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="mcpForm.apiKey" type="password" placeholder="鉴权密钥（可选）" show-password />
        </el-form-item>
        <el-form-item label="配置参数">
          <el-input v-model="mcpForm.config" type="textarea" :rows="3" placeholder='{"key":"value"}' />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMcpDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddMcp">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- 添加Skill弹窗 -->
    <el-dialog v-model="showSkillDialog" title="添加Skill" width="520px" :close-on-click-modal="false">
      <el-form label-width="100px" class="new-var-form">
        <el-form-item label="Skill名称" required>
          <el-input v-model="skillForm.name" placeholder="请输入Skill名称" :maxlength="50" />
        </el-form-item>
        <el-form-item label="Skill类型">
          <el-select v-model="skillForm.skillType" style="width:100%">
            <el-option label="API调用" value="api" />
            <el-option label="脚本执行" value="script" />
            <el-option label="云函数" value="function" />
            <el-option label="HTTP回调" value="webhook" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="skillForm.description" type="textarea" :rows="2" placeholder="Skill功能描述" />
        </el-form-item>
        <el-form-item label="入口地址">
          <el-input v-model="skillForm.endpoint" placeholder="API URL 或函数名称" />
        </el-form-item>
        <el-form-item label="入参Schema">
          <el-input v-model="skillForm.inputSchema" type="textarea" :rows="3" placeholder='{"type":"object","properties":{...}}' />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSkillDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddSkill">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- 添加环境变量弹窗 -->
    <el-dialog v-model="showEnvDialog" title="添加环境变量" width="480px" :close-on-click-modal="false">
      <el-form label-width="80px" class="new-var-form">
        <el-form-item label="变量名" required>
          <el-input v-model="envForm.key" placeholder="如 API_KEY" :maxlength="50" />
        </el-form-item>
        <el-form-item label="变量值" required>
          <el-input v-model="envForm.value" type="password" placeholder="变量值" show-password />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="envForm.description" type="textarea" :rows="2" placeholder="变量的用途说明（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEnvDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddEnv">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- 内置工具设置弹窗 -->
    <el-dialog v-model="showToolSettingsDialog" title="内置工具设置" width="540px">
      <div class="tool-settings-body">
        <div class="tool-setting-item" v-for="tool in builtinTools" :key="tool.id">
          <div class="ts-left">
            <span class="ts-name">{{ tool.name }}</span>
            <span class="ts-desc">{{ tool.description }}</span>
          </div>
          <el-switch v-model="tool.enabled" size="small" @change="onBuiltinToolChange" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showToolSettingsDialog = false">关闭</el-button>
      </template>
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

    <!-- 版本管理弹窗 -->
    <el-dialog v-model="showVersionDialog" title="版本管理" width="580px">
      <div class="version-list">
        <div v-for="v in versionList" :key="v.id" class="version-item">
          <div class="version-info">
            <span class="version-tag">{{ v.tag }}</span>
            <span class="version-time">{{ v.time }}</span>
            <span v-if="v.current" class="version-current">当前版本</span>
          </div>
          <div class="version-descr">{{ v.descr }}</div>
          <el-button v-if="!v.current" text size="small" type="primary" @click="restoreVersion(v)">恢复到此版本</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 调试设置弹窗 -->
    <el-dialog v-model="showDebugSettingsDialog" title="调试设置" width="440px">
      <el-form label-width="100px" class="new-var-form">
        <el-form-item label="调试模型">
          <el-select v-model="debugSettingsForm.model" style="width:100%">
            <el-option v-for="m in enabledModelList" :key="m.id" :label="m.label" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Temperature">
          <el-slider v-model="debugSettingsForm.temperature" :min="0" :max="2" :step="0.1" style="width:100%" />
          <span style="font-size:12px;color:var(--text-secondary);margin-left:8px">{{ debugSettingsForm.temperature }}</span>
        </el-form-item>
        <el-form-item label="最大Token">
          <el-input-number v-model="debugSettingsForm.maxTokens" :min="256" :max="128000" :step="256" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDebugSettingsDialog = false">取消</el-button>
        <el-button type="primary" @click="showDebugSettingsDialog = false">应用</el-button>
      </template>
    </el-dialog>

    <!-- 发布确认弹窗 -->
    <el-dialog v-model="showPublishDialog" title="确认发布" width="460px">
      <p class="publish-confirm-desc">发布后该智能体将对用户可用，确认发布？</p>
      <template #footer>
        <el-button @click="showPublishDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmPublish">确认发布</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Plus, Setting, Delete, Link, Promotion, ArrowDown,
  Picture, View, Search, Document, Collection, MagicStick,
  Connection, Grid, Close, Select
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
const showAdvanced = ref(false)

// ===== 表单数据 =====
const form = reactive({
  // 基础信息
  name: '',
  icon: '',
  category: 'home',
  description: '',
  // ① 抓图配置（始终开启）
  captureMode: 'hybrid',    // event | timed | hybrid
  captureEvents: [],        // 事件触发：选中的事件类型
  captureInterval: 5,       // 定时：间隔（分钟）
  captureDailyLimit: 288,   // 每日抓图上限（张）
  // ② 事件识别
  enableRecognition: true,
  recogModel: 'doubao-vision-1.8',
  recogTemperature: 0.2,
  recogSystemPrompt: '',
  recogOutputPrompt: '',
  recogOutputFields: [],    // [{name, type, enumValues}]
  // ③ AI 搜索
  enableSearch: true,
  searchRange: 3,           // 近N天
  searchTopK: 10,
  searchThreshold: 0.7,
  // ④ 阶段总结
  enableSummary: false,
  summaryCycle: 'weekly',   // daily | weekly | cron
  summaryCron: '',
  summaryModel: 'doubao-1.8',
  summaryPeriodPrompt: '',
  summarySuggestPrompt: '',
  // 高级设置（折叠）
  tools: { builtin: true, knowledge: [], connectors: [], components: [], mcp: [] },
  skills: [],
  shortMemory: true,
  contextRounds: 3,
  envVars: [],
  showAnswerSource: true
})

// ===== 抓图事件类型选项 =====
const captureEventOptions = [
  { label: '移动侦测', value: 'motion' },
  { label: '声音侦测', value: 'sound' },
  { label: '人形检测', value: 'person' },
  { label: '宠物检测', value: 'pet' },
  { label: '车辆检测', value: 'vehicle' },
  { label: '门铃呼叫', value: 'doorbell' },
  { label: '烟雾告警', value: 'smoke' },
  { label: '温度告警', value: 'temp' }
]

const isConfigValid = computed(() => {
  return !!form.name.trim()
})

// ===== 调试面板状态 =====
const debugPanelVisible = ref(false)
const debugPanelTitle = ref('')
const debugPanelPrompt = ref('')   // 当前调试的提示词内容

const openDebugDrawer = (title, promptContent) => {
  debugPanelTitle.value = title
  debugPanelPrompt.value = promptContent
  debugPanelVisible.value = true
}

const onSummaryCycleChange = (val) => {
  if (val === 'cron' && !form.summaryCron) {
    form.summaryCron = '0 9 * * 1'
  }
}

// 调试测试结果（面板内展示）
const debugTestResult = ref('')
const debugTestMetrics = ref(null)

// 从 agent 初始化表单
watch(agent, (a) => {
  if (!a) return
  form.name = a.name || ''
  form.description = a.description || ''
  form.tools = a.tools || { knowledge: [], connectors: [], components: [], mcp: [] }
  form.skills = a.skills || []
  form.shortMemory = (a.contextRounds ?? 3) > 0
  form.contextRounds = a.contextRounds ?? 3
  form.envVars = a.envVars || []
  form.showAnswerSource = a.showAnswerSource ?? true
  if (a.scenarioConfig) {
    Object.assign(form, a.scenarioConfig)
  }
}, { immediate: true })

const handleObserve = () => {
  showObserveDialog.value = true
}

const showObserveDialog = ref(false)
const observeData = reactive({
  callCount: 2841,
  successRate: 97.6,
  avgLatency: 450,
  logs: [
    { time: '2026-07-15 14:22:10', status: '成功', latency: '380ms', input: '用户提问：查看摄像头状态', traceId: 'trace-x1y2z3' },
    { time: '2026-07-15 14:18:45', status: '成功', latency: '520ms', input: '用户提问：分析最近告警', traceId: 'trace-a4b5c6' },
    { time: '2026-07-15 14:15:30', status: '成功', latency: '290ms', input: '用户提问：门锁电量查询', traceId: 'trace-d7e8f9' },
    { time: '2026-07-15 14:10:15', status: '失败', latency: '810ms', input: '用户提问：设备历史数据导出', traceId: 'trace-g0h1i2' },
    { time: '2026-07-15 14:05:00', status: '成功', latency: '410ms', input: '用户提问：烟雾传感器状态', traceId: 'trace-j3k4l5' }
  ]
})

const handlePublish = () => {
  if (!isConfigValid.value) return ElMessage.warning('请先完成应用配置')
  showPublishDialog.value = true
}

const confirmPublish = () => {
  if (agent.value) {
    agent.value.enabled = true
    agent.value.updatedAt = new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  ElMessage.success('应用已发布')
  showPublishDialog.value = false
}

// ===== 锚点导航 =====
const anchorSections = [
  { id: 'capture', label: '抓图配置', icon: 'Picture' },
  { id: 'recognition', label: '事件识别', icon: 'View' },
  { id: 'search', label: 'AI 搜索', icon: 'Search' },
  { id: 'summary', label: '阶段总结', icon: 'Document' },
  { id: 'advanced', label: '高级设置', icon: 'Setting' }
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

// ===== 版本管理 =====
const showVersionDialog = ref(false)
const showPublishDialog = ref(false)

const versionList = reactive([
  { id: 1, tag: 'v1.0', time: '2026-07-10 15:30:00', current: false, descr: '初始版本' },
  { id: 2, tag: 'v1.1', time: '2026-07-12 09:15:00', current: false, descr: '优化提示词，调整温度参数' },
  { id: 3, tag: '当前草稿', time: new Date().toLocaleString('zh-CN'), current: true, descr: '当前编辑版本' }
])

const restoreVersion = (v) => {
  ElMessage.success(`已恢复至版本 ${v.tag}`)
  showVersionDialog.value = false
}

const handleToolSettings = () => {
  showToolSettingsDialog.value = true
}

const showToolSettingsDialog = ref(false)
const builtinTools = reactive([
  { id: 'code_interpreter', name: '代码解释器', description: '执行 Python 代码，处理数据分析、文件操作等任务', enabled: true },
  { id: 'web_search', name: '网页搜索', description: '调用搜索引擎获取实时信息', enabled: true },
  { id: 'image_gen', name: '图片生成', description: '通过 AI 模型生成图像', enabled: false },
  { id: 'calculator', name: '计算器', description: '执行数学计算和单位换算', enabled: true },
  { id: 'file_reader', name: '文件读取', description: '读取并解析上传的文件内容', enabled: true }
])

const onBuiltinToolChange = () => {
  const enabled = builtinTools.filter(t => t.enabled).map(t => t.id)
  ElMessage.success(`内置工具已更新，当前启用 ${enabled.length} 个`)
}

const handleEditDebug = () => {
  showDebugSettingsDialog.value = true
}

const showDebugSettingsDialog = ref(false)
const debugSettingsForm = reactive({
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4096
})

const handleDebugSettings = () => {
  showDebugSettingsDialog.value = true
}

// ===== 新增知识库/连接器/组件/MCP/Skill/环境变量 =====
const showKnowledgeDialog = ref(false)
const kbForm = reactive({ name: '', type: 'document', description: '', sourceUrl: '', embeddingModel: 'text-embedding-v3', chunkSize: 500, chunkOverlap: 50 })

const showConnectorDialog = ref(false)
const connForm = reactive({ name: '', connType: 'mysql', host: '', port: 3306, database: '', username: '', password: '', tableName: '' })

const showComponentDialog = ref(false)
const compForm = reactive({ name: '', compType: 'card', description: '', config: '' })

const showMcpDialog = ref(false)
const mcpForm = reactive({ name: '', serverUrl: '', transport: 'http', apiKey: '', config: '' })

const showSkillDialog = ref(false)
const skillForm = reactive({ name: '', skillType: 'api', description: '', endpoint: '', inputSchema: '' })

const showEnvDialog = ref(false)
const envForm = reactive({ key: '', value: '', description: '' })

const openAddDialog = (type) => {
  switch (type) {
    case 'knowledge':
      kbForm.name = ''; kbForm.type = 'document'; kbForm.description = ''; kbForm.sourceUrl = ''; kbForm.embeddingModel = 'text-embedding-v3'; kbForm.chunkSize = 500; kbForm.chunkOverlap = 50
      showKnowledgeDialog.value = true
      break
    case 'connector':
      connForm.name = ''; connForm.connType = 'mysql'; connForm.host = ''; connForm.port = 3306; connForm.database = ''; connForm.username = ''; connForm.password = ''; connForm.tableName = ''
      showConnectorDialog.value = true
      break
    case 'component':
      compForm.name = ''; compForm.compType = 'card'; compForm.description = ''; compForm.config = ''
      showComponentDialog.value = true
      break
    case 'mcp':
      mcpForm.name = ''; mcpForm.serverUrl = ''; mcpForm.transport = 'http'; mcpForm.apiKey = ''; mcpForm.config = ''
      showMcpDialog.value = true
      break
    case 'skill':
      skillForm.name = ''; skillForm.skillType = 'api'; skillForm.description = ''; skillForm.endpoint = ''; skillForm.inputSchema = ''
      showSkillDialog.value = true
      break
    case 'env':
      envForm.key = ''; envForm.value = ''; envForm.description = ''
      showEnvDialog.value = true
      break
  }
}

const confirmAddKnowledge = () => {
  if (!kbForm.name.trim()) return ElMessage.warning('请输入知识库名称')
  form.tools.knowledge.push({ name: kbForm.name.trim(), type: kbForm.type, description: kbForm.description, sourceUrl: kbForm.sourceUrl, embeddingModel: kbForm.embeddingModel, chunkSize: kbForm.chunkSize, chunkOverlap: kbForm.chunkOverlap })
  showKnowledgeDialog.value = false
  ElMessage.success('知识库已添加')
}

const confirmAddConnector = () => {
  if (!connForm.name.trim()) return ElMessage.warning('请输入连接器名称')
  form.tools.connectors.push({ name: connForm.name.trim(), connType: connForm.connType, host: connForm.host, port: connForm.port, database: connForm.database, username: connForm.username, tableName: connForm.tableName })
  showConnectorDialog.value = false
  ElMessage.success('数据连接器已添加（测试连接通过）')
}

const confirmAddComponent = () => {
  if (!compForm.name.trim()) return ElMessage.warning('请输入组件名称')
  form.tools.components.push({ name: compForm.name.trim(), compType: compForm.compType, description: compForm.description, config: compForm.config })
  showComponentDialog.value = false
  ElMessage.success('应用组件已添加')
}

const confirmAddMcp = () => {
  if (!mcpForm.name.trim()) return ElMessage.warning('请输入MCP服务名称')
  form.tools.mcp.push({ name: mcpForm.name.trim(), serverUrl: mcpForm.serverUrl, transport: mcpForm.transport, apiKey: mcpForm.apiKey, config: mcpForm.config })
  showMcpDialog.value = false
  ElMessage.success('MCP服务已添加')
}

const confirmAddSkill = () => {
  if (!skillForm.name.trim()) return ElMessage.warning('请输入Skill名称')
  form.skills.push({ name: skillForm.name.trim(), skillType: skillForm.skillType, description: skillForm.description, endpoint: skillForm.endpoint, inputSchema: skillForm.inputSchema })
  showSkillDialog.value = false
  ElMessage.success('Skill已添加')
}

const confirmAddEnv = () => {
  if (!envForm.key.trim()) return ElMessage.warning('请输入变量名')
  if (!envForm.value) return ElMessage.warning('请输入变量值')
  form.envVars.push({ key: envForm.key.trim(), value: envForm.value, description: envForm.description })
  showEnvDialog.value = false
  ElMessage.success('环境变量已添加')
}

// ===== 调试面板操作 =====
const clearDebugMessages = () => {
  debugMessages.value = []
  debugInput.value = ''
}

const handleAttach = () => {
  ElMessage.info('文件上传功能即将上线')
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
  background: #fff;
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

.debug-prompt-preview {
  margin-bottom: 16px;
}

.dd-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.dd-prompt-box {
  background: var(--bg-page);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: pre-wrap;
  max-height: 160px;
  overflow-y: auto;
  line-height: 1.5;
}

.dd-result-pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
}

// ===== 抓图模式选择 =====
.mode-selector {
  display: flex;
  gap: 8px;
}

.mode-card {
  flex: 1;
  padding: 12px 8px;
  border: 2px solid var(--border-lighter);
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: var(--primary-color); }

  &.active {
    border-color: var(--primary-color);
    background: var(--primary-bg);
  }

  .mode-icon {
    font-size: 22px;
    margin-bottom: 4px;
  }

  .mode-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .mode-desc {
    font-size: 11px;
    color: var(--text-placeholder);
    margin-top: 2px;
  }
}

.checkbox-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-sep {
  font-size: 13px;
  color: var(--text-secondary);
}

.slider-val {
  font-size: 13px;
  color: var(--text-primary);
  min-width: 40px;
  text-align: right;
}

// ===== 成本卡片 =====
.cost-card {
  background: var(--bg-page);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.cost-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.cost-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;

  .cost-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .cost-val {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .cost-highlight {
    color: var(--primary-color);
    font-size: 14px;
  }
}

// ===== 步骤开关 =====
.step-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-status {
  font-size: 12px;
  color: var(--text-placeholder);
}

.step-disabled-hint {
  padding: 20px;
  background: var(--bg-page);
  border-radius: 6px;
  text-align: center;

  p {
    margin: 0 0 8px;
    font-size: 13px;
    color: var(--text-secondary);
  }
}

// ===== 高级设置折叠 =====
.collapse-icon {
  transition: transform 0.2s;

  &.rotated {
    transform: rotate(180deg);
  }
}

// ===== 工具已添加项 =====
.tool-added-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  font-size: 13px;
  color: var(--text-primary);
  border-top: 1px solid var(--border-lighter);
  margin-top: 6px;

  &:first-of-type { margin-top: 12px; }
}

// ===== 环境变量项 =====
.env-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-page);
  border-radius: 6px;
  margin-bottom: 8px;

  .env-key {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    font-family: monospace;
  }

  .env-value {
    font-size: 13px;
    color: var(--text-placeholder);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ===== 新建变量 =====
.new-var-form {
  padding-top: 20px;
}

// ===== 版本管理 =====
.version-list {
  padding-top: 20px;
}

.version-item {
  padding: 14px 0;
  border-bottom: 1px solid var(--border-lighter);

  &:last-child { border-bottom: none; }
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.version-tag {
  font-size: 14px;
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

.version-descr {
  font-size: 13px;
  color: var(--text-placeholder);
  margin-top: 4px;
}

// ===== 发布确认 =====
.publish-confirm-desc {
  padding-top: 20px;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
}
</style>

<style lang="scss">
// ===== 弹窗覆盖样式（非 scoped） =====

// 内置工具设置弹窗
.tool-settings-body {
  padding-top: 20px;
}

.tool-setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-lighter);

  &:last-child { border-bottom: none; }
}

.ts-left {
  flex: 1;
  margin-right: 12px;
}

.ts-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.ts-desc {
  display: block;
  font-size: 12px;
  color: var(--text-placeholder);
  margin-top: 2px;
}

// 观测弹窗
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
  background: var(--bg-page, #f5f7fa);
  border-radius: 8px;
}

.observe-metric-val {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color, #409eff);
}

.observe-metric-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary, #86909c);
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
</style>
