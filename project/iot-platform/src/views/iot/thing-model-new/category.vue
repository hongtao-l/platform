<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <span class="card-title">设备类目</span>
        <el-button type="primary" size="small" @click="openAdd">
          <el-icon><Plus /></el-icon>添加类目
        </el-button>
      </div>
      <el-table
        v-if="categoryTree.length"
        :data="categoryTree"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
        stripe
      >
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
        <el-table-column label="能力项" width="110" align="center">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="$router.push(`/thing-model-new/category/${row.id}/capabilities`)">
              {{ getCapTotal(row) }} 个
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
              <el-button size="small" text type="primary" @click="openImportTabDialog(row.id)">导入能力</el-button>
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
      class="category-dialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父级类目">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            check-strictly
            :render-after-expand="false"
            clearable
            placeholder="不选则为顶级类目"
            style="width:100%"
          />
        </el-form-item>
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

    <!-- 导入能力弹窗（new：已去掉「（旧）能力」tab，只保留标准能力） -->
    <el-dialog v-model="importTabDialogVisible" title="导入能力" width="960px" :close-on-click-modal="false" top="3vh" class="import-dialog">
      <div class="transfer-container">
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
                <div v-for="mod in importAvailableByModule" :key="mod.id" :class="['transfer-category-item', { expanded: expandedLeftModules.includes(mod.id) }]">
                  <div class="transfer-cat-header" @click="toggleLeftModuleExpand(mod.id)">
                    <el-icon class="transfer-cat-arrow"><ArrowRight /></el-icon>
                    <el-checkbox :model-value="isModuleAllChecked(mod)" :indeterminate="isModuleIndeterminate(mod)" @change="toggleModuleAllCheck(mod)" @click.stop />
                    <span class="transfer-cat-name">{{ mod.name }}</span>
                    <span class="transfer-cat-count">{{ mod.caps.length }} 个能力</span>
                  </div>
                  <div class="transfer-cat-body">
                    <label v-for="cap in mod.caps" :key="cap.id" :class="['transfer-pkg-item', { selected: importCheckedIds.includes(cap.id) }]">
                      <el-checkbox :model-value="importCheckedIds.includes(cap.id)" @change="toggleImportCheck(cap.id)" />
                      <div class="transfer-pkg-info">
                        <div class="transfer-pkg-name">
                          <span :class="['type-tag', typeTagCls(cap.capType)]">{{ typeLabel(cap.capType) }}</span>
                          {{ cap.name }}
                          <span class="pkg-param-count">{{ cap.paramCount }} 个参数</span>
                        </div>
                        <div class="transfer-pkg-meta">{{ cap.identifier }}</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="transfer-actions">
              <el-button size="small" :disabled="!importCheckedIds.length" @click="transferToRight"><el-icon><ArrowRight /></el-icon></el-button>
              <el-button size="small" :disabled="!importSelectedIds.length" @click="transferToLeft"><el-icon><ArrowLeft /></el-icon></el-button>
            </div>

            <div class="transfer-panel">
              <div class="transfer-panel-header">
                <span>待导入</span>
                <span class="transfer-count">{{ importSelectedIds.length }} 项</span>
              </div>
              <div class="transfer-panel-body">
                <div v-if="!importSelectedIds.length" class="transfer-empty">请从左侧勾选能力后点击 → 添加</div>
                <div v-for="mod in importSelectedByModule" :key="mod.id" :class="['transfer-category-item', { expanded: expandedModules.includes(mod.id) }]">
                  <div class="transfer-cat-header" @click="toggleModuleExpand(mod.id)">
                    <el-icon class="transfer-cat-arrow"><ArrowRight /></el-icon>
                    <span class="transfer-cat-name">{{ mod.name }}</span>
                    <span class="transfer-cat-count">{{ mod.caps.length }} 个能力</span>
                  </div>
                  <div class="transfer-cat-body">
                    <div v-for="cap in mod.caps" :key="cap.id" class="transfer-pkg-item selected">
                      <div class="transfer-pkg-info" style="flex:1">
                        <div class="transfer-pkg-name">
                          <span :class="['type-tag', typeTagCls(cap.capType)]">{{ typeLabel(cap.capType) }}</span>
                          {{ cap.name }}
                          <span class="pkg-param-count">{{ cap.paramCount }} 个参数</span>
                        </div>
                        <div class="transfer-pkg-meta">{{ cap.identifier }}</div>
                      </div>
                      <el-button size="small" text type="danger" @click="removeFromSelected(cap.id)"><el-icon><Delete /></el-icon></el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      <template #footer>
        <el-button @click="importTabDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!docImportCount" @click="handleImportTabConfirm">
          导入（{{ docImportCount }}）
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
  getCategoryLinkedCapIds, linkCapToCategory, getCapsByCapItem,
  getCategoryLinkedLegacyCapIds, linkLegacyCapToCategory,
  legacyDeviceDef, legacyLensDef, legacyMicDef,
  buildCategoryTree, getCategoryDescendantIds
} from './data'

