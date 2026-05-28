<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <span class="card-title">设备类目</span>
        <el-button type="primary" size="small" @click="openAdd">
          <el-icon><Plus /></el-icon>添加类目
        </el-button>
      </div>
      <el-table v-if="store.categories.length" :data="store.categories" stripe>
        <el-table-column label="类目名称" min-width="140">
          <template #default="{ row }">
            <span class="cell-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标识符" width="180" align="center">
          <template #default="{ row }">
            <span class="cell-id">{{ row.identifier }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标准能力" width="120" align="center">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="$router.push(`/thing-model/category/${row.id}/capabilities`)">
              {{ getCapCount(row) }} 个
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="cell-desc">{{ row.descr }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240">
          <template #default="{ row }">
            <div style="white-space:nowrap">
              <el-button size="small" text type="primary" @click="openImportDialog(row.id)">导入能力</el-button>
              <el-button size="small" text type="primary" @click="openEdit(row)">编辑</el-button>
              <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="empty-state">暂无设备类目，请点击上方按钮添加</div>
    </div>

    <!-- 添加/编辑类目弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入类目名称（最多40字符）" maxlength="40" />
        </el-form-item>
        <el-form-item label="标识符" prop="identifier">
          <el-input v-model="form.identifier" placeholder="例如 IpcCamera" maxlength="40" />
          <span class="form-hint">字母开头，仅允许字母、数字、下划线</span>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.descr" type="textarea" placeholder="请输入描述（最多200字符）" maxlength="200" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入能力弹窗（穿梭框） -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入能力"
      width="960px"
      :close-on-click-modal="false"
      top="3vh"
    >
      <div class="transfer-container">
        <!-- 左侧：可选能力（按模块分组） -->
        <div class="transfer-panel">
          <div class="transfer-panel-header">
            <span>可选能力</span>
            <span v-if="importCheckedIds.length" class="transfer-selected-count">已选 <span class="count-num">{{ importCheckedIds.length }}</span> 个</span>
          </div>
          <div class="transfer-panel-search">
            <el-input v-model="importSearchText" placeholder="搜索能力名称或标识" clearable size="small">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <div class="transfer-panel-body">
            <div v-if="!importAvailableByModule.length" class="transfer-empty">暂无可导入的能力</div>
            <div
              v-for="mod in importAvailableByModule"
              :key="mod.id"
              :class="['transfer-category-item', { expanded: expandedLeftModules.includes(mod.id) }]"
            >
              <div class="transfer-cat-header" @click="toggleLeftModuleExpand(mod.id)">
                <el-icon class="transfer-cat-arrow"><ArrowRight /></el-icon>
                <el-checkbox
                  :model-value="isModuleAllChecked(mod)"
                  :indeterminate="isModuleIndeterminate(mod)"
                  @change="toggleModuleAllCheck(mod)"
                  @click.stop
                />
                <span class="transfer-cat-name">{{ mod.name }}</span>
                <span class="transfer-cat-count">{{ mod.caps.length }} 个能力</span>
              </div>
              <div class="transfer-cat-body">
                <label
                  v-for="cap in mod.caps"
                  :key="cap.id"
                  :class="['transfer-pkg-item', { selected: importCheckedIds.includes(cap.id), hidden: !isImportCapVisible(cap) }]"
                >
                  <el-checkbox :model-value="importCheckedIds.includes(cap.id)" @change="toggleImportCheck(cap.id)" />
                  <div class="transfer-pkg-info">
                    <div class="transfer-pkg-name">
                      <span :class="['type-tag', typeTagCls(cap.capType)]">{{ typeLabel(cap.capType) }}</span>
                      {{ cap.name }}
                    </div>
                    <div class="transfer-pkg-meta">{{ cap.identifier }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间操作按钮 -->
        <div class="transfer-actions">
          <el-button size="small" :disabled="!importCheckedIds.length" @click="transferToRight">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button size="small" :disabled="!importSelectedIds.length" @click="transferToLeft">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </div>

        <!-- 右侧：已选能力（按模块分组） -->
        <div class="transfer-panel">
          <div class="transfer-panel-header">
            <span>待导入</span>
            <span class="transfer-count">{{ importSelectedIds.length }} 项</span>
          </div>
          <div class="transfer-panel-body">
            <div v-if="!importSelectedIds.length" class="transfer-empty">请从左侧勾选能力后点击 → 添加</div>
            <div
              v-for="mod in importSelectedByModule"
              :key="mod.id"
              :class="['transfer-category-item', { expanded: expandedModules.includes(mod.id) }]"
            >
              <div class="transfer-cat-header" @click="toggleModuleExpand(mod.id)">
                <el-icon class="transfer-cat-arrow"><ArrowRight /></el-icon>
                <span class="transfer-cat-name">{{ mod.name }}</span>
                <span class="transfer-cat-count">{{ mod.caps.length }} 个能力</span>
              </div>
              <div class="transfer-cat-body">
                <div
                  v-for="cap in mod.caps"
                  :key="cap.id"
                  class="transfer-pkg-item selected"
                >
                  <div class="transfer-pkg-info" style="flex:1">
                    <div class="transfer-pkg-name">
                      <span :class="['type-tag', typeTagCls(cap.capType)]">{{ typeLabel(cap.capType) }}</span>
                      {{ cap.name }}
                    </div>
                    <div class="transfer-pkg-meta">{{ cap.identifier }}</div>
                  </div>
                  <el-button size="small" text type="danger" @click="removeFromSelected(cap.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!importSelectedIds.length" @click="handleImportConfirm">
          导入（{{ importSelectedIds.length }}）
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, Search, ArrowRight, ArrowLeft, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  store, addCategory, updateCategory, removeCategory, getCategoryStats, isIdentifierUnique,
  getCategoryLinkedCapIds, linkCapToCategory
} from './data'

const dialogVisible = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const form = reactive({ name: '', identifier: '', descr: '' })

const dialogTitle = computed(() => editingId.value ? '编辑类目' : '添加类目')

const identRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/

const rules = {
  name: [{ required: true, message: '请输入类目名称', trigger: 'blur' }],
  identifier: [
    { required: true, message: '请输入标识符', trigger: 'blur' },
    { pattern: identRegex, message: '字母开头，仅允许字母、数字、下划线', trigger: 'blur' }
  ]
}

function getCapCount(row) {
  return getCategoryStats(row.id).capabilityCount
}

function openAdd() {
  editingId.value = null
  form.name = ''
  form.identifier = ''
  form.descr = ''
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  form.name = row.name
  form.identifier = row.identifier
  form.descr = row.descr
  dialogVisible.value = true
}

function handleConfirm() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    if (!isIdentifierUnique(form.identifier, editingId.value || undefined)) {
      ElMessage.warning('标识符已存在，请更换')
      return
    }
    if (editingId.value) {
      updateCategory(editingId.value, { ...form })
      ElMessage.success('编辑成功')
    } else {
      addCategory({ ...form })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
  })
}

