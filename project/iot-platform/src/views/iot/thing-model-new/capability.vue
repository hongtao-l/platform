<template>
  <div class="page-container" style="display:flex;flex-direction:column;height:calc(100vh - 56px)">
    <!-- 主体：能力列表（new：仅保留标准能力，已去掉自定义能力与（旧）能力） -->
    <div class="main-layout">
          <!-- 左栏：模块列表 -->
          <div class="module-sidebar">
            <div class="module-sidebar-header">
              <span class="module-sidebar-title">能力模块</span>
              <el-button size="small" type="primary" text @click="openAddModule">+ 添加</el-button>
            </div>
            <div class="module-list">
              <div
                :class="['module-item-all', { active: currentModuleId === 'all' }]"
                @click="currentModuleId = 'all'"
              >
                全部
              </div>
              <div
                v-for="m in activeModules"
                :key="m.id"
                :class="['module-item', { active: currentModuleId === m.id }]"
                @click="currentModuleId = m.id"
              >
                <span class="module-name">{{ m.name }}</span>
                <span class="module-ident">{{ m.identifier }}</span>
                <span class="module-actions" @click.stop>
                  <el-button size="small" text @click="openEditModule(m)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="handleDeleteModule(m)"><el-icon><Delete /></el-icon></el-button>
                </span>
              </div>
            </div>
          </div>

          <!-- 右栏：能力表格 -->
          <div class="capability-right">
            <div class="card" style="flex:1;display:flex;flex-direction:column">
              <div class="card-header">
                <el-button type="primary" size="small" @click="openAddCapItem">
                  <el-icon><Plus /></el-icon>添加能力项
                </el-button>
              </div>
              <el-table :data="capItemTree" row-key="id" stripe class="cap-item-table">
                <!-- 展开：参数子表 -->
                <el-table-column type="expand" width="44">
                  <template #default="{ row }">
                    <div class="param-panel">
                      <el-table :data="row.params" size="small">
                        <el-table-column label="类型" width="80" align="center">
                          <template #default="{ row: p }">
                            <span :class="['type-tag', typeTagCls(p.capType)]">{{ typeLabel(p.capType) }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column label="参数名称" min-width="150">
                          <template #default="{ row: p }"><span class="cell-name">{{ p.name }}</span></template>
                        </el-table-column>
                        <el-table-column label="参数标识" width="180" align="center">
                          <template #default="{ row: p }"><span class="cell-id">{{ p.identifier || '—' }}</span></template>
                        </el-table-column>
                        <el-table-column label="数据类型" width="100" align="center">
                          <template #default="{ row: p }"><span class="cell-datatype">{{ dataTypeLabel(p) || '—' }}</span></template>
                        </el-table-column>
                        <el-table-column label="数据定义" min-width="190" show-overflow-tooltip>
                          <template #default="{ row: p }"><span class="cell-def">{{ dataDefDetail(p) || '—' }}</span></template>
                        </el-table-column>
                        <el-table-column label="描述" min-width="150" show-overflow-tooltip>
                          <template #default="{ row: p }"><span class="cell-desc">{{ p.descr || '—' }}</span></template>
                        </el-table-column>
                        <el-table-column label="操作" width="130" align="center">
                          <template #default="{ row: p }">
                            <div class="row-actions">
                              <el-button size="small" text type="primary" @click="openEditCapability(p)">编辑</el-button>
                              <el-button size="small" text type="danger" @click="handleDeleteCapability(p)">删除</el-button>
                            </div>
                          </template>
                        </el-table-column>
                        <template #empty><div class="param-empty">暂无参数</div></template>
                      </el-table>
                    </div>
                  </template>
                </el-table-column>

                <!-- 四列都用 min-width：剩余宽度按比例分摊，避免全部挤给第一列 -->
                <el-table-column label="类型" width="90" align="center">
                  <template #default="{ row }">
                    <span :class="['type-tag', typeTagCls(row.capType)]">{{ typeLabel(row.capType) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="能力项名称" min-width="240">
                  <template #default="{ row }"><span class="cell-item-name">{{ row.name }}</span></template>
                </el-table-column>
                <el-table-column label="能力项ID" min-width="200" align="center">
                  <template #default="{ row }"><span class="cell-id">{{ row.identifier || '—' }}</span></template>
                </el-table-column>
                <el-table-column label="所属模块" min-width="140" align="center">
                  <template #default="{ row }"><span class="cell-module">{{ row.moduleName || '—' }}</span></template>
                </el-table-column>
                <el-table-column label="更新时间" min-width="180" align="center">
                  <template #default="{ row }"><span class="cell-time">{{ row.updateTime || '—' }}</span></template>
                </el-table-column>
                <el-table-column label="操作" width="220" align="center" fixed="right">
                  <template #default="{ row }">
                    <div class="row-actions">
                      <el-button size="small" text type="primary" @click="openAddCapability(row)">添加参数</el-button>
                      <el-button size="small" text type="primary" @click="openEditCapItem(row)">编辑</el-button>
                      <el-button size="small" text type="danger" @click="handleDeleteCapItem(row)">删除</el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>

    <!-- 添加/编辑模块弹窗 -->
    <el-dialog v-model="moduleDialogVisible" :title="moduleDialogTitle" width="480px" :close-on-click-modal="false" class="module-dialog">
      <el-form ref="moduleFormRef" :model="moduleForm" :rules="moduleRules" label-width="80px">
        <el-form-item label="模块名称" prop="name">
          <el-input v-model="moduleForm.name" placeholder="请输入模块名称" />
        </el-form-item>
        <el-form-item label="模块标识" prop="identifier">
          <el-input v-model="moduleForm.identifier" placeholder="例如 WorkModeModule" />
          <span class="form-hint">字母开头，仅允许字母、数字、下划线，全局唯一</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="moduleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleModuleConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑能力项弹窗 -->
    <el-dialog v-model="capItemDialogVisible" :title="capItemDialogTitle" width="480px" :close-on-click-modal="false" class="cap-item-dialog">
      <el-form :model="capItemForm" label-width="110px">
        <el-form-item label="类型" required>
          <el-radio-group v-model="capItemForm.capType">
            <el-radio-button value="prop">属性</el-radio-button>
            <el-radio-button value="svc">服务</el-radio-button>
            <el-radio-button value="evt">事件</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="能力项名称" required>
          <el-input v-model="capItemForm.name" placeholder="请输入能力项名称" />
        </el-form-item>
        <el-form-item label="能力项ID" required>
          <el-input v-model="capItemForm.identifier" placeholder="例如 WorkModeItem" />
          <span class="form-hint">字母开头，仅允许字母、数字、下划线，全局唯一</span>
        </el-form-item>
        <el-form-item label="所属模块" required>
          <el-select v-model="capItemForm.moduleId" style="width:100%" placeholder="请选择能力模块">
            <el-option v-for="m in activeModules" :key="m.id" :label="`${m.name} (${m.identifier})`" :value="m.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="capItemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCapItemConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑能力弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="860px"
      :close-on-click-modal="false"
      top="3vh"
      class="cap-dialog"
    >
      <el-form ref="capFormRef" label-width="100px">
        <!-- 参数类型 -->
        <el-form-item label="参数类型" required>
          <div class="type-cards">
            <div
              v-for="t in capTypeOptions"
              :key="t.value"
              :class="['type-card', { active: capForm.capType === t.value }]"
              @click="onCapTypeChange(t.value)"
            >
              {{ t.label }}
            </div>
          </div>
        </el-form-item>

        <!-- 基础字段 -->
        <el-form-item label="参数名称" required>
          <el-input v-model="capForm.name" placeholder="请输入参数名称（2-50字符）" maxlength="50" />
        </el-form-item>
        <el-form-item label="标识符" required>
          <el-input v-model="capForm.identifier" placeholder="例如 WorkMode" maxlength="40" />
          <span class="form-hint">字母开头，仅允许字母、数字、下划线，全局唯一</span>
        </el-form-item>

        <!-- 属性专属 -->
        <template v-if="capForm.capType === 'prop'">
          <el-form-item label="数据类型" required>
            <el-select v-model="capForm.dataType" style="width:100%" @change="onDataTypeChange">
              <el-option label="枚举型 (Enum)" value="enum" />
              <el-option label="数值型 (Int)" value="int" />
              <el-option label="布尔型 (Boolean)" value="boolean" />
              <el-option label="字符串 (String)" value="string" />
              <el-option label="数组型 (Array)" value="array" />
              <el-option label="结构体型 (Struct)" value="struct" />
            </el-select>
          </el-form-item>
          <el-form-item label="读写模式">
            <el-select v-model="capForm.accessMode" style="width:100%">
              <el-option label="读写 (Read/Write)" value="rw" />
              <el-option label="只读 (Read Only)" value="ro" />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="描述">
          <el-input v-model="capForm.descr" type="textarea" placeholder="请输入能力描述" rows="2" />
        </el-form-item>

        <!-- 分隔线 -->
        <el-divider>数据定义</el-divider>

        <!-- 枚举型编辑器 -->
        <template v-if="capForm.capType === 'prop' && capForm.dataType === 'enum'">
          <el-form-item label="枚举值定义" required>
            <div class="enum-list">
              <div v-for="(ev, i) in capForm.enumValues" :key="i" class="enum-row">
                <el-input v-model="ev.name" placeholder="名称（如：低功耗模式）" style="flex:1" />
                <el-input-number v-model="ev.val" :min="0" style="width:100px" controls-position="right" />
                <el-button size="small" type="danger" :icon="Delete" circle @click="capForm.enumValues.splice(i, 1)" />
              </div>
            </div>
            <el-button size="small" style="margin-top:8px" @click="capForm.enumValues.push({ name: '', val: (capForm.enumValues.length) })">+ 添加枚举值</el-button>
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="capForm.defaultVal" placeholder="请输入默认枚举值的 Value" />
          </el-form-item>
        </template>

        <!-- 数值型编辑器 -->
        <template v-if="capForm.capType === 'prop' && capForm.dataType === 'int'">
          <el-form-item label="取值范围" required>
            <div class="range-row">
              <el-input-number v-model="capForm.min" :max="capForm.max - 1" placeholder="最小值" style="flex:1" />
              <span style="color:var(--text-placeholder)">~</span>
              <el-input-number v-model="capForm.max" :min="capForm.min + 1" placeholder="最大值" style="flex:1" />
            </div>
          </el-form-item>
          <el-form-item label="步长">
            <el-input-number v-model="capForm.step" :min="1" style="width:150px" />
          </el-form-item>
          <el-form-item label="单位">
            <el-input v-model="capForm.unit" placeholder="例如：%、°C、ms" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input-number v-model="capForm.defaultVal" :min="capForm.min" :max="capForm.max" style="width:200px" />
          </el-form-item>
        </template>

        <!-- 布尔型编辑器 -->
        <template v-if="capForm.capType === 'prop' && capForm.dataType === 'boolean'">
          <el-form-item label="布尔值标签">
            <div class="bool-labels">
              <div style="flex:1">
                <span class="form-hint">true 标签</span>
                <el-input v-model="capForm.trueLabel" placeholder="开启" />
              </div>
              <div style="flex:1">
                <span class="form-hint">false 标签</span>
                <el-input v-model="capForm.falseLabel" placeholder="关闭" />
              </div>
            </div>
          </el-form-item>
          <el-form-item label="默认值">
            <el-radio-group v-model="capForm.defaultVal">
              <el-radio value="1">{{ capForm.trueLabel || '开启' }} (true)</el-radio>
              <el-radio value="0">{{ capForm.falseLabel || '关闭' }} (false)</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 字符串型编辑器 -->
        <template v-if="capForm.capType === 'prop' && capForm.dataType === 'string'">
          <el-form-item label="最大长度（字节）" required>
            <el-input-number v-model="capForm.maxLength" :min="1" :max="65535" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="capForm.defaultVal" placeholder="请输入默认值" />
          </el-form-item>
        </template>

        <!-- 数组型编辑器 -->
        <template v-if="capForm.capType === 'prop' && capForm.dataType === 'array'">
          <el-form-item label="元素类型" required>
            <el-select v-model="capForm.elementType" style="width:100%">
              <el-option label="Int (数字)" value="int" />
              <el-option label="String (字符串)" value="string" />
              <el-option label="Struct (结构体)" value="struct" />
            </el-select>
          </el-form-item>
          <el-form-item label="元素个数" required>
            <el-input-number v-model="capForm.arrayCount" :min="1" :max="1000" style="width:150px" />
          </el-form-item>
          <template v-if="capForm.elementType === 'struct'">
            <el-form-item label="元素结构体字段">
              <div style="width:100%">
                <div class="param-list">
                  <div v-for="(f, i) in capForm.fields" :key="i" class="param-item">
                    <div class="param-info">
                      <span class="param-name">{{ f.name || '未命名' }}</span>
                      <span class="param-meta">{{ f.identifier }} · {{ paramTypeLabel(f.dataType) }}</span>
                    </div>
                    <el-button size="small" text @click="openEditStructField(i)"><el-icon><Edit /></el-icon></el-button>
                    <el-button size="small" text type="danger" @click="capForm.fields.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                  </div>
                  <div v-if="!capForm.fields.length" class="param-empty">暂无字段</div>
                </div>
                <el-button size="small" style="margin-top:8px" @click="openAddStructField">+ 添加字段</el-button>
              </div>
            </el-form-item>
          </template>
        </template>

        <!-- 结构体型编辑器 -->
        <template v-if="capForm.capType === 'prop' && capForm.dataType === 'struct'">
          <el-form-item label="结构体字段">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(f, i) in capForm.fields" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ f.name || '未命名' }}</span>
                    <span class="param-meta">{{ f.identifier }} · {{ paramTypeLabel(f.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditStructField(i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="capForm.fields.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!capForm.fields.length" class="param-empty">暂无字段</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddStructField">+ 添加字段</el-button>
            </div>
          </el-form-item>
        </template>

        <!-- 服务编辑器 -->
        <template v-if="capForm.capType === 'svc'">
          <el-form-item label="输入参数">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(p, i) in capForm.inputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditParam('input', i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="capForm.inputParams.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!capForm.inputParams.length" class="param-empty">暂无输入参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('input')">+ 添加参数</el-button>
            </div>
          </el-form-item>
          <el-form-item label="输出参数">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(p, i) in capForm.outputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditParam('output', i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="capForm.outputParams.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!capForm.outputParams.length" class="param-empty">暂无输出参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('output')">+ 添加参数</el-button>
            </div>
          </el-form-item>
        </template>

        <!-- 事件编辑器 -->
        <template v-if="capForm.capType === 'evt'">
          <el-form-item label="事件类型" required>
            <div class="type-cards">
              <div
                v-for="et in eventTypeOptions"
                :key="et.value"
                :class="['type-card', { active: capForm.eventType === et.value }]"
                @click="capForm.eventType = et.value"
              >
                {{ et.label }}
              </div>
            </div>
          </el-form-item>
          <el-form-item label="输出参数">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(p, i) in capForm.outputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditParam('output', i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="capForm.outputParams.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!capForm.outputParams.length" class="param-empty">暂无输出参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('output')">+ 添加参数</el-button>
            </div>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCapabilityConfirm">提交</el-button>
      </template>
    </el-dialog>

    <!-- 参数编辑弹窗（含完整类型定义） -->
    <el-dialog v-model="paramDialogVisible" :title="paramDialogTitle" width="600px" :close-on-click-modal="false" class="param-dialog">
      <el-form ref="paramFormRef" :model="paramForm" label-width="100px">
        <el-form-item label="参数名称" required>
          <el-input v-model="paramForm.name" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数标识" required>
          <el-input v-model="paramForm.identifier" placeholder="例如 result" />
        </el-form-item>
        <el-form-item label="数据类型" required>
          <el-select v-model="paramForm.dataType" style="width:100%" @change="onParamDataTypeChange">
            <el-option label="Int (数字)" value="int" />
            <el-option label="String (字符串)" value="string" />
            <el-option label="Boolean (布尔)" value="boolean" />
            <el-option label="Enum (枚举)" value="enum" />
            <el-option v-if="editingParamTarget !== 'field'" label="Array (数组)" value="array" />
          </el-select>
        </el-form-item>

        <el-divider>类型定义</el-divider>

        <!-- Int 定义 -->
        <template v-if="paramForm.dataType === 'int'">
          <el-form-item label="取值范围">
            <div class="range-row">
              <el-input-number v-model="paramForm.min" :max="paramForm.max - 1" style="flex:1" />
              <span style="color:var(--text-placeholder)">~</span>
              <el-input-number v-model="paramForm.max" :min="paramForm.min + 1" style="flex:1" />
            </div>
          </el-form-item>
          <el-form-item label="步长">
            <el-input-number v-model="paramForm.step" :min="1" style="width:150px" />
          </el-form-item>
          <el-form-item label="单位">
            <el-input v-model="paramForm.unit" placeholder="例如：%、°C、ms" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input-number v-model="paramForm.defaultVal" :min="paramForm.min" :max="paramForm.max" style="width:200px" />
          </el-form-item>
        </template>

        <!-- String 定义 -->
        <template v-if="paramForm.dataType === 'string'">
          <el-form-item label="最大长度（字节）">
            <el-input-number v-model="paramForm.maxLength" :min="1" :max="65535" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="paramForm.defaultVal" placeholder="请输入默认值" />
          </el-form-item>
        </template>

        <!-- Boolean 定义 -->
        <template v-if="paramForm.dataType === 'boolean'">
          <el-form-item label="布尔值标签">
            <div class="bool-labels">
              <div style="flex:1">
                <span class="form-hint">true 标签</span>
                <el-input v-model="paramForm.trueLabel" placeholder="开启" />
              </div>
              <div style="flex:1">
                <span class="form-hint">false 标签</span>
                <el-input v-model="paramForm.falseLabel" placeholder="关闭" />
              </div>
            </div>
          </el-form-item>
          <el-form-item label="默认值">
            <el-radio-group v-model="paramForm.defaultVal">
              <el-radio value="1">{{ paramForm.trueLabel || '开启' }} (true)</el-radio>
              <el-radio value="0">{{ paramForm.falseLabel || '关闭' }} (false)</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- Enum 定义 -->
        <template v-if="paramForm.dataType === 'enum'">
          <el-form-item label="枚举值定义">
            <div class="enum-list">
              <div v-for="(ev, i) in paramForm.enumValues" :key="i" class="enum-row">
                <el-input v-model="ev.name" placeholder="名称" style="flex:1" />
                <el-input-number v-model="ev.val" :min="0" style="width:100px" controls-position="right" />
                <el-button size="small" type="danger" :icon="Delete" circle @click="paramForm.enumValues.splice(i, 1)" />
              </div>
            </div>
            <el-button size="small" style="margin-top:8px" @click="paramForm.enumValues.push({ name: '', val: (paramForm.enumValues.length) })">+ 添加枚举值</el-button>
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="paramForm.defaultVal" placeholder="请输入默认枚举值的 Value" />
          </el-form-item>
        </template>

        <!-- Array 定义 -->
        <template v-if="paramForm.dataType === 'array'">
          <el-form-item label="元素类型" required>
            <el-select v-model="paramForm.elementType" style="width:100%">
              <el-option label="Int (数字)" value="int" />
              <el-option label="String (字符串)" value="string" />
            </el-select>
          </el-form-item>
          <el-form-item label="元素个数">
            <el-input-number v-model="paramForm.arrayCount" :min="1" :max="1000" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="paramForm.defaultVal" placeholder="请输入默认值（逗号分隔）" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="paramDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleParamConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Plus, Edit, Delete, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  store, addModule, updateModule, removeModule,
  addCapability, updateCapability, removeCapability,
  addCapItem, updateCapItem, removeCapItem,
  getCapItemsByModule, getCapsByCapItem,
  isModuleIdentifierUnique, isCapIdentifierUnique,
  isCustomModuleIdentifierUnique, isCustomCapIdentifierUnique,
  addCustomModule, updateCustomModule, removeCustomModule,
  addCustomCapability, updateCustomCapability, removeCustomCapability,
  addLegacyModule, updateLegacyModule, removeLegacyModule,
  isLegacyModuleIdentifierUnique,
  legacyDeviceDef, legacyLensDef, legacyMicDef
} from './data'
import CapModules from '@/views/product/cap-modules.vue'

// ===== 数据源 =====
// new 模块已去掉「自定义能力」「（旧）能力」两个 tab，只保留标准能力，直接绑定标准能力池
const activeModules = computed(() => store.modules)
const activeCapabilities = computed(() => store.capabilities)

// 保留该常量：下方模块/能力的增删改函数仍按它分支，恒为 false 即只操作标准能力池
const isCustomTab = computed(() => false)

// ===== 能力池（老） =====
const currentLegacyModuleId = ref(null)
// 初始化默认选中第一个 legacy module
watch(() => store.legacyModules, (mods) => {
  if (mods.length && !currentLegacyModuleId.value) {
    currentLegacyModuleId.value = mods[0].id
  }
}, { immediate: true })

const legacyModuleDialogVisible = ref(false)
const legacyModuleFormRef = ref(null)
const editingLegacyModuleId = ref(null)
const legacyModuleForm = reactive({ name: '', identifier: '' })

const legacyModuleDialogTitle = computed(() => editingLegacyModuleId.value ? '编辑能力模块' : '添加能力模块')

const legacyJsonDialogVisible = ref(false)
const legacyJsonContent = ref('')

function currentLegacyModule() {
  return store.legacyModules.find(m => m.id === currentLegacyModuleId.value)
}

function showLegacyForm(identifier) {
  const m = currentLegacyModule()
  return m && m.identifier === identifier
}

// ===== 能力池（老）— 复用产品开发「功能定义与配置」三套结构（共享定义 data.js） =====
const legacyActiveTab = ref('device')

// 设备能力（设备级，按 5 模块分组）— 与 data.js 同源
const legacyDeviceModules = reactive(legacyDeviceDef())

// 镜头能力配置模板（每镜头实例一份，按 2 模块分组）— 与 data.js 同源
function defaultLensCapabilityConfig() {
  return legacyLensDef()
}

// ===== 镜头多实例 =====
const legacyLensList = ref([
  { id: 1, name: 'Camera_ 1', capabilityConfig: defaultLensCapabilityConfig() }
])
const activeLensIdx = ref(0)
const activeLens = computed(() => legacyLensList.value[activeLensIdx.value] || null)

function addLens() {
  const idx = legacyLensList.value.length + 1
  legacyLensList.value.push({ id: Date.now(), name: `Camera_ ${idx}`, capabilityConfig: defaultLensCapabilityConfig() })
  activeLensIdx.value = legacyLensList.value.length - 1
  ElMessage.success(`镜头 Camera_ ${idx} 已添加`)
}

function removeLens(idx) {
  if (legacyLensList.value.length <= 1) { ElMessage.warning('至少保留一个镜头'); return }
  legacyLensList.value.splice(idx, 1)
  if (activeLensIdx.value >= legacyLensList.value.length) activeLensIdx.value = legacyLensList.value.length - 1
  ElMessage.success('镜头已删除')
}

// 麦克风能力配置模板（每麦克风实例一份，1 模块）
function defaultMicCapabilityConfig() {
  return legacyMicDef()
}

// ===== 麦克风多实例 =====
const legacyMicList = ref([
  { id: 1, name: 'Microphone_ 1', capabilityConfig: defaultMicCapabilityConfig() }
])
const activeMicIdx = ref(0)
const activeMic = computed(() => legacyMicList.value[activeMicIdx.value] || null)

function addMic() {
  const idx = legacyMicList.value.length + 1
  legacyMicList.value.push({ id: Date.now(), name: `Microphone_ ${idx}`, capabilityConfig: defaultMicCapabilityConfig() })
  activeMicIdx.value = legacyMicList.value.length - 1
  ElMessage.success(`Microphone_ ${idx} 已添加`)
}

function removeMic(idx) {
  if (legacyMicList.value.length <= 1) { ElMessage.warning('至少保留一个Microphone'); return }
  legacyMicList.value.splice(idx, 1)
  if (activeMicIdx.value >= legacyMicList.value.length) activeMicIdx.value = legacyMicList.value.length - 1
}

// Legacy 配置默认值（硬编码表单）
const legacyCfg = reactive({
  // 联网方式
  networkModes: ['WIFI'],
  distMethods: [],
  apHasPassword: false,
  defaultDistMethod: 'AP',
  wifiBand: '2.4G',
  // 对讲设置
  voiceCallType: 'none',
  // 存储设置
  storageMethod: 'none',
  fileSystem: 'fat32',
  storageDisplayMode: 'capacity',
  recordMode: 'scheduled',
  storageStartTime: new Date(2000, 0, 1, 0, 0, 0),
  storageEndTime: new Date(2000, 0, 1, 23, 59, 59),
  recordSound: true,
  storageRepeatDays: [],
  // 电池设置
  hasBattery: false,
  showBatteryOnCharge: false,
  // 工作模式
  supportWorkModeSwitch: false,
  workModes: ['低功耗', 'AOV'],
  aovFrameRate: 1,
  // 唤醒能力
  wakeMode: 'none',
  // OTA能力
  otaEnabled: false,
  // 指示灯
  hasIndicator: false,
  indicatorDefaultOn: true,
  // 报警录制
  alarmRecordEnabled: false,
  alarmRecordDuration: 15,
  alarmRecordResolution: '高清',
  // 红外灯
  irLightEnabled: false,
  irLightMode: '自动',
  // 声音侦测
  soundDetectEnabled: true,
  soundDetectSensitive: 2,
  // 算法能力
  algorithmEnabled: true,
  algorithmSensitive: '中',
  // 屏显配置
  hasDisplay: false,
  supportedResolutions: [],
  screenOffTime: 0,
  decodeFormats: [],
  displayTypes: [],
  // 喇叭配置
  hasSpeaker: false,
  encodeFormats: [],
  volumeAdjustable: false,
  volume: 50,
  customRingtone: false,
  bitDepth: '16bit',
  sampleRate: '8000',
  channels: 'mono'
})

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function saveCurrentLegacyCfg() {
  const m = currentLegacyModule()
  if (!m) { ElMessage.warning('请先选择模块'); return }
  ElMessage.success(`「${m.name}」配置已保存`)
}

function openAddLegacyModule() {
  editingLegacyModuleId.value = null
  legacyModuleForm.name = ''
  legacyModuleForm.identifier = ''
  legacyModuleDialogVisible.value = true
}

function openEditLegacyModule(mod) {
  editingLegacyModuleId.value = mod.id
  legacyModuleForm.name = mod.name
  legacyModuleForm.identifier = mod.identifier
  legacyModuleDialogVisible.value = true
}

function handleLegacyModuleConfirm() {
  legacyModuleFormRef.value?.validate((valid) => {
    if (!valid) return
    // 标识符唯一性校验（仅 legacy pool 内部）
    if (!isLegacyModuleIdentifierUnique(legacyModuleForm.identifier, editingLegacyModuleId.value || undefined)) {
      ElMessage.warning('模块标识已存在，请更换'); return
    }
    if (editingLegacyModuleId.value) {
      updateLegacyModule(editingLegacyModuleId.value, { ...legacyModuleForm })
      ElMessage.success('编辑成功')
    } else {
      addLegacyModule({ ...legacyModuleForm })
      ElMessage.success('添加成功')
    }
    legacyModuleDialogVisible.value = false
  })
}

function handleDeleteLegacyModule(mod) {
  const capCount = store.legacyCapabilities.filter(c => c.moduleId === mod.id).length
  ElMessageBox.confirm(
    `确定删除模块「${mod.name}」？模块下的 ${capCount} 个能力将同步删除。`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    removeLegacyModule(mod.id)
    if (currentLegacyModuleId.value === mod.id) {
      currentLegacyModuleId.value = store.legacyModules[0]?.id || null
    }
    ElMessage.success('已删除')
  }).catch(() => {})
}

function viewLegacyJson(cap) {
  try {
    const obj = JSON.parse(cap.jsonContent)
    legacyJsonContent.value = JSON.stringify(obj, null, 2)
  } catch {
    legacyJsonContent.value = cap.jsonContent
  }
  legacyJsonDialogVisible.value = true
}

function copyLegacyJson() {
  navigator.clipboard.writeText(legacyJsonContent.value).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.warning('复制失败，请手动复制')
  })
}

// ===== 模块 =====
const currentModuleId = ref('all')
const moduleDialogVisible = ref(false)
const moduleFormRef = ref(null)
const editingModuleId = ref(null)
const moduleForm = reactive({ name: '', identifier: '' })

const moduleDialogTitle = computed(() => editingModuleId.value ? '编辑能力模块' : '添加能力模块')
const moduleRules = {
  name: [{ required: true, message: '请输入模块名称', trigger: 'blur' }],
  identifier: [
    { required: true, message: '请输入模块标识', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '字母开头，仅允许字母、数字、下划线', trigger: 'blur' }
  ]
}

function openAddModule() {
  editingModuleId.value = null
  moduleForm.name = ''
  moduleForm.identifier = ''
  moduleDialogVisible.value = true
}

function openEditModule(mod) {
  editingModuleId.value = mod.id
  moduleForm.name = mod.name
  moduleForm.identifier = mod.identifier
  moduleDialogVisible.value = true
}

function handleModuleConfirm() {
  moduleFormRef.value?.validate((valid) => {
    if (!valid) return
    // 跨池唯一性校验（标准 + 自定义模块标识不冲突）
    const modIdUnique = isModuleIdentifierUnique(moduleForm.identifier, editingModuleId.value || undefined)
      && isCustomModuleIdentifierUnique(moduleForm.identifier, editingModuleId.value || undefined)
    if (!modIdUnique) {
      ElMessage.warning('模块标识已存在，请更换')
      return
    }
    if (editingModuleId.value) {
      if (isCustomTab.value) {
        updateCustomModule(editingModuleId.value, { ...moduleForm })
      } else {
        updateModule(editingModuleId.value, { ...moduleForm })
      }
      ElMessage.success('编辑成功')
    } else {
      if (isCustomTab.value) {
        addCustomModule({ ...moduleForm })
      } else {
        addModule({ ...moduleForm })
      }
      ElMessage.success('添加成功')
    }
    moduleDialogVisible.value = false
  })
}

function handleDeleteModule(mod) {
  const caps = isCustomTab.value ? store.customCapabilities : store.capabilities
  const capCount = caps.filter(c => c.moduleId === mod.id).length
  ElMessageBox.confirm(
    `确定删除模块「${mod.name}」？模块下的 ${capCount} 个能力将同步删除。`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    if (isCustomTab.value) {
      removeCustomModule(mod.id)
    } else {
      removeModule(mod.id)
    }
    if (currentModuleId.value === mod.id) currentModuleId.value = 'all'
    ElMessage.success('已删除')
  }).catch(() => {})
}

// ===== 能力列表（父子树：能力项 → 参数）=====
// 父行 = 能力项（名称/ID/参数数量/更新时间/操作），子行 = 属性/服务/事件
const capItemTree = computed(() => {
  const mods = activeModules.value
  return getCapItemsByModule(currentModuleId.value).map(item => {
    const mod = mods.find(m => m.id === item.moduleId)
    const moduleName = mod ? mod.name : '—'
    // 注意：字段名不能叫 children —— el-table 默认把 children 当树数据渲染，
    // 会和展开列(type="expand")重复成两层。这里用 params 承载展开子表的数据。
    const params = getCapsByCapItem(item.id).map(cap => ({
      ...cap,
      _isParam: true,
      _moduleName: moduleName,
      _moduleId: cap.moduleId
    }))
    return {
      id: `item_${item.id}`,
      _isCapItem: true,
      _rawId: item.id,
      moduleId: item.moduleId,
      moduleName,
      capType: item.capType || 'prop',
      name: item.name,
      identifier: item.identifier,
      paramCount: params.length,
      updateTime: item.updateTime,
      params
    }
  })
})

// ===== 标签与展示 =====
const typeTagMap = { prop: '属性', svc: '服务', evt: '事件' }
const typeTagClsMap = { prop: 'type-prop', svc: 'type-svc', evt: 'type-evt' }
const paramTypeMap = { int: 'Int', string: 'String', boolean: 'Boolean', enum: 'Enum' }

function typeLabel(t) { return typeTagMap[t] || t }
function typeTagCls(t) { return typeTagClsMap[t] || '' }
function paramTypeLabel(t) { return paramTypeMap[t] || t }

function dataTypeLabel(cap) {
  if (cap.capType === 'prop') {
    const m = { enum: '枚举型', int: '数值型', boolean: '布尔型', string: '字符串', array: '数组型', struct: '结构体型' }
    return m[cap.dataDef.dataType] || ''
  }
  if (cap.capType === 'svc') return '服务'
  if (cap.capType === 'evt') return '事件'
  return ''
}

function dataDefDetail(cap) {
  if (cap.capType === 'prop') {
    const dd = cap.dataDef
    if (dd.dataType === 'enum') {
      return dd.enumValues.map(ev => `${ev.name}(${ev.val})`).join(', ')
    }
    if (dd.dataType === 'int') {
      let s = `${dd.min}~${dd.max}`
      if (dd.step && dd.step !== 1) s += `, 步长${dd.step}`
      if (dd.unit) s += ` ${dd.unit}`
      return s
    }
    if (dd.dataType === 'boolean') {
      return `${dd.trueLabel || 'true'}/${dd.falseLabel || 'false'}`
    }
    if (dd.dataType === 'string') {
      return `最大${dd.limit || dd.maxLength || 64}字节`
    }
    if (dd.dataType === 'array') {
      const et = { int: 'Int', string: 'String', struct: 'Struct' }[dd.elementType] || dd.elementType || '—'
      return `元素${et}, ${dd.maxLength || 100}个元素`
    }
    if (dd.dataType === 'struct') {
      return `${(dd.fields || []).length} 个字段`
    }
  }
  if (cap.capType === 'svc') {
    const dd = cap.dataDef
    return `入参${(dd.inputParams || []).length}个, 出参${(dd.outputParams || []).length}个`
  }
  if (cap.capType === 'evt') {
    const dd = cap.dataDef
    const et = dd.eventType === 'alarm' ? '告警' : dd.eventType === 'fault' ? '故障' : '信息'
    return `${et}事件, 出参${(dd.outputParams || []).length}个`
  }
  return ''
}

// ===== 能力弹窗 =====
const dialogVisible = ref(false)
const capFormRef = ref(null)
const editingCapId = ref(null)
// 这个弹窗编辑的是「参数」（能力项下的属性/服务/事件）
const dialogTitle = computed(() => editingCapId.value ? '编辑参数' : '添加参数')

const capTypeOptions = [
  { label: '属性', value: 'prop' },
  { label: '服务', value: 'svc' },
  { label: '事件', value: 'evt' }
]
const eventTypeOptions = [
  { label: '信息 (Info)', value: 'info' },
  { label: '告警 (Alarm)', value: 'alarm' },
  { label: '故障 (Fault)', value: 'fault' }
]

const capForm = reactive({
  capItemId: null,
  moduleId: null,
  capType: 'prop',
  name: '',
  identifier: '',
  descr: '',
  dataType: 'enum',
  accessMode: 'rw',
  enumValues: [{ name: '', val: 0 }],
  defaultVal: '',
  min: 0, max: 100, step: 1, unit: '',
  trueLabel: '开启', falseLabel: '关闭',
  maxLength: 64,
  elementType: 'int', arrayCount: 100, fields: [],
  eventType: 'alarm',
  inputParams: [], outputParams: []
})

function resetCapForm() {
  capForm.capItemId = null
  capForm.moduleId = null
  capForm.capType = 'prop'
  capForm.name = ''; capForm.identifier = ''; capForm.descr = ''
  capForm.dataType = 'enum'; capForm.accessMode = 'rw'
  capForm.enumValues = [{ name: '', val: 0 }]; capForm.defaultVal = ''
  capForm.min = 0; capForm.max = 100; capForm.step = 1; capForm.unit = ''
  capForm.trueLabel = '开启'; capForm.falseLabel = '关闭'
  capForm.maxLength = 64; capForm.elementType = 'int'; capForm.arrayCount = 100; capForm.fields = []
  capForm.eventType = 'alarm'; capForm.inputParams = []; capForm.outputParams = []
}

function onCapTypeChange(type) {
  if (capForm.name || capForm.identifier) {
    ElMessageBox.confirm('切换类型将清空当前数据定义，是否继续？', '提示', {
      confirmButtonText: '继续', cancelButtonText: '取消', type: 'warning'
    }).then(() => {
      capForm.capType = type
      resetDataDefForType()
    }).catch(() => {})
  } else {
    capForm.capType = type
    resetDataDefForType()
  }
}

function resetDataDefForType() {
  if (capForm.capType === 'prop') {
    capForm.dataType = 'enum'
    capForm.enumValues = [{ name: '', val: 0 }]; capForm.defaultVal = ''
    capForm.min = 0; capForm.max = 100; capForm.step = 1; capForm.unit = ''
    capForm.trueLabel = '开启'; capForm.falseLabel = '关闭'
    capForm.maxLength = 64; capForm.elementType = 'int'; capForm.arrayCount = 100; capForm.fields = []
  } else if (capForm.capType === 'svc') {
    capForm.inputParams = []; capForm.outputParams = []
  } else {
    capForm.eventType = 'alarm'; capForm.outputParams = []
  }
}

function onDataTypeChange() { capForm.defaultVal = '' }

// 添加参数：由能力项父行的「添加参数」触发，参数必须挂在某个能力项下
function openAddCapability(capItemRow) {
  editingCapId.value = null
  resetCapForm()
  if (capItemRow?._isCapItem) {
    capForm.capItemId = capItemRow._rawId
    capForm.moduleId = capItemRow.moduleId
    // 参数类型跟随能力项类型：事件能力项下只能加事件参数，以此类推
    capForm.capType = capItemRow.capType || 'prop'
    resetDataDefForType()
  }
  dialogVisible.value = true
}

// ===== 能力项增删改 =====
const capItemDialogVisible = ref(false)
const editingCapItemId = ref(null)
const capItemForm = reactive({ name: '', identifier: '', moduleId: null, capType: 'prop' })
const capItemDialogTitle = computed(() => editingCapItemId.value ? '编辑能力项' : '添加能力项')

function openAddCapItem() {
  editingCapItemId.value = null
  capItemForm.name = ''
  capItemForm.identifier = ''
  capItemForm.capType = 'prop'
  capItemForm.moduleId = currentModuleId.value !== 'all' ? currentModuleId.value : (activeModules.value[0]?.id ?? null)
  capItemDialogVisible.value = true
}

function openEditCapItem(item) {
  editingCapItemId.value = item._rawId
  capItemForm.name = item.name
  capItemForm.identifier = item.identifier
  capItemForm.capType = item.capType || 'prop'
  capItemForm.moduleId = item.moduleId
  capItemDialogVisible.value = true
}

function handleCapItemConfirm() {
  if (!capItemForm.name || !capItemForm.name.trim()) { ElMessage.warning('请输入能力项名称'); return }
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(capItemForm.identifier || '')) { ElMessage.warning('能力项ID不合法：字母开头，仅允许字母、数字、下划线'); return }
  const dup = store.capItems.some(x => x.identifier === capItemForm.identifier && x.id !== editingCapItemId.value)
  if (dup) { ElMessage.warning('能力项ID已存在，请更换'); return }
  if (!capItemForm.moduleId) { ElMessage.warning('请选择所属模块'); return }

  if (editingCapItemId.value) {
    updateCapItem(editingCapItemId.value, { ...capItemForm })
    ElMessage.success('编辑成功')
  } else {
    addCapItem({ ...capItemForm })
    ElMessage.success('添加成功')
  }
  capItemDialogVisible.value = false
}

function handleDeleteCapItem(item) {
  ElMessageBox.confirm(
    `确定删除能力项「${item.name}」？其下的 ${item.paramCount} 个参数将一并删除。`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    removeCapItem(item._rawId)
    ElMessage.success('已删除')
  }).catch(() => {})
}

function openEditCapability(cap) {
  editingCapId.value = cap.id
  capForm.capItemId = cap.capItemId ?? null
  capForm.moduleId = cap.moduleId ?? null
  const dd = cap.dataDef
  capForm.capType = cap.capType
  capForm.name = cap.name; capForm.identifier = cap.identifier; capForm.descr = cap.descr
  if (cap.capType === 'prop') {
    capForm.dataType = dd.dataType; capForm.accessMode = dd.accessMode
    capForm.enumValues = dd.enumValues ? JSON.parse(JSON.stringify(dd.enumValues)) : [{ name: '', val: 0 }]
    capForm.defaultVal = dd.defaultVal || ''
    capForm.min = dd.min || 0; capForm.max = dd.max || 100; capForm.step = dd.step || 1; capForm.unit = dd.unit || ''
    capForm.trueLabel = dd.trueLabel || '开启'; capForm.falseLabel = dd.falseLabel || '关闭'
    capForm.maxLength = dd.limit || 64
    capForm.elementType = dd.elementType || 'int'; capForm.arrayCount = dd.maxLength || 100
    capForm.fields = dd.fields ? JSON.parse(JSON.stringify(dd.fields)) : []
  } else if (cap.capType === 'svc') {
    capForm.inputParams = JSON.parse(JSON.stringify(dd.inputParams || []))
    capForm.outputParams = JSON.parse(JSON.stringify(dd.outputParams || []))
  } else {
    capForm.eventType = dd.eventType || 'alarm'
    capForm.outputParams = JSON.parse(JSON.stringify(dd.outputParams || []))
  }
  dialogVisible.value = true
}

function handleDeleteCapability(cap) {
  ElMessageBox.confirm(
    `确定删除能力「${cap.name}」？`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    if (isCustomTab.value) {
      removeCustomCapability(cap.id)
    } else {
      removeCapability(cap.id)
    }
    ElMessage.success('已删除')
  }).catch(() => {})
}

function capFormModuleId() {
  if (capForm.moduleId) return capForm.moduleId
  if (editingCapId.value) {
    return activeCapabilities.value.find(c => c.id === editingCapId.value)?.moduleId
  }
  if (currentModuleId.value !== 'all') return currentModuleId.value
  return activeModules.value[0]?.id
}

function handleCapabilityConfirm() {
  if (!capForm.name || !capForm.name.trim()) { ElMessage.warning('请输入参数名称'); return }
  if (!capForm.identifier || !capForm.identifier.trim()) { ElMessage.warning('请输入标识符'); return }
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(capForm.identifier)) { ElMessage.warning('标识符格式不合法'); return }

  // 跨池唯一性校验（标准 + 自定义标识符不冲突）
  const isCapIdUnique = isCapIdentifierUnique(capForm.identifier, editingCapId.value || undefined)
    && isCustomCapIdentifierUnique(capForm.identifier, editingCapId.value || undefined)
  if (!isCapIdUnique) {
    ElMessage.warning('能力标识符已存在，请更换'); return
  }

  if (capForm.capType === 'prop') {
    if (capForm.dataType === 'enum' && capForm.enumValues.filter(ev => ev.name.trim()).length < 1) {
      ElMessage.warning('枚举值至少需要一个有效条目'); return
    }
    if (capForm.dataType === 'int' && capForm.max <= capForm.min) {
      ElMessage.warning('最大值必须大于最小值'); return
    }
  }
  if (capForm.capType === 'evt' && !capForm.eventType) {
    ElMessage.warning('请选择事件类型'); return
  }

  if (!editingCapId.value && !capForm.capItemId) {
    ElMessage.warning('请从能力项的「添加参数」进入，参数必须归属于某个能力项'); return
  }

  // 参数类型必须与所属能力项一致（事件能力项下不能有属性参数）
  if (capForm.capItemId) {
    const parent = store.capItems.find(x => x.id === capForm.capItemId)
    if (parent && parent.capType && parent.capType !== capForm.capType) {
      ElMessage.warning(`该能力项是「${typeLabel(parent.capType)}」类型，只能添加${typeLabel(parent.capType)}参数`); return
    }
  }

  const item = {
    moduleId: capFormModuleId(),
    capItemId: capForm.capItemId,
    capType: capForm.capType,
    name: capForm.name.trim(),
    identifier: capForm.identifier.trim(),
    descr: capForm.descr.trim(),
    dataDef: buildDataDef()
  }

  if (editingCapId.value) {
    if (isCustomTab.value) {
      updateCustomCapability(editingCapId.value, item)
    } else {
      updateCapability(editingCapId.value, item)
    }
    ElMessage.success('编辑成功')
  } else {
    if (isCustomTab.value) {
      addCustomCapability(item)
    } else {
      addCapability(item)
    }
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}

function buildDataDef() {
  if (capForm.capType === 'prop') {
    const dd = { dataType: capForm.dataType, accessMode: capForm.accessMode, defaultVal: capForm.defaultVal }
    if (capForm.dataType === 'enum') {
      dd.enumValues = capForm.enumValues.filter(ev => ev.name.trim())
    } else if (capForm.dataType === 'int') {
      dd.min = capForm.min; dd.max = capForm.max; dd.step = capForm.step; dd.unit = capForm.unit
    } else if (capForm.dataType === 'boolean') {
      dd.trueLabel = capForm.trueLabel; dd.falseLabel = capForm.falseLabel
    } else if (capForm.dataType === 'string') {
      dd.limit = capForm.maxLength
    } else if (capForm.dataType === 'array') {
      dd.elementType = capForm.elementType; dd.maxLength = capForm.arrayCount
      if (capForm.elementType === 'struct') dd.fields = capForm.fields.filter(f => f.name.trim())
    } else if (capForm.dataType === 'struct') {
      dd.fields = capForm.fields.filter(f => f.name.trim())
    }
    return dd
  }
  if (capForm.capType === 'svc') {
    return { dataType: 'service', inputParams: capForm.inputParams, outputParams: capForm.outputParams }
  }
  return { dataType: 'event', eventType: capForm.eventType, outputParams: capForm.outputParams }
}

// ===== 参数弹窗 =====
const paramDialogVisible = ref(false)
const paramFormRef = ref(null)
const editingParamTarget = ref('input')
const editingParamIdx = ref(-1)

const paramForm = reactive({
  name: '', identifier: '', dataType: 'boolean',
  defaultVal: '',
  min: 0, max: 100, step: 1, unit: '',
  maxLength: 64, elementType: 'int', arrayCount: 10,
  trueLabel: '是', falseLabel: '否',
  enumValues: [{ name: '', val: 0 }]
})

function resetParamForm() {
  paramForm.name = ''; paramForm.identifier = ''; paramForm.dataType = 'boolean'
  paramForm.defaultVal = ''
  paramForm.min = 0; paramForm.max = 100; paramForm.step = 1; paramForm.unit = ''
  paramForm.maxLength = 64; paramForm.elementType = 'int'; paramForm.arrayCount = 10
  paramForm.trueLabel = '是'; paramForm.falseLabel = '否'
  paramForm.enumValues = [{ name: '', val: 0 }]
}

function onParamDataTypeChange() {
  paramForm.defaultVal = ''
}

const paramDialogTitle = computed(() => {
  if (editingParamTarget.value === 'field') return editingParamIdx.value >= 0 ? '编辑结构体字段' : '添加结构体字段'
  const prefix = editingParamTarget.value === 'input' ? '输入' : '输出'
  return editingParamIdx.value >= 0 ? `编辑${prefix}参数` : `添加${prefix}参数`
})

function openAddParam(target) {
  editingParamTarget.value = target; editingParamIdx.value = -1
  resetParamForm()
  paramDialogVisible.value = true
}

function openEditParam(target, idx) {
  editingParamTarget.value = target; editingParamIdx.value = idx
  const p = capForm[target + 'Params'][idx]
  paramForm.name = p.name; paramForm.identifier = p.identifier; paramForm.dataType = p.dataType || 'boolean'
  paramForm.defaultVal = p.defaultVal || ''
  if (p.dataType === 'int') {
    paramForm.min = p.min || 0; paramForm.max = p.max || 100; paramForm.step = p.step || 1; paramForm.unit = p.unit || ''
  } else {
    paramForm.min = 0; paramForm.max = 100; paramForm.step = 1; paramForm.unit = ''
  }
  paramForm.maxLength = p.maxLength || 64
  if (p.dataType === 'array') {
    paramForm.elementType = p.elementType || 'int'; paramForm.arrayCount = p.maxLength || 10
  } else {
    paramForm.elementType = 'int'; paramForm.arrayCount = 10
  }
  paramForm.trueLabel = p.trueLabel || '是'; paramForm.falseLabel = p.falseLabel || '否'
  paramForm.enumValues = p.enumValues ? JSON.parse(JSON.stringify(p.enumValues)) : [{ name: '', val: 0 }]
  paramDialogVisible.value = true
}

function buildParam() {
  const p = {
    name: paramForm.name.trim(),
    identifier: paramForm.identifier.trim(),
    dataType: paramForm.dataType,
    defaultVal: paramForm.defaultVal
  }
  if (paramForm.dataType === 'int') {
    p.min = paramForm.min; p.max = paramForm.max; p.step = paramForm.step; p.unit = paramForm.unit
  } else if (paramForm.dataType === 'string') {
    p.maxLength = paramForm.maxLength
  } else if (paramForm.dataType === 'boolean') {
    p.trueLabel = paramForm.trueLabel; p.falseLabel = paramForm.falseLabel
  } else if (paramForm.dataType === 'enum') {
    p.enumValues = paramForm.enumValues.filter(ev => ev.name.trim())
  } else if (paramForm.dataType === 'array') {
    p.elementType = paramForm.elementType; p.maxLength = paramForm.arrayCount
  }
  return p
}

function handleParamConfirm() {
  if (!paramForm.name.trim() || !paramForm.identifier.trim()) {
    ElMessage.warning('请填写完整参数信息'); return
  }
  const param = buildParam()
  if (editingParamTarget.value === 'field') {
    if (editingParamIdx.value >= 0) {
      capForm.fields[editingParamIdx.value] = param
    } else {
      capForm.fields.push(param)
    }
  } else {
    const key = editingParamTarget.value + 'Params'
    if (editingParamIdx.value >= 0) {
      capForm[key][editingParamIdx.value] = param
    } else {
      capForm[key].push(param)
    }
  }
  paramDialogVisible.value = false
}

function openAddStructField() {
  editingParamTarget.value = 'field'; editingParamIdx.value = -1
  resetParamForm()
  paramDialogVisible.value = true
}

function openEditStructField(idx) {
  editingParamTarget.value = 'field'; editingParamIdx.value = idx
  const f = capForm.fields[idx]
  paramForm.name = f.name; paramForm.identifier = f.identifier; paramForm.dataType = f.dataType || 'boolean'
  paramForm.defaultVal = f.defaultVal || ''
  if (f.dataType === 'int') {
    paramForm.min = f.min || 0; paramForm.max = f.max || 100; paramForm.step = f.step || 1; paramForm.unit = f.unit || ''
  }
  paramForm.maxLength = f.maxLength || 64
  paramForm.elementType = 'int'; paramForm.arrayCount = 10
  paramForm.trueLabel = f.trueLabel || '是'; paramForm.falseLabel = f.falseLabel || '否'
  paramForm.enumValues = f.enumValues ? JSON.parse(JSON.stringify(f.enumValues)) : [{ name: '', val: 0 }]
  paramDialogVisible.value = true
}
</script>

<style lang="scss" scoped>
// 主标签页
.main-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 24px;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-lighter);
  }
  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
  }
  :deep(.el-tab-pane) {
    height: 100%;
  }
}

