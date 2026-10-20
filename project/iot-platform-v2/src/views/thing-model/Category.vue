<template>
  <div class="flex flex-1 min-w-0 overflow-hidden">

    <!-- ===== Main ===== -->
    <main class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
      <div class="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5">
          <button class="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all" @click="openAdd">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" /></svg>
            <span>添加类目</span>
          </button>
          <div class="inline-flex items-center space-x-1 bg-slate-100/80 p-0.5 rounded-lg text-xs">
            <button
              class="px-2.5 py-1 rounded-md transition-all"
              :class="categoryFilter === 'all' ? 'font-semibold text-slate-900 bg-white shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="categoryFilter = 'all'"
            >全部 ({{ store.categories.length }})</button>
            <button
              class="px-2.5 py-1 rounded-md transition-all flex items-center space-x-1"
              :class="categoryFilter === 'top' ? 'font-semibold text-slate-900 bg-white shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="categoryFilter = 'top'"
            ><span class="w-1.5 h-1.5 rounded-full bg-sky-500" /><span>顶级类目 ({{ store.categories.filter(c => c.parentId == null).length }})</span></button>
            <button
              class="px-2.5 py-1 rounded-md transition-all flex items-center space-x-1"
              :class="categoryFilter === 'child' ? 'font-semibold text-slate-900 bg-white shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="categoryFilter = 'child'"
            ><span class="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span>子类目 ({{ store.categories.filter(c => c.parentId != null).length }})</span></button>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <div class="relative w-64">
            <input
              v-model="searchText"
              class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all"
              placeholder="搜索类目名称 / 标识符..."
            />
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
          </div>
          <button class="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" title="刷新" @click="searchText = ''">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto bg-white">
        <el-table :data="categoryTable" row-key="id" :tree-props="{ children: 'children' }" default-expand-all class="stitch-table category-table">
          <el-table-column label="类目名称" min-width="220">
            <template #default="{ row }">
              <span class="inline-flex items-center gap-2 align-middle">
                <span class="w-1.5 h-1.5 rounded-full bg-sky-500" v-if="row.parentId == null" />
                <span class="w-1 h-1 rounded-full bg-slate-300" v-else />
                <span class="cell-name">{{ row.name }}</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="标识符" min-width="200">
            <template #default="{ row }"><code class="cell-id">{{ row.identifier }}</code></template>
          </el-table-column>
          <el-table-column label="能力项" width="110" align="center">
            <template #default="{ row }">
              <button class="link-action !font-mono" @click="$router.push(`/thing-model-new/category/${row.id}/capabilities`)">{{ getCapTotal(row) }} 个</button>
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="240">
            <template #default="{ row }"><span class="cell-desc">{{ row.descr || '—' }}</span></template>
          </el-table-column>
          <el-table-column label="操作" width="220" align="right" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <button class="link-action" @click="openImportTabDialog(row.id)">关联能力</button>
                <button class="link-action" @click="openEdit(row)">编辑</button>
                <button class="link-danger" @click="handleDelete(row)">删除</button>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <div class="empty-box">
              <span>暂无设备类目</span>
              <button class="link-action" @click="openAdd">+ 添加类目</button>
            </div>
          </template>
        </el-table>
      </div>

      <footer class="h-12 border-t border-slate-200 bg-white px-5 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
        <span>共 <strong class="font-semibold text-slate-700">{{ store.categories.length }}</strong> 个类目</span>
        <span class="font-mono text-[11px] text-slate-400">Schema: JSON 2.0</span>
      </footer>
    </main>

    <!-- ===== Add/Edit dialog ===== -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="92px">
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
          <el-input v-model="form.identifier" placeholder="例如 IpcCamera" maxlength="40" class="!font-mono" />
          <span class="form-hint">字母开头，仅允许字母、数字、下划线</span>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.descr" type="textarea" placeholder="请输入描述（最多200字符）" maxlength="200" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- ===== Import capabilities (transfer) ===== -->
    <el-dialog v-model="importTabDialogVisible" title="关联能力" width="960px" :close-on-click-modal="false" top="3vh">
      <div class="flex items-center gap-2 mb-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">标准能力</span>
        <span class="text-[11px] text-slate-400">选择能力项将连带关联其下的全部参数</span>
      </div>

      <div class="grid grid-cols-[1fr_48px_1fr] gap-3" style="height: 440px">
        <div class="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div class="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
            <span class="text-xs font-semibold text-slate-700">可选能力</span>
            <span v-if="importCheckedIds.length" class="text-[11px] text-slate-500">已选 <span class="font-mono font-semibold text-sky-700">{{ importCheckedIds.length }}</span> 个</span>
          </div>
          <div class="p-2 border-b border-slate-100 flex-shrink-0">
            <el-input v-model="importSearchText" placeholder="搜索能力名称或标识" clearable size="small" />
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-1">
            <div v-if="!importAvailableByModule.length" class="text-[11px] text-slate-400 py-8 text-center">暂无可关联的能力</div>
            <div v-for="mod in importAvailableByModule" :key="mod.id" class="rounded-md border border-slate-200 overflow-hidden">
              <div class="flex items-center gap-2 px-2 py-1.5 bg-slate-50 cursor-pointer hover:bg-slate-100" @click="toggleLeftModuleExpand(mod.id)">
                <svg class="w-3 h-3 text-slate-400 transition-transform" :class="{ 'rotate-90': expandedLeftModules.includes(mod.id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                <el-checkbox :model-value="isModuleAllChecked(mod)" :indeterminate="isModuleIndeterminate(mod)" @change="toggleModuleAllCheck(mod)" @click.stop />
                <span class="text-xs font-medium text-slate-700 truncate">{{ mod.name }}</span>
                <span class="ml-auto text-[10px] font-mono text-slate-400">{{ mod.caps.length }} 个能力</span>
              </div>
              <div v-show="expandedLeftModules.includes(mod.id)" class="divide-y divide-slate-100">
                <label
                  v-for="cap in mod.caps"
                  :key="cap.id"
                  class="flex items-start gap-2 px-3 py-2 cursor-pointer hover:bg-slate-50"
                  :class="{ hidden: !isImportCapVisible(cap) }"
                >
                  <el-checkbox :model-value="importCheckedIds.includes(cap.id)" @change="toggleImportCheck(cap.id)" />
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span :class="['type-tag', typeTagCls(cap.capType)]">{{ typeLabel(cap.capType) }}</span>
                      <span class="text-xs font-medium text-slate-800">{{ cap.name }}</span>
                      <span class="text-[10px] text-slate-400">{{ cap.paramCount }} 个参数</span>
                    </div>
                    <div class="font-mono text-[10px] text-slate-400 mt-0.5">{{ cap.identifier }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center gap-2">
          <el-button size="small" :disabled="!importCheckedIds.length" @click="transferToRight">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
          </el-button>
          <el-button size="small" :disabled="!importSelectedIds.length" @click="transferToLeft">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
          </el-button>
        </div>

        <div class="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div class="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
            <span class="text-xs font-semibold text-slate-700">待关联</span>
            <span class="text-[11px] font-mono text-slate-500">{{ importSelectedIds.length }} 项</span>
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-1">
            <div v-if="!importSelectedIds.length" class="text-[11px] text-slate-400 py-8 text-center">请从左侧勾选能力后点击 → 添加</div>
            <div v-for="mod in importSelectedByModule" :key="mod.id" class="rounded-md border border-slate-200 overflow-hidden">
              <div class="flex items-center gap-2 px-2 py-1.5 bg-slate-50 cursor-pointer" @click="toggleModuleExpand(mod.id)">
                <svg class="w-3 h-3 text-slate-400 transition-transform" :class="{ 'rotate-90': expandedModules.includes(mod.id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                <span class="text-xs font-medium text-slate-700">{{ mod.name }}</span>
                <span class="ml-auto text-[10px] font-mono text-slate-400">{{ mod.caps.length }} 个能力</span>
              </div>
              <div v-show="expandedModules.includes(mod.id)" class="divide-y divide-slate-100">
                <div v-for="cap in mod.caps" :key="cap.id" class="flex items-start gap-2 px-3 py-2">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                      <span :class="['type-tag', typeTagCls(cap.capType)]">{{ typeLabel(cap.capType) }}</span>
                      <span class="text-xs font-medium text-slate-800">{{ cap.name }}</span>
                      <span class="text-[10px] text-slate-400">{{ cap.paramCount }} 个参数</span>
                    </div>
                    <div class="font-mono text-[10px] text-slate-400 mt-0.5">{{ cap.identifier }}</div>
                  </div>
                  <button class="link-danger" @click="removeFromSelected(cap.id)">移除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="importTabDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!docImportCount" @click="handleImportTabConfirm">关联（{{ docImportCount }}）</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  store, addCategory, updateCategory, removeCategory, getCategoryStats, isIdentifierUnique,
  getCategoryLinkedCapIds, linkCapToCategory, getCapsByCapItem,
  buildCategoryTree, getCategoryDescendantIds
} from '@/data/thing-model'