function handleDelete(row) {
  const stats = getCategoryStats(row.id)
  ElMessageBox.confirm(
    `确定删除类目「${row.name}」？关联的 ${stats.capabilityCount} 个能力将同步解绑。`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    removeCategory(row.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}

// ===== 类型标签 =====
const typeTagMap = { prop: '属性', svc: '服务', evt: '事件' }
const typeTagClsMap = { prop: 'type-prop', svc: 'type-svc', evt: 'type-evt' }

function typeLabel(t) { return typeTagMap[t] || t }
function typeTagCls(t) { return typeTagClsMap[t] || '' }

// ===== 导入能力（穿梭框） =====
const importDialogVisible = ref(false)
const activeCategoryId = ref(null)
const importSelectedIds = ref([])
const importCheckedIds = ref([])
const importSearchText = ref('')
const expandedLeftModules = ref([])
const expandedModules = ref([])

function buildModuleGroups(capList) {
  const moduleMap = {}
  const orphanCaps = []
  capList.forEach(cap => {
    const mod = store.modules.find(m => m.id === cap.moduleId)
    if (mod) {
      if (!moduleMap[cap.moduleId]) moduleMap[cap.moduleId] = { mod, caps: [] }
      moduleMap[cap.moduleId].caps.push(cap)
    } else {
      orphanCaps.push(cap)
    }
  })
  const groups = store.modules
    .filter(m => moduleMap[m.id]?.caps.length)
    .map(m => ({
      id: m.id,
      name: m.name + ' (' + m.identifier + ')',
      caps: moduleMap[m.id].caps
    }))
  if (orphanCaps.length) {
    groups.push({ id: '_other', name: '其他', caps: orphanCaps })
  }
  return groups
}

const importAvailableByModule = computed(() => {
  if (!activeCategoryId.value) return []
  const linkedIds = new Set(getCategoryLinkedCapIds(activeCategoryId.value))
  const excludedIds = new Set([...linkedIds, ...importSelectedIds.value])
  const available = store.capabilities.filter(c => !excludedIds.has(c.id))
  return buildModuleGroups(available)
})

function isImportCapVisible(cap) {
  if (!importSearchText.value) return true
  const kw = importSearchText.value.toLowerCase()
  return cap.name.toLowerCase().includes(kw) || cap.identifier.toLowerCase().includes(kw)
}

function toggleImportCheck(capId) {
  const idx = importCheckedIds.value.indexOf(capId)
  if (idx > -1) importCheckedIds.value.splice(idx, 1)
  else importCheckedIds.value.push(capId)
}

function toggleLeftModuleExpand(modId) {
  const idx = expandedLeftModules.value.indexOf(modId)
  if (idx > -1) expandedLeftModules.value.splice(idx, 1)
  else expandedLeftModules.value.push(modId)
}

function getVisibleCaps(mod) {
  if (!importSearchText.value) return mod.caps
  return mod.caps.filter(c => isImportCapVisible(c))
}

function isModuleAllChecked(mod) {
  const visible = getVisibleCaps(mod)
  return visible.length > 0 && visible.every(c => importCheckedIds.value.includes(c.id))
}

function isModuleIndeterminate(mod) {
  const visible = getVisibleCaps(mod)
  const checked = visible.filter(c => importCheckedIds.value.includes(c.id))
  return checked.length > 0 && checked.length < visible.length
}

function toggleModuleAllCheck(mod) {
  const visible = getVisibleCaps(mod)
  if (isModuleAllChecked(mod)) {
    visible.forEach(c => {
      importCheckedIds.value = importCheckedIds.value.filter(id => id !== c.id)
    })
  } else {
    visible.forEach(c => {
      if (!importCheckedIds.value.includes(c.id)) importCheckedIds.value.push(c.id)
    })
  }
}

function getCapById(id) {
  return store.capabilities.find(c => c.id === id)
}

const importSelectedByModule = computed(() => {
  const caps = importSelectedIds.value.map(id => getCapById(id)).filter(Boolean)
  return buildModuleGroups(caps)
})

function toggleModuleExpand(modId) {
  const idx = expandedModules.value.indexOf(modId)
  if (idx > -1) expandedModules.value.splice(idx, 1)
  else expandedModules.value.push(modId)
}

function transferToRight() {
  const newModIds = new Set()
  importCheckedIds.value.forEach(id => {
    if (!importSelectedIds.value.includes(id)) {
      importSelectedIds.value.push(id)
      const cap = getCapById(id)
      if (cap) newModIds.add(cap.moduleId)
    }
  })
  newModIds.forEach(mid => {
    if (!expandedModules.value.includes(mid)) expandedModules.value.push(mid)
  })
  importCheckedIds.value = []
}

function transferToLeft() {
  importSelectedIds.value = []
}

function removeFromSelected(id) {
  importSelectedIds.value = importSelectedIds.value.filter(i => i !== id)
}

function openImportDialog(categoryId) {
  activeCategoryId.value = categoryId
  importSelectedIds.value = []
  importCheckedIds.value = []
  importSearchText.value = ''
  expandedModules.value = []
  expandedLeftModules.value = store.modules.map(m => m.id)
  importDialogVisible.value = true
}

function handleImportConfirm() {
  importSelectedIds.value.forEach(capId => {
    linkCapToCategory(activeCategoryId.value, capId)
  })
  ElMessage.success(`已导入 ${importSelectedIds.value.length} 个能力`)
  importDialogVisible.value = false
}

</script>

<style lang="scss" scoped>
.cell-name { font-weight: 500; color: var(--text-primary); }
.cell-id { font-size: 13px; color: var(--text-secondary); font-family: monospace; }
.cell-desc { font-size: 13px; color: var(--text-secondary); }

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

// 穿梭框
.transfer-container {
  height: 420px;
}
.transfer-panel-search {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-lighter);
  flex-shrink: 0;
}
.transfer-count {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-secondary);
}
</style>
