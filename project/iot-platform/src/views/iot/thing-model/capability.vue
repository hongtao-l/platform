<template>
  <div class="page-container" style="display:flex;flex-direction:column;height:calc(100vh - 56px)">
    <!-- 顶部：类目选择器 -->
    <div class="top-bar">
      <span class="top-label">类目：</span>
      <el-select v-model="currentCategoryId" placeholder="请选择类目" style="width:240px" @change="onCategoryChange">
        <el-option v-for="c in store.categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <span v-if="store.categories.length === 0" class="empty-hint">
        暂无类目，请先在 <router-link to="/thing-model/category">IOT类目</router-link> 中创建
      </span>
    </div>

    <!-- 主体：左栏模块 + 右栏能力 -->
    <div class="main-layout" v-if="currentCategory">
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
            v-for="m in currentCategory.modules"
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
            <div class="header-left">
              <span class="card-title">标准能力</span>
              <div class="filter-chips">
                <span :class="['filter-chip', { active: filterType === 'all' }]" @click="filterType = 'all'">全部</span>
                <span :class="['filter-chip', { active: filterType === 'prop' }]" @click="filterType = 'prop'">属性</span>
                <span :class="['filter-chip', { active: filterType === 'svc' }]" @click="filterType = 'svc'">服务</span>
                <span :class="['filter-chip', { active: filterType === 'evt' }]" @click="filterType = 'evt'">事件</span>
              </div>
            </div>
            <el-button type="primary" size="small" @click="openAddCapability">
              <el-icon><Plus /></el-icon>添加标准能力
            </el-button>
          </div>
          <el-table :data="filteredCapabilities" stripe>
            <el-table-column label="类型" width="80" align="center">
              <template #default="{ row }">
                <span :class="['type-tag', typeTagCls(row.capType)]">{{ typeLabel(row.capType) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="能力名称" min-width="120">
              <template #default="{ row }">
                <span class="cell-name">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="能力标识" width="170" align="center">
              <template #default="{ row }">
                <span class="cell-id">{{ row.identifier }}</span>
              </template>
            </el-table-column>
            <el-table-column label="数据类型" width="100" align="center">
              <template #default="{ row }">
                <span class="cell-datatype">{{ dataTypeLabel(row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="数据定义" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="cell-def">{{ dataDefDetail(row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="描述" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="cell-desc">{{ row.descr }}</span>
              </template>
            </el-table-column>
            <el-table-column label="所属模块" width="130" align="center">
              <template #default="{ row }">
                <span class="cell-module">{{ row._moduleName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <div style="white-space:nowrap;display:flex;gap:4px">
                <el-button size="small" text type="primary" @click="openEditCapability(row)">编辑</el-button>
                <el-button size="small" text type="danger" @click="handleDeleteCapability(row)">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 无类目空状态 -->
    <div v-else class="empty-state">
      <p>暂无类目，请先在 <router-link to="/thing-model/category">IOT类目</router-link> 中创建设备类目</p>
    </div>

    <!-- 添加/编辑模块弹窗 -->
    <el-dialog v-model="moduleDialogVisible" :title="moduleDialogTitle" width="480px" :close-on-click-modal="false">
      <el-form ref="moduleFormRef" :model="moduleForm" :rules="moduleRules" label-width="80px">
        <el-form-item label="模块名称" prop="name">
          <el-input v-model="moduleForm.name" placeholder="请输入模块名称" />
        </el-form-item>
        <el-form-item label="模块标识" prop="identifier">
          <el-input v-model="moduleForm.identifier" placeholder="例如 work_mode_module" />
          <span class="form-hint">字母开头，仅允许字母、数字、下划线</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="moduleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleModuleConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑能力弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="860px"
      :close-on-click-modal="false"
      top="3vh"
    >
      <el-form ref="capFormRef" label-width="100px">
        <!-- 能力类型 -->
        <el-form-item label="能力类型" required>
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
        <el-form-item label="能力名称" required>
          <el-input v-model="capForm.name" placeholder="请输入能力名称（2-50字符）" maxlength="50" />
        </el-form-item>
        <el-form-item label="标识符" required>
          <el-input v-model="capForm.identifier" placeholder="例如 work_mode" maxlength="40" />
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
    <el-dialog v-model="paramDialogVisible" :title="paramDialogTitle" width="600px" :close-on-click-modal="false">
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
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  store, addModule, updateModule, removeModule,
  addCapability, updateCapability, removeCapability,
  findCapability, isModuleIdentifierUnique, isCapIdentifierUnique
} from './data'

// ===== 类目选择 =====
const currentCategoryId = ref(store.categories[0]?.id || null)
const currentCategory = computed(() => store.categories.find(c => c.id === currentCategoryId.value))

watch(() => store.categories.length, () => {
  if (!currentCategoryId.value && store.categories.length > 0) {
    currentCategoryId.value = store.categories[0].id
  }
  if (!store.categories.find(c => c.id === currentCategoryId.value)) {
    currentCategoryId.value = store.categories[0]?.id || null
  }
})

function onCategoryChange() {
  currentModuleId.value = 'all'
  filterType.value = 'all'
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
    if (!isModuleIdentifierUnique(currentCategoryId.value, moduleForm.identifier, editingModuleId.value || undefined)) {
      ElMessage.warning('模块标识已存在，请更换')
      return
    }
    if (editingModuleId.value) {
      updateModule(currentCategoryId.value, editingModuleId.value, { ...moduleForm })
      ElMessage.success('编辑成功')
    } else {
      addModule(currentCategoryId.value, { ...moduleForm })
      ElMessage.success('添加成功')
    }
    moduleDialogVisible.value = false
  })
}

function handleDeleteModule(mod) {
  ElMessageBox.confirm(
    `确定删除模块「${mod.name}」？模块下的 ${mod.capabilities.length} 个能力将同步删除。`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    removeModule(currentCategoryId.value, mod.id)
    if (currentModuleId.value === mod.id) currentModuleId.value = 'all'
    ElMessage.success('已删除')
  }).catch(() => {})
}

// ===== 能力列表 =====
const filterType = ref('all')

const filteredCapabilities = computed(() => {
  if (!currentCategory.value) return []
  let list = []
  currentCategory.value.modules.forEach(mod => {
    if (currentModuleId.value !== 'all' && mod.id !== currentModuleId.value) return
    mod.capabilities.forEach(cap => {
      list.push({ ...cap, _moduleName: mod.name, _moduleId: mod.id })
    })
  })
  if (filterType.value !== 'all') {
    list = list.filter(c => c.capType === filterType.value)
  }
  return list
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
    const m = { enum: '枚举型', int: '数值型', boolean: '布尔型', string: '字符串' }
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
const editingCapModuleId = ref(null)
const dialogTitle = computed(() => editingCapId.value ? '编辑标准能力' : '添加标准能力')

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
  eventType: 'alarm',
  inputParams: [], outputParams: []
})

function resetCapForm() {
  capForm.capType = 'prop'
  capForm.name = ''; capForm.identifier = ''; capForm.descr = ''
  capForm.dataType = 'enum'; capForm.accessMode = 'rw'
  capForm.enumValues = [{ name: '', val: 0 }]; capForm.defaultVal = ''
  capForm.min = 0; capForm.max = 100; capForm.step = 1; capForm.unit = ''
  capForm.trueLabel = '开启'; capForm.falseLabel = '关闭'
  capForm.maxLength = 64; capForm.eventType = 'alarm'
  capForm.inputParams = []; capForm.outputParams = []
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
    capForm.maxLength = 64
  } else if (capForm.capType === 'svc') {
    capForm.inputParams = []; capForm.outputParams = []
  } else {
    capForm.eventType = 'alarm'; capForm.outputParams = []
  }
}

function onDataTypeChange() { capForm.defaultVal = '' }

function openAddCapability() {
  editingCapId.value = null; editingCapModuleId.value = null
  resetCapForm()
  dialogVisible.value = true
}

function openEditCapability(cap) {
  editingCapId.value = cap.id
  editingCapModuleId.value = cap._moduleId || currentModuleId.value
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
    removeCapability(currentCategoryId.value, cap.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}

function handleCapabilityConfirm() {
  if (!capForm.name || !capForm.name.trim()) { ElMessage.warning('请输入能力名称'); return }
  if (!capForm.identifier || !capForm.identifier.trim()) { ElMessage.warning('请输入标识符'); return }
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(capForm.identifier)) { ElMessage.warning('标识符格式不合法'); return }

  if (!isCapIdentifierUnique(currentCategoryId.value, capForm.identifier, editingCapId.value || undefined)) {
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

  const item = {
    capType: capForm.capType,
    name: capForm.name.trim(),
    identifier: capForm.identifier.trim(),
    descr: capForm.descr.trim(),
    dataDef: buildDataDef()
  }

  if (editingCapId.value) {
    const found = findCapability(editingCapId.value)
    if (found) updateCapability(currentCategoryId.value, found.module.id, editingCapId.value, item)
    ElMessage.success('编辑成功')
  } else {
    const modId = currentModuleId.value !== 'all' ? currentModuleId.value : (currentCategory.value?.modules[0]?.id)
    if (!modId) { ElMessage.warning('请先创建能力模块'); return }
    addCapability(currentCategoryId.value, modId, item)
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
  maxLength: 64,
  trueLabel: '是', falseLabel: '否',
  enumValues: [{ name: '', val: 0 }]
})

function resetParamForm() {
  paramForm.name = ''; paramForm.identifier = ''; paramForm.dataType = 'boolean'
  paramForm.defaultVal = ''
  paramForm.min = 0; paramForm.max = 100; paramForm.step = 1; paramForm.unit = ''
  paramForm.maxLength = 64
  paramForm.trueLabel = '是'; paramForm.falseLabel = '否'
  paramForm.enumValues = [{ name: '', val: 0 }]
}

function onParamDataTypeChange() {
  paramForm.defaultVal = ''
}

const paramDialogTitle = computed(() => {
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
  }
  return p
}

function handleParamConfirm() {
  if (!paramForm.name.trim() || !paramForm.identifier.trim()) {
    ElMessage.warning('请填写完整参数信息'); return
  }
  const key = editingParamTarget.value + 'Params'
  const param = buildParam()
  if (editingParamIdx.value >= 0) {
    capForm[key][editingParamIdx.value] = param
  } else {
    capForm[key].push(param)
  }
  paramDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
// 顶部栏
.top-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-lighter);
  flex-shrink: 0;
}
.top-label { font-size: var(--font-md); font-weight: 500; color: var(--text-primary); }
.empty-hint { font-size: var(--font-sm); color: var(--text-placeholder); margin-left: 12px; }

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

.filter-chips { display: flex; gap: 8px; }
.filter-chip {
  padding: 4px 14px;
  border-radius: 14px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  border: 1px solid var(--border-light);
  transition: all .15s;
  &:hover { background: var(--bg-hover); }
  &.active { background: var(--primary-color); color: #fff; border-color: var(--primary-color); }
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
.cell-id { font-size: 13px; color: var(--text-secondary); font-family: monospace; }
.cell-datatype { font-size: 13px; color: var(--text-regular); }
.cell-def { font-size: 12px; color: var(--text-secondary); }
.cell-desc { font-size: 13px; color: var(--text-secondary); }
.cell-module { font-size: 13px; color: var(--text-regular); }

// 类型卡片
.type-cards { display: flex; gap: 8px; }
.type-card {
  padding: 8px 24px;
  border: 2px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  font-size: var(--font-md);
  font-weight: 500;
  color: var(--text-secondary);
  transition: all .15s;
  &:hover { border-color: var(--primary-hover); }
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

// 空状态
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-placeholder);
  font-size: var(--font-md);
}
</style>