.sub-tabs {
  height: 100%;
  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 24px;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-lighter);
  }
  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
  }
}

// 主布局
.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding-top: 12px;
}

// 模块侧栏
.module-sidebar {
  width: 260px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-lighter);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.module-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-lighter);
}
.module-sidebar-title { font-size: var(--font-md); font-weight: 600; color: var(--text-primary); }
.module-list { flex: 1; overflow-y: auto; padding: 8px; }

.module-item-all {
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-regular);
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 4px;
  &:hover { background: var(--bg-hover); }
  &.active { background: var(--primary-bg); color: var(--primary-color); }
}

.module-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: all .15s;
  &:hover { background: var(--bg-hover); }
  &.active { background: var(--primary-bg); }
  .module-name {
    flex: 1;
    font-size: 13px;
    color: var(--text-regular);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    .active & { color: var(--primary-color); font-weight: 500; }
  }
  .module-ident {
    font-size: 11px; color: var(--text-placeholder); margin-left: 8px; flex-shrink: 0;
  }
  .module-actions {
    display: none; gap: 2px; margin-left: 4px;
  }
  &:hover .module-actions { display: flex; }
}

// 能力表格区
.capability-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 24px 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

// 类型标签
.type-tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  &.type-prop { background: #EFF6FF; color: #2563EB; }
  &.type-svc { background: #F0FDF4; color: #16A34A; }
  &.type-evt { background: #FFFBEB; color: #D97706; }
}

.cell-name { font-weight: 500; color: var(--text-primary); }
// 能力项父行名称：稍重、带主色，跟参数行区分开
.cell-item-name { font-weight: 600; color: var(--text-primary); }
.cell-count { font-size: 13px; color: var(--text-secondary); }
.cell-time { font-size: 13px; color: var(--text-placeholder); font-family: monospace; }

/* ===== 布局：右侧表格区横向纵向都可滚动 ===== */
.main-layout { min-height: 0; }
.capability-right {
  min-height: 0;
  overflow: auto;          /* 内容超出时由这里滚动，而不是被裁掉 */
}

/* ===== 参数子表：内嵌面板 ===== */
.param-panel {
  padding: 12px 16px 14px 56px;
  background: var(--bg-page, #f5f7fa);
  :deep(.el-table) {
    border: 1px solid var(--border-lighter, #e4e7ed);
    border-radius: 8px;
    overflow: hidden;
    background: var(--bg-card, #fff);
  }
  :deep(th.el-table__cell) { background: var(--bg-card, #fff); }
}
.param-empty {
  padding: 28px 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-placeholder);
}
// 表格操作列按钮组：强制一行
.row-actions {
  display: flex; align-items: center; white-space: nowrap;
  :deep(.el-button + .el-button) { margin-left: 4px; }
}
.cell-id { font-size: 13px; color: var(--text-secondary); font-family: monospace; }
.cell-datatype { font-size: 13px; color: var(--text-regular); }
.cell-def { font-size: 12px; color: var(--text-secondary); }
.cell-desc { font-size: 13px; color: var(--text-secondary); }
.cell-module { font-size: 13px; color: var(--text-regular); }

// 类型卡片
.type-cards { display: flex; gap: 8px; }

// 弹窗整体间距
.type-card {
  padding: 0 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--el-border-radius-base);
  cursor: pointer;
  font-size: 12px;
  line-height: 26px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-body);
  transition: all .15s;
  &:hover { border-color: var(--primary-hover); color: var(--primary-color); }
  &.active { border-color: var(--primary-color); background: var(--primary-bg); color: var(--primary-color); }
}

// 枚举编辑
.enum-list { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.enum-row { display: flex; align-items: center; gap: 8px; }

// 范围行
.range-row { display: flex; align-items: center; gap: 8px; width: 100%; }

// 布尔标签
.bool-labels { display: flex; gap: 12px; width: 100%; }

// 参数列表
.param-list { width: 100%; }
.param-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  margin-bottom: 6px;
}
.param-info { flex: 1; min-width: 0; }
.param-name { font-size: 13px; color: var(--text-primary); }
.param-meta { font-size: 11px; color: var(--text-placeholder); margin-left: 8px; }
.param-empty { font-size: 12px; color: var(--text-placeholder); padding: 8px 0; }

// 配置表单
.cfg-form { padding: 4px 0; }
.cfg-block { margin-bottom: 16px; }
.cfg-block-label { font-size: 13px; color: var(--text-regular); margin-bottom: 8px; }
.card-title { font-size: var(--font-md); font-weight: 600; color: var(--text-primary); }
.card-body {}

// JSON 查看器
.json-viewer {
  background: var(--bg-body);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 12px 16px;
  pre { margin: 0; font-size: 13px; font-family: monospace; white-space: pre-wrap; word-break: break-all; color: var(--text-primary); }
}

// 空状态
// ===== 镜头/麦克风多实例 =====
.lens-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
}

.lens-config-body {
  padding-top: 4px;
}

.camera-name { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }

.tab-tag-icon {
  display: inline-flex;
  align-items: center;
  vertical-align: -2px;
  color: var(--text-placeholder);
  cursor: help;
  margin-left: 4px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-placeholder);
  font-size: var(--font-md);
}
</style>

<style lang="scss">
// 弹窗样式（非 scoped，因 el-dialog 被 teleport 到 body）
.cap-dialog {
  .el-dialog__body { padding-top: 20px; }
  .el-dialog__header { padding-bottom: 12px; }
  .el-form-item { margin-bottom: 18px; }
  .el-divider { margin: 24px 0 20px; }
}

// 其余弹窗同样要留出顶部间距，否则第一个字段紧贴分割线
.module-dialog,
.cap-item-dialog,
.param-dialog {
  .el-dialog__body { padding-top: 20px; }
  .el-dialog__header { padding-bottom: 12px; }
}
</style>