// ===== Form =====
const dialogVisible = ref(false)
const formRef = ref(null)
const editingId = ref(null)
const form = reactive({ parentId: null, name: '', identifier: '', descr: '' })
const dialogTitle = computed(() => editingId.value ? '编辑类目' : '添加类目')
const identRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/
const rules = {
  name: [{ required: true, message: '请输入类目名称', trigger: 'blur' }],
  identifier: [
    { required: true, message: '请输入标识符', trigger: 'blur' },
    { pattern: identRegex, message: '字母开头，仅允许字母、数字、下划线', trigger: 'blur' }
  ]
}

// ===== Tree / table =====
const searchText = ref('')
const categoryFilter = ref('all')
const categoryTree = computed(() => buildCategoryTree())

function flattenChildren(nodes, out = []) {
  nodes.forEach(n => {
    if (n.parentId != null) out.push({ ...n, children: undefined })
    if (n.children) flattenChildren(n.children, out)
  })
  return out
}

function filterTree(nodes) {
  let list = nodes
  if (categoryFilter.value === 'top') {
    list = nodes.map(n => ({ ...n, children: undefined }))
  } else if (categoryFilter.value === 'child') {
    list = flattenChildren(nodes)
  }

  const kw = searchText.value.trim().toLowerCase()
  if (!kw) return list
  if (categoryFilter.value !== 'all') {
    return list.filter(n => n.name.toLowerCase().includes(kw) || n.identifier.toLowerCase().includes(kw))
  }
  const prune = (arr) => arr.map(n => {
    const children = n.children ? prune(n.children) : []
    return { ...n, children: children.length ? children : undefined }
  }).filter(n => n.name.toLowerCase().includes(kw) || n.identifier.toLowerCase().includes(kw) || (n.children && n.children.length))
  return prune(list)
}
const categoryTable = computed(() => filterTree(categoryTree.value))