const dialogVisible = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const form = reactive({ parentId: null, name: '', identifier: '', descr: '' })

// 树形类目（供表格树形模式渲染）
const categoryTree = computed(() => buildCategoryTree())

// 父级候选：编辑时排除自己及自己的子孙，避免形成环
const parentOptions = computed(() => {
  const excluded = editingId.value ? new Set([editingId.value, ...getCategoryDescendantIds(editingId.value)]) : new Set()
  const filter = (nodes) => nodes
    .filter(n => !excluded.has(n.id))
    .map(n => ({ ...n, children: n.children ? filter(n.children) : undefined }))
  return filter(buildCategoryTree())
})

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

function getLegacyCapCount(row) {
  return getCategoryStats(row.id).legacyCapabilityCount
}

function getCapTotal(row) {
  const st = getCategoryStats(row.id)
  return st.capabilityCount + st.legacyCapabilityCount
}

function openAdd() {
  editingId.value = null
  form.parentId = null
  form.name = ''
  form.identifier = ''
  form.descr = ''
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  form.parentId = row.parentId ?? null
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
  const childCount = getCategoryDescendantIds(row.id).length
  const childTip = childCount ? `及其 ${childCount} 个子类目` : ''
  ElMessageBox.confirm(
    `确定删除类目「${row.name}」${childTip}？关联的 ${stats.capabilityCount} 个能力将同步解绑。`,
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

// ===== 导入能力弹窗（new：只保留标准能力） =====
const importTabDialogVisible = ref(false)

const docImportCount = computed(() => importSelectedIds.value.length)

function openImportTabDialog(categoryId) {
  activeCategoryId.value = categoryId
  importSelectedIds.value = []
  importCheckedIds.value = []
  importSearchText.value = ''
  expandedModules.value = []
  expandedLeftModules.value = store.modules.map(m => m.id)
  importTabDialogVisible.value = true
}

function handleImportTabConfirm() {
  let paramCount = 0
  importSelectedIds.value.forEach(itemId => {
    getCapsByCapItem(itemId).forEach(param => {
      linkCapToCategory(activeCategoryId.value, param.id)
      paramCount++
    })
  })
  ElMessage.success(`已导入 ${importSelectedIds.value.length} 个能力项（${paramCount} 个参数）`)
  importTabDialogVisible.value = false
}
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

// 可选单位是「能力项」：选中后连带导入它下面的全部参数
const capItemOptions = computed(() =>
  store.capItems.map(it => {
    const params = getCapsByCapItem(it.id)
    return { ...it, params, paramCount: params.length }
  })
)

const importAvailableByModule = computed(() => {
  if (!activeCategoryId.value) return []
  const linkedIds = new Set(getCategoryLinkedCapIds(activeCategoryId.value))
  // 参数已全部挂到该类目的能力项不再列出
  const available = capItemOptions.value.filter(it =>
    !importSelectedIds.value.includes(it.id) &&
    !(it.paramCount && it.params.every(p => linkedIds.has(p.id)))
  )
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
  const items = importSelectedIds.value.map(id => capItemOptions.value.find(it => it.id === id)).filter(Boolean)
  return buildModuleGroups(items)
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

// ===== 导入老能力（能力池（老）穿梭框） =====
const legacyImportDialogVisible = ref(false)
const legacyActiveCategoryId = ref(null)
const legacySelectedIds = ref([])
const legacyCheckedIds = ref([])
const legacySearchText = ref('')
const legacyExpandedLeftModules = ref([])
const legacyExpandedModules = ref([])
const legacyLinkedCapIds = ref([])

// 三套旧能力定义 → 可勾选清单（与能力库同源）
const legacyOptionList = computed(() => {
  const defs = [
    { scope: '设备能力', modules: legacyDeviceDef() },
    { scope: '镜头能力', modules: legacyLensDef() },
    { scope: '麦克风能力', modules: legacyMicDef() }
  ]
  const list = []
  defs.forEach(d => {
    d.modules.forEach(mod => {
      mod.items.forEach(item => {
        list.push({ id: item.id, name: item.name, scope: d.scope, moduleName: mod.name })
      })
    })
  })
  return list
})

function buildLegacyModuleGroups(capList) {
  const moduleMap = {}
  const orphanCaps = []
  capList.forEach(cap => {
    if (cap.moduleName) {
      if (!moduleMap[cap.moduleName]) moduleMap[cap.moduleName] = { name: cap.moduleName, caps: [] }
      moduleMap[cap.moduleName].caps.push(cap)
    } else {
      orphanCaps.push(cap)
    }
  })
  const groups = Object.keys(moduleMap).map(name => ({ id: name, name, caps: moduleMap[name].caps }))
  if (orphanCaps.length) groups.push({ id: '_other', name: '其他', caps: orphanCaps })
  return groups
}

const legacyAvailableByModule = computed(() => {
  const excludedIds = new Set([...legacyLinkedCapIds.value, ...legacySelectedIds.value])
  const available = legacyOptionList.value.filter(c => !excludedIds.has(c.id))
  return buildLegacyModuleGroups(available)
})

function legacyCapVisible(cap) {
  if (!legacySearchText.value) return true
  const kw = legacySearchText.value.toLowerCase()
  return cap.name.toLowerCase().includes(kw) || cap.identifier.toLowerCase().includes(kw)
}

const legacySelectedByModule = computed(() => {
  const caps = legacySelectedIds.value.map(id => legacyOptionList.value.find(c => c.id === id)).filter(Boolean)
  return buildLegacyModuleGroups(caps)
})

function toggleLegacyCheck(capId) {
  const idx = legacyCheckedIds.value.indexOf(capId)
  if (idx > -1) legacyCheckedIds.value.splice(idx, 1)
  else legacyCheckedIds.value.push(capId)
}

function toggleLegacyLeftModuleExpand(modId) {
  const idx = legacyExpandedLeftModules.value.indexOf(modId)
  if (idx > -1) legacyExpandedLeftModules.value.splice(idx, 1)
  else legacyExpandedLeftModules.value.push(modId)
}

function toggleLegacyModuleExpand(modId) {
  const idx = legacyExpandedModules.value.indexOf(modId)
  if (idx > -1) legacyExpandedModules.value.splice(idx, 1)
  else legacyExpandedModules.value.push(modId)
}

function legacyGetVisibleCaps(mod) {
  if (!legacySearchText.value) return mod.caps
  return mod.caps.filter(c => legacyCapVisible(c))
}

function legacyTransferToRight() {
  const newModIds = new Set()
  legacyCheckedIds.value.forEach(id => {
    if (!legacySelectedIds.value.includes(id)) {
      legacySelectedIds.value.push(id)
      const cap = legacyOptionList.value.find(c => c.id === id)
      if (cap) newModIds.add(cap.moduleName)
    }
  })
  newModIds.forEach(mid => {
    if (!legacyExpandedModules.value.includes(mid)) legacyExpandedModules.value.push(mid)
  })
  legacyCheckedIds.value = []
}

function legacyTransferToLeft() {
  legacySelectedIds.value = []
}

function legacyRemoveFromSelected(id) {
  legacySelectedIds.value = legacySelectedIds.value.filter(i => i !== id)
}

function openLegacyImportDialog(categoryId) {
  legacyActiveCategoryId.value = categoryId
  legacyLinkedCapIds.value = getCategoryLinkedLegacyCapIds(categoryId).map(String)
  legacySelectedIds.value = []
  legacyCheckedIds.value = []
  legacySearchText.value = ''
  legacyExpandedModules.value = []
  legacyExpandedLeftModules.value = [...new Set(legacyOptionList.value.map(c => c.moduleName))]
  legacyImportDialogVisible.value = true
}

function handleLegacyImportConfirm() {
  legacySelectedIds.value.forEach(capId => {
    if (!legacyLinkedCapIds.value.includes(capId)) legacyLinkedCapIds.value.push(capId)
  })
  legacyLinkedCapIds.value.forEach(capId => linkLegacyCapToCategory(legacyActiveCategoryId.value, capId))
  ElMessage.success(`已导入 ${legacySelectedIds.value.length} 个旧能力`)
  legacyImportDialogVisible.value = false
}

</script>

<style lang="scss" scoped>
.cell-name { font-weight: 500; color: var(--text-primary); }
.cell-id { font-size: 13px; color: var(--text-secondary); font-family: monospace; }
.cell-desc { font-size: 13px; color: var(--text-secondary); }
// 穿梭框里的「N 个参数」小字
.pkg-param-count {
  margin-left: 8px;
  font-size: 12px;
  color: var(--text-placeholder);
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

/* ===== 样式对齐 Stitch「IoT Dashboard Redesign」===== */
.card { border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: none; }

.page-container :deep(.el-table__header th.el-table__cell) {
  height: 42px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  border-bottom: 1px solid #e2e8f0;
}
.page-container :deep(.el-table__body td.el-table__cell) { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.page-container :deep(.el-table__body tr:hover > td.el-table__cell) { background: #f8fafc; }
.page-container :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) { background: #fff; }
.page-container :deep(.el-table__inner-wrapper::before) { display: none; }

.cell-id { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; color: #64748b; }
.cell-name { font-size: 13px; font-weight: 500; color: #334155; }
.cell-desc { font-size: 12px; color: #64748b; }

.type-tag {
  display: inline-flex; align-items: center;
  height: 18px; padding: 0 7px;
  border-radius: 4px; font-size: 11px; font-weight: 500; line-height: 1;
  &.type-prop { background: #f0f7ff; color: #0369a1; }
  &.type-svc  { background: #ecfdf5; color: #047857; }
  &.type-evt  { background: #fffbeb; color: #b45309; }
}

</style>

<style lang="scss">
// 弹窗样式（非 scoped，因 el-dialog 被 teleport 到 body）
.category-dialog,
.import-dialog {
  .el-dialog__body { padding-top: 20px; }
  .el-dialog__header { padding-bottom: 12px; }
}

/* ===== 弹窗视觉优化（仅样式）===== */
.category-dialog,
.import-dialog {
  .el-dialog__header { padding: 18px 20px 14px; }
  .el-dialog__title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
  .el-dialog__body { padding: 20px 20px 20px; }
  .el-dialog__footer {
    padding: 12px 20px;
    border-top: 1px solid var(--border-lighter, #F0F0F0);
  }
  .el-form-item { margin-bottom: 18px; }
}
</style>