const parentOptions = computed(() => {
  const excluded = editingId.value ? new Set([editingId.value, ...getCategoryDescendantIds(editingId.value)]) : new Set()
  const filter = (nodes) => nodes
    .filter(n => !excluded.has(n.id))
    .map(n => ({ ...n, children: n.children ? filter(n.children) : undefined }))
  return filter(buildCategoryTree())
})

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

// ===== Type labels =====
const typeTagMap = { prop: '属性', svc: '服务', evt: '事件' }
const typeTagClsMap = { prop: 'type-prop', svc: 'type-svc', evt: 'type-evt' }
function typeLabel(t) { return typeTagMap[t] || t }
function typeTagCls(t) { return typeTagClsMap[t] || '' }

// ===== Import transfer =====
const importTabDialogVisible = ref(false)
const activeCategoryId = ref(null)
const importSelectedIds = ref([])
const importCheckedIds = ref([])
const importSearchText = ref('')
const expandedLeftModules = ref([])
const expandedModules = ref([])
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
  ElMessage.success(`已关联 ${importSelectedIds.value.length} 个能力项（${paramCount} 个参数）`)
  importTabDialogVisible.value = false
}

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
    .map(m => ({ id: m.id, name: m.name + ' (' + m.identifier + ')', caps: moduleMap[m.id].caps }))
  if (orphanCaps.length) groups.push({ id: '_other', name: '其他', caps: orphanCaps })
  return groups
}

const capItemOptions = computed(() =>
  store.capItems.map(it => {
    const params = getCapsByCapItem(it.id)
    return { ...it, params, paramCount: params.length }
  })
)

const importAvailableByModule = computed(() => {
  if (!activeCategoryId.value) return []
  const linkedIds = new Set(getCategoryLinkedCapIds(activeCategoryId.value))
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
    visible.forEach(c => { importCheckedIds.value = importCheckedIds.value.filter(id => id !== c.id) })
  } else {
    visible.forEach(c => { if (!importCheckedIds.value.includes(c.id)) importCheckedIds.value.push(c.id) })
  }
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
      const item = capItemOptions.value.find(it => it.id === id)
      if (item) newModIds.add(item.moduleId)
    }
  })
  newModIds.forEach(mid => {
    if (!expandedModules.value.includes(mid)) expandedModules.value.push(mid)
  })
  importCheckedIds.value = []
}
function transferToLeft() { importSelectedIds.value = [] }
function removeFromSelected(id) { importSelectedIds.value = importSelectedIds.value.filter(i => i !== id) }
</script>

<style scoped>
.category-table :deep(.el-table__expand-icon) {
  vertical-align: middle;
}
.cell-name { font-size: 12px; font-weight: 600; color: #0f172a; }
.cell-id { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #475569; }
.cell-desc { font-size: 12px; color: #64748b; }
.row-actions { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; }
</style>
